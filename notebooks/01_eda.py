"""Exploratory data analysis - 2023 National YRBS CSA study.

Produces:
  reports/figures/*.png
  reports/eda_summary.md   (auto-generated tables referenced by the paper)

The YRBS uses a complex survey design (weight / stratum / psu). Prevalence
estimates here are weight-adjusted point estimates; design-based standard
errors (Taylor linearization) are used in the modeling stage. Rows are never
treated as iid for population statements.
"""
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

ROOT = Path(__file__).resolve().parent.parent
FIG = ROOT / "reports" / "figures"
FIG.mkdir(parents=True, exist_ok=True)

sns.set_theme(style="whitegrid", context="talk")

df = pd.read_csv(ROOT / "data" / "yrbs_analysis_ready.csv")

SUBSTANCE = [
    "cig_current", "vape_current", "alcohol_current", "binge_drinking_current",
    "marijuana_current", "rx_pain_misuse_ever", "cocaine_ever", "inhalants_ever",
    "heroin_ever", "meth_ever", "ecstasy_ever", "injection_drug_ever",
    "any_illicit_ever",
]
WITHDRAWAL = ["feel_close_to_school", "parent_monitoring", "social_media_heavy"]
MEDIATORS = [
    "persistent_sad_hopeless", "considered_suicide_12mo", "suicide_plan_12mo",
    "attempted_suicide_12mo", "poor_mental_health_30d",
]
EXPOSURES = [
    "csa_exposure", "forced_sex_ever", "sexual_violence_12mo",
    "sexual_dating_violence_12mo", "parent_substance_problem",
    "parent_mental_illness", "parent_incarcerated",
]

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
    "csa_exposure": "Sexual-violence exposure (composite)",
    "forced_sex_ever": "Ever forced intercourse",
    "sexual_violence_12mo": "Sexual violence (12mo)",
    "sexual_dating_violence_12mo": "Sexual dating violence (12mo)",
    "parent_substance_problem": "Parent substance problem",
    "parent_mental_illness": "Parent mental illness",
    "parent_incarcerated": "Parent incarcerated",
}


def wmean(col: str, mask=None) -> float:
    """Weighted prevalence of a 0/1 column among non-missing values."""
    d = df if mask is None else df[mask]
    ok = d[col].notna()
    return float(np.average(d.loc[ok, col], weights=d.loc[ok, "weight"]))


def uwmean(col: str) -> float:
    return float(df[col].mean())


lines = ["# EDA summary — 2023 National YRBS (N = 20,103)\n"]

# ---------------------------------------------------------------- missingness
miss = (df.isna().mean() * 100).sort_values(ascending=False).round(1)
lines.append("## Missingness by variable (%)\n")
lines.append(miss.to_frame("pct_missing").to_markdown())
lines.append("")

fig, ax = plt.subplots(figsize=(10, 12))
miss_plot = miss[miss > 0]
ax.barh(miss_plot.index[::-1], miss_plot.values[::-1], color="#c0504d")
ax.set_xlabel("% missing")
ax.set_title("Missingness by variable")
plt.tight_layout()
plt.savefig(FIG / "missingness.png", dpi=150)
plt.close()

# --------------------------------------------- weighted vs unweighted table
key_vars = EXPOSURES + MEDIATORS + SUBSTANCE + WITHDRAWAL
rows = []
for v in key_vars:
    rows.append(
        {
            "variable": LABELS.get(v, v),
            "unweighted_%": round(100 * uwmean(v), 1),
            "weighted_%": round(100 * wmean(v), 1),
            "n_nonmissing": int(df[v].notna().sum()),
        }
    )
prev = pd.DataFrame(rows)
lines.append("## Weighted vs unweighted prevalence\n")
lines.append(prev.to_markdown(index=False))
lines.append("")

# ------------------------------------------- outcomes by exposure (weighted)
def by_exposure(outcomes, exposure="csa_exposure"):
    rows = []
    for v in outcomes:
        exp1 = wmean(v, mask=df[exposure] == 1)
        exp0 = wmean(v, mask=df[exposure] == 0)
        rows.append(
            {
                "outcome": LABELS.get(v, v),
                "exposed_%": round(100 * exp1, 1),
                "unexposed_%": round(100 * exp0, 1),
                "prevalence_ratio": round(exp1 / exp0, 2) if exp0 > 0 else np.nan,
            }
        )
    return pd.DataFrame(rows)


assoc = by_exposure(SUBSTANCE + WITHDRAWAL + MEDIATORS)
lines.append("## Weighted prevalence by sexual-violence exposure\n")
lines.append(assoc.to_markdown(index=False))
lines.append("")

plot_df = assoc[assoc["outcome"].isin([LABELS[v] for v in SUBSTANCE])].copy()
plot_df = plot_df.sort_values("exposed_%", ascending=True)
fig, ax = plt.subplots(figsize=(11, 9))
y = np.arange(len(plot_df))
ax.barh(y + 0.2, plot_df["exposed_%"], height=0.38, label="Exposed", color="#c0504d")
ax.barh(y - 0.2, plot_df["unexposed_%"], height=0.38, label="Not exposed", color="#4f81bd")
ax.set_yticks(y)
ax.set_yticklabels(plot_df["outcome"], fontsize=12)
ax.set_xlabel("Weighted prevalence (%)")
ax.set_title("Substance use by sexual-violence exposure")
ax.legend()
plt.tight_layout()
plt.savefig(FIG / "substance_by_exposure.png", dpi=150)
plt.close()

# --------------------------------- dose-response: household adversity score
rows = []
for k in [0, 1, 2, 3]:
    mask = df["household_adversity_score"] == k
    rows.append(
        {
            "score": k,
            "n": int(mask.sum()),
            "any_illicit_%": round(100 * wmean("any_illicit_ever", mask), 1),
            "binge_%": round(100 * wmean("binge_drinking_current", mask), 1),
            "vape_%": round(100 * wmean("vape_current", mask), 1),
            "sad_hopeless_%": round(100 * wmean("persistent_sad_hopeless", mask), 1),
            "attempted_suicide_%": round(100 * wmean("attempted_suicide_12mo", mask), 1),
        }
    )
dose = pd.DataFrame(rows)
lines.append("## Dose-response: household adversity score\n")
lines.append(dose.to_markdown(index=False))
lines.append("")

fig, ax = plt.subplots(figsize=(10, 7))
for col, label in [
    ("any_illicit_%", "Any illicit drug (ever)"),
    ("vape_%", "Vaping (30d)"),
    ("binge_%", "Binge drinking (30d)"),
    ("sad_hopeless_%", "Persistent sadness"),
    ("attempted_suicide_%", "Attempted suicide (12mo)"),
]:
    ax.plot(dose["score"], dose[col], marker="o", label=label)
ax.set_xticks([0, 1, 2, 3])
ax.set_xlabel("Household adversity score (0–3)")
ax.set_ylabel("Weighted prevalence (%)")
ax.set_title("Dose–response: household adversity")
ax.legend(fontsize=11)
plt.tight_layout()
plt.savefig(FIG / "dose_response_household_adversity.png", dpi=150)
plt.close()

# ----------------------------------------------------- correlation structure
corr_vars = EXPOSURES + MEDIATORS + [
    "cig_current", "vape_current", "alcohol_current", "binge_drinking_current",
    "marijuana_current", "rx_pain_misuse_ever", "any_illicit_ever",
] + WITHDRAWAL
corr = df[corr_vars].corr()
fig, ax = plt.subplots(figsize=(16, 13))
sns.heatmap(
    corr, cmap="RdBu_r", center=0, annot=True, fmt=".2f",
    annot_kws={"size": 8},
    xticklabels=[LABELS.get(v, v) for v in corr_vars],
    yticklabels=[LABELS.get(v, v) for v in corr_vars],
    ax=ax,
)
ax.tick_params(labelsize=9)
ax.set_title("Pairwise correlations (phi) — exposures, mediators, outcomes")
plt.tight_layout()
plt.savefig(FIG / "correlation_heatmap.png", dpi=150)
plt.close()

# --------------------------------------------------- demographics of exposure
rows = []
for name, mask in [
    ("Overall", df["csa_exposure"].notna()),
    ("Female", df["sex"] == "Female"),
    ("Male", df["sex"] == "Male"),
]:
    rows.append({"group": name, "csa_exposure_%": round(100 * wmean("csa_exposure", mask), 1)})
for grp, sub in df.groupby("race_ethnicity"):
    ok = sub["csa_exposure"].notna()
    if ok.sum() > 100:
        rows.append(
            {
                "group": grp,
                "csa_exposure_%": round(
                    100 * np.average(sub.loc[ok, "csa_exposure"], weights=sub.loc[ok, "weight"]), 1
                ),
            }
        )
demo = pd.DataFrame(rows)
lines.append("## Sexual-violence exposure by demographic group (weighted)\n")
lines.append(demo.to_markdown(index=False))
lines.append("")

(ROOT / "reports").mkdir(exist_ok=True)
(ROOT / "reports" / "eda_summary.md").write_text("\n".join(lines), encoding="utf-8")
print("EDA complete. Figures ->", FIG)
print("\n".join(lines[:4]))
print(prev.to_string(index=False))
print()
print(assoc.to_string(index=False))
print()
print(dose.to_string(index=False))
print()
print(demo.to_string(index=False))
