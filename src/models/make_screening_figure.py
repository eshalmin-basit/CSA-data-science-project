"""Static figure panel for the paper: ROC, calibration, and decision curves
for the screening prototype, rendered from reports/dashboard_data/screening.json.
"""
import json
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parent.parent.parent
FIG = ROOT / "reports" / "figures"
d = json.loads((ROOT / "reports" / "dashboard_data" / "screening.json").read_text())

plt.rcParams.update({"font.size": 9, "axes.spines.top": False, "axes.spines.right": False})
fig, axes = plt.subplots(1, 3, figsize=(11, 3.6))

colors = {"any_current_substance": "#c0504d", "any_illicit_ever": "#4f81bd",
          "binge_drinking_current": "#9bbb59"}
labels = {k: d[k]["label"] for k in d}

# ROC
ax = axes[0]
for k, c in colors.items():
    m = d[k]["models"]["xgboost_calibrated"]
    ax.plot([p["x"] for p in m["roc_curve"]], [p["y"] for p in m["roc_curve"]],
            color=c, lw=1.8, label=f"{labels[k]} (AUC {m['auc']:.2f})")
ax.plot([0, 1], [0, 1], "--", color="grey", lw=0.8)
ax.set_xlabel("False positive rate"); ax.set_ylabel("True positive rate")
ax.set_title("(a) ROC — held-out test set", fontsize=9.5)
ax.legend(fontsize=6.5, loc="lower right")

# Calibration
ax = axes[1]
for k, c in colors.items():
    m = d[k]["models"]["xgboost_calibrated"]
    ax.plot([p["mean_pred"] for p in m["calibration"]],
            [p["frac_pos"] for p in m["calibration"]],
            marker="o", ms=3, color=c, lw=1.5,
            label=f"{labels[k]} (Brier {m['brier']:.3f})")
ax.plot([0, 1], [0, 1], "--", color="grey", lw=0.8)
ax.set_xlabel("Predicted probability"); ax.set_ylabel("Observed frequency")
ax.set_title("(b) Calibration (quantile bins)", fontsize=9.5)
ax.legend(fontsize=6.5, loc="upper left")

# Decision curve (any current substance)
ax = axes[2]
m = d["any_current_substance"]["models"]["xgboost_calibrated"]
dc = m["decision_curve"]
t = [r["threshold"] for r in dc]
ax.plot(t, [r["net_benefit_model"] for r in dc], color="#c0504d", lw=1.8, label="Screen by model")
ax.plot(t, [r["net_benefit_treat_all"] for r in dc], "--", color="#e6a23c", lw=1.4, label="Screen everyone")
ax.plot(t, [r["net_benefit_treat_none"] for r in dc], ":", color="grey", lw=1.4, label="Screen no one")
ax.set_ylim(-0.05, 0.5)
ax.set_xlabel("Threshold probability"); ax.set_ylabel("Net benefit")
ax.set_title("(c) Decision curve — any current substance use", fontsize=9.5)
ax.legend(fontsize=6.5)

plt.tight_layout()
plt.savefig(FIG / "screening_performance_panel.png", dpi=200)
print("saved", FIG / "screening_performance_panel.png")
