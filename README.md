# CSA Trauma, Substance Use, and Social Withdrawal — 2023 National YRBS

A data science research project studying how sexual-violence victimization
(a proxy for childhood sexual abuse exposure) and household adversity predict
adolescent substance use and social withdrawal, using the CDC's 2023 National
Youth Risk Behavior Survey (YRBS), N = 20,103 US high school students.

> **Framing note:** the YRBS is cross-sectional and self-reported. All results
> are risk-factor associations, **not** causal claims.

## Data source

- CDC YRBSS: https://www.cdc.gov/yrbs/data/index.html
- Raw file: `XXH2023_YRBS_Data.mdb` (Access database; tables `XXHq` raw
  responses, `XXHqn` CDC-computed dichotomous variables)
- Documentation: 2023 YRBS Data User's Guide (Sept 2024)

## Pipeline

```
src/export_mdb.py      .mdb -> data/yrbs_raw.csv + data/yrbs_derived.csv
src/build_dataset.py   -> data/yrbs_analysis_ready.csv (recoded analysis file)
notebooks/01_eda.py    exploratory analysis (weighted + unweighted)
src/models/            logistic baselines, XGBoost + SHAP, mediation analysis
paper/draft.md         research paper draft
app/                   Next.js results dashboard
```

## Key constructs

| Construct | Definition |
|---|---|
| `csa_exposure` | Any of: ever forced intercourse (Q19), sexual violence past 12 mo (Q20), sexual dating violence (Q21). Prevalence ≈ 15.5% unweighted. |
| `household_adversity_score` | 0–3 count: parent/guardian substance problem (Q100), mental illness (Q101), incarceration (Q102). |
| Substance outcomes | CDC QN dichotomies: cigarettes, vaping, alcohol, binge drinking, marijuana, Rx pain-med misuse, cocaine, inhalants, heroin, meth, ecstasy, injection drug use. |
| Withdrawal proxies | School connectedness (Q103), parental monitoring (Q104), social media use (Q80). |
| Mediators | Persistent sadness/hopelessness (Q26), poor mental health past 30 days (Q84), suicidality items (Q27–Q29). |

## Reproducing

```bash
pip install pandas numpy pyodbc scikit-learn xgboost shap statsmodels imbalanced-learn matplotlib seaborn
python src/export_mdb.py path/to/XXH2023_YRBS_Data.mdb
python src/build_dataset.py
```

Survey weights (`weight`, `stratum`, `psu`) are carried through for
design-aware estimates.
