"""Precompute EDA results as JSON for the Next.js dashboard (app/).

Model artifacts (metrics, SHAP, ORs, mediation) are exported by their own
scripts in src/models/. This script covers the descriptive findings.

Outputs into reports/dashboard_data/:
  overview.json        headline numbers for the hero section
  exposure_assoc.json  weighted prevalence by exposure + prevalence ratios
  dose_response.json   outcomes across household adversity 0-3
  demographics.json    exposure prevalence by group
  missingness.json     per-variable missingness + mechanism annotation
"""
import json
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
DASH = ROOT / "reports" / "dashboard_data"
DASH.mkdir(parents=True, exist_ok=True)

df = pd.read_csv(ROOT / "data" / "yrbs_analysis_ready.csv")
df["low_school_connectedness"] = 1 - df["feel_close_to_school"]


def wmean(col, mask=None):
    d = df if mask is None else df[mask]
    ok = d[col].notna()
    if ok.sum() == 0:
        return None
    return float(np.average(d.loc[ok, col], weights=d.loc[ok, "weight"]))


LABELS = {
    "cig_current": "Cigarettes (30d)", "vape_current": "Vaping (30d)",
    "alcohol_current": "Alcohol (30d)", "binge_drinking_current": "Binge drinking (30d)",
    "marijuana_current": "Marijuana (30d)", "rx_pain_misuse_ever": "Rx pain-med misuse (ever)",
    "cocaine_ever": "Cocaine (ever)", "inhalants_ever": "Inhalants (ever)",
    "heroin_ever": "Heroin (ever)", "meth_ever": "Meth (ever)",
    "ecstasy_ever": "Ecstasy (ever)", "injection_drug_ever": "Injected drugs (ever)",
    "any_illicit_ever": "Any illicit drug (ever)",
    "feel_close_to_school": "Feels close to people at school",
    "parent_monitoring": "Parents usually know whereabouts",
    "social_media_heavy": "Social media several times/day+",
    "persistent_sad_hopeless": "Persistent sadness/hopelessness",
    "considered_suicide_12mo": "Considered suicide (12mo)",
    "suicide_plan_12mo": "Made suicide plan (12mo)",
    "attempted_suicide_12mo": "Attempted suicide (12mo)",
    "poor_mental_health_30d": "Poor mental health (30d)",
}
SUBSTANCE = [
    "vape_current", "alcohol_current", "binge_drinking_current",
    "marijuana_current", "cig_current", "rx_pain_misuse_ever",
    "inhalants_ever", "ecstasy_ever", "cocaine_ever", "meth_ever",
    "heroin_ever", "injection_drug_ever", "any_illicit_ever",
]
SOCIAL = ["feel_close_to_school", "parent_monitoring", "social_media_heavy"]
MH = [
    "persistent_sad_hopeless", "considered_suicide_12mo", "suicide_plan_12mo",
    "attempted_suicide_12mo", "poor_mental_health_30d",
]

# ---- overview -----------------------------------------------------------
overview = {
    "n_students": int(len(df)),
    "csa_exposure_weighted_pct": round(100 * wmean("csa_exposure"), 1),
    "csa_exposure_female_pct": round(100 * wmean("csa_exposure", df["sex"] == "Female"), 1),
    "csa_exposure_male_pct": round(100 * wmean("csa_exposure", df["sex"] == "Male"), 1),
    "sad_hopeless_exposed_pct": round(100 * wmean("persistent_sad_hopeless", df["csa_exposure"] == 1), 1),
    "sad_hopeless_unexposed_pct": round(100 * wmean("persistent_sad_hopeless", df["csa_exposure"] == 0), 1),
}
(DASH / "overview.json").write_text(json.dumps(overview, indent=1))

# ---- exposure associations ----------------------------------------------
rows = []
for group, vars_ in [("substance", SUBSTANCE), ("social", SOCIAL), ("mental_health", MH)]:
    for v in vars_:
        e1, e0 = wmean(v, df["csa_exposure"] == 1), wmean(v, df["csa_exposure"] == 0)
        rows.append(
            {
                "outcome": v, "label": LABELS[v], "group": group,
                "exposed_pct": round(100 * e1, 1),
                "unexposed_pct": round(100 * e0, 1),
                "prevalence_ratio": round(e1 / e0, 2) if e0 else None,
                "n": int(df[v].notna().sum()),
            }
        )
(DASH / "exposure_assoc.json").write_text(json.dumps(rows, indent=1))

# ---- dose response -------------------------------------------------------
dose = []
for k in [0, 1, 2, 3]:
    mask = df["household_adversity_score"] == k
    dose.append(
        {
            "score": k,
            "n": int(mask.sum()),
            "outcomes": {
                v: round(100 * wmean(v, mask), 1)
                for v in ["any_illicit_ever", "vape_current", "binge_drinking_current",
                          "marijuana_current", "persistent_sad_hopeless",
                          "attempted_suicide_12mo", "low_school_connectedness"]
            },
        }
    )
(DASH / "dose_response.json").write_text(json.dumps(dose, indent=1))

# ---- demographics --------------------------------------------------------
demo = []
for name, mask in [("Female", df["sex"] == "Female"), ("Male", df["sex"] == "Male")]:
    demo.append({"group": name, "kind": "sex", "csa_pct": round(100 * wmean("csa_exposure", mask), 1)})
for grp in sorted(df["race_ethnicity"].dropna().unique()):
    mask = df["race_ethnicity"] == grp
    if (mask & df["csa_exposure"].notna()).sum() > 100:
        demo.append({"group": grp, "kind": "race_ethnicity", "csa_pct": round(100 * wmean("csa_exposure", mask), 1)})
(DASH / "demographics.json").write_text(json.dumps(demo, indent=1))

# ---- missingness ---------------------------------------------------------
MECH = {}
for v in ["parent_monitoring", "feel_close_to_school", "social_media_heavy",
          "poor_mental_health_30d", "any_illicit_ever"]:
    MECH[v] = "questionnaire version (school-level block)"
for v in ["parent_substance_problem", "parent_mental_illness", "parent_incarcerated",
          "household_adversity_score"]:
    MECH[v] = "questionnaire version (school-level block)"
for v in ["forced_sex_ever", "sexual_violence_12mo", "sexual_dating_violence_12mo", "csa_exposure"]:
    MECH[v] = "sensitive-item nonresponse + attrition"

miss = []
for v in df.columns:
    if v in ("record", "weight", "stratum", "psu"):
        continue
    pct = round(100 * float(df[v].isna().mean()), 1)
    miss.append({"variable": v, "pct_missing": pct, "mechanism": MECH.get(v, "attrition / skip pattern")})
miss.sort(key=lambda r: -r["pct_missing"])
(DASH / "missingness.json").write_text(json.dumps(miss, indent=1))

print("dashboard data exported ->", DASH)
