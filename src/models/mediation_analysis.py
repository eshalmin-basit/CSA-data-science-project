"""Causal mediation analysis (Imai-Keele-Tingley) via statsmodels.

Pathway tested:  csa_exposure -> mediator -> outcome
  mediators: persistent_sad_hopeless, poor_mental_health_30d
  outcomes:  vape_current, binge_drinking_current, marijuana_current,
             rx_pain_misuse_ever, any_illicit_ever, low_school_connectedness

Both mediator and outcome models are probit GLMs adjusted for age, grade,
sex, race/ethnicity, and household_adversity_score. Quasi-Bayesian Monte
Carlo (500 sims) gives the ACME (indirect effect), ADE (direct effect), and
proportion mediated, each with 95% CIs.

Cross-sectional caveat: temporal order of exposure, mediator, and outcome is
not observable in YRBS; estimates quantify *consistency with* a mediation
hypothesis, not proof of it. Framed accordingly in the paper.

Outputs:
  reports/mediation_results.csv
  reports/dashboard_data/mediation.json
"""
import json
import warnings

import numpy as np
import pandas as pd
import statsmodels.api as sm
from statsmodels.stats.mediation import Mediation

from common import DASH, load

warnings.filterwarnings("ignore")
np.random.seed(42)

MEDIATORS = {
    "persistent_sad_hopeless": "Persistent sadness/hopelessness",
    "poor_mental_health_30d": "Poor mental health (30d)",
}
OUTCOMES = {
    "vape_current": "Vaping (30d)",
    "binge_drinking_current": "Binge drinking (30d)",
    "marijuana_current": "Marijuana (30d)",
    "rx_pain_misuse_ever": "Rx pain-med misuse (ever)",
    "any_illicit_ever": "Any illicit drug (ever)",
    "low_school_connectedness": "Low school connectedness",
}
ADJUST = ["age", "grade", "female", "household_adversity_score"]


def run_one(df, mediator, outcome, n_sims=500):
    cols = ["csa_exposure", mediator, outcome, "age", "grade", "sex",
            "race_ethnicity", "household_adversity_score"]
    d = df[cols].dropna().copy()
    d["female"] = (d["sex"] == "Female").astype(float)
    race = pd.get_dummies(d["race_ethnicity"], prefix="race", dtype=float)
    race = race.drop(columns=["race_White"], errors="ignore")
    d = pd.concat([d.reset_index(drop=True), race.reset_index(drop=True)], axis=1)

    predictors = ["csa_exposure"] + ADJUST + list(race.columns)
    Xm = sm.add_constant(d[predictors])
    med_model = sm.GLM(d[mediator], Xm, family=sm.families.Binomial(sm.families.links.Probit()))

    Xo = sm.add_constant(d[[mediator] + predictors])
    out_model = sm.GLM(d[outcome], Xo, family=sm.families.Binomial(sm.families.links.Probit()))

    med = Mediation(out_model, med_model, exposure="csa_exposure", mediator=mediator)
    res = med.fit(method="parametric", n_rep=n_sims)
    s = res.summary()

    def grab(row):
        return {
            "estimate": round(float(s.loc[row, "Estimate"]), 4),
            "ci_low": round(float(s.loc[row, "Lower CI bound"]), 4),
            "ci_high": round(float(s.loc[row, "Upper CI bound"]), 4),
            "p": round(float(s.loc[row, "P-value"]), 4),
        }

    return {
        "acme": grab("ACME (average)"),
        "ade": grab("ADE (average)"),
        "total_effect": grab("Total effect"),
        "prop_mediated": grab("Prop. mediated (average)"),
        "n": int(len(d)),
    }


def main():
    df = load()
    rows = []
    for m, mlabel in MEDIATORS.items():
        for o, olabel in OUTCOMES.items():
            r = run_one(df, m, o)
            rows.append(
                {"mediator": m, "mediator_label": mlabel, "outcome": o,
                 "outcome_label": olabel, **{
                     f"{k}_{kk}": vv
                     for k, v in r.items() if isinstance(v, dict)
                     for kk, vv in v.items()
                 }, "n": r["n"]}
            )
            print(
                f"{mlabel:32s} -> {olabel:26s} "
                f"ACME={r['acme']['estimate']:+.4f} "
                f"({r['acme']['ci_low']:+.4f},{r['acme']['ci_high']:+.4f}) "
                f"prop_mediated={r['prop_mediated']['estimate']:.2f} n={r['n']}"
            )
    pd.DataFrame(rows).to_csv(DASH.parent / "mediation_results.csv", index=False)
    DASH.mkdir(parents=True, exist_ok=True)
    (DASH / "mediation.json").write_text(json.dumps(rows, indent=1))


if __name__ == "__main__":
    main()
