"""Missing-data diagnostics - 2023 National YRBS CSA study.

Generates the empirical evidence behind docs/missing_data.md:
  1. Block structure of item missingness (correlation of missingness
     indicators within the new-to-2023 item block Q98-Q107).
  2. School(PSU)-level all-or-none missingness -> questionnaire-version
     mechanism, not individual refusal.
  3. Subsample comparability (MAR check): key statistics among students who
     did vs did not receive the new-item block.

Outputs: reports/figures/missingness_block_corr.png, printed tables
(embedded in docs/missing_data.md).
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

raw = pd.read_csv(ROOT / "data" / "yrbs_raw.csv", low_memory=False)
df = pd.read_csv(ROOT / "data" / "yrbs_analysis_ready.csv")

# 1. block correlation of missingness indicators
block = ["q80", "q84", "q99", "q100", "q101", "q102", "q103", "q104", "q105", "q106"]
m = raw[block].isna()
corr = m.corr()
fig, ax = plt.subplots(figsize=(9, 7))
sns.heatmap(corr, annot=True, fmt=".2f", cmap="Reds", vmin=0, vmax=1, ax=ax)
ax.set_title("Correlation of missingness indicators\n(new-to-2023 item block)")
plt.tight_layout()
plt.savefig(FIG / "missingness_block_corr.png", dpi=150)
plt.close()

# 2. PSU-level all-or-none missingness
rows = []
for q in ["q100", "q103", "q104"]:
    miss = raw[q].isna().astype(int)
    g = miss.groupby(raw["psu"]).agg(["mean", "count"])
    g = g[g["count"] >= 30]
    rows.append(
        {
            "item": q,
            "overall_missing_%": round(100 * miss.mean(), 1),
            "psu_all_or_none_%": round(
                100 * ((g["mean"] < 0.15) | (g["mean"] > 0.85)).mean(), 1
            ),
            "n_psus": len(g),
        }
    )
print("PSU-level missingness concentration:")
print(pd.DataFrame(rows).to_string(index=False))

# 3. subsample comparability
got_block = df["feel_close_to_school"].notna()
rows = []
for v in ["csa_exposure", "persistent_sad_hopeless", "vape_current",
          "alcohol_current", "marijuana_current", "attempted_suicide_12mo"]:
    out = {"variable": v}
    for name, mask in [("received_block_%", got_block), ("no_block_%", ~got_block)]:
        ok = mask & df[v].notna()
        out[name] = round(100 * np.average(df.loc[ok, v], weights=df.loc[ok, "weight"]), 1)
    rows.append(out)
print("\nSubsample comparability (weighted %):")
print(pd.DataFrame(rows).to_string(index=False))
