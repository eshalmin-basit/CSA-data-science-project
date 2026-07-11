# Sexual-Violence Victimization, Household Adversity, and Adolescent Substance Use and Social Withdrawal: A Design-Aware Machine-Learning Analysis of the 2023 National Youth Risk Behavior Survey

*Working manuscript*

---

## Abstract

Childhood sexual abuse (CSA) trauma is associated with a constellation of
maladaptive outcomes that extends well beyond the narrow stereotypes often
attached to survivors. This study examines how sexual-violence victimization
and household adversity relate to substance use (cigarette smoking, vaping,
alcohol and binge drinking, marijuana, and illicit drug use) and social
withdrawal among US high school students, framing these behaviors as coping
responses aimed at regaining stability and control rather than inherent
tendencies toward risky conduct. Using the 2023 National Youth Risk Behavior
Survey (N = 20,103, nationally representative), we combine design-aware
epidemiological estimation with interpretable and ensemble machine-learning
models. Students reporting sexual-violence exposure (weighted prevalence
14.6%) showed 2.2–7.9 times higher weighted prevalence across all twelve
substance-use outcomes, lower school connectedness, and lower parental
monitoring, with the relative gap widening monotonically with substance
severity. Associations persisted after adjustment for demographics and
household adversity (adjusted odds ratios 2.19–3.19 for substance outcomes).
Household adversity displayed a graded dose–response relationship with every
outcome examined. Causal mediation analysis found that persistent sadness or
hopelessness mediated approximately 15–23% of the exposure–substance-use
association and 46% of the exposure–low-school-connectedness association.
Cross-validated models using only exposure, adversity, and demographic
features achieved ROC-AUC 0.70–0.79, with SHAP analysis confirming that
victimization variables outrank demographic features in predictive
importance. A calibrated screening prototype restricted to thirteen
intake-collectable items — with protected attributes excluded from inputs
but audited for subgroup performance — identified 81% of students currently
using substances at a decision threshold supported by decision-curve
analysis. Because the YRBS is cross-sectional and self-reported, all findings
are risk-factor associations rather than causal effects. The results support
early, trauma-informed identification of at-risk adolescents and underscore
the societal imperative to protect children from trauma and to foster
resilience in survivors.

**Keywords:** childhood sexual abuse, adverse childhood experiences,
adolescent substance use, school connectedness, machine learning, mediation
analysis, risk screening, YRBS

---

## 1. Introduction

Adolescents who have experienced sexual violence carry an elevated burden of
psychological distress, and a large clinical literature links childhood
sexual abuse to later substance use, depression, and social difficulties
(Hailes et al., 2019; Norman et al., 2012). Public discussion of CSA
sequelae, however, tends to fixate on a narrow set of stereotyped outcomes.
This project starts from a different premise: that the behaviors most
strongly associated with trauma exposure — substance use across the full
severity spectrum, and withdrawal from school and family connection — are
better understood as coping mechanisms aimed at regaining stability and
control (Khantzian, 1997), and that treating them as such changes both what
we should measure and what interventions follow.

Three empirical questions follow from that premise:

1. **Breadth.** Is sexual-violence exposure associated with elevated use
   across the whole substance battery — from vaping and alcohol to heroin,
   methamphetamine, and injection drug use — rather than with one or two
   signature behaviors? A coping-escalation account predicts a *gradient*:
   larger relative risks for rarer, more dangerous substances. A "risky
   personality" stereotype predicts no such ordering.
2. **Pathway.** Is the association consistent with mediation through
   psychological distress (persistent sadness/hopelessness, poor current
   mental health), as a coping account requires?
3. **Predictability.** Can trauma-exposure variables alone — without any
   behavioral inputs — identify at-risk adolescents with sensitivity
   sufficient for early screening, and can such a model be made calibrated,
   auditable, and ethically deployable?

We address these questions with the 2023 National Youth Risk Behavior Survey
(YRBS), which in 2023 added household adverse-childhood-experience (ACE)
items, school-connectedness, and parental-monitoring measures to its
long-standing violence and substance batteries (Brener et al., 2024), making
it the first national YRBS cycle in which this full constellation can be
studied together in a single nationally representative adolescent sample.

**Contributions.** (i) A design-aware epidemiological characterization of
the sexual-violence → substance-use gradient in the newest national YRBS
cycle, including the first dose–response analysis of the 2023 household-ACE
items against the full substance battery; (ii) a formal causal-mediation
test of the psychological-distress pathway; (iii) a predictive-modeling
protocol that deliberately excludes on-pathway mediators, compares
class-imbalance strategies, and explains itself via SHAP; (iv) a calibrated,
fairness-audited screening prototype with decision-curve evidence and a
public interactive dashboard; and (v) a mechanism-first missing-data
analysis that identifies school-level questionnaire-version missingness in
the 2023 public-use file, of independent methodological value to other YRBS
analysts.

All code, data pipeline, and an interactive results dashboard are public
(repository: `github.com/eshalmin-basit/CSA-data-science-project`; dashboard:
`eshalmin-basit.github.io/CSA-data-science-project`).

## 2. Background and Related Work

### 2.1 Childhood sexual abuse and substance use

Umbrella and meta-analytic reviews consistently associate CSA with
substance-misuse outcomes in adolescence and adulthood. Hailes et al. (2019),
synthesizing 19 meta-analyses covering 559 primary studies, report pooled
odds ratios of roughly 1.8–3.3 for psychiatric diagnoses and substance-misuse
outcomes among CSA survivors; Norman et al. (2012) find comparable
associations for physical abuse and neglect, with evidence of causal
plausibility under Bradford-Hill-style criteria. Simpson and Miller (2002)
document that among clinical substance-using populations, CSA prevalence far
exceeds general-population rates, particularly for women. Our adjusted odds
ratios (2.19–3.19 across substance outcomes; Section 5.4) sit squarely in
the range this literature predicts, in a current, population-representative
adolescent sample.

### 2.2 Adverse childhood experiences and dose–response

The CDC-Kaiser ACE study established the canonical graded relationship
between the count of adverse childhood exposures and adult health-risk
behaviors (Felitti et al., 1998); Dube et al. (2003) extended it
specifically to illicit drug initiation, with each additional ACE increasing
early-initiation risk 2- to 4-fold. The 2023 YRBS is the first national
cycle to carry household-dysfunction ACE items (parental problematic
substance use, mental illness, incarceration), enabling a contemporary
adolescent replication. We observe strict monotonicity across the 0–3
adversity count for every outcome examined (Section 5.3) — a pattern
consistent with the classic ACE gradient.

### 2.3 Self-medication and coping theory

Khantzian's (1997) self-medication hypothesis frames substance use as an
attempt to regulate intolerable affective states, predicting that use should
(a) co-occur with measurable distress, (b) escalate with trauma load, and
(c) be partially statistically mediated by distress. Prior tests in
adolescent samples are typically small or clinical; formal mediation
analysis in nationally representative adolescent data remains rare. Our
mediation results (Section 5.6) provide exactly this test, with effect
decomposition under the potential-outcomes framework (Imai et al., 2010).

### 2.4 School connectedness and social withdrawal

School connectedness — the perception of closeness to people at school — is
among the most robust protective factors against adolescent substance use
and suicidality (Resnick et al., 1997; Steiner et al., 2019). Victimized
adolescents report lower connectedness, but whether the deficit runs through
psychological distress has not been quantified nationally. We find low
connectedness is the outcome with the *largest* mediated share (46%),
consistent with withdrawal being predominantly distress-driven.

### 2.5 Machine learning on adolescent risk surveys

Tree ensembles applied to YRBS suicidality prediction report AUCs in the
mid-0.70s to low 0.80s using broad behavioral feature sets. Three gaps
motivate our protocol: (i) prior models freely mix on-pathway mediators and
even downstream behaviors into the feature set, inflating apparent
performance while destroying causal interpretability; (ii) oversampling
(SMOTE; Chawla et al., 2002) is frequently applied without comparison
against simpler class weighting; and (iii) calibration, decision-analytic
utility (Vickers & Elkin, 2006), and subgroup fairness auditing (Obermeyer
et al., 2019) are rarely reported despite being prerequisites for any
deployment claim. Sections 4.2–4.6 address each gap explicitly.

## 3. Data

### 3.1 Source and design

The National YRBS is a cross-sectional school-based survey conducted
biennially by the CDC under a three-stage cluster design — counties,
schools, then classes — yielding a sample representative of US public and
private high school students in grades 9–12 (Brener et al., 2024). The 2023
cycle surveyed N = 20,103 students at 155 schools with a 43% overall
response rate, administered for the first time on electronic tablets with
programmed skip patterns. We use the public-use Access database (tables
`XXHq`, raw responses; `XXHqn`, CDC-computed dichotomies) exported and
recoded by our open pipeline. Survey design variables (`weight`, `stratum`,
`psu`) are carried through all analyses.

### 3.2 Measures

**Exposure — sexual-violence victimization (`csa_exposure`).** A composite
flag equal to 1 if the respondent reported any of: ever being physically
forced to have sexual intercourse (Q19); being forced by anyone to do sexual
things in the past 12 months (Q20); or sexual dating violence in the past 12
months (Q21). Weighted prevalence 14.6% (female 21.6%, male 8.1%).
*Terminology note:* the YRBS records neither age at first victimization nor
perpetrator identity, so this measure captures sexual-violence victimization
reported in adolescence — a proxy for, not a clinical determination of,
childhood sexual abuse. Given systematic under-disclosure, prevalence and
all associations should be read as lower bounds under nondifferential
misclassification.

**Household adversity (0–3).** Count of three new-to-2023 ACE items: ever
lived with a parent/guardian with problematic alcohol/drug use (Q100;
weighted 24.8%), with severe mental illness (Q101; 28.5%), or separated from
a parent/guardian due to incarceration (Q102; 14.4%).

**Substance-use outcomes.** CDC dichotomies for current (30-day) cigarette,
electronic-vapor, alcohol, binge-drinking, and marijuana use; lifetime
prescription-pain-medicine misuse, cocaine, inhalant, heroin,
methamphetamine, ecstasy, and injection drug use; and the CDC composite
"any lifetime illicit drug use."

**Social-withdrawal proxies.** Feeling close to people at school (Q103),
parental monitoring (Q104), and social media use (Q80).

**Mediators.** Persistent sadness or hopelessness (Q26: sad or hopeless
almost every day for ≥2 weeks in the past year; weighted 39.7%) and poor
current mental health (Q84: mental health "most of the time" or "always" not
good in the past 30 days; 28.5%). Both are single self-report items; no
validated PHQ-9/GAD-7 instruments exist in YRBS (see Limitations).

### 3.3 Missing data: mechanism before method

We diagnosed missingness mechanisms before choosing any handling strategy
(full analysis in the repository, `docs/missing_data.md`). Four mechanisms
were identified:

1. **Questionnaire-version missingness (structural).** Students in schools
   sampled for both national and state surveys completed their state's
   questionnaire, which omits the 20 new-to-2023 national items (ACE block,
   connectedness, monitoring). The signature is unambiguous: missingness
   indicators within the block correlate at r = 0.88–0.96; 83–87% of school
   clusters (PSUs with n ≥ 30) are all-or-none missing; and item response
   *rises* from 54% at Q98 to 78% at Q99, which no attrition process can
   produce. The receiving subsample matches the full sample within 0.7
   percentage points (weighted) on every checked construct — e.g.,
   `csa_exposure` 14.8% vs 14.1% — so these variables are analyzed in the
   subsample that received them (n ≈ 10,900–13,300).
2. **Within-questionnaire attrition.** Response declines gradually with item
   position (97% at Q48 → 65% at Q78), treated as missing-at-random
   conditional on demographics.
3. **Skip-pattern missingness.** Tablet branching; resolved by CDC's logical
   edits in the QN variables we use.
4. **Sensitive-item nonresponse.** The sexual-violence items carry 14–22%
   missingness that may relate to the true value. Exposure is therefore
   never imputed, and associations are framed as lower bounds.

No multiple imputation is applied to block-missing variables: imputing 44%
of a variable whose absence is a school-level design artifact would
manufacture within-school variance without adding information. Exposures and
outcomes are never imputed under any mechanism.

### 3.4 Ethics

All data are de-identified public-use records; secondary analysis requires
no IRB review. Three framing commitments govern the paper: associations are
reported with risk-factor language and never as causal effects; results are
presented to motivate protection and support for survivors, never to
stigmatize; and the screening prototype is framed strictly as a
prioritization aid for supportive, non-punitive outreach, with prospective
validation, IRB oversight, and community consent named as preconditions for
any real-world use.

## 4. Methods

### 4.1 Design-aware estimation

All prevalence estimates are survey-weighted:
p̂ = Σᵢ wᵢ yᵢ / Σᵢ wᵢ over non-missing respondents. Adjusted associations
come from weighted logistic models with weights normalized to the analytic
sample size (w̃ᵢ = wᵢ·n/Σwᵢ) and cluster-robust (sandwich) standard errors
on PSU:

  logit P(Yᵢ = 1) = β₀ + β₁·CSAᵢ + β₂·ADVᵢ + γ′Xᵢ

where ADV is the 0–3 adversity count and X contains age, grade, sex, and
race/ethnicity (reference: White). This approximates Taylor-linearized
design-based variance while ignoring stratification gains, which is
generally conservative; we flag it as an approximation to full
survey-package estimation.

### 4.2 Predictive modeling protocol

For each of eight outcomes we fit (a) an L2-regularized logistic regression
and (b) gradient-boosted trees (XGBoost; Chen & Guestrin, 2016). The feature
set contains only exposure/adversity/context variables — sexual-violence
exposure, household adversity, physical dating violence, school and
electronic bullying, witnessed community violence, unstable housing,
basic-needs support — plus demographics. **Psychological mediators are
excluded by design**: they lie on the hypothesized causal pathway, and
conditioning on them would launder exposure signal into apparent
"mental-health" predictors while biasing any causal reading of feature
importance. Rows are complete-case per outcome on {outcome, exposure};
missing covariates are median-imputed with missingness indicators for the
logistic pipeline and passed natively to XGBoost.

Evaluation uses stratified 5-fold cross-validation with all preprocessing
fit inside training folds. We report ROC-AUC, PR-AUC, recall, precision, and
F1 at the 0.5 threshold.

### 4.3 Class imbalance: weighting versus SMOTE

Outcome prevalence ranges from 4% (current smoking) to 46% (low
connectedness). We compare inverse-prevalence class weighting
(logistic `class_weight='balanced'`; XGBoost `scale_pos_weight`) against
SMOTE oversampling (Chawla et al., 2002) applied strictly inside training
folds. Screening favors sensitivity — a missed at-risk student costs more
than a false alert — so recall at fixed threshold is the headline comparison.

### 4.4 Interpretability

TreeSHAP (Lundberg & Lee, 2017) decomposes each prediction of the final
class-weighted XGBoost models into additive feature contributions; we report
mean |SHAP| rankings and beeswarm distributions on 3,000-student samples.

### 4.5 Causal mediation analysis

Under the potential-outcomes framework (Imai et al., 2010), for exposure T,
mediator M, and outcome Y, the average causal mediation effect and average
direct effect are

  ACME(t) = E[Y(t, M(1)) − Y(t, M(0))],  ADE(t) = E[Y(1, M(t)) − Y(0, M(t))]

estimated with probit mediator and outcome models adjusted for age, grade,
sex, race/ethnicity, and household adversity, via quasi-Bayesian Monte Carlo
(500 parameter draws). Identification requires sequential ignorability,
which cross-sectional data cannot verify; estimates are reported as
consistency checks for the coping hypothesis, not causal proof.

### 4.6 Screening prototype

To translate findings into deployable form we trained models restricted to
thirteen intake-collectable inputs (the victimization/adversity/context set
plus age, grade, sex). **Race/ethnicity and sexual identity are excluded as
inputs** — a support-allocation tool must not condition on protected
attributes — **but retained as audit dimensions.** The protocol: stratified
80/20 train/test split; randomized 30-candidate, 5-fold CV hyperparameter
search for XGBoost (depth, learning rate, estimators, subsampling,
regularization); Platt calibration (Platt, 1999) fit within training folds;
all reported metrics from the untouched test set. Operating points are
chosen sensitivity-first (thresholds achieving ≥90% and ≥80% recall).

### 4.7 Decision-curve analysis

Following Vickers and Elkin (2006), net benefit at threshold probability p_t
is NB(p_t) = TP/n − (FP/n)·p_t/(1−p_t), compared against screen-everyone and
screen-no-one strategies across p_t ∈ [0.02, 0.60].

### 4.8 Fairness audit

At the deployed operating point we report subgroup AUC, sensitivity, false
positive rate, and precision by sex and race/ethnicity (groups with ≥150
test students and ≥20 positive cases), reporting residual gaps rather than
concealing them (Obermeyer et al., 2019).

## 5. Results

### 5.1 Prevalence

Weighted exposure prevalence is 14.6% overall — 21.6% among female and 8.1%
among male students, highest among American Indian/Alaska Native (16.5%) and
multiracial students (17.5–17.7%). Among all students: persistent
sadness/hopelessness 39.7%; poor current mental health 28.5%; past-year
suicide attempt 9.5%; current vaping 16.8%; current alcohol 22.1%; current
marijuana 17.0%; lifetime illicit drug use 9.9%. Weighted and unweighted
estimates differ by ≤5 percentage points throughout.

### 5.2 The severity gradient (unadjusted, weighted)

**Table 1.** Weighted prevalence by sexual-violence exposure.

| Outcome | Exposed % | Unexposed % | Prevalence ratio |
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
| Attempted suicide (12mo) | 28.7 | 5.8 | 4.96 |

The ordering is the study's first headline result: prevalence ratios rise
nearly monotonically with substance severity/rarity, from ~2.2 (alcohol) to
~7.9 (injection drug use) — the gradient a coping-escalation account
predicts. Simultaneously, both connection measures run *below* parity,
the social-withdrawal signature.

### 5.3 Household adversity dose–response

**Table 2.** Weighted prevalence by household adversity score.

| Score | n | Any illicit % | Vaping % | Binge % | Sadness % | Suicide attempt % |
|---|---|---|---|---|---|---|
| 0 | 7,024 | 5.8 | 10.5 | 6.4 | 27.1 | 4.3 |
| 1 | 2,868 | 10.7 | 18.7 | 8.2 | 53.5 | 11.8 |
| 2 | 1,936 | 18.2 | 31.1 | 15.1 | 65.2 | 19.7 |
| 3 | 1,198 | 24.8 | 37.2 | 15.6 | 71.4 | 26.3 |

Every outcome rises monotonically — the classic ACE gradient (Felitti et
al., 1998; Dube et al., 2003) reproduced in the 2023 national adolescent
sample.

### 5.4 Adjusted associations

**Table 3.** Survey-weighted logistic regression, PSU cluster-robust 95%
CIs; each model adjusts for age, grade, sex, race/ethnicity, and the other
exposure.

| Outcome | CSA-proxy OR (95% CI) | Adversity OR per point (95% CI) | n |
|---|---|---|---|
| Any illicit drug (ever) | 3.19 (2.50–4.06) | 1.64 (1.48–1.83) | 10,006 |
| Vaping (30d) | 2.89 (2.42–3.45) | 1.62 (1.47–1.79) | 10,152 |
| Binge drinking (30d) | 2.84 (2.34–3.45) | 1.23 (1.09–1.39) | 10,109 |
| Cigarettes (30d) | 2.67 (1.82–3.91) | 1.74 (1.47–2.06) | 10,533 |
| Marijuana (30d) | 2.31 (1.93–2.78) | 1.62 (1.44–1.81) | 10,489 |
| Rx pain-med misuse (ever) | 2.19 (1.75–2.73) | 1.52 (1.37–1.69) | 10,502 |
| Low school connectedness | 1.42 (1.24–1.62) | 1.27 (1.17–1.38) | 10,490 |

Every interval excludes 1. Sexual-violence exposure and household adversity
contribute independently on every outcome.

### 5.5 Prediction

**Table 4.** Stratified 5-fold CV; features are exposure/adversity/context +
demographics only (mediators excluded).

| Outcome (prevalence) | Model | ROC-AUC | Recall | PR-AUC |
|---|---|---|---|---|
| Cigarettes, 4.1% | Logistic + class wt | 0.789 | 0.703 | 0.175 |
| Binge drinking, 9.2% | Logistic + class wt | 0.773 | 0.690 | 0.266 |
| Vaping, 18.1% | Logistic + class wt | 0.766 | 0.666 | 0.429 |
| Any illicit ever, 11.3% | Logistic + class wt | 0.760 | 0.660 | 0.333 |
| Marijuana, 17.9% | Logistic + class wt | 0.758 | 0.662 | 0.408 |
| Alcohol, 21.9% | Logistic + class wt | 0.727 | 0.651 | 0.419 |
| Rx misuse, 11.9% | Logistic + class wt | 0.715 | 0.586 | 0.285 |
| Low connectedness, 46.2% | Logistic + class wt | 0.620 | 0.542 | 0.565 |

Two methodological results accompany Table 4. First, logistic regression
matches or slightly exceeds tuned XGBoost on most outcomes (e.g., cigarettes
0.789 vs 0.754), indicating a predominantly additive signal. Second, the
imbalance comparison is decisive: with XGBoost, SMOTE collapses recall
relative to class weighting (binge drinking 0.13 vs 0.65; cigarettes 0.04 vs
0.57; Rx misuse 0.06 vs 0.56), while producing no compensating AUC gain — a
practically important negative result for oversampling on sparse binary
survey features. Low school connectedness is substantially harder to predict
(AUC 0.62) than any substance outcome, implying withdrawal depends on
contextual factors beyond measured trauma variables.

### 5.6 Interpretability

Across all eight outcomes, SHAP rankings place the victimization/adversity
block above every demographic feature: physical dating violence, household
adversity, sexual-violence exposure, and witnessed community violence
consistently occupy the top positions, with the basic-needs-met item acting
protectively. The models predict substance use from *what happened to the
student*, not from who the student demographically is.

### 5.7 Mediation

**Table 5.** Causal mediation estimates (probit, 500 quasi-Bayesian draws);
ACME = average causal mediation effect via persistent sadness/hopelessness.

| Outcome | ACME (95% CI) | Proportion mediated | n |
|---|---|---|---|
| Low school connectedness | +0.039 (0.033, 0.046) | 46% | 10,430 |
| Marijuana (30d) | +0.031 (0.025, 0.037) | 23% | 10,428 |
| Vaping (30d) | +0.034 (0.028, 0.040) | 22% | 10,095 |
| Rx pain-med misuse (ever) | +0.023 (0.018, 0.027) | 22% | 10,440 |
| Any illicit drug (ever) | +0.024 (0.019, 0.029) | 20% | 9,952 |
| Binge drinking (30d) | +0.015 (0.011, 0.020) | 15% | 10,051 |

All indirect effects are positive with CIs excluding zero. Poor current
mental health shows the same pattern with smaller shares (5–12% for
substances; 30% for connectedness). The contrast is informative: nearly half
of the withdrawal association runs through measured distress, while
substance use retains a substantial direct path — compatible with coping
motives (affect regulation, control) not fully captured by two mood items.

### 5.8 Screening prototype

**Table 6.** Held-out test performance (calibrated XGBoost / logistic).

| Target (prevalence) | n | AUC | PR-AUC | Brier |
|---|---|---|---|---|
| Any current substance use (43.7%) | 6,409 | 0.694 / 0.697 | 0.636 / 0.641 | 0.218 / 0.217 |
| Binge drinking (12.6%) | 6,039 | 0.693 / 0.691 | 0.287 / 0.268 | 0.103 / 0.103 |
| Any illicit drug ever (13.9%) | 6,139 | 0.759 / 0.761 | 0.436 / 0.433 | 0.103 / 0.101 |

Calibration curves track the diagonal (quantile bins), so predicted
probabilities are decision-grade. At the recommended sensitivity-first
operating point for any current substance use (threshold 0.32), the model
identifies 81% of students currently using substances while flagging 69% of
students, with 52% precision against a 44% base rate. Decision-curve
analysis shows model-guided outreach dominating both screen-everyone and
screen-no-one across the plausible threshold range. The fairness audit at
this operating point finds broadly comparable subgroup AUCs with residual
sensitivity and false-positive-rate gaps reported openly in the dashboard;
group-specific threshold correction and its legal trade-offs are future
work. Because the logistic variant matches XGBoost within ~0.01 AUC, the
deployment recommendation is the interpretable model, whose thirteen
coefficients ship as published odds ratios (e.g., physical dating violence
2.12, witnessed community violence 1.68, cyberbullying 1.44, sexual-violence
exposure 1.41). The screening sample is restricted to students with complete
thirteen-item intake data (n ≈ 6,000–6,400), predominantly reflecting the
questionnaire-version mechanism of Section 3.3.

## 6. Discussion

### 6.1 The three questions, answered

**Breadth:** exposure is associated with the entire substance battery, and
the association *strengthens* with substance severity (PR 2.2 → 7.9). This
gradient is difficult to reconcile with a stereotype of generalized
recklessness — the rarer and more dangerous the substance, the more
disproportionately it is used by exposed students — and is exactly what an
escalating-coping account predicts. **Pathway:** a fifth to a quarter of
each substance association, and nearly half of the withdrawal association,
runs through a single crude distress item; given single-item measurement
error, these are plausibly lower bounds on the true mediated share.
**Predictability:** trauma variables alone identify most at-risk students at
screening-appropriate sensitivity, with calibrated probabilities and
decision-analytic support.

### 6.2 Implications for practice

Screening for victimization and household adversity — information many
school health contexts already collect — could flag the majority of
adolescents at elevated substance-use risk before behavior consolidates. The
mediation results argue for pairing any such screening with mental-health
support rather than disciplinary response: if a substantial share of the
pathway runs through distress, treating distress is the actionable lever,
and punitive framing would target the symptom while deepening its cause. The
findings also operationalize trauma-informed care: substance use in this
population signals unmet regulation needs, not delinquency.

### 6.3 Deployment ethics

We are explicit that the prototype is not deployment-ready. Preconditions
include prospective validation on the target population, IRB oversight,
student and community consent processes, strict confidentiality of scores,
routing alerts exclusively to health professionals (never to discipline
systems), and monitoring for the failure mode documented by Obermeyer et al.
(2019), in which a facially neutral score encodes structural inequity.
Excluding protected attributes from inputs while auditing on them is a
minimum standard, not a resolution of that risk.

### 6.4 Limitations

1. **Cross-sectional design.** Exposure, mediator, and outcome are measured
   simultaneously; temporal order is assumed, not observed, and reverse
   pathways (substance-involved contexts increasing victimization risk)
   cannot be excluded. Mediation estimates rely on unverifiable sequential
   ignorability.
2. **Proxy exposure.** No age-at-victimization; the composite blends
   childhood and adolescent victimization and misclassifies non-disclosing
   survivors as unexposed, biasing associations toward the null.
3. **Single-item mediators** likely deflate mediated proportions.
4. **Self-report** throughout, with recall and social-desirability bias;
   out-of-school youth are outside the sampling frame entirely.
5. **Approximate variance estimation** (cluster-robust on PSU, ignoring
   strata) and subsample analyses inherited from the questionnaire-version
   missingness; the screening models' complete-case restriction (n ≈ 6,100–
   6,400) may limit generalizability if intake completeness correlates with
   unmeasured risk.
6. **The 43% response rate** admits nonresponse bias that weighting only
   partially corrects.

### 6.5 Future work

Pooling the 2021 and 2023 cycles for replication; group-specific operating
thresholds with a formal fairness-accuracy frontier; ordinal models of
polysubstance escalation; and, where feasible, linkage to longitudinal
cohorts (e.g., Add Health-style designs) to convert the mediation
consistency checks into genuine temporal tests.

## 7. Conclusion

In the first national YRBS cycle to measure ACEs, school connectedness, and
parental monitoring alongside its violence and substance batteries,
sexual-violence victimization and household adversity were associated with
elevated use of every substance measured — with relative risk rising
monotonically with substance severity — alongside reduced social connection
and severe psychological distress, which mediated a substantial share of
both pathways. The pattern is consistent with trauma-driven coping rather
than intrinsic risk-seeking. A calibrated, fairness-audited screening
prototype built only on exposure and demographic information identified 81%
of currently-using students at a decision-analytically supported operating
point, suggesting that early, trauma-informed identification is feasible
with data schools already collect. The broadest-benefit intervention,
however, remains the oldest one: preventing the trauma.

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
- Vickers AJ, Elkin EB. Decision curve analysis: a novel method for
  evaluating prediction models. *Med Decis Making* 2006;26(6):565–574.
