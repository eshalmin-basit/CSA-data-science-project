# Submission checklist — do these in order

Everything referenced below lives in `paper/` and `paper/submission/`.
Steps marked **[YOU]** require your accounts/signatures and must be done by
you; everything else is already prepared.

## 0. One-time setup (~15 min)

- [ ] **[YOU]** Create an ORCID iD at https://orcid.org/register (free,
      2 minutes; journals effectively require it).
- [ ] **[YOU]** Decide the email you'll use for correspondence.
- [ ] Replace the `[corresponding email]` and `[ORCID iD]` placeholders in:
      `paper/draft.md`, `submission/title_page.md`, `submission/cover_letter.md`,
      then re-render both PDFs:
      `python paper/render_pdf.py` and `python paper/render_pdf.py --anonymize`.

## 1. medRxiv preprint (~30 min, live in ~48 h)

- [ ] **[YOU]** Create an account at https://submit.medrxiv.org
- [ ] Upload `paper/CSA_YRBS_2023_manuscript.pdf` (the full, named version).
- [ ] Suggested metadata:
      - Subject area: **Public and Global Health** (alt: Epidemiology)
      - Article type: New Results
      - Declarations: no funding; no competing interests; ethics — secondary
        analysis of de-identified public-use data, no IRB required; data —
        CDC public-use YRBS (link in manuscript).
- [ ] **[YOU]** Approve the final proof screen and submit.
- [ ] When the DOI arrives (~48 h): add it to the CV, the dashboard footer,
      `title_page.md`, and `cover_letter.md` ("A preprint has been posted…").

## 2. Child Abuse & Neglect submission (~45 min)

Portal: Editorial Manager — https://www.editorialmanager.com/chiabuneg/

Before starting, skim the current Guide for Authors once yourself
(https://www.sciencedirect.com/journal/child-abuse-and-neglect/publish/guide-for-authors)
— word/abstract limits occasionally change, and the page blocks automated
access so it was verified only via secondary sources.

- [ ] **[YOU]** Register on Editorial Manager (uses your ORCID).
- [ ] Article type: **Research article (empirical report)**.
- [ ] Upload files in this order:
      1. `submission/cover_letter.md` content (paste or PDF)
      2. `submission/title_page.md` content (Title page — NOT anonymized)
      3. `submission/manuscript_anonymized.pdf` (Manuscript — anonymized:
         no author name, repo/dashboard URLs blinded)
      4. `submission/highlights.md` content (Highlights)
      5. Figures are embedded in the manuscript PDF for review; if the
         portal demands separate figure files, they are in
         `reports/figures/` (Figures 1–5 as named in the manuscript).
- [ ] Paste the **condensed ≤250-word abstract** from `title_page.md` into
      the abstract field (the in-manuscript structured abstract is longer).
- [ ] Declarations screens: no funding · no competing interests · not under
      consideration elsewhere · preprint on medRxiv (give DOI) · AI-assistance
      disclosure as worded in `title_page.md`.
- [ ] Suggested reviewers (optional): pick 3–5 researchers whose work the
      paper cites (ACEs/YRBS/adolescent substance use areas); do not suggest
      anyone you know personally.
- [ ] **[YOU]** Final approval click.

## 3. While under review

- Do not submit the same manuscript to another journal simultaneously.
- Typical first decision: 2–5 months. Rejection with reviews is normal and
  useful — the fallback chain is Addictive Behaviors → Preventive Medicine
  Reports → PLOS ONE, and the package adapts with minor reformatting.
- Cite the preprint DOI in your master's applications immediately; update
  to the journal citation if accepted.
