# Sexual-Violence Victimization, Household Adversity, and Adolescent Substance Use and Social Withdrawal: A Design-Aware Machine-Learning Analysis of the 2023 National Youth Risk Behavior Survey

*Manuscript prepared for submission — working version*

**Data availability:** All analyses use the public-use 2023 National YRBS
microdata (CDC). Complete code, the reproducible pipeline, and an
interactive results dashboard are available at
`github.com/eshalmin-basit/CSA-data-science-project` and
`eshalmin-basit.github.io/CSA-data-science-project`.

---

## Abstract

**Background.** Childhood sexual abuse (CSA) is associated with maladaptive
outcomes extending well beyond the stereotypes attached to survivors. We
test a coping-theoretic account — that substance use and social withdrawal
after sexual trauma function as regulation strategies — against four
pre-stated hypotheses in the newest nationally representative US adolescent
sample.

**Methods.** Cross-sectional analysis of the 2023 National Youth Risk
Behavior Survey (N = 20,103 students, grades 9–12; three-stage cluster
design). Exposure was a composite of three sexual-violence items; household
adversity was a 0–3 count of new-to-2023 ACE items. We combined
survey-weighted prevalence estimation and cluster-robust logistic regression
with (i) stratified 5-fold cross-validated prediction using
exposure/adversity/context features only, comparing class weighting against
SMOTE; (ii) TreeSHAP interpretation; (iii) potential-outcomes mediation
analysis through persistent sadness/hopelessness; and (iv) a calibrated,
fairness-audited screening prototype evaluated on a held-out test set with
bootstrap confidence intervals, operating-point analysis, and decision-curve
analysis. E-values quantified robustness to unmeasured confounding.

**Results.** Weighted exposure prevalence was 14.6% (21.6% female, 8.1%
male). Exposed students showed higher weighted prevalence of all twelve
substance outcomes, with prevalence ratios rising monotonically with
substance severity (alcohol 2.17 → injection drug use 7.88), and lower
school connectedness (0.76) and parental monitoring (0.85). Adjusted odds
ratios were 2.19–3.19 across substance outcomes (all 95% CIs excluding 1;
E-values 2.3–3.0). Household adversity showed strict dose–response gradients.
Persistent sadness/hopelessness mediated 15–23% of substance associations
and 46% of the connectedness association (all ACME CIs excluding 0).
Cross-validated ROC-AUC reached 0.70–0.79 from trauma and demographic
features alone; SMOTE collapsed sensitivity relative to class weighting
(e.g., 0.13 vs 0.65 for binge drinking). The calibrated screening model
achieved held-out AUC 0.76 (95% CI 0.72–0.80) for lifetime illicit drug use
and identified 81% of currently-using students at a decision-curve-supported
threshold, with subgroup AUC gaps ≤ 0.045.

**Conclusions.** All four hypotheses were supported. The severity-graded,
distress-mediated pattern is consistent with trauma-driven coping rather
than intrinsic risk-seeking. Trauma-informed screening with data schools
already collect appears feasible, subject to prospective validation and
strict ethical guardrails. Findings are associations from cross-sectional
self-report and are framed as lower bounds, not causal effects.

**Keywords:** childhood sexual abuse; adverse childhood experiences;
adolescent substance use; school connectedness; machine learning; causal
mediation; risk screening; calibration; YRBS

---

## 1. Introduction

Adolescents who have experienced sexual violence carry an elevated burden of
psychological distress, and a large clinical literature links childhood
sexual abuse to later substance use, depression, and social difficulties
(Hailes et al., 2019; Norman et al., 2012). Public discussion of CSA
sequelae, however, tends to fixate on a narrow set of stereotyped outcomes.
This study starts from a different premise: that the behaviors most strongly
associated with trauma exposure — substance use across the full severity
spectrum, and withdrawal from school and family connection — are better
understood as coping mechanisms aimed at regaining stability and control
(Khantzian, 1997). Taking that premise seriously changes what should be
measured (the full severity gradient, not a signature behavior), what should
be modeled (distress as mediator, not covariate), and what should be built
(sensitivity-first supportive screening, not punitive flagging).

### 1.1 Theoretical framework and hypotheses

The self-medication hypothesis (Khantzian, 1997) holds that substances are
selected and used to regulate otherwise intolerable affective states.
Trauma-exposed adolescents experience chronic hyperarousal, intrusive
distress, and shame; substances offer rapid, reliable, self-administered
relief, and social withdrawal reduces exposure to evaluation and reminders.
Under this account — and in contrast to a dispositional "risk-seeking"
account — we pre-state four falsifiable hypotheses:

- **H1a (Breadth).** Sexual-violence exposure is associated with elevated
  prevalence of *every* substance outcome, not one or two signature
  behaviors, and the associations survive adjustment for demographics and
  household adversity.
- **H1b (Severity gradient).** The *relative* association strengthens with
  substance severity/rarity. Escalating-coping predicts that the rarer,
  more dangerous substances — used almost exclusively under strong
  regulation pressure — show the largest prevalence ratios. A generalized
  risk-taking disposition predicts no such ordering, since it elevates all
  risk behaviors comparably.
- **H2 (Mediation).** A measurable share of each exposure–outcome
  association is statistically mediated by psychological distress
  (persistent sadness/hopelessness; poor current mental health), and the
  mediated share is *larger* for social withdrawal than for substance use,
  since withdrawal is a direct expression of distress whereas substance use
  also serves regulation functions not captured by mood items.
- **H3 (Cumulative adversity).** Household adversity exhibits a monotonic
  dose–response with every outcome, replicating the ACE gradient (Felitti
  et al., 1998; Dube et al., 2003) in a 2023 nationally representative
  adolescent sample.
- **H4 (Predictability).** Exposure, adversity, and context features alone —
  excluding all behavioral and mental-health inputs — support
  cross-validated discrimination adequate for sensitivity-first screening
  (ROC-AUC ≥ 0.70 for substance outcomes), with victimization variables
  outranking demographics in feature attributions.

The 2023 National YRBS is the first cycle to carry household-ACE,
school-connectedness, and parental-monitoring items alongside the
long-standing violence and substance batteries (Brener et al., 2024),
making these hypotheses jointly testable in one representative sample for
the first time.

**Contributions.** (i) A design-aware characterization of the
sexual-violence → substance-use severity gradient in the newest national
YRBS cycle; (ii) the first dose–response analysis of the 2023 household-ACE
items against the full substance battery; (iii) a formal potential-outcomes
mediation test of the distress pathway; (iv) a predictive protocol that
excludes on-pathway mediators, quantifies the class-imbalance decision, and
explains itself via SHAP; (v) a calibrated, fairness-audited screening
prototype with bootstrap uncertainty, operating-point and decision-curve
evidence, and a public interactive implementation; and (vi) identification
of school-level questionnaire-version missingness in the 2023 public-use
file, of independent methodological value to other YRBS analysts.

## 2. Related Work

### 2.1 CSA and substance use

Hailes et al. (2019), in an umbrella review of 19 meta-analyses (559
primary studies), report pooled odds ratios of roughly 1.8–3.3 linking CSA
to psychiatric and substance-misuse outcomes; Norman et al. (2012) find
comparable magnitudes for physical abuse and neglect with evidence
satisfying several causal-plausibility criteria. Simpson and Miller (2002)
document strongly elevated CSA prevalence in clinical substance-using
populations. Our adjusted estimates (2.19–3.19; Section 5.4) fall squarely
in the predicted range in a current population-representative adolescent
sample — itself a non-trivial replication, since most prior estimates come
from adult retrospection or clinical samples.

### 2.2 Cumulative adversity and dose–response

The CDC-Kaiser ACE study established the graded exposure–outcome
relationship for adult health-risk behavior (Felitti et al., 1998), and
Dube et al. (2003) extended it to illicit drug initiation with 2- to 4-fold
risk increases per additional ACE. The household-dysfunction items entered
the national YRBS only in 2023; we provide their first dose–response
characterization against the adolescent substance battery.

### 2.3 Self-medication and coping theory

Khantzian's (1997) framework generates the breadth, gradient, and mediation
predictions of Section 1.1. Direct mediation tests in nationally
representative adolescent data are rare; most evidence is clinical, adult,
or bivariate. Section 5.7 supplies the missing test with formal effect
decomposition (Imai et al., 2010).

### 2.4 School connectedness

Connectedness is among the most replicated protective factors in adolescent
health (Resnick et al., 1997; Steiner et al., 2019). We quantify both its
deficit among victimized students and — new to this literature — the share
of that deficit running through measured distress (46%).

### 2.5 Machine learning on adolescent risk surveys

Tree ensembles on YRBS suicidality report AUCs in the mid-0.70s to low
0.80s using broad behavioral feature sets. Three recurrent weaknesses
motivate our protocol: mixing on-pathway mediators (or downstream
behaviors) into features, inflating apparent performance while destroying
interpretive value; applying SMOTE (Chawla et al., 2002) without comparison
to class weighting; and omitting calibration, decision-analytic utility
(Vickers & Elkin, 2006), and subgroup auditing (Obermeyer et al., 2019)
despite deployment claims. Sections 4.3–4.9 address each directly.

## 3. Data

### 3.1 Survey design and sample

The National YRBS is a biennial cross-sectional school-based survey using a
stratified three-stage cluster design — counties (primary sampling units),
then schools, then classes — representative of US public and private high
school students in grades 9–12 (Brener et al., 2024). In 2023, 155 of 311
sampled schools participated (school response rate 49.8%); 20,386 of 28,308
sampled students submitted questionnaires (student response rate 71.0%;
overall response rate 35.4%), yielding N = 20,103 usable records after CDC
data editing. The 2023 cycle was administered for the first time on
electronic tablets with programmed skip logic. Survey design variables
(`weight`, `stratum`, `psu`) accompany every record; weights calibrate the
sample to national enrollment by sex, race/ethnicity, and grade.

### 3.2 Data preparation

The public-use Access database contains raw responses (table `XXHq`,
questions Q1–Q107) and CDC-computed dichotomous variables (`XXHqn`, QN
coding 1 = yes, 2 = no). Our open pipeline (`src/export_mdb.py`,
`src/build_dataset.py`) exports both tables via ODBC, merges them 1:1 on
record ID, and recodes to an analysis file of 50 variables plus design
columns. Recoding rules: QN dichotomies map {1, 2} → {1, 0} with missing
preserved; ordinal items retain CDC category order; age maps category codes
to years; race/ethnicity uses the CDC 8-category bridged variable. We use
CDC's QN dichotomies rather than re-deriving cutoffs, inheriting their
logical-consistency edits. Two composites are constructed:

- `csa_exposure` = 1 if any of Q19 (ever physically forced intercourse),
  Q20 (forced sexual things by anyone, past 12 months), Q21 (sexual dating
  violence, past 12 months) is yes; 0 if all answered items are no; missing
  if all three are missing.
- `household_adversity_score` = count of Q100 (parent/guardian problematic
  alcohol/drug use), Q101 (parent/guardian severe mental illness), Q102
  (parent/guardian incarceration); missing if any component is missing
  (components co-missing at r ≈ 0.96, so this restriction costs < 2%
  beyond the block itself).

Variable mapping was validated line-by-line against the 2023 Data User's
Guide codebook, and the composite prevalence (15.5% unweighted) was
verified against independent derivation from the raw items.

### 3.3 Measures

**Table 1.** Analysis constructs, source items, and weighted prevalence.

| Construct | YRBS item(s) | Weighted % |
|---|---|---|
| Sexual-violence exposure (composite) | Q19 ∪ Q20 ∪ Q21 | 14.6 |
| — Ever forced intercourse | Q19 | 8.6 |
| — Sexual violence, any perpetrator (12mo) | Q20 | 11.4 |
| — Sexual dating violence (12mo) | Q21 | 5.9 |
| Parent/guardian substance problem | Q100 | 24.8 |
| Parent/guardian mental illness | Q101 | 28.5 |
| Parent/guardian incarcerated | Q102 | 14.4 |
| Persistent sadness/hopelessness | Q26 | 39.7 |
| Poor current mental health (30d) | Q84 | 28.5 |
| Attempted suicide (12mo) | Q29 | 9.5 |
| Current vaping (30d) | Q36 | 16.8 |
| Current alcohol (30d) | Q42 | 22.1 |
| Current binge drinking (30d) | Q43 | 8.8 |
| Current marijuana (30d) | Q48 | 17.0 |
| Current cigarettes (30d) | Q33 | 3.5 |
| Rx pain-medicine misuse (ever) | Q49 | 11.6 |
| Any illicit drug (ever; CDC composite) | qnillict | 9.9 |
| Feels close to people at school | Q103 | 55.3 |
| Parental monitoring | Q104 | 84.0 |

*Terminology.* The YRBS records neither age at first victimization nor
perpetrator identity; `csa_exposure` therefore measures sexual-violence
victimization reported in adolescence — a proxy for, not a clinical
determination of, childhood sexual abuse. Under systematic under-disclosure
this measure is misclassified toward "unexposed," and nondifferential
misclassification of a binary exposure biases associations toward the null;
we accordingly interpret prevalence and associations as lower bounds.

### 3.4 Analytic samples

Analyses use complete cases per estimand; no exposure or outcome is ever
imputed (rationale in 3.5).

**Table 2.** Analytic-sample flow.

| Analysis | Requirement | n |
|---|---|---|
| Full sample | — | 20,103 |
| Exposure prevalence | csa_exposure observed | 17,627 |
| Unadjusted associations | + outcome observed | 10,925–19,600 (per outcome) |
| Adjusted odds ratios | + adversity, demographics | 10,006–10,533 |
| Prediction (CV) | outcome + exposure observed | 10,838–17,381 |
| Mediation | + mediator, adjustment set | 9,929–10,440 |
| Screening prototype | all 13 intake items observed | 6,039–6,409 |

### 3.5 Missing data: mechanism before method

We diagnosed mechanisms before selecting handling strategies (full evidence
in repository, `docs/missing_data.md`). Four mechanisms:

1. **Questionnaire-version missingness (structural, school-level).**
   Students in schools sampled for both national and state surveys
   completed their state's questionnaire, which omits the 20 new-to-2023
   national items (ACE block, connectedness, monitoring). Signature:
   within-block missingness correlations r = 0.88–0.96; 83–87% of PSUs
   (n ≥ 30) all-or-none missing; item response *rises* from 54% (Q98) to
   78% (Q99), impossible under attrition. The receiving subsample matches
   the full sample within 0.7 weighted percentage points on every audited
   construct (e.g., exposure 14.8% vs 14.1%; vaping 16.9% vs 16.5%);
   affected variables are analyzed in the subsample that received them.
2. **Within-questionnaire attrition** (97% response at Q48 → 65% at Q78),
   treated as missing-at-random given demographics.
3. **Skip-pattern missingness** from tablet branching, resolved by CDC
   logical edits in the QN variables.
4. **Sensitive-item nonresponse** on the sexual-violence items (14–22%),
   potentially value-related; exposure is never imputed and associations
   are framed as lower bounds.

Multiple imputation is deliberately not applied to block-missing variables:
imputing 44% of a variable whose absence is a school-level design artifact
would manufacture within-school variance without information gain.

### 3.6 Ethics

All data are de-identified public-use records; secondary analysis requires
no IRB review. Reporting commitments: risk-factor language throughout, no
causal claims; results framed to motivate protection and support, never
stigma; the screening prototype framed strictly as a prioritization aid for
supportive, non-punitive outreach, with prospective validation, IRB
oversight, and community consent named as deployment preconditions.

## 4. Methods

### 4.1 Design-aware estimation

Weighted prevalence: p̂ = Σᵢ wᵢyᵢ / Σᵢ wᵢ over non-missing respondents.
Adjusted associations use weighted logistic regression with weights
normalized to the analytic n (w̃ᵢ = wᵢ · n/Σwᵢ):

> logit P(Yᵢ = 1) = β₀ + β₁·CSAᵢ + β₂·ADVᵢ + γ′Xᵢ

with ADV the 0–3 adversity count and X = {age, grade, sex,
race/ethnicity (ref. White)}. Standard errors are cluster-robust (sandwich)
on PSU. This approximates Taylor-linearized design-based variance while
ignoring stratification gains (generally conservative); we report it as an
approximation to full survey-package estimation.

### 4.2 Performance metric definitions

With TP/FP/TN/FN the confusion-matrix cells at threshold t:

- Sensitivity (recall) = TP/(TP+FN); specificity = TN/(TN+FP);
  precision (PPV) = TP/(TP+FP); F1 = 2·(precision·recall)/(precision+recall).
- ROC-AUC: probability a random positive is scored above a random negative;
  the area under {(FPR(t), TPR(t))}.
- PR-AUC: average precision, Σₙ (Rₙ − Rₙ₋₁)·Pₙ; its no-skill baseline is
  the outcome prevalence, making it the informative summary under imbalance.
- Brier score = (1/n)Σᵢ(p̂ᵢ − yᵢ)², proper for calibrated probability
  quality; calibration curves plot observed frequency against predicted
  probability in quantile bins.

### 4.3 Predictive modeling protocol

For each of eight outcomes we fit an L2-regularized logistic regression and
gradient-boosted trees (XGBoost; Chen & Guestrin, 2016). Features comprise
only exposure/adversity/context — sexual-violence exposure, household
adversity, physical dating violence, school and electronic bullying,
witnessed community violence, unstable housing, basic-needs support — plus
demographics. **Psychological mediators are excluded by design:** they lie
on the hypothesized causal pathway (Section 1.1), and conditioning on them
would launder exposure signal into apparent "mental-health" predictors,
inflate apparent performance, and invalidate H4's interpretation. Rows are
complete-case on {outcome, exposure}; remaining covariate missingness is
median-imputed with missingness indicators in the logistic pipeline and
passed natively to XGBoost. Evaluation: stratified 5-fold cross-validation,
all preprocessing fit within training folds; we report mean ± SD across
folds.

### 4.4 Class imbalance

Prevalence spans 4.1% (cigarettes) to 46.2% (low connectedness). We compare
inverse-prevalence class weighting (logistic `class_weight='balanced'`;
XGBoost `scale_pos_weight` = N₋/N₊) against SMOTE (Chawla et al., 2002)
applied strictly inside training folds, holding all else fixed. Sensitivity
at the default threshold is the headline comparison, matching the screening
use-case.

### 4.5 Interpretability

TreeSHAP (Lundberg & Lee, 2017) provides exact additive attributions
φᵢⱼ with Σⱼφᵢⱼ = f(xᵢ) − E[f(X)]; we report mean |SHAP| rankings and
beeswarm distributions from 3,000-student samples per outcome.

### 4.6 Causal mediation

Under potential outcomes (Imai et al., 2010), with exposure T, mediator M,
outcome Y:

> ACME(t) = E[Y(t, M(1)) − Y(t, M(0))]  (indirect effect)
> ADE(t) = E[Y(1, M(t)) − Y(0, M(t))]  (direct effect)
> Total effect = ACME(t) + ADE(1−t);  proportion mediated = ACME/Total.

Mediator and outcome models are probit GLMs adjusted for age, grade, sex,
race/ethnicity, and household adversity; uncertainty via quasi-Bayesian
Monte Carlo with 500 parameter draws. Identification requires sequential
ignorability — no unmeasured exposure–outcome, exposure–mediator, or
mediator–outcome confounding, with mediator temporally after exposure —
which cross-sectional data cannot verify. Estimates are reported as
consistency checks for H2, not causal proof.

### 4.7 Screening prototype

Thirteen intake-collectable inputs (the victimization/adversity/context set
plus age, grade, sex). **Race/ethnicity and sexual identity are excluded as
inputs and retained as audit dimensions.** Protocol: stratified 80/20
train/test split; randomized hyperparameter search for XGBoost (30
candidates, 5-fold CV, ROC-AUC objective) over n_estimators ∈ [150, 700],
max_depth ∈ [2, 5], learning rate ∈ logU(0.01, 0.2), subsample and
colsample ∈ {0.7, 0.8, 0.9, 1.0}, min_child_weight ∈ [1, 19], λ ∈
logU(0.1, 10); Platt calibration (Platt, 1999) via 5-fold
CalibratedClassifierCV on training data; logistic baseline fit on raw
features so coefficients export as odds ratios. All reported metrics come
from the untouched test set, with nonparametric bootstrap 95% CIs (1,000
resamples of test predictions). Operating points are sensitivity-first:
the largest threshold achieving ≥ 90% and ≥ 80% recall.

### 4.8 Decision-curve analysis

Net benefit at threshold probability p_t (Vickers & Elkin, 2006):

> NB(p_t) = TP/n − (FP/n) · p_t/(1 − p_t)

compared against screen-everyone (NB_all = π − (1−π)·p_t/(1−p_t), π =
prevalence) and screen-no-one (NB = 0) over p_t ∈ [0.02, 0.60].

### 4.9 Fairness audit

At the deployed operating point we report subgroup n, prevalence, AUC,
sensitivity, false-positive rate, and precision by sex and race/ethnicity
(groups with ≥ 150 test students and ≥ 20 positives), reporting residual
gaps openly (Obermeyer et al., 2019).

### 4.10 Sensitivity analyses

(i) Weighted vs unweighted prevalence deltas for all key constructs;
(ii) received-block vs no-block subsample comparability (Section 3.5);
(iii) E-values (VanderWeele & Ding, 2017) for adjusted estimates: for
common outcomes we first convert OR to an approximate risk ratio
RR* = √OR, then E = RR* + √(RR*(RR*−1)) — the minimum strength of
association an unmeasured confounder would need with both exposure and
outcome to fully explain the estimate.

### 4.11 Software and reproducibility

Python 3.12.2; pandas 2.3.3, numpy 2.4.6, scikit-learn 1.8.0, xgboost
3.3.0, shap 0.52.0, statsmodels 0.14.6, imbalanced-learn 0.14.2. Fixed seed
(42) for all splits, searches, and simulations. The full pipeline from raw
Access database to every table below is reproducible from the repository;
the dashboard renders the same precomputed artifacts.

## 5. Results

### 5.1 Sample and prevalence

Weighted sexual-violence exposure prevalence was 14.6% — 21.6% among female
and 8.1% among male students; highest among American Indian/Alaska Native
(16.5%) and multiracial students (17.5–17.7%). Population-level burden was
substantial: 39.7% persistent sadness/hopelessness, 28.5% poor current
mental health, 9.5% past-year suicide attempt. Weighted and unweighted
estimates differed by ≤ 5 percentage points throughout (sensitivity
analysis i).

### 5.2 Breadth and severity gradient (H1a, H1b)

**Table 3.** Weighted prevalence by exposure status, ordered by prevalence
ratio (PR).

| Outcome | Exposed % | Unexposed % | PR |
|---|---|---|---|
| Alcohol (30d) | 41.8 | 19.3 | 2.17 |
| Marijuana (30d) | 35.6 | 14.2 | 2.51 |
| Rx pain-med misuse (ever) | 24.2 | 8.9 | 2.73 |
| Vaping (30d) | 39.1 | 13.4 | 2.93 |
| Binge drinking (30d) | 21.6 | 6.7 | 3.21 |
| Any illicit drug (ever) | 24.5 | 7.5 | 3.28 |
| Cigarettes (30d) | 9.8 | 2.5 | 3.92 |
| Inhalants (ever) | 15.6 | 3.9 | 3.97 |
| Heroin (ever) | 5.5 | 0.9 | 6.32 |
| Cocaine (ever) | 9.0 | 1.4 | 6.38 |
| Ecstasy (ever) | 10.4 | 1.5 | 7.14 |
| Methamphetamine (ever) | 7.2 | 1.0 | 7.47 |
| Injection drug use (ever) | 4.7 | 0.6 | 7.88 |
| Feels close to people at school | 43.4 | 57.4 | 0.76 |
| Parental monitoring | 72.9 | 85.9 | 0.85 |
| Persistent sadness/hopelessness | 72.1 | 33.3 | 2.16 |
| Considered suicide (12mo) | 48.0 | 14.7 | 3.27 |
| Attempted suicide (12mo) | 28.7 | 5.8 | 4.96 |

Every substance outcome is elevated (H1a), and the PR ordering tracks
severity almost perfectly — common/social substances 2.2–2.9, cigarettes
and inhalants ≈ 4, and the rarest, most dangerous substances 6.3–7.9
(H1b). Both connection measures fall below parity, the withdrawal
signature. Among exposed students, 72.1% report persistent sadness and
28.7% a past-year suicide attempt.

### 5.3 Household adversity dose–response (H3)

**Table 4.** Weighted prevalence by adversity score.

| Score | n | Any illicit % | Vaping % | Binge % | Sadness % | Suicide attempt % |
|---|---|---|---|---|---|---|
| 0 | 7,024 | 5.8 | 10.5 | 6.4 | 27.1 | 4.3 |
| 1 | 2,868 | 10.7 | 18.7 | 8.2 | 53.5 | 11.8 |
| 2 | 1,936 | 18.2 | 31.1 | 15.1 | 65.2 | 19.7 |
| 3 | 1,198 | 24.8 | 37.2 | 15.6 | 71.4 | 26.3 |

Strict monotonicity holds for every outcome examined — the ACE gradient
(Felitti et al., 1998; Dube et al., 2003) reproduced in the 2023 adolescent
sample. H3 supported.

### 5.4 Adjusted associations and confounding robustness (H1a)

**Table 5.** Survey-weighted logistic regression (PSU cluster-robust 95%
CIs); each model adjusts for age, grade, sex, race/ethnicity, and the other
exposure. E-values per Section 4.10.

| Outcome | CSA-proxy OR (95% CI) | E-value (CI bound) | Adversity OR/point (95% CI) | n |
|---|---|---|---|---|
| Any illicit drug (ever) | 3.19 (2.50–4.06) | 2.97 (2.54) | 1.64 (1.48–1.83) | 10,006 |
| Vaping (30d) | 2.89 (2.42–3.45) | 2.79 (2.49) | 1.62 (1.47–1.79) | 10,152 |
| Binge drinking (30d) | 2.84 (2.34–3.45) | 2.76 (2.43) | 1.23 (1.09–1.39) | 10,109 |
| Cigarettes (30d) | 2.67 (1.82–3.91) | 2.65 (2.04) | 1.74 (1.47–2.06) | 10,533 |
| Marijuana (30d) | 2.31 (1.93–2.78) | 2.41 (2.12) | 1.62 (1.44–1.81) | 10,489 |
| Rx pain-med misuse (ever) | 2.19 (1.75–2.73) | 2.32 (1.98) | 1.52 (1.37–1.69) | 10,502 |
| Low school connectedness | 1.42 (1.24–1.62) | 1.67 (1.47) | 1.27 (1.17–1.38) | 10,490 |

All intervals exclude 1; exposure and adversity contribute independently
everywhere. The E-values indicate that explaining away the illicit-drug
association would require an unmeasured confounder associated with both
exposure and outcome at RR ≈ 3.0 (≥ 2.5 to move the CI to null) — stronger
than most plausible candidates net of the adversity, demographic, and
context variables already in the model.

### 5.5 Prediction (H4)

**Table 6.** Stratified 5-fold CV (mean ± SD); trauma/context + demographic
features only; class-weighted models.

| Outcome (prev.) | Model | ROC-AUC | Sensitivity | PR-AUC |
|---|---|---|---|---|
| Cigarettes (4.1%) | Logistic | 0.789 ± 0.019 | 0.703 ± 0.034 | 0.175 ± 0.030 |
| | XGBoost | 0.754 ± 0.010 | 0.566 ± 0.040 | 0.152 ± 0.021 |
| Binge drinking (9.2%) | Logistic | 0.773 ± 0.014 | 0.690 ± 0.035 | 0.266 ± 0.026 |
| | XGBoost | 0.747 ± 0.020 | 0.645 ± 0.039 | 0.246 ± 0.021 |
| Vaping (18.1%) | Logistic | 0.766 ± 0.010 | 0.666 ± 0.020 | 0.429 ± 0.011 |
| | XGBoost | 0.758 ± 0.006 | 0.662 ± 0.013 | 0.416 ± 0.012 |
| Any illicit ever (11.3%) | Logistic | 0.760 ± 0.010 | 0.660 ± 0.028 | 0.333 ± 0.009 |
| | XGBoost | 0.739 ± 0.009 | 0.617 ± 0.018 | 0.307 ± 0.017 |
| Marijuana (17.9%) | Logistic | 0.758 ± 0.006 | 0.662 ± 0.015 | 0.408 ± 0.011 |
| | XGBoost | 0.750 ± 0.010 | 0.661 ± 0.023 | 0.398 ± 0.011 |
| Alcohol (21.9%) | Logistic | 0.727 ± 0.005 | 0.651 ± 0.018 | 0.419 ± 0.006 |
| | XGBoost | 0.726 ± 0.004 | 0.660 ± 0.012 | 0.425 ± 0.007 |
| Rx misuse (11.9%) | Logistic | 0.715 ± 0.015 | 0.586 ± 0.029 | 0.285 ± 0.017 |
| | XGBoost | 0.701 ± 0.012 | 0.558 ± 0.020 | 0.283 ± 0.019 |
| Low connectedness (46.2%) | Logistic | 0.620 ± 0.018 | 0.542 ± 0.014 | 0.565 ± 0.010 |
| | XGBoost | 0.606 ± 0.015 | 0.541 ± 0.009 | 0.553 ± 0.015 |

Three findings. **First**, all seven substance outcomes clear the H4
threshold (AUC 0.70–0.79) from exposure information alone. **Second**,
logistic regression matches or exceeds tuned XGBoost on every substance
outcome — the risk signal is predominantly additive, which favors the
interpretable model for deployment. **Third**, the imbalance comparison is
decisive: replacing class weighting with SMOTE collapses XGBoost
sensitivity at the default threshold — 0.133 vs 0.645 (binge drinking),
0.037 vs 0.566 (cigarettes), 0.059 vs 0.558 (Rx misuse), 0.108 vs 0.617
(any illicit) — with no compensating AUC gain. On sparse binary survey
features, SMOTE's synthetic interpolants concentrate mass near the
minority-class centroid and shift the decision surface away from
sensitivity; simple reweighting preserves it. Low school connectedness is
markedly harder (AUC 0.62) than any substance outcome: withdrawal depends
on school-contextual factors beyond measured trauma variables.

### 5.6 Feature attributions

Across all eight outcomes, mean |SHAP| rankings place the
victimization/adversity block above every demographic feature: physical
dating violence, household adversity, sexual-violence exposure, and
witnessed community violence occupy the top positions, with basic-needs
support acting protectively. The models predict from *what happened to the
student*, not from who the student demographically is — completing H4.

### 5.7 Mediation (H2)

**Table 7.** Effect decomposition, mediator = persistent
sadness/hopelessness (probit, 500 quasi-Bayesian draws; risk-difference
scale).

| Outcome | Total effect | ACME (95% CI) | ADE (95% CI) | Prop. mediated (95% CI) | n |
|---|---|---|---|---|---|
| Low school connectedness | 0.085 | 0.039 (0.033, 0.046) | 0.045 (0.020, 0.071) | 0.46 (0.35, 0.67) | 10,430 |
| Marijuana (30d) | 0.134 | 0.031 (0.025, 0.037) | 0.102 (0.081, 0.124) | 0.23 (0.19, 0.29) | 10,428 |
| Vaping (30d) | 0.156 | 0.034 (0.028, 0.040) | 0.122 (0.097, 0.145) | 0.22 (0.18, 0.27) | 10,095 |
| Rx pain-med misuse (ever) | 0.102 | 0.023 (0.018, 0.027) | 0.079 (0.060, 0.099) | 0.22 (0.17, 0.29) | 10,440 |
| Any illicit drug (ever) | 0.119 | 0.024 (0.019, 0.029) | 0.096 (0.075, 0.116) | 0.20 (0.15, 0.25) | 9,952 |
| Binge drinking (30d) | 0.103 | 0.015 (0.011, 0.020) | 0.088 (0.069, 0.105) | 0.15 (0.11, 0.20) | 10,051 |

All ACME intervals exclude zero. The poor-mental-health mediator shows the
same pattern with smaller shares (5–12% substances; 30% connectedness).
Both H2 components are supported: distress mediates every pathway, and the
mediated share for withdrawal (46%) is roughly double that of any substance
outcome — withdrawal expresses distress; substance use additionally serves
regulation functions two mood items do not capture.

### 5.8 Screening prototype

**Table 8.** Held-out test performance (bootstrap 95% CIs, 1,000 resamples).
Selected XGBoost hyperparameters: max_depth 2, learning rate 0.010–0.017,
600–620 estimators (all targets favored shallow, slow-learning ensembles).

| Target (prev.) | n | Model | AUC (95% CI) | PR-AUC (95% CI) | Brier |
|---|---|---|---|---|---|
| Any current substance (43.7%) | 6,409 | XGB-cal | 0.694 (0.664–0.722) | 0.636 (0.596–0.679) | 0.218 |
| | | Logistic | 0.697 (0.666–0.725) | 0.641 (0.601–0.685) | 0.217 |
| Binge drinking (12.6%) | 6,039 | XGB-cal | 0.693 (0.647–0.737) | 0.287 (0.226–0.358) | 0.103 |
| | | Logistic | 0.691 (0.648–0.734) | 0.268 (0.210–0.338) | 0.103 |
| Any illicit ever (13.9%) | 6,139 | XGB-cal | 0.759 (0.718–0.797) | 0.436 (0.361–0.513) | 0.103 |
| | | Logistic | 0.761 (0.721–0.799) | 0.433 (0.358–0.509) | 0.101 |

Calibration curves track the diagonal (quantile bins), making the
probabilities decision-grade. Operating points for any-current-substance:
at threshold 0.24, sensitivity 90.5% with 48.2% precision (82% flagged); at
the recommended threshold 0.32, sensitivity 81.3% with 51.7% precision
against the 43.7% base rate (69% flagged; per 1,000 students: 455 true
alerts, 426 supportive-outreach false alerts, 105 missed). Decision-curve
analysis places model-guided outreach above both screen-everyone and
screen-no-one throughout p_t ∈ [0.05, 0.60].

**Table 9.** Fairness audit at the deployed operating point (threshold
0.32, any current substance use).

| Group | n | Prevalence | AUC | Sensitivity | FPR | Precision |
|---|---|---|---|---|---|---|
| Female | 657 | 0.47 | 0.688 | 0.842 | 0.688 | 0.524 |
| Male | 619 | 0.40 | 0.694 | 0.771 | 0.497 | 0.504 |
| White | 578 | 0.44 | 0.710 | 0.819 | 0.608 | 0.514 |
| Multiracial (Hispanic) | 225 | 0.44 | 0.695 | 0.800 | 0.640 | 0.500 |
| Multiracial (non-Hispanic) | 167 | 0.43 | 0.665 | 0.833 | 0.621 | 0.504 |

Subgroup AUCs span 0.665–0.710 (max gap 0.045) and precision is uniform
(0.50–0.52). Sensitivity/FPR differences across groups (e.g., female
students flagged more often, consistent with their higher exposure and
prevalence) are reported openly; a single global threshold cannot equalize
all group metrics simultaneously when base rates differ, and group-specific
thresholds carry legal and ethical trade-offs addressed in Section 6.3.
Because the logistic variant matches XGBoost within ~0.01 AUC everywhere,
the deployment recommendation is the interpretable model, whose thirteen
coefficients ship as published odds ratios (physical dating violence 2.12,
witnessed community violence 1.68, parent substance problem 1.65,
cyberbullying 1.44, sexual-violence exposure 1.41, basic-needs support
0.97).

### 5.9 Hypothesis summary

| Hypothesis | Verdict | Key evidence |
|---|---|---|
| H1a Breadth | Supported | All 12 substance outcomes elevated; adjusted ORs 2.19–3.19, CIs exclude 1 |
| H1b Severity gradient | Supported | PR rises 2.17 → 7.88 with substance severity |
| H2 Mediation | Supported | All ACME CIs exclude 0; withdrawal share (46%) ≈ 2× substance shares (15–23%) |
| H3 Dose–response | Supported | Strict monotonicity on every outcome, scores 0→3 |
| H4 Predictability | Supported | CV AUC 0.70–0.79 substances; trauma features outrank demographics in SHAP |

## 6. Discussion

### 6.1 Principal findings

All four pre-stated hypotheses were supported. The severity gradient (H1b)
is the study's sharpest discriminating evidence: a dispositional
risk-taking account predicts roughly uniform elevation across behaviors,
while escalating trauma-driven coping predicts precisely the observed
ordering — modest relative elevation for normative social substances,
extreme relative elevation for substances used almost exclusively under
severe regulation pressure. The mediation contrast (H2) sharpens the
picture: withdrawal is predominantly a distress expression (46% mediated by
one crude mood item), whereas substance use retains a large direct path,
consistent with regulation functions (numbing, control, sleep) that mood
items do not measure. Given single-item mediator measurement error, both
mediated shares are plausibly underestimates.

### 6.2 Relation to prior literature

The adjusted ORs replicate the meta-analytic range (Hailes et al., 2019;
Simpson & Miller, 2002) in a current, non-clinical, population-based
adolescent sample. The dose–response results extend the ACE gradient
(Felitti et al., 1998; Dube et al., 2003) to the 2023 cohort with items
newly available at national scale. The predictive results align with prior
YRBS machine-learning AUCs while using a deliberately impoverished,
causally-disciplined feature set — evidence that most of the achievable
signal is trauma burden itself, not behavioral correlates.

### 6.3 Implications and deployment ethics

Screening for victimization and household adversity — information many
school health contexts already collect — could identify four of five
students at elevated substance-use risk before behavior consolidates, at
alert volumes decision-curve analysis shows are worth their cost whenever
supportive outreach is the response. The mediation results specify the
intervention: mental-health support, not discipline; a punitive response
targets the symptom while deepening its cause. We are explicit that the
prototype is not deployment-ready. Preconditions include prospective
validation on the target population, IRB oversight, student and community
consent, score confidentiality, routing exclusively to health
professionals, and monitoring for structural-inequity encoding (Obermeyer
et al., 2019). Excluding protected attributes from inputs while auditing on
them is a minimum standard, not a resolution; when base rates differ across
groups, no single threshold equalizes all error rates, and any
group-specific correction must be weighed legally and ethically with the
affected community.

### 6.4 Limitations

1. **Cross-sectional design.** Temporal order among exposure, mediator, and
   outcome is assumed, not observed; reverse pathways cannot be excluded;
   mediation relies on unverifiable sequential ignorability.
2. **Proxy exposure.** No age-at-victimization; non-disclosing survivors
   are misclassified as unexposed, biasing toward the null (associations
   are lower bounds).
3. **Single-item mediators** likely deflate mediated proportions.
4. **Self-report** with recall and social-desirability bias; out-of-school
   youth are outside the frame.
5. **Response rate.** The 35.4% overall response rate (49.8% school ×
   71.0% student) admits nonresponse bias that weighting only partially
   corrects.
6. **Approximate variance estimation** (PSU cluster-robust, ignoring
   strata) and subsample analyses inherited from questionnaire-version
   missingness; the screening models' complete-case restriction
   (n ≈ 6,000–6,400) may limit generalizability if intake completeness
   correlates with unmeasured risk.
7. **Unmeasured confounding** remains possible despite E-values of 2.3–3.0;
   candidate confounders (e.g., neighborhood disadvantage, genetic
   liability) plausibly operate below that strength net of included
   covariates, but cannot be ruled out.

### 6.5 Future directions

Pooling 2021 and 2023 cycles for replication and temporal-stability checks;
formal fairness–accuracy frontier analysis with group-specific thresholds;
ordinal/multistate models of polysubstance escalation; linkage-based
longitudinal validation (Add Health-style) to convert mediation consistency
checks into temporal tests; and prospective piloting of the screening
instrument with school health partners under IRB oversight.

## 7. Conclusion

In the first national YRBS cycle to measure household ACEs, school
connectedness, and parental monitoring alongside its violence and substance
batteries, sexual-violence victimization and household adversity were
associated with elevated use of every substance measured — with relative
risk rising monotonically with substance severity — alongside reduced
social connection and severe psychological distress that mediated a
substantial share of both pathways. The pattern is consistent with
trauma-driven coping rather than intrinsic risk-seeking. A calibrated,
fairness-audited screening prototype using only intake-collectable
information identified 81% of currently-using students at a
decision-analytically supported operating point. Early, trauma-informed
identification appears feasible with data schools already collect; the
broadest-benefit intervention remains preventing the trauma.

## Declarations

**Data availability.** Public-use CDC YRBS microdata
(https://www.cdc.gov/yrbs/data/index.html). **Code availability.** Complete
pipeline, analysis code, and dashboard source:
github.com/eshalmin-basit/CSA-data-science-project. **Ethics.**
Secondary analysis of de-identified public-use data; no IRB review
required. **Funding.** None. **Competing interests.** None declared.

## References

- Brener ND, Mpofu JJ, Krause KH, et al. Overview and Methods for the Youth
  Risk Behavior Surveillance System — United States, 2023. *MMWR Suppl*
  2024;73(Suppl-4):1–12.
- CDC. *2023 YRBS Data User's Guide*. September 2024.
- Chawla NV, Bowyer KW, Hall LO, Kegelmeyer WP. SMOTE: Synthetic minority
  over-sampling technique. *J Artif Intell Res* 2002;16:321–357.
- Chen T, Guestrin C. XGBoost: A scalable tree boosting system. *Proc 22nd
  ACM SIGKDD* 2016:785–794.
- Dube SR, Felitti VJ, Dong M, Chapman DP, Giles WH, Anda RF. Childhood
  abuse, neglect, and household dysfunction and the risk of illicit drug
  use: the Adverse Childhood Experiences Study. *Pediatrics*
  2003;111(3):564–572.
- Felitti VJ, Anda RF, Nordenberg D, et al. Relationship of childhood abuse
  and household dysfunction to many of the leading causes of death in
  adults: the Adverse Childhood Experiences (ACE) Study. *Am J Prev Med*
  1998;14(4):245–258.
- Hailes HP, Yu R, Danese A, Fazel S. Long-term outcomes of childhood sexual
  abuse: an umbrella review. *Lancet Psychiatry* 2019;6(10):830–839.
- Imai K, Keele L, Tingley D. A general approach to causal mediation
  analysis. *Psychol Methods* 2010;15(4):309–334.
- Khantzian EJ. The self-medication hypothesis of substance use disorders: a
  reconsideration and recent applications. *Harv Rev Psychiatry*
  1997;4(5):231–244.
- Lundberg SM, Lee S-I. A unified approach to interpreting model
  predictions. *Adv Neural Inf Process Syst* 2017;30:4765–4774.
- Norman RE, Byambaa M, De R, Butchart A, Scott J, Vos T. The long-term
  health consequences of child physical abuse, emotional abuse, and neglect:
  a systematic review and meta-analysis. *PLoS Med* 2012;9(11):e1001349.
- Obermeyer Z, Powers B, Vogeli C, Mullainathan S. Dissecting racial bias in
  an algorithm used to manage the health of populations. *Science*
  2019;366(6464):447–453.
- Platt J. Probabilistic outputs for support vector machines and comparisons
  to regularized likelihood methods. *Advances in Large Margin Classifiers*
  1999:61–74.
- Resnick MD, Bearman PS, Blum RW, et al. Protecting adolescents from harm:
  findings from the National Longitudinal Study on Adolescent Health. *JAMA*
  1997;278(10):823–832.
- Simpson TL, Miller WR. Concomitance between childhood sexual and physical
  abuse and substance use problems: a review. *Clin Psychol Rev*
  2002;22(1):27–77.
- Steiner RJ, Sheremenko G, Lesesne C, Dittus PJ, Sieving RE, Ethier KA.
  Adolescent connectedness and adult health outcomes. *Pediatrics*
  2019;144(1):e20183766.
- VanderWeele TJ, Ding P. Sensitivity analysis in observational research:
  introducing the E-value. *Ann Intern Med* 2017;167(4):268–274.
- Vickers AJ, Elkin EB. Decision curve analysis: a novel method for
  evaluating prediction models. *Med Decis Making* 2006;26(6):565–574.
