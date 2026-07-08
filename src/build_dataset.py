"""Build the analysis-ready dataset for the CSA -> substance use / social
withdrawal study from the 2023 National YRBS.

Inputs (produced by src/export_mdb.py):
  data/yrbs_raw.csv     - XXHq  table: raw questionnaire responses (q1-q107)
  data/yrbs_derived.csv - XXHqn table: CDC-computed dichotomous variables (QN*)

Output:
  data/yrbs_analysis_ready.csv

Variable mapping is taken from the 2023 YRBS Data User's Guide (Sept 2024),
Appendix A/C. All QN* variables use the CDC coding 1=Yes, 2=No and are
recoded here to 1/0 with missing preserved as NaN.

Key constructs
--------------
csa_exposure: composite sexual-violence exposure flag = 1 if any of
  Q19 (ever physically forced to have sexual intercourse),
  Q20 (forced to do sexual things by anyone, past 12 months),
  Q21 (sexual dating violence, past 12 months) is Yes;
  0 if all answered items are No; NaN if all three are missing.
  NOTE: YRBS does not ask perpetrator age or age at first victimization, so
  this flag captures sexual-violence victimization reported in adolescence
  (a proxy for CSA exposure, not a clinical CSA determination).

household_adversity_score: 0-3 count of ACE-style household exposures
  (Q100 parent/guardian alcohol or drug problem, Q101 parent/guardian severe
  mental illness, Q102 parent/guardian incarceration). NaN if any of the
  three items is missing (these sit in the same questionnaire block, so
  missingness is highly overlapping; see docs/missing_data.md).
"""
from pathlib import Path

import numpy as np
import pandas as pd

DATA = Path(__file__).resolve().parent.parent / "data"


def yn(series: pd.Series) -> pd.Series:
    """CDC QN coding (1=Yes, 2=No) -> 1/0 float with NaN preserved."""
    return series.map({1: 1.0, 2: 0.0})


def build() -> pd.DataFrame:
    raw = pd.read_csv(DATA / "yrbs_raw.csv", low_memory=False)
    qn = pd.read_csv(DATA / "yrbs_derived.csv", low_memory=False)
    df = raw.merge(
        qn.drop(columns=[c for c in qn.columns if c in raw.columns and c != "record"]),
        on="record",
        validate="1:1",
    )

    out = pd.DataFrame({"record": df["record"]})

    # --- survey design ---------------------------------------------------
    out["weight"] = df["weight"]
    out["stratum"] = df["stratum"]
    out["psu"] = df["psu"]

    # --- demographics -----------------------------------------------------
    out["age"] = df["q1"] + 11  # q1: 1 = "12 or younger" ... 7 = "18 or older"
    out["sex"] = df["q2"].map({1: "Female", 2: "Male"})
    out["grade"] = df["q3"].map({1: 9, 2: 10, 3: 11, 4: 12})
    out["race_ethnicity"] = df["raceeth"].map(
        {
            1: "AI/AN",
            2: "Asian",
            3: "Black",
            4: "NH/OPI",
            5: "White",
            6: "Hispanic/Latino",
            7: "Multiple-Hispanic",
            8: "Multiple-NonHispanic",
        }
    )
    out["sexual_identity"] = df["q64"].map(
        {
            1: "Heterosexual",
            2: "Gay/Lesbian",
            3: "Bisexual",
            4: "Other identity",
            5: "Questioning",
            6: "Did not understand",
        }
    )
    out["transgender"] = df["q65"].map(
        {1: "No", 2: "Yes", 3: "Not sure", 4: "Did not understand"}
    )

    # --- sexual violence exposure (primary IV) ----------------------------
    out["forced_sex_ever"] = yn(df["QN19"])
    out["sexual_violence_12mo"] = yn(df["QN20"])
    out["sexual_dating_violence_12mo"] = yn(df["QN21"])
    out["physical_dating_violence_12mo"] = yn(df["QN22"])

    sv = out[["forced_sex_ever", "sexual_violence_12mo", "sexual_dating_violence_12mo"]]
    out["csa_exposure"] = np.where(
        sv.isna().all(axis=1), np.nan, (sv == 1).any(axis=1).astype(float)
    )

    # --- household adversity (ACE-style block, Q99-Q102) -------------------
    out["parent_substance_problem"] = yn(df["QN100"])
    out["parent_mental_illness"] = yn(df["QN101"])
    out["parent_incarcerated"] = yn(df["QN102"])
    ace = out[["parent_substance_problem", "parent_mental_illness", "parent_incarcerated"]]
    out["household_adversity_score"] = np.where(
        ace.isna().any(axis=1), np.nan, ace.sum(axis=1)
    )
    # q99: adult ensured basic needs; 4/5 = most of the time / always
    out["basic_needs_met"] = np.where(
        df["q99"].isna(), np.nan, df["q99"].isin([4, 5]).astype(float)
    )

    # --- other victimization / context -------------------------------------
    out["witnessed_community_violence"] = yn(df["QN18"])
    out["bullied_at_school_12mo"] = yn(df["QN24"])
    out["bullied_electronic_12mo"] = yn(df["QN25"])
    out["unstable_housing"] = yn(df["QN86"])

    # --- substance use outcomes (CDC dichotomies) ---------------------------
    out["cig_ever"] = yn(df["QN31"])
    out["cig_current"] = yn(df["QN33"])            # past 30 days
    out["vape_ever"] = yn(df["QN35"])
    out["vape_current"] = yn(df["QN36"])           # past 30 days
    out["smokeless_current"] = yn(df["QN38"])
    out["alcohol_current"] = yn(df["QN42"])        # past 30 days
    out["binge_drinking_current"] = yn(df["QN43"]) # past 30 days
    out["marijuana_ever"] = yn(df["QN46"])
    out["marijuana_current"] = yn(df["QN48"])      # past 30 days
    out["rx_pain_misuse_ever"] = yn(df["QN49"])
    out["cocaine_ever"] = yn(df["QN50"])
    out["inhalants_ever"] = yn(df["QN51"])
    out["heroin_ever"] = yn(df["QN52"])
    out["meth_ever"] = yn(df["QN53"])
    out["ecstasy_ever"] = yn(df["QN54"])
    out["injection_drug_ever"] = yn(df["QN55"])
    out["any_illicit_ever"] = yn(df["qnillict"])   # CDC supplemental composite

    # --- social withdrawal / connectedness proxies --------------------------
    # q103: 1=strongly agree ... 5=strongly disagree (44% missing - split
    # questionnaire form; see docs/missing_data.md)
    out["feel_close_to_school"] = yn(df["QN103"])          # agree/strongly agree
    out["school_connect_scale"] = 6 - df["q103"]           # higher = more connected
    out["social_media_use"] = df["q80"] - 1                # 0=none ... 7=hourly+
    out["social_media_heavy"] = yn(df["QN80"])             # several times a day+
    out["parent_monitoring"] = yn(df["QN104"])             # most of time/always
    out["difficulty_concentrating"] = yn(df["QN106"])

    # --- mental health mediators --------------------------------------------
    out["persistent_sad_hopeless"] = yn(df["QN26"])
    out["considered_suicide_12mo"] = yn(df["QN27"])
    out["suicide_plan_12mo"] = yn(df["QN28"])
    out["attempted_suicide_12mo"] = yn(df["QN29"])
    out["poor_mental_health_30d"] = yn(df["QN84"])         # most of time/always
    out["poor_mental_health_freq"] = df["q84"] - 1         # 0=never ... 4=always
    out["sleep_hours"] = df["q85"].map(
        {1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10}
    )

    return out


if __name__ == "__main__":
    df = build()
    out_path = DATA / "yrbs_analysis_ready.csv"
    df.to_csv(out_path, index=False)
    print(f"{df.shape[0]} rows x {df.shape[1]} cols -> {out_path}")
    print(
        "csa_exposure prevalence (unweighted, non-missing): "
        f"{100 * df['csa_exposure'].mean():.1f}%"
    )
