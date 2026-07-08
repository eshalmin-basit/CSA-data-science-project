# Screening model report

## Any current substance use (30d)
- n=6409 (test 1282), prevalence 43.7%
- Calibrated XGBoost: AUC 0.6945, PR-AUC 0.6358, Brier 0.2176
- Logistic:           AUC 0.6973, PR-AUC 0.6406
- @90% recall: threshold 0.24, flags 82% of students, precision 48%
- @80% recall: threshold 0.32, flags 69% of students, precision 52%

## Binge drinking (30d)
- n=6039 (test 1208), prevalence 12.6%
- Calibrated XGBoost: AUC 0.6932, PR-AUC 0.2866, Brier 0.1029
- Logistic:           AUC 0.6905, PR-AUC 0.2676
- @90% recall: threshold 0.06, flags 73% of students, precision 16%
- @80% recall: threshold 0.07, flags 67% of students, precision 16%

## Any illicit drug (ever)
- n=6139 (test 1228), prevalence 13.9%
- Calibrated XGBoost: AUC 0.7587, PR-AUC 0.4359, Brier 0.1029
- Logistic:           AUC 0.761, PR-AUC 0.4327
- @90% recall: threshold 0.06, flags 76% of students, precision 18%
- @80% recall: threshold 0.08, flags 57% of students, precision 20%
