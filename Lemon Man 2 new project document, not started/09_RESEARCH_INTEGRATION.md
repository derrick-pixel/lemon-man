# 09 — Research Integration & Design Deltas

Reconciliation between the *Southeast Asia Business Viability Research* paper (May 2026) and this planning bundle. This file is the audit trail: what was adopted, what was modified, and what was explicitly rejected, with reasoning.

The research paper is a strong contribution — particularly on theoretical grounding (Akerlof/Spence), market regulatory analysis, and the ROI math. Several mechanisms it proposes have been integrated. A small number have been **rejected on legal grounds** — those rejections must hold in code even if marketing copy later wants to revive them.

---

## A. Adopted

These ideas from the research paper have been integrated into the planning bundle.

### A.1 Theoretical foundation (Akerlof + Spence)
The asymmetric-information framing is genuinely useful for investor / partner conversations and for explaining the product to skeptical employers. **Integrated into `00_PROJECT_BRIEF.md` §Theoretical foundation.**

### A.2 ROI math for screening fee pricing
The cancellation cost formula `C_total = LD + (P_loss × ACV) + (T_fire × R_hr)` produces ~S$225 minimum per missed shift, which is the defensible anchor for token pricing. **Integrated into `00_PROJECT_BRIEF.md` §Unit economics.**

### A.3 Three-market regulatory comparison (SG / MY / TH)
The paper's reading of the regulatory environment in each market is broadly sound and has been folded in.
- **Singapore — Platform Workers Act (Jan 2025):** raises the cost of bad hires (CPF + injury cover), which raises the value of pre-screening. Pro-platform.
- **Malaysia — Gig Workers Act 2025 + MPGig council:** Troopers' 2% mandatory platform fee establishes that employers in MY accept platform overhead for compliance. Pro-platform.
- **Thailand:** lower regulation, high turnover, daily-payout (Daywork) model preferred. Volume play, not premium.

Integrated into `01_LEGAL_AND_RISK.md` §Regional regulatory landscape and `06_BUILD_PLAN.md` §Phase 6 (SEA expansion).

### A.4 "Lemon Hirer" protection mechanism
A platform that lets employers post about workers without an equivalent backstop on bad-faith employers is asymmetric and fragile. The paper's proposed safeguard — **flag any employer submitting >10 incidents per quarter who can't substantiate a proportional workforce size** — is a strong addition. **Integrated into `02_PRD.md` (admin story A-7), `04_DATA_MODEL.md` (new `employer_headcount_attestations` table + employer flags), and `05_LEMON_SCORE_ENGINE.md` §Anomaly detection.**

### A.5 "You planted a lemon tree!" slogan
Added to the brand voice for the employer multi-submission gamification arc. **Integrated into `07_BRAND_AND_COPY.md`.** The two existing slogans ("lemonified", "side-stepped a lemon") already came from this lineage.

### A.6 Rehabilitation pathways structure
The paper formalises four redemption pathways (testimonials, WSQ training, sincere write-ins, counter-reviews). My existing scoring engine already supports the first three; counter-reviews (worker-initiated review of an employer that becomes part of dispute evidence) has now been made explicit. **Integrated into `02_PRD.md` and `05_LEMON_SCORE_ENGINE.md` §Redemption pathway.**

### A.7 Worker rehabilitation fee
The paper proposes S$50–200 for expedited removal after rehabilitation. Adopted as an optional revenue stream, but with one critical guardrail: **paying the fee does not remove the record from the audit log; it only accelerates the public-score recomputation.** A worker paying to expunge a still-relevant record would be a defamation/PDPA red flag. **Integrated into `00_PROJECT_BRIEF.md` §Monetisation and `04_DATA_MODEL.md`.**

---

## B. Modified

Adopted with substantive changes for legal or technical reasons.

### B.1 Scoring formula
| | Research paper | This bundle |
|---|---|---|
| **Single-employer multiplier** | `α × E^γ` with α=10, γ=1, so 10× | 1× (Variant B: uncorroborated does **not** affect public score) |
| **Multi-employer multiplier** | `α × E^γ` with γ=2 once E≥2, so 4× jump (E=2 → 40, E=3 → 90) | 1 + 0.25×(E−1)², capped at 5× |
| **Decay half-life** | 3 months | 12 months (consider 6) |

**Why diverged:**

1. **Single-employer × 10 is defamation-exposed.** In Singapore, a single employer's unverified claim, published with a 10× weighting against a worker, is high defamation risk. Our Variant B model says uncorroborated records exist in the database (so future corroboration can land) but do not affect the public score. This is the central legal-defensibility move and we should not give it up to match the paper's math.
2. **A 4× jump at E=2 is too cliff-shaped.** The platform's credibility comes from incremental, defensible scoring. A worker going from "unaffected" to "Significant band" the moment a second employer files is hard to defend in mediation. The smoother quadratic curve we picked (1 → 1.25 → 2 → 3.25 → 5) lands more naturally.
3. **3-month half-life is too aggressive.** A worker with one severe corroborated incident would see their score halve in 12 weeks. That undermines the deterrence function (the moral hazard rebalancing the paper itself argues for). 12 months is closer to background-check industry norms; 6 months may be acceptable for the lowest-severity bands. **`[DECISION]` flagged: confirm 12 vs 6 month half-life with counsel.**

**What this means in code:** the existing formula in `05_LEMON_SCORE_ENGINE.md` §Final formula stands. The paper's formula is documented there as "alternative considered" with this reasoning.

### B.2 Demerit taxonomy
The paper presents a 50-incident taxonomy. Our bundle uses 70 negative + 12 positive incidents — the difference is mostly granularity (we split things like theft into minor/major, no-show into confirmed/unconfirmed, etc.).

**Mapping:** every L01–L50 in the paper maps to a code in our `incident_types` seed, with two exceptions detailed in §C below.

**Severity scales differ:** the paper uses weights 5–250; ours use 1–50. Both are arbitrary — the only thing that matters is that the multiplier × severity × decay produces a defensible display number. Ours is calibrated in `05_LEMON_SCORE_ENGINE.md` §Calibration and produces the right display bands.

### B.3 Pricing model
The paper proposes:
- SaaS Lite S$2/mo (< 15 staff)
- SaaS Pro S$10/mo (15–50 staff)
- Standard token S$15
- Volume token S$5 (min 500 purchase)
- Worker rehabilitation fee S$50–200

**Adopted with one change:** we add a "Starter" tier between Lite and Pro that's free for the first 60 days to drive adoption. The S$15 standard / S$5 volume token spread is exactly right for the segmentation goal (penalise low-volume frivolous searches; reward enterprise adoption). **Integrated into `00_PROJECT_BRIEF.md` §Monetisation and `06_BUILD_PLAN.md`.**

The S$2/mo Lite price is aggressive — it covers Stripe fees and not much else. The justification is land-and-expand: get small employers transacting so they upgrade. Acceptable for the first 12 months; revisit at the unit-economics review.

### B.4 Search return — 3-month rolling window
The paper proposes that a search returns "active Lemon Score and historical performance records for a rolling 3-month window."

**Modified to 12 months for the score, with an optional 24-month detail view for higher-tier subscribers.** Three months is too short to be useful — the very behaviours the platform exists to flag (no-shows on confirmed shifts, mid-contract walk-offs) cluster around contract endings that may be 6–9 months apart for the same worker.

The 3-month window may, however, be the right default for what's **shown to the worker on their public profile** by default (a "current standing" view). Workers can opt to show 12 months.

---

## C. Rejected

These elements from the research paper are **explicitly excluded** from the build. Code that adds them is a regression.

### C.1 Incident L10 — "Submitting a medical certificate suspected of malingering"
**Rejected. Severity 45 in the paper.**

This is a direct Workplace Fairness Act 2024 proxy violation. The WFA protects against discrimination on the basis of disability, mental health condition, pregnancy, and caregiving responsibilities — and unexplained medical leave is the canonical visible signal for all of those characteristics. "Suspected of malingering" is precisely the framing the Act exists to eliminate from hiring decisions.

A platform that logs and exposes this would face WFA penalties (S$5K–S$10K per breach) and would attract regulatory attention from MOM and TAFEP. It would also become the single most cited example in any future case against the platform.

**Not in `incident_types` seed. Will be programmatically blocked at API ingress level via the `EXCLUDED_PROXIES` constant in `packages/scoring`.**

### C.2 Incident L11 — "Excessive, pattern-based sick leave (specifically during Q4)"
**Rejected. Severity 50 in the paper.**

Same reasoning as C.1. "Q4 sick leave" is a worker-folklore proxy for "burning unused MC days before the year resets" — but the underlying behaviour mostly correlates with chronic conditions, caregiving responsibilities flaring at year-end, and mental health. Capturing this is a WFA proxy hit.

It is also distinguishable in mediation only by going *into* the worker's medical history, which the platform never has authority to do under PDPA.

**Not in `incident_types` seed.**

### C.3 Direct full-NRIC indexing
The paper says: *"the platform indexes workers using their name and the last four digits of their National Registration Identity Card (NRIC) or local equivalent."*

The bundle agrees on last-4 NRIC (with checksum), not full NRIC. The paper's framing is fine in spirit; **the implementation must use last-4 only**, as established under PDPC's September 2019 advisory. The June 2025 joint PDPC + CSA advisory further deprecates NRIC for authentication generally — the bundle prefers Singpass Myinfo where possible (Phase 2). See `01_LEGAL_AND_RISK.md` §NRIC and `CLAUDE.md` operating principle #3.

### C.4 24-hour minimum contest window
The paper proposes a "24-to-72-hour pending window." 24 hours is too short: it doesn't survive a public-holiday weekend, a worker in transit, or a phone-out-of-charge scenario.

**Bundle uses 72 hours as the standard minimum**, extendable to 7 days if the worker is unreachable on the first SMS and email. See `02_PRD.md` and `03_ARCHITECTURE.md` §Contest window.

### C.5 "Active database removal fee" as expungement
The paper frames the S$50–200 rehabilitation fee as "expediting formal removal from the active database." **Adopted only as score-recomputation expediting, not as expungement.**

The audit log is append-only. The platform never deletes a published record on payment. Otherwise, the platform's defamation-defensibility (the appearance of fairness, evidence-bound process) collapses. Paying to remove a finding would be a regulatory red flag. This must hold in code: the `data_subject_requests` flow handles PDPA-driven correction; the rehab fee accelerates score recompute and worker-side messaging only.

---

## D. Open questions raised by the paper

Issues the paper highlights that we haven't fully resolved.

### D.1 Counter-review of employers (worker-initiated)
The paper proposes that workers can publish "verified counter-reviews" of employers, with mediation deciding whether they reduce the worker's score. The bundle's current model handles this only inside the contest flow on a specific record. **An open question:** does the worker get a standalone path to publish a review of an employer, independent of any specific incident?

Risk: turns the platform into a two-sided reputation graph, dramatically increasing the surface area for cross-suits (Glassdoor + Lemon in one).
Upside: provides genuine balance and undermines the "anti-worker" narrative the platform will face.

**Recommendation:** defer to Phase 3 (after MVP and after the first defamation test case clears). Build the data model to support it (see `04_DATA_MODEL.md`), but don't expose the UI until legal review.

### D.2 Daily-payout adjacency in Thailand
The paper notes that Thai gig platforms (Daywork) succeed with immediate daily payouts. Lemon Man is not a payroll platform, but the question is: does a trust-signal platform without payments attach to TH workers? Or does TH expansion require a payments adjacency?

**Recommendation:** explore a Daywork-style partnership rather than building payments. Capture the trust signal at clock-out/clock-in; let the partner handle payouts. Note in `06_BUILD_PLAN.md` Phase 6.

### D.3 WSQ MySkillsFuture API integration
The paper assumes deep integration with SSG's MySkillsFuture API for automated verification of training records. This isn't currently in the MVP. The integration would let workers auto-verify rehabilitation credits without manual evidence upload.

**Recommendation:** Phase 2. The API exists but onboarding takes ~6–8 weeks and isn't on the critical path. Flagged in `06_BUILD_PLAN.md`.

---

## E. Things the paper got materially right that strengthen the bundle

Not modifications — just acknowledgements that these arguments should be repeated in fundraising / partner conversations.

1. **The Akerlof "lemons" → market degradation framing** is the cleanest one-paragraph explanation of why the platform should exist.
2. **The cancellation-cost ROI math (S$225/shift minimum loss vs S$5–15 screening fee)** is the cleanest one-paragraph defence of why employers will pay.
3. **The "mutual assured destruction" framing** for why employers will behave well (because workers can be visible too) is the cleanest one-paragraph defence against the "anti-worker tool" critique.
4. **The Singapore Platform Workers Act observation** — that raising employer costs of bad hires raises the value of pre-screening — is a real macro tailwind for the SG launch.

Use these in the deck.

---

**Last updated:** May 2026
**Owner of this file:** whoever next reads an external paper / analyst note about the platform and decides whether to fold it in
