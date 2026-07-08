"""Deployment-grade screening models for school health teams.

Goal: from information a school health professional could realistically
collect in a confidential intake (victimization, household adversity,
context — NOT behavior reports, NOT race/ethnicity, NOT sexual identity),
estimate the probability a student is engaging in substance use, so that
supportive outreach can be prioritized.

Design decisions
----------------
- Race/ethnicity and sexual identity are EXCLUDED as model inputs (a
  screening tool must not gate support on protected attributes) but are
  used to AUDIT the model for subgroup performance gaps.
- Probabilities are calibrated (Platt scaling inside CV) so "20% risk"
  means 20% — required for any threshold/net-benefit reasoning.
- Operating points are chosen sensitivity-first (80% / 90% recall):
  in screening, a missed at-risk student costs more than a false alert.
- Everything is evaluated on a held-out 20% test set never touched during
  tuning or calibration.

Outputs
-------
  reports/screening_model_report.md          human-readable summary
  reports/dashboard_data/screening.json      full artifact for the web app
"""
import json
import warnings

import numpy as np
import pandas as pd
from scipy.stats import loguniform, randint
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    average_precision_score, brier_score_loss, confusion_matrix,
    precision_recall_curve, roc_auc_score, roc_curve,
)
from sklearn.model_selection import RandomizedSearchCV, train_test_split
from xgboost import XGBClassifier

from common import DASH, load

warnings.filterwarnings("ignore")
RNG = 42

# Screening inputs: collectable in a confidential intake conversation.
FEATURES = [
    "csa_exposure",
    "physical_dating_violence_12mo",
    "bullied_at_school_12mo",
    "bullied_electronic_12mo",
    "witnessed_community_violence",
    "unstable_housing",
    "basic_needs_met",
    "parent_substance_problem",
    "parent_mental_illness",
    "parent_incarcerated",
    "age",
    "grade",
    "female",
]

FEATURE_META = {
    "csa_exposure": ("Sexual-violence victimization", "binary"),
    "physical_dating_violence_12mo": ("Physical dating violence (12mo)", "binary"),
    "bullied_at_school_12mo": ("Bullied at school (12mo)", "binary"),
    "bullied_electronic_12mo": ("Cyberbullied (12mo)", "binary"),
    "witnessed_community_violence": ("Witnessed neighborhood violence", "binary"),
    "unstable_housing": ("Unstable housing (30d)", "binary"),
    "basic_needs_met": ("Adult ensured basic needs (protective)", "binary"),
    "parent_substance_problem": ("Parent/guardian substance problem", "binary"),
    "parent_mental_illness": ("Parent/guardian mental illness", "binary"),
    "parent_incarcerated": ("Parent/guardian incarcerated", "binary"),
    "age": ("Age (years)", "ordinal"),
    "grade": ("Grade (9-12)", "ordinal"),
    "female": ("Sex: female", "binary"),
}

TARGETS = {
    "any_current_substance": "Any current substance use (30d)",
    "binge_drinking_current": "Binge drinking (30d)",
    "any_illicit_ever": "Any illicit drug (ever)",
}

CURRENT_USE = [
    "vape_current", "alcohol_current", "binge_drinking_current",
    "marijuana_current", "cig_current",
]


def prepare(df: pd.DataFrame) -> pd.DataFrame:
    d = df.copy()
    d["female"] = (d["sex"] == "Female").astype(float)
    use = d[CURRENT_USE]
    d["any_current_substance"] = np.where(
        use.isna().all(axis=1), np.nan, (use == 1).any(axis=1).astype(float)
    )
    return d


def threshold_sweep(y, p):
    rows = []
    for t in np.round(np.arange(0.05, 0.91, 0.01), 2):
        yhat = (p >= t).astype(int)
        tn, fp, fn, tp = confusion_matrix(y, yhat).ravel()
        rows.append(
            {
                "threshold": float(t),
                "recall": round(tp / (tp + fn), 4) if tp + fn else 0,
                "precision": round(tp / (tp + fp), 4) if tp + fp else 0,
                "specificity": round(tn / (tn + fp), 4) if tn + fp else 0,
                "flagged_rate": round((tp + fp) / len(y), 4),
                "tp": int(tp), "fp": int(fp), "fn": int(fn), "tn": int(tn),
            }
        )
    return rows


def decision_curve(y, p):
    """Net benefit vs threshold probability, plus treat-all/treat-none."""
    n = len(y)
    prev = y.mean()
    rows = []
    for t in np.round(np.arange(0.02, 0.61, 0.02), 2):
        yhat = (p >= t).astype(int)
        tp = int(((yhat == 1) & (y == 1)).sum())
        fp = int(((yhat == 1) & (y == 0)).sum())
        nb = tp / n - fp / n * (t / (1 - t))
        nb_all = prev - (1 - prev) * (t / (1 - t))
        rows.append(
            {
                "threshold": float(t),
                "net_benefit_model": round(float(nb), 4),
                "net_benefit_treat_all": round(float(nb_all), 4),
                "net_benefit_treat_none": 0.0,
            }
        )
    return rows


def curve_points(x, y, n=60):
    """Downsample a curve to n evenly spaced points for the dashboard."""
    idx = np.linspace(0, len(x) - 1, min(n, len(x))).astype(int)
    return [{"x": round(float(x[i]), 4), "y": round(float(y[i]), 4)} for i in idx]


def fairness_audit(d_test, y, p, threshold):
    """Subgroup performance at the chosen operating point (audit only)."""
    rows = []
    groups = [("sex", "Female"), ("sex", "Male")] + [
        ("race_ethnicity", g)
        for g in ["White", "Black", "Hispanic/Latino", "Asian",
                  "Multiple-NonHispanic", "Multiple-Hispanic"]
    ]
    for col, g in groups:
        mask = (d_test[col] == g).to_numpy()
        if mask.sum() < 150 or y[mask].sum() < 20:
            continue
        yg, pg = y[mask], p[mask]
        yhat = (pg >= threshold).astype(int)
        tn, fp, fn, tp = confusion_matrix(yg, yhat).ravel()
        rows.append(
            {
                "group": g,
                "dimension": col,
                "n": int(mask.sum()),
                "prevalence": round(float(yg.mean()), 4),
                "auc": round(float(roc_auc_score(yg, pg)), 4),
                "recall": round(tp / (tp + fn), 4) if tp + fn else None,
                "fpr": round(fp / (fp + tn), 4) if fp + tn else None,
                "precision": round(tp / (tp + fp), 4) if tp + fp else None,
            }
        )
    return rows


def run_target(d: pd.DataFrame, target: str):
    cols = FEATURES + [target, "sex", "race_ethnicity"]
    dd = d[cols].dropna(subset=FEATURES + [target]).reset_index(drop=True)
    X, y = dd[FEATURES].astype(float), dd[target].astype(int).to_numpy()

    X_tr, X_te, y_tr, y_te, d_tr, d_te = train_test_split(
        X, y, dd, test_size=0.2, stratify=y, random_state=RNG
    )
    print(f"\n=== {TARGETS[target]}: n={len(dd)}, prev={y.mean():.3f}, "
          f"train={len(X_tr)}, test={len(X_te)} ===")

    # ---- XGBoost: randomized CV tuning on train, then calibration ----------
    search = RandomizedSearchCV(
        XGBClassifier(
            eval_metric="logloss", random_state=RNG, n_jobs=-1,
            scale_pos_weight=float((y_tr == 0).sum() / (y_tr == 1).sum()),
        ),
        {
            "n_estimators": randint(150, 700),
            "max_depth": randint(2, 6),
            "learning_rate": loguniform(0.01, 0.2),
            "subsample": [0.7, 0.8, 0.9, 1.0],
            "colsample_bytree": [0.7, 0.8, 0.9, 1.0],
            "min_child_weight": randint(1, 20),
            "reg_lambda": loguniform(0.1, 10),
        },
        n_iter=30, cv=5, scoring="roc_auc", random_state=RNG, n_jobs=-1,
    )
    search.fit(X_tr, y_tr)
    print(f"  XGB best CV AUC={search.best_score_:.4f}  {search.best_params_}")

    xgb_cal = CalibratedClassifierCV(search.best_estimator_, method="sigmoid", cv=5)
    xgb_cal.fit(X_tr, y_tr)
    p_xgb = xgb_cal.predict_proba(X_te)[:, 1]

    # ---- Logistic (raw-feature coefficients -> exportable calculator) ------
    lr = LogisticRegression(max_iter=3000, C=1.0)
    lr.fit(X_tr, y_tr)
    p_lr = lr.predict_proba(X_te)[:, 1]

    result = {"label": TARGETS[target], "n": len(dd), "n_test": len(X_te),
              "prevalence": round(float(y.mean()), 4), "models": {}}

    for name, p in [("xgboost_calibrated", p_xgb), ("logistic", p_lr)]:
        fpr, tpr, _ = roc_curve(y_te, p)
        prec, rec, _ = precision_recall_curve(y_te, p)
        frac_pos, mean_pred = calibration_curve(y_te, p, n_bins=10, strategy="quantile")
        sweep = threshold_sweep(y_te, p)
        # sensitivity-first operating points
        ops = {}
        for target_recall in (0.9, 0.8):
            cands = [r for r in sweep if r["recall"] >= target_recall]
            ops[f"recall_{int(target_recall*100)}"] = max(
                cands, key=lambda r: r["threshold"]
            ) if cands else None
        result["models"][name] = {
            "auc": round(float(roc_auc_score(y_te, p)), 4),
            "pr_auc": round(float(average_precision_score(y_te, p)), 4),
            "brier": round(float(brier_score_loss(y_te, p)), 4),
            "roc_curve": curve_points(fpr, tpr),
            "pr_curve": curve_points(rec[::-1], prec[::-1]),
            "calibration": [
                {"mean_pred": round(float(mp), 4), "frac_pos": round(float(fp_), 4)}
                for mp, fp_ in zip(mean_pred, frac_pos)
            ],
            "threshold_sweep": sweep,
            "operating_points": ops,
            "decision_curve": decision_curve(y_te, p),
        }
        print(f"  {name:20s} test AUC={result['models'][name]['auc']:.4f} "
              f"PR-AUC={result['models'][name]['pr_auc']:.4f} "
              f"Brier={result['models'][name]['brier']:.4f}")

    # fairness audit at the 80%-recall operating point of the XGB model
    op = result["models"]["xgboost_calibrated"]["operating_points"]["recall_80"]
    result["fairness"] = fairness_audit(d_te, y_te, p_xgb, op["threshold"])

    # calculator export: logistic on raw features (interpretable, portable)
    result["calculator"] = {
        "intercept": round(float(lr.intercept_[0]), 5),
        "coefficients": {
            f: round(float(c), 5) for f, c in zip(FEATURES, lr.coef_[0])
        },
        "odds_ratios": {
            f: round(float(np.exp(c)), 3) for f, c in zip(FEATURES, lr.coef_[0])
        },
        "feature_meta": {f: {"label": FEATURE_META[f][0], "kind": FEATURE_META[f][1]}
                         for f in FEATURES},
        "base_rate": round(float(y.mean()), 4),
    }
    return result


def main():
    d = prepare(load())
    out = {t: run_target(d, t) for t in TARGETS}
    DASH.mkdir(parents=True, exist_ok=True)
    (DASH / "screening.json").write_text(json.dumps(out, indent=1))

    lines = ["# Screening model report\n"]
    for t, r in out.items():
        m = r["models"]["xgboost_calibrated"]
        op90, op80 = m["operating_points"]["recall_90"], m["operating_points"]["recall_80"]
        lines += [
            f"## {r['label']}",
            f"- n={r['n']} (test {r['n_test']}), prevalence {100*r['prevalence']:.1f}%",
            f"- Calibrated XGBoost: AUC {m['auc']}, PR-AUC {m['pr_auc']}, Brier {m['brier']}",
            f"- Logistic:           AUC {r['models']['logistic']['auc']}, "
            f"PR-AUC {r['models']['logistic']['pr_auc']}",
            f"- @90% recall: threshold {op90['threshold']}, flags {100*op90['flagged_rate']:.0f}% "
            f"of students, precision {100*op90['precision']:.0f}%" if op90 else "",
            f"- @80% recall: threshold {op80['threshold']}, flags {100*op80['flagged_rate']:.0f}% "
            f"of students, precision {100*op80['precision']:.0f}%" if op80 else "",
            "",
        ]
    (DASH.parent / "screening_model_report.md").write_text("\n".join(lines), encoding="utf-8")
    print("\nSaved screening.json + screening_model_report.md")


if __name__ == "__main__":
    main()
