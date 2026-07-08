"""Predictive models: interpretable logistic baseline vs XGBoost ensemble.

For every outcome in common.OUTCOMES:
  - restrict to rows where the outcome AND csa_exposure are observed
    (complete-case per outcome; see docs/missing_data.md)
  - stratified 5-fold CV
  - class imbalance handled two ways and compared:
      * class weights (LR class_weight='balanced' / XGB scale_pos_weight)
      * SMOTE oversampling (inside the CV fold pipeline, never before the split)
  - metrics chosen for clinical framing: recall (sensitivity) at 0.5,
    ROC-AUC, PR-AUC, precision, F1
  - final XGBoost (class-weight variant) refit on all rows -> SHAP values

Outputs:
  reports/model_metrics.csv
  reports/figures/shap_summary_<outcome>.png
  reports/dashboard_data/model_metrics.json
  reports/dashboard_data/shap_importance.json
"""
import json
import warnings

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import shap
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    average_precision_score, f1_score, precision_score, recall_score,
    roc_auc_score,
)
from sklearn.model_selection import StratifiedKFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

from common import DASH, FEATURE_LABELS, FIG, OUTCOMES, design_matrix, load

warnings.filterwarnings("ignore")
RNG = 42


def cv_eval(model_factory, X, y, smote=False):
    """5-fold stratified CV; SMOTE (if used) applied inside each fold only."""
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=RNG)
    m = {"roc_auc": [], "pr_auc": [], "recall": [], "precision": [], "f1": []}
    for tr, te in skf.split(X, y):
        Xtr, Xte, ytr, yte = X.iloc[tr], X.iloc[te], y.iloc[tr], y.iloc[te]
        model = model_factory(ytr, smote)
        model.fit(Xtr, ytr)
        p = model.predict_proba(Xte)[:, 1]
        yhat = (p >= 0.5).astype(int)
        m["roc_auc"].append(roc_auc_score(yte, p))
        m["pr_auc"].append(average_precision_score(yte, p))
        m["recall"].append(recall_score(yte, yhat))
        m["precision"].append(precision_score(yte, yhat, zero_division=0))
        m["f1"].append(f1_score(yte, yhat))
    return {k: round(float(np.mean(v)), 3) for k, v in m.items()}


def lr_factory(ytr, smote):
    steps = [
        ("impute", SimpleImputer(strategy="median", add_indicator=True)),
        ("scale", StandardScaler()),
    ]
    if smote:
        steps.append(("smote", SMOTE(random_state=RNG)))
        clf = LogisticRegression(max_iter=2000)
    else:
        clf = LogisticRegression(max_iter=2000, class_weight="balanced")
    steps.append(("clf", clf))
    return ImbPipeline(steps) if smote else Pipeline(steps)


def xgb_factory(ytr, smote):
    params = dict(
        n_estimators=400, max_depth=4, learning_rate=0.05, subsample=0.9,
        colsample_bytree=0.9, eval_metric="logloss", random_state=RNG,
        n_jobs=-1,
    )
    if smote:
        return ImbPipeline(
            [
                ("impute", SimpleImputer(strategy="median", add_indicator=True)),
                ("smote", SMOTE(random_state=RNG)),
                ("clf", XGBClassifier(**params)),
            ]
        )
    # native NaN handling, weight positives up to balance
    return XGBClassifier(
        scale_pos_weight=float((ytr == 0).sum() / (ytr == 1).sum()), **params
    )


def main():
    df = load()
    X_all = design_matrix(df)
    FIG.mkdir(parents=True, exist_ok=True)
    DASH.mkdir(parents=True, exist_ok=True)

    rows, shap_json = [], {}
    for outcome, label in OUTCOMES.items():
        keep = df[outcome].notna() & df["csa_exposure"].notna()
        X, y = X_all[keep].reset_index(drop=True), df.loc[keep, outcome].astype(int).reset_index(drop=True)
        prev = float(y.mean())
        print(f"\n=== {label}  (n={len(y)}, prevalence={100*prev:.1f}%) ===")

        for model_name, factory in [("logistic", lr_factory), ("xgboost", xgb_factory)]:
            for strategy in ["class_weight", "smote"]:
                res = cv_eval(factory, X, y, smote=(strategy == "smote"))
                rows.append(
                    {"outcome": outcome, "label": label, "n": len(y),
                     "prevalence": round(prev, 4), "model": model_name,
                     "imbalance": strategy, **res}
                )
                print(f"  {model_name:9s} {strategy:12s} {res}")

        # final XGB (class-weight variant) on all rows -> SHAP
        final = xgb_factory(y, smote=False)
        final.fit(X, y)
        explainer = shap.TreeExplainer(final)
        sample = X.sample(min(3000, len(X)), random_state=RNG)
        sv = explainer.shap_values(sample)
        names = [FEATURE_LABELS.get(c, c) for c in X.columns]

        plt.figure()
        shap.summary_plot(sv, sample, feature_names=names, show=False, max_display=14)
        plt.title(f"SHAP — {label}", fontsize=13)
        plt.tight_layout()
        plt.savefig(FIG / f"shap_summary_{outcome}.png", dpi=150, bbox_inches="tight")
        plt.close("all")

        imp = np.abs(sv).mean(axis=0)
        order = np.argsort(imp)[::-1]
        shap_json[outcome] = [
            {"feature": names[i], "mean_abs_shap": round(float(imp[i]), 4)}
            for i in order[:14]
        ]

    metrics = pd.DataFrame(rows)
    metrics.to_csv(DASH.parent / "model_metrics.csv", index=False)
    (DASH / "model_metrics.json").write_text(json.dumps(rows, indent=1))
    (DASH / "shap_importance.json").write_text(json.dumps(shap_json, indent=1))
    print("\nSaved metrics + SHAP artifacts.")


if __name__ == "__main__":
    main()
