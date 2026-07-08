"""Shared definitions for the modeling stage."""
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent.parent
DATA = ROOT / "data"
FIG = ROOT / "reports" / "figures"
DASH = ROOT / "reports" / "dashboard_data"

# Outcomes modeled (binary, CDC QN coding recoded 1/0).
# low_school_connectedness is the social-withdrawal outcome (1 = does NOT
# agree they feel close to people at school; subsample per docs/missing_data.md)
OUTCOMES = {
    "vape_current": "Vaping (30d)",
    "alcohol_current": "Alcohol (30d)",
    "binge_drinking_current": "Binge drinking (30d)",
    "marijuana_current": "Marijuana (30d)",
    "cig_current": "Cigarettes (30d)",
    "rx_pain_misuse_ever": "Rx pain-med misuse (ever)",
    "any_illicit_ever": "Any illicit drug (ever)",
    "low_school_connectedness": "Low school connectedness",
}

# Exposure block + demographics. Mediators (sadness, suicidality, poor mental
# health) are deliberately EXCLUDED from predictive models: they sit on the
# hypothesized causal pathway and would launder exposure signal. They enter
# only via the mediation analysis.
CORE_FEATURES = ["csa_exposure", "household_adversity_score", "age", "grade"]
CONTEXT_FEATURES = [
    "physical_dating_violence_12mo",
    "bullied_at_school_12mo",
    "bullied_electronic_12mo",
    "witnessed_community_violence",
    "unstable_housing",
    "basic_needs_met",
]
CATEGORICAL = ["sex", "race_ethnicity", "sexual_identity"]


def load() -> pd.DataFrame:
    df = pd.read_csv(DATA / "yrbs_analysis_ready.csv")
    df["low_school_connectedness"] = 1 - df["feel_close_to_school"]
    return df


def design_matrix(df: pd.DataFrame, features=None) -> pd.DataFrame:
    """One-hot design matrix; NaN preserved for tree models."""
    feats = features or (CORE_FEATURES + CONTEXT_FEATURES)
    X = df[feats].copy()
    dummies = pd.get_dummies(df[CATEGORICAL], prefix=CATEGORICAL, dtype=float)
    # keep NaN information for categoricals: get_dummies drops NaN rows to all-0
    return pd.concat([X, dummies], axis=1)


FEATURE_LABELS = {
    "csa_exposure": "Sexual-violence exposure",
    "household_adversity_score": "Household adversity (0-3)",
    "age": "Age",
    "grade": "Grade",
    "physical_dating_violence_12mo": "Physical dating violence",
    "bullied_at_school_12mo": "Bullied at school",
    "bullied_electronic_12mo": "Cyberbullied",
    "witnessed_community_violence": "Witnessed community violence",
    "unstable_housing": "Unstable housing",
    "basic_needs_met": "Basic needs met (protective)",
    "sex_Female": "Female",
    "sex_Male": "Male",
    "race_ethnicity_AI/AN": "AI/AN",
    "race_ethnicity_Asian": "Asian",
    "race_ethnicity_Black": "Black",
    "race_ethnicity_Hispanic/Latino": "Hispanic/Latino",
    "race_ethnicity_Multiple-Hispanic": "Multiracial (Hispanic)",
    "race_ethnicity_Multiple-NonHispanic": "Multiracial (non-Hispanic)",
    "race_ethnicity_NH/OPI": "NH/OPI",
    "race_ethnicity_White": "White",
    "sexual_identity_Heterosexual": "Heterosexual",
    "sexual_identity_Gay/Lesbian": "Gay/Lesbian",
    "sexual_identity_Bisexual": "Bisexual",
    "sexual_identity_Other identity": "Other sexual identity",
    "sexual_identity_Questioning": "Questioning",
    "sexual_identity_Did not understand": "Did not understand SI item",
}
