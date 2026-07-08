"""Design-aware inference: adjusted odds ratios for csa_exposure and
household_adversity_score on each outcome.

Approach: logistic GLM with normalized survey weights (freq_weights scaled to
sum to the analytic n) and cluster-robust (sandwich) standard errors on PSU.
This approximates Taylor-linearized design-based SEs; stratum is not used in
variance estimation, which is typically conservative. Documented in the paper
as an approximation (full design-based estimation would use SUDAAN/R survey).

Model per outcome:
  outcome ~ csa_exposure + household_adversity_score + age + grade
            + sex + race_ethnicity   (reference: Male, White)

Outputs:
  reports/adjusted_odds_ratios.csv
  reports/dashboard_data/odds_ratios.json
"""
import json

import numpy as np
import pandas as pd
import statsmodels.api as sm

from common import DASH, OUTCOMES, load


def fit_outcome(df: pd.DataFrame, outcome: str):
    cols = [
        outcome, "csa_exposure", "household_adversity_score", "age", "grade",
        "sex", "race_ethnicity", "weight", "psu",
    ]
    d = df[cols].dropna().copy()
    y = d[outcome].astype(int)

    X = pd.DataFrame(
        {
            "csa_exposure": d["csa_exposure"],
            "household_adversity_score": d["household_adversity_score"],
            "age": d["age"],
            "grade": d["grade"],
            "female": (d["sex"] == "Female").astype(float),
        }
    )
    race = pd.get_dummies(d["race_ethnicity"], prefix="race", dtype=float)
    race = race.drop(columns=["race_White"], errors="ignore")
    X = pd.concat([X, race], axis=1)
    X = sm.add_constant(X)

    w = d["weight"] * len(d) / d["weight"].sum()  # normalize to analytic n
    model = sm.GLM(y, X, family=sm.families.Binomial(), freq_weights=w)
    res = model.fit(cov_type="cluster", cov_kwds={"groups": d["psu"]})

    out = []
    for term in ["csa_exposure", "household_adversity_score"]:
        or_ = float(np.exp(res.params[term]))
        lo, hi = np.exp(res.conf_int().loc[term])
        out.append(
            {
                "term": term,
                "odds_ratio": round(or_, 2),
                "ci_low": round(float(lo), 2),
                "ci_high": round(float(hi), 2),
                "p_value": float(res.pvalues[term]),
                "n": int(len(d)),
            }
        )
    return out


def main():
    df = load()
    rows = []
    for outcome, label in OUTCOMES.items():
        for r in fit_outcome(df, outcome):
            rows.append({"outcome": outcome, "label": label, **r})
            print(
                f"{label:28s} {r['term']:26s} OR={r['odds_ratio']:5.2f} "
                f"({r['ci_low']:.2f}-{r['ci_high']:.2f})  n={r['n']}"
            )
    pd.DataFrame(rows).to_csv(DASH.parent / "adjusted_odds_ratios.csv", index=False)
    DASH.mkdir(parents=True, exist_ok=True)
    (DASH / "odds_ratios.json").write_text(json.dumps(rows, indent=1))


if __name__ == "__main__":
    main()
