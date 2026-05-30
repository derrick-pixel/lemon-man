# 00 — Project Brief

## What

A two-sided employment trust platform. Employers contribute structured feedback on workers they've engaged; workers maintain a portable trust profile they can use to signal reliability to future employers. Both sides have explicit rights of correction, contest, and mediation.

## Why

The current state is asymmetric. Workers can review employers (Glassdoor, Indeed, Google Maps). Employers have **no equivalent signal** on workers — particularly in the temporary / short-contract / daily-worker segment where reference checks are impractical and the cost of a bad hire is high. The labour-economics term for an information-asymmetric bad hire is a *lemon* (Akerlof, 1970). The platform restores signalling on the employer side.

## Theoretical foundation (use in deck / partner conversations)

Two pieces of labour economics frame why this market exists:

1. **Akerlof's "Market for Lemons" (1970).** When buyers can't distinguish high-quality from low-quality goods (or hires), the market gravitates to a low-price / low-quality equilibrium. The good workers exit the segment because their quality isn't being priced. The platform addresses this by making worker quality observable.
2. **Spence's job market signalling (1973).** High-quality candidates differentiate themselves by acquiring costly, hard-to-fake signals — usually credentials. In high-velocity contract labour, traditional credentials don't survive the transaction frequency: an agency placing 200 daily hires can't run a reference check on each. The platform reintroduces a signal layer (the trust score, training records, employer testimonials) that operates at gig-economy throughput.

The platform's strategic position is that it solves an information problem that the market has informally tried to solve via WhatsApp groups and word-of-mouth — but does so structurally, with audit trails, mediation, and worker rights of reply that the informal channel lacks.

## Who

**Target users (Phase 1 — Singapore):**
- **Manpower outsourcing agencies and BPO operators** (Derrick's own portfolio is a Tier-0 buyer). Highest pain, fastest sales cycle.
- **F&B, events/MICE, retail, logistics, healthcare auxiliary employers** who hire temporary staff (daily, weekly, monthly contracts).
- **Construction main-cons and sub-cons** who engage transient site labour.
- **Workers** in those segments who want a verifiable reputation to differentiate from the median.

**Excluded from Phase 1:**
- Permanent full-time hires (background-check companies serve this; we don't compete on Phase 1)
- Roles where Workplace Fairness Act protected characteristics are highly salient (e.g., professional services hiring)
- Anyone under 18

## Core insight

The "blacklist" framing has been tried and is legally radioactive in regulated markets (Singapore, EU, increasingly SEA). The **same business goal** (employer-side signal on worker reliability) can be achieved through a worker-owned record where employers contribute and workers respond. Workers cooperate because:
1. The platform serves as their portable reference letter
2. A clean record is competitive advantage
3. They control narrative on contested entries
4. The alternative — informal blacklisting via WhatsApp groups — is worse for them and is happening anyway

## What we ship in MVP (12 weeks)

1. **Worker profiles** with verified phone + email (Singpass Myinfo in Phase 2)
2. **Employer/agency accounts** with verified UEN
3. **Adverse-incident submission** with evidence upload, OTP-pinged contest window (24–72h), pre-publication review
4. **Positive-record submission** (testimonials, training completion, attendance milestones)
5. **Trust score engine** — single integer score with severity weights, decay, and quadratic corroboration uplift
6. **Worker dashboard** — view own record, contest entries, request mediation, share profile link
7. **Employer dashboard** — search workers, contribute records, view contributed history
8. **Pay-per-check token model + monthly subscription** for employers
9. **Admin/moderation console** — mediation queue, anomaly detection (frivolous uploads, retaliatory patterns)
10. **PDPA-compliant access logs and data subject rights workflows**

## Phase 2 (months 4–6)

- Singpass Myinfo for worker onboarding
- WSQ training integration (auto-pull SkillsFuture records as positive signal)
- LinkedIn testimonial verification
- API for agency HRIS integration (Whyze-HR, others)
- B2B reseller channel through existing manpower agencies

## Phase 3 (months 7–12)

- Malaysia + Philippines launch (different consent regimes; Variant A may be viable)
- Industry-specific trust signals (e.g., F&B service score, construction safety score)
- Predictive flight-risk model for HR teams

## Key economic assumptions (to be validated)

From Derrick's notes and the May 2026 SEA viability research:
- 1–3% of workers are persistent "lemons" (needs validation — this may be 5–10% in temp segments)
- SEA workforce ≈ 700M, so addressable lemon population if SEA-wide ≈ 7–21M individuals
- Lemon-upload event rate: ~10% of lemons per year → ~700K–2.1M upload events/year SEA-wide at maturity
- Employer willingness to pay: $200/shift saved per side-stepped bad hire (validated against Singapore F&B daily-rate norms — this checks out)
- 1–5% of annual contract value as cost of degraded client relationship (consistent with Elitez Group internal data)

### ROI math for screening fee pricing

The total cost of one no-show or cancellation for an employer (`C_total`):

```
C_total = LD + (P_loss × ACV) + (T_fire × R_hr)

where:
  LD       = Liquidated damages to end client          (≈ S$200 / shift, F&B + retail + cleaning)
  P_loss   = Probability-weighted client churn         (1–5% of Annual Contract Value)
  ACV      = Annual Contract Value of the engagement
  T_fire   = Manager hours to find a replacement       (≈ 1.0 hr)
  R_hr     = Operational manager hourly rate           (≈ S$25 / hr)
```

For a representative S$60K ACV engagement with one no-show:
- LD: S$200
- P_loss × ACV (at 2%): S$1,200
- T_fire × R_hr: S$25
- **Total: ~S$1,425 per avoided bad hire** (and S$225 even excluding the relationship-degradation term)

A search token priced at S$5–15 against a S$225–1,425 avoided loss is **15×–95× ROI per check**. This is the pricing anchor.

## Monetisation (MVP)

Hybrid: low subscription floor for distribution + per-event tokens for the high-value moments.

| Tier | Price | Who | Includes |
|---|---|---|---|
| **Lite** | S$2 / mo | < 15 staff | Dashboard, search, basic attendance tracking |
| **Pro** | S$10 / mo | 15–50 staff | Lite + unlimited user accounts, basic reporting, integrations |
| **Enterprise** | Custom | 50+ staff, manpower agencies | Pro + API, SLA, dedicated CSM |
| **Search token** | S$5–15 / token (volume bundles at S$5; standalone at S$15) | All | 1 token / search; reveals score and records within the rolling window |
| **Upload token** | 3 tokens / submission | All | Friction price; deters frivolous uploads |
| **Worker rehabilitation fee** | S$50–200 / record | Workers (optional) | Expedites score recompute after rehabilitation pathway is complete. **Does not delete the audit record** — only accelerates the recomputation cycle. |

Soft-launch posture: first 60 days free for Lite tier to drive employer-side adoption density. Revenue model formalises in months 3–6.

## What this bundle does NOT do

- Provide legal advice. The `01_LEGAL_AND_RISK.md` doc is a risk register written by an AI assistant, not a lawyer's opinion. Before launch, get a Singapore data-protection lawyer (Drew & Napier, Allen & Gledhill, or Rajah & Tann have PDPA practices) to sign off on the consent flows and TOS.
- Cover financial modelling in detail. Build that in a separate spreadsheet using the unit economics in this brief.
- Cover go-to-market. Use Elitez's existing agency network as the warm distribution channel — that's the core moat.

## What the planning bundle DOES expect you to decide

See `README.md` § "Open questions" for the five `[DECISION]` items.
