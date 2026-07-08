# Sexual-Violence Victimization, Household Adversity, and Adolescent Substance Use and Social Withdrawal: A Machine-Learning Analysis of the 2023 National Youth Risk Behavior Survey

*Draft manuscript — working version*

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
models to identify predictive patterns of maladaptive outcomes. Students
reporting sexual-violence exposure (weighted prevalence 14.6%) showed 2.2–7.9
times higher weighted prevalence across all twelve substance-use outcomes,
lower school connectedness, and lower parental monitoring. Associations
persisted after adjustment for demographics and household adversity (adjusted
odds ratios 2.19–3.19 for substance outcomes). Household adversity displayed
a monotonic dose–response relationship with every outcome examined. Causal
mediation analysis found that persistent sadness or hopelessness mediated
approximately 20–23% of the exposure–substance-use association and 46% of the
exposure–low-school-connectedness association, consistent with a pathway from
trauma through psychological distress to behavioral outcomes. Gradient-boosted
models prioritizing sensitivity achieved ROC-AUC 0.70–0.79 using only trauma
exposure, adversity, and demographic features, with SHAP analysis confirming
that victimization variables outrank demographic features in predictive
importance. Because the YRBS is cross-sectional and self-reported, all
findings are risk-factor associations rather than causal effects; we discuss
these limits alongside the case for trauma-informed screening. The results
support early identification of at-risk adolescents and timely therapeutic
intervention, and underscore the societal imperative to protect children from
trauma and to foster resilience in survivors.

## 1. Introduction

Adolescents who have experienced sexual violence carry an elevated burden of
psychological distress, and a large clinical literature links childhood
sexual abuse (CSA) to later substance use, depression, and social
difficulties. Public discussion of CSA sequelae, however, tends to fixate on
a narrow set of stereotyped outcomes. This project starts from a different
premise: that the behaviors most strongly associated with trauma exposure —
substance use across the full severity spectrum, and withdrawal from school
and family connection — are better understood as coping mechanisms aimed at
regaining stability and control.

Three empirical questions follow from that premise:

1. **Breadth.** Is sexual-violence exposure associated with elevated use
   across the whole substance battery — from vaping and alcohol to heroin,
   methamphetamine, and injection drug use — rather than with one or two
   signature behaviors?
2. **Pathway.** Is the association consistent with mediation through
   psychological distress (persistent sadness/hopelessness, poor current
   mental health), as a coping account predicts?
3. **Predictability.** Can trauma-exposure variables alone, without any
   behavioral inputs, identify at-risk adolescents with useful sensitivity —
   the practical requirement for early screening?

We answer these with the 2023 National Youth Risk Behavior Survey (YRBS),
which in 2023 added household adverse-childhood-experience (ACE) items,
school-connectedness, and parental-monitoring measures to its long-standing
violence and substance batteries, making it the first national YRBS cycle in
which this full constellation can be studied together.

## 2. Related Work

**CSA and substance use.** Meta-analyses consistently associate CSA with
substance-use disorders in adolescence and adulthood, with pooled odds
ratios typically between 1.7 and 3.5 depending on substance and design.
Dube et al. (2003), using the CDC-Kaiser ACE cohort, reported graded
relationships between ACE count and early substance initiation. Our
household-adversity dose–response replicates this pattern in a 2023
national adolescent sample.

**Trauma, distress, and coping.** Self-medication accounts (Khantzian, 1997)
frame substance use as regulation of trauma-related negative affect.
Consistent evidence links victimization to depression and to subsequent
substance use; formal mediation tests in nationally representative
adolescent data remain comparatively rare, which is the gap our mediation
analysis addresses.

**Social withdrawal and connectedness.** School connectedness is protective
against substance use and suicidality (CDC, 2009; Steiner et al., 2019).
Victimized adolescents report lower connectedness; we quantify that
association and test whether it, too, runs through psychological distress.

**Machine learning on YRBS.** Prior work has applied tree ensembles to YRBS
suicidality prediction with AUCs in the mid-0.7s to low-0.8s. We extend the
approach to substance-use outcomes with an exposure-only feature set,
deliberate exclusion of on-pathway mediators, and interpretability via SHAP.

## 3. Data and Ethics

### 3.1 Data source

The 2023 National YRBS is a cross-sectional, school-based survey conducted
biennially by the CDC using a three-stage cluster design (counties →
schools → classes), yielding N = 20,103 students in grades 9–12
representative of US public and private high school students. We use the
public-use microdata (Access database), including CDC-computed dichotomous
variables and survey design variables (weight, stratum, PSU).

### 3.2 Measures

- **Exposure (`csa_exposure`):** any "yes" to ever being physically forced to
  have sexual intercourse (Q19), sexual violence by anyone in the past 12
  months (Q20), or sexual dating violence in the past 12 months (Q21).
  Weighted prevalence 14.6% (female 21.6%, male 8.1%). *Terminology note:*
  YRBS does not record age at first victimization or perpetrator identity,
  so this is sexual-violence victimization reported in adolescence — a proxy
  for, not a clinical determination of, childhood sexual abuse.
- **Household adversity (0–3):** count of parent/guardian problematic
  substance use (Q100), severe mental illness (Q101), and incarceration
  (Q102) — the household-dysfunction subset of the ACE battery added in 2023.
- **Substance outcomes:** CDC dichotomies for current (30-day) cigarette,
  vape, alcohol, binge-drinking, and marijuana use; lifetime prescription
  pain-medicine misuse, cocaine, inhalants, heroin, methamphetamine, ecstasy,
  and injection drug use; any lifetime illicit drug use (CDC composite).
- **Social withdrawal proxies:** low school connectedness (not agreeing one
  feels close to people at school, Q103), parental monitoring (Q104), social
  media use (Q80).
- **Mediators:** persistent sadness/hopelessness (Q26) and poor current
  mental health (Q84). Single-item measures — see Limitations.

### 3.3 Ethics and framing

All data are de-identified public-use records; no IRB review is required for
secondary analysis. Three framing commitments govern the paper. First,
self-reported victimization is almost certainly undercounted, so exposure
prevalence and associations are treated as lower bounds. Second, the design
is cross-sectional: we use risk-factor language throughout and never claim
that exposure *causes* an outcome. Third, results are reported to inform
protection and care for survivors, not to stigmatize them; prediction models
are framed as screening aids for supportive intervention, never as
individual-level labels.

## 4. Methods

### 4.1 Missing data

Item missingness was diagnosed before any modeling (full analysis in
`docs/missing_data.md`). The dominant mechanism is structural: students in
schools sampled for both national and state surveys completed their state's
questionnaire, which omits the 20 new-to-2023 national items. Missingness on
that block is school-clustered (83–87% of PSUs all-or-none) and the
receiving subsample matches the full sample on all checked measures within
0.7 percentage points (weighted). New-block variables are therefore analyzed
in the subsample that received them. Exposures and outcomes are never
imputed; sensitive-item nonresponse on the sexual-violence items (14–22%) is
handled complete-case and discussed as a limitation.

### 4.2 Design-aware estimation

Prevalence estimates use survey weights. Adjusted odds ratios come from
weighted logistic models (weights normalized to the analytic sample size)
with cluster-robust standard errors on PSU — an approximation to full
Taylor-series design-based variance that ignores stratification, which is
generally conservative. Models adjust for age, grade, sex, race/ethnicity,
and mutually for the other exposure (household adversity or `csa_exposure`).

### 4.3 Predictive modeling

For each of eight outcomes we fit (a) an L2 logistic regression baseline and
(b) an XGBoost classifier, using only exposure/adversity/context features
(sexual-violence exposure, household adversity, physical dating violence,
bullying, witnessed community violence, unstable housing, basic-needs
support) plus demographics. Psychological mediators are deliberately
excluded from predictive features because they lie on the hypothesized
causal pathway. Evaluation uses stratified 5-fold cross-validation. Because
clinical screening favors sensitivity, we compare two imbalance strategies —
inverse-prevalence class weights and SMOTE oversampling (applied inside
folds only) — and report recall, precision, F1, ROC-AUC, and PR-AUC.
Interpretability uses TreeSHAP on the final class-weighted XGBoost models.

### 4.4 Mediation analysis

We estimate average causal mediation effects (ACME), average direct effects
(ADE), and proportion mediated under the Imai–Keele–Tingley framework
(quasi-Bayesian Monte Carlo, 500 draws) with probit mediator and outcome
models adjusted for demographics and household adversity. Estimates are
interpreted as *consistency checks* for the coping hypothesis, since
temporal ordering is unobservable in cross-sectional data.

## 5. Results

### 5.1 Exposure prevalence and unadjusted associations

14.6% of students (weighted) reported sexual-violence exposure — 21.6% of
female and 8.1% of male students. Exposed students had a higher weighted
prevalence of every substance outcome examined, with prevalence ratios
increasing with substance severity: vaping 2.9×, binge drinking 3.2×,
cigarettes 3.9×, cocaine 6.4×, methamphetamine 7.5×, injection drug use
7.9×. Exposed students were also less likely to feel close to people at
school (43.4% vs 57.4%) and less likely to report parental monitoring
(72.9% vs 85.9%), while 72.1% reported persistent sadness or hopelessness
(vs 33.3% unexposed) and 28.7% reported a past-year suicide attempt (vs
5.8%).

### 5.2 Dose–response for household adversity

Every outcome rose monotonically with household adversity score: any
lifetime illicit drug use 5.8% → 24.8%, current vaping 10.5% → 37.2%,
persistent sadness 27.1% → 71.4%, and past-year suicide attempt 4.3% → 26.3%
across scores 0 → 3.

### 5.3 Adjusted associations

After adjustment for age, grade, sex, race/ethnicity, and household
adversity, sexual-violence exposure remained associated with all outcomes:
adjusted OR 3.19 (95% CI 2.50–4.06) for any lifetime illicit drug use, 2.89
(2.42–3.45) for current vaping, 2.84 (2.34–3.45) for binge drinking, 2.67
(1.82–3.91) for current smoking, 2.31 (1.93–2.78) for current marijuana,
2.19 (1.75–2.73) for prescription pain-medicine misuse, and 1.42 (1.24–1.62)
for low school connectedness. Household adversity contributed independently
(OR 1.23–1.74 per point).

### 5.4 Prediction

With exposure and demographic features only, cross-validated ROC-AUC ranged
from 0.70 (prescription pain-medicine misuse) to 0.79 (current cigarette
use); recall at the 0.5 threshold was 0.56–0.70 under class weighting.
Logistic regression matched or slightly exceeded XGBoost on most outcomes,
indicating a predominantly additive signal. Class weighting dominated SMOTE
for sensitivity: with XGBoost, SMOTE collapsed recall (e.g., 0.13 vs 0.65
for binge drinking) while class weighting preserved it — a practically
important negative result for oversampling on sparse binary survey features.
Low school connectedness was harder to predict (AUC 0.62), suggesting
withdrawal depends on contextual factors beyond the trauma variables
measured here.

### 5.5 Interpretability

SHAP analysis ranked victimization and adversity variables above every
demographic feature for all substance outcomes: physical dating violence,
household adversity, sexual-violence exposure, and witnessed community
violence consistently occupied the top positions. The basic-needs-met item
acted protectively.

### 5.6 Mediation

Persistent sadness/hopelessness carried a significant indirect effect for
every outcome tested: proportion mediated ≈ 22% for current vaping, 23% for
marijuana, 20% for any illicit drug use, 15% for binge drinking — and 46%
for low school connectedness. Poor current mental health showed the same
pattern with smaller shares (5–12% substances, 30% connectedness). The
larger mediated share for connectedness is consistent with withdrawal being
more distress-driven, while substance use retains a substantial direct
(unmediated) path — compatible with coping motives not fully captured by
mood items.

## 6. Discussion

### 6.1 Interpretation

The three questions posed in the Introduction receive affirmative answers.
Exposure is associated with the *entire* substance battery, and the gradient
— larger relative risks for rarer, more dangerous substances — is what a
coping-escalation account predicts and a "risky personality" stereotype does
not. A meaningful fraction of each association runs through measured
psychological distress, and nearly half of the connectedness association
does. Finally, trauma variables alone predict outcomes with sensitivity
adequate for low-stakes screening, and interpretable models attribute that
performance to the victimization variables themselves.

### 6.2 Implications

Screening for victimization and household adversity — already collected in
many school health contexts — could flag the majority of adolescents at
elevated substance-use risk before behavior consolidates. The mediation
results argue for pairing any such screening with mental-health support
rather than disciplinary responses: if a substantial share of the pathway
runs through distress, treating distress is the actionable lever. The
findings also reinforce trauma-informed care principles: substance use in
this population signals unmet regulation needs, not delinquency.

### 6.3 Limitations

1. **Cross-sectional design.** Exposure, mediator, and outcome are measured
   simultaneously; temporal order is assumed, not observed. Mediation
   estimates are consistency checks, not causal proof. Reverse pathways
   (e.g., substance-involved contexts increasing victimization risk) cannot
   be excluded.
2. **Proxy exposure measure.** YRBS lacks age-at-victimization; the
   composite includes adolescent victimization and misses abuse the
   respondent chose not to report. Prevalence and associations are best read
   as lower bounds under nondifferential underreporting.
3. **Single-item mediators.** No PHQ-9/GAD-7; persistent sadness and poor
   current mental health are single self-report items and undermeasure the
   constructs, likely deflating mediated proportions.
4. **Self-report generally**, with social-desirability and recall biases.
5. **Approximate variance estimation.** Cluster-robust SEs on PSU ignore
   stratification gains; point estimates are design-weighted throughout.
6. **School-based frame.** Out-of-school youth — plausibly higher-risk — are
   not represented.

## 7. Conclusion

In the first national YRBS cycle to carry ACE, connectedness, and monitoring
items together, sexual-violence victimization and household adversity were
associated with elevated use of every substance measured, reduced social
connection, and severe psychological distress, with distress mediating a
substantial share of both pathways. The pattern is consistent with
trauma-driven coping rather than intrinsic risk-seeking. Machine-learning
models built only on exposure and demographic information identified
most at-risk students, suggesting that early, trauma-informed screening and
support is feasible with data schools already collect — and that protecting
children from trauma remains the single intervention with the broadest
predicted benefit.

## References

- Brener ND, et al. Overview and Methods for the Youth Risk Behavior
  Surveillance System — United States, 2023. *MMWR Suppl* 2024;73(4).
- CDC. 2023 YRBS Data User's Guide. September 2024.
- CDC. School Connectedness: Strategies for Increasing Protective Factors
  Among Youth. 2009.
- Dube SR, Felitti VJ, Dong M, et al. Childhood abuse, neglect, and household
  dysfunction and the risk of illicit drug use: the Adverse Childhood
  Experiences Study. *Pediatrics* 2003;111(3):564–572.
- Imai K, Keele L, Tingley D. A general approach to causal mediation
  analysis. *Psychol Methods* 2010;15(4):309–334.
- Khantzian EJ. The self-medication hypothesis of substance use disorders.
  *Harv Rev Psychiatry* 1997;4(5):231–244.
- Lundberg SM, Lee S-I. A unified approach to interpreting model
  predictions. *NeurIPS* 2017.
- Steiner RJ, Sheremenko G, Lesesne C, et al. Adolescent connectedness and
  adult health outcomes. *Pediatrics* 2019;144(1).
