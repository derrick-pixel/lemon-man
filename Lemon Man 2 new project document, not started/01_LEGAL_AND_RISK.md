# 01 — Legal & Risk

**This is the single most important file in the bundle.** This product touches Singapore's PDPA, defamation law, the new Workplace Fairness Act, and (depending on launch markets) GDPR-equivalents in Indonesia, Malaysia, Thailand, and the Philippines. The architecture and consent flows in the rest of this bundle exist primarily to manage these risks.

> ⚠️ **Not legal advice.** Written by an AI assistant. Before MVP launch, retain a Singapore data-protection lawyer (Drew & Napier, Allen & Gledhill, Rajah & Tann, or specialist firms like CLINT). Budget S$15–40k for proper consent flow review + TOS + privacy policy + risk memo.

---

## 1. The legal landscape (Singapore, May 2026)

### 1.1 Personal Data Protection Act 2012 (PDPA)

The PDPA governs collection, use, and disclosure of personal data of Singapore residents. It applies extraterritorially — **hosting offshore does not exempt you** if your data is about Singapore residents.

**Key obligations relevant to this product:**

| Obligation | What it means here |
|------------|--------------------|
| Consent | Cannot collect, use, or disclose personal data without consent. Limited exceptions in 2nd/3rd/4th Schedules (legitimate interests, public interest, evaluative purposes — see §1.2). |
| Notification | Must inform the individual of purposes. Generic notices are increasingly disfavoured. |
| Purpose limitation | Can only use data for purposes consented to. |
| Reasonableness | Collection/use must be reasonable to a reasonable person. |
| Accuracy | Must make reasonable effort to ensure accuracy, especially when data is used to make decisions affecting the individual. |
| Protection | Reasonable security arrangements. |
| Retention limitation | Cannot keep longer than necessary. |
| Access & Correction | Individuals have right to access their data and request correction. |
| Withdrawal of consent | Individuals can withdraw consent (subject to limited carve-outs). |

**Penalty exposure:** Under the 2020 PDPA amendments, financial penalties for breaches can be up to **10% of annual Singapore turnover or S$1 million, whichever is higher.**

### 1.2 The "evaluative purpose" exception (important)

PDPA's 2nd Schedule includes an exception for **evaluative purposes** — assessing suitability for employment, promotion, contracts, etc. This is the strongest legal foundation we have. But:

- It allows the **organisation making the evaluation** to collect/use data without consent for that purpose.
- It does **not** clearly authorise a **third party** (us) to aggregate that data and resell it.
- The exception is narrow and the PDPC has not directly ruled on multi-employer reputation databases.

**Working assumption:** We cannot rely solely on the evaluative-purpose exception. We need affirmative consent from the worker for the **worker-side** of the platform, and we lean on evaluative purpose only for the employer's contribution flow (combined with strong notification and accuracy obligations).

### 1.3 PDPC NRIC Advisory Guidelines (effective Sep 2019; reinforced June 2025)

Singapore organisations must not collect, use, or disclose **full NRIC numbers** unless:
1. Required by law, or
2. Necessary to establish identity to a high degree of fidelity for risk-significant purposes.

**A worker reputation database does not qualify** under either limb. Therefore:

- ❌ Full NRIC: not allowed
- ✅ **Partial NRIC (last 3 digits + checksum, or last 4 digits)**: permitted as personal data subject to standard PDPA obligations
- ✅ **Mobile + email + name**: preferred primary identifier
- ✅ **Singpass Myinfo verification**: preferred identity-verification path (no NRIC stored, just attestation)

The **June 2025 joint advisory** (PDPC + CSA) explicitly cautions against NRIC-based authentication. Don't authenticate with last-4; use it only as a tie-breaker for name disambiguation, and always combine with at least one other channel.

### 1.4 Workplace Fairness Act 2024 (in force 2026/2027)

Passed in January 2025, expected to enter force in 2026 or 2027. Makes discrimination on **protected characteristics** unlawful in employment decisions:

- Age
- Nationality (including PR/citizen status)
- Sex (including assigned-at-birth or post-reassignment), marital status, pregnancy, caregiving responsibilities
- Race, religion, language
- Disability and mental health conditions

Administrative penalties up to S$5,000 / S$10,000 per occasion. Companies <25 employees exempt for first 5 years (but not for fair-consideration-of-applicants requirement).

**Why this matters for us:** Several incidents in Derrick's original notes are **direct proxies for protected characteristics**:

| Original incident | Protected proxy | Action |
|---|---|---|
| "Frequent MC that is suspected for malingering" | Disability, mental health, pregnancy | **Excluded from scoring incidents.** Frequency cannot be on our taxonomy. |
| "Clearing medical leave towards Q4" | Same | **Excluded.** |
| "Last minute cancellation" | Caregiving, disability | **Permitted only as a count of last-minute cancellations without reason given** — and reasonable cause auto-clears it. |
| "Late to work" | (Generally OK, but flag if pattern correlates with caregiving) | **Permitted.** |

The Tripartite Guidelines on Fair Employment Practices (TGFEP) is being updated alongside the WFA to explicitly cover **platform operators and corporate service buyers** — i.e., us. Even if we're not the employer, MOM has indicated they will investigate platforms that facilitate discriminatory hiring decisions.

### 1.5 Defamation (Singapore)

Singapore's defamation regime (Defamation Act 1957 + common law):

- Statement lowering the reputation of an identified person in the eyes of right-thinking members of society, **published** (communicated to a third party), is defamatory.
- **Defences:** truth (justification), fair comment, qualified privilege, absolute privilege, innocent dissemination.
- **The platform is a publisher** unless we can establish "innocent dissemination" by showing we didn't know and couldn't reasonably know about specific defamatory content.
- Singapore courts are plaintiff-friendly on defamation. Award levels can be six figures for individual claims.

**Architectural implications:**
- Every adverse record must be reviewable by the subject before or upon publication
- Mediation/takedown must be fast (target: 48h for legitimate disputes)
- Truth/justification defence requires evidence — every adverse record must have attached evidence (timesheets, internal emails, photographs, supervisor reports)
- We need an "innocent dissemination" architecture — clear notice-and-takedown procedure, prompt response to complaints
- Indemnification from contributing employer in TOS: each employer who uploads agrees to indemnify us against defamation claims arising from their submissions

### 1.6 Tort of malicious falsehood / wrongful interference

If a worker can show that adverse content caused them to lose a specific job opportunity, and the content was false or maliciously published, there's a claim. Less common than defamation but a real risk.

### 1.7 Other markets (preview for Phase 3)

| Market | Key data regime | Notes |
|--------|-----------|-------|
| Malaysia | PDPA 2010 (recently amended 2024, eff 1 Jun 2025) | Consent-based; introduces data breach notification; data portability rights similar to GDPR |
| Indonesia | PDP Law (UU 27/2022, fully effective 2024) | Strong consent regime; large fines (up to 2% of revenue); data localisation pressure |
| Philippines | Data Privacy Act 2012 | Consent-based; NPC actively enforces |
| Thailand | PDPA 2019 | GDPR-like; consent-based |
| Vietnam | PDPL effective 2026 | Newest; consent-based; localisation requirements |

**None of these markets are looser than Singapore for a worker-reputation platform.** The Phase 3 plan needs to redo this analysis per-market with local counsel.

### 1.8 Regional regulatory landscape — strategic read

How the gig-economy regulation in each of our top three markets shapes the platform opportunity. This is the strategic framing for fundraising and partner conversations; the per-market consent analysis above remains the technical/legal authority.

#### Singapore — premium-tier, compliance-driven
- **Platform Workers Act (in force Jan 2025):** mandates CPF contributions and work injury insurance for platform workers, creating a new third legal category between employee and contractor.
- **Strategic implication:** the cost of a bad temporary hire just went up materially for employers (CPF + injury cover + admin overhead), which means the value of pre-screening went up proportionally. This is a macro tailwind for the SG launch.
- **WSQ integration:** Singapore's WSQ skills-recognition framework gives the rehabilitation pipeline a state-recognised verifiable signal. Phase 2 should pursue MySkillsFuture API integration.
- **Channel:** structured platforms (FastJobs, MyCareersFuture) — accessible via partnership, not raw acquisition.

#### Malaysia — high-growth, structured policy
- **Gig Workers Act 2025:** provides clear legal classification, distinct from traditional employment liabilities. Establishes the Gig Advisory Council (MPGig).
- **Validated willingness to pay:** local platform Troopers operates with a 2% platform service fee accepted by employers. This is direct evidence that the MY market accepts platform overhead in exchange for compliance and reliability.
- **Strategic implication:** the gap between MY's regulatory maturity and ID/TH means MY is the most natural Phase 3 expansion target — known consent regime, validated employer willingness to pay, gig-specific legislation in place.
- **Channel:** Troopers, GoGet are the established gig-network distributors. Partnership before competition.

#### Thailand — high-volume, flexible
- **Regulatory posture:** platform workers remain classified as informal contractors under the Labour Protection Act. Limited gig-specific legislation.
- **Strategic implication:** the market is cost-sensitive and high-volume with severe operational volatility — opposite of SG. Premium pricing won't land; the platform must compete on transaction throughput and integration with daily-payout flows (Daywork model).
- **Operational shape:** the bundle's recommendation is to enter TH via partnership with an existing daily-payout platform rather than building payments ourselves. See `09_RESEARCH_INTEGRATION.md` §D.2.
- **Channel:** Daywork, Jobsdb, daily mobile apps.

| Parameter | Singapore | Malaysia | Thailand |
|-----------|-----------|----------|----------|
| Market valuation & growth | Premium-tier, high-value B2B | High-growth, ~15% CAGR | Booming gig sector, projected to reach $7B |
| Regulatory risk | High compliance; mandatory CPF + injury cover | Balanced; Gig Workers Act 2025 framework | Low formal regulation; high informality |
| Cost sensitivity | Low; high WTP for reliability | Moderate; compliance-value mix | High; thin margins, low daily wages |
| Sourcing channels | FastJobs, MyCareersFuture | Troopers, GoGet | Daywork, Jobsdb |
| Strategic posture for Lemon Man | Land here first; defensible premium pricing | Phase 3; partner with Troopers / GoGet | Phase 4; partner-only entry via Daywork |

---

## 2. The three biggest legal landmines

These are the failure modes that could shut down the product. Architecture exists to mitigate each.

### Landmine 1: Operating an unconsented adverse-data database

**Risk:** PDPC investigation, financial penalty up to 10% of SG turnover, public order to delete data.
**Mitigation:** Worker-consent first model (Variant B). Workers create profile and consent to receive employer feedback. Adverse data from employers without active worker profile must be queued, not published, until the worker is reachable and consent is obtained — or anonymised and used only as aggregate signal (which has limited business value but zero exposure).

### Landmine 2: Defamation suits at scale

**Risk:** Even one successful defamation suit creates a template; class action–like clusters can follow.
**Mitigation:**
- Mandatory evidence attachment for every adverse record
- 48–72h contest window with OTP-verified worker acknowledgment
- Mediation track funded by uploader fee
- Indemnification clause from contributing employer
- Errors-and-omissions insurance from year 1 (S$5–10M cover; quote from Lockton or Marsh Singapore)
- Two-employer corroboration before negative records affect the public-facing score (records remain visible to direct subscribers, but the score is not affected by uncorroborated single-source claims)

### Landmine 3: Workplace Fairness Act collision

**Risk:** Once WFA is in force, MOM can investigate the platform if our incidents are being used as proxies for protected characteristics. Reputation damage + administrative penalties + potential injunctive relief.
**Mitigation:**
- Hard-coded denylist of incidents that proxy for protected characteristics (see §1.4 above and `05_LEMON_SCORE_ENGINE.md`)
- Periodic statistical audit of whether our score distribution correlates with demographic categories (we can do this internally on Singpass-Myinfo onboarded users)
- Public-facing fair-use policy and clear guidance to employers on what NOT to upload
- Soft delete + permanent exclusion for any record flagged as discriminatory

---

## 3. Variant A — Bold (the original idea)

**Posture:** Employer-controlled blacklist with employee 24–72h OTP contest window. Worker only sees record if they're notified by the contest OTP — no profile required.

**Where this works:** Markets with weaker consent regimes and where employer-side aggregation is culturally normal. Possibly: Vietnam, Cambodia, parts of the GCC. **Not Singapore, not the EU, not Indonesia/Philippines once their regimes mature.**

**Why we are documenting it:** Some SEA expansion markets may permit this model, and the data model in `04_DATA_MODEL.md` is built to support both with a `publication_mode` flag at the jurisdiction level.

**Risks if launched in Singapore as the primary model:**
- PDPC investigation likely within 12–24 months of any media coverage
- Defamation claims; you become a publisher of unconsented adverse content
- Workplace Fairness Act exposure
- Class action energy from labour advocates (TWC2, HOME)
- MOM displeasure — and Derrick has work pass dependencies through Elitez

**Verdict:** Do not launch in Singapore as Variant A.

---

## 4. Variant B — Consent-First (recommended for SG)

**Posture:** Worker creates profile and consents to receive structured employer feedback. Workers always notified before publication. Workers always have right to respond, contest, mediate. Score is **worker-owned and portable**. Employers contribute feedback as a service to the worker's profile (and as input to a hiring-signal product they pay for).

**The reframe:** This is not a blacklist. It is a *verified employment track record* with severity-weighted feedback. The lemon framing stays as **brand voice**, not as legal posture.

### How Variant B captures Derrick's business goal

| Original business goal | How Variant B delivers it |
|---|---|
| Employers get signal on worker reliability | Yes — they search the platform, find workers, see their consented record + score |
| Workers are deterred from "lemon" behaviour | Yes — soft power is identical; workers know employers will submit records |
| Bad hires can be flagged | Yes — but worker has 48–72h to contest before publication |
| Two-employer corroboration | Yes — score formula gives quadratic uplift to corroborated records |
| Mutual assured destruction / mediation | Yes — built in |
| Worker incentive to clean up | Yes — testimonials, training, time-decay all reduce score |
| Soft + hard power | Yes — soft via fear of profile being affected, hard via direct lookup |
| Revenue model (per-check tokens, subscriptions) | Yes — identical |

**What Variant B doesn't capture:**
- Records on workers who refuse to onboard. *Solution:* Records can still be submitted, but they sit in a quarantine until the worker can be reached. They are visible to the **submitting employer's own organisation** as an internal note, but not to other employers' searches and not in the public score.
- The element of surprise / shame. *Solution:* That was always a legal risk anyway. Variant B's mediation track delivers the same operational benefit (a defaulting worker faces consequences) without the litigation risk.

### What you give up

- The "you've been punked" affect. The brand still carries citrus humour but it's not weaponised against the worker.
- Records on hold-out workers (~10–20% of lemons may refuse to onboard). Mitigated by data network effects — once 30–40% of agencies use the platform, refusing to onboard becomes a red flag itself.

---

## 5. Recommended posture for MVP

1. **Variant B is the MVP model for Singapore.** All consent flows, contest windows, mediation paths built first.
2. **Variant A architecture is preserved** behind a `jurisdiction_publication_mode` config so SEA markets that permit it can flip the switch later.
3. **Singpass Myinfo for identity verification** (preferred) with mobile+email+name+last-4-NRIC as fallback only after explicit consent.
4. **Contest window: 72h default, 24h hard floor.** Records pre-published only after worker OTP acknowledgement OR 72h timeout.
5. **No incidents that proxy for protected characteristics.** Strict denylist enforced in code.
6. **Mandatory evidence attachment** for any record carrying severity ≥ 4.
7. **Two-employer corroboration** required before a record affects the public-facing score (uncorroborated records visible to the submitting employer's own org only).
8. **Soft-delete with 24-month retention floor for adverse records; hard-delete on valid PDPA withdrawal request after retention floor.**
9. **Indemnity in TOS** from contributing employers.
10. **E&O insurance** Year 1 (S$5M cover minimum).
11. **Operating entity:** Singapore Pte Ltd (don't try to offshore — PDPA applies anyway, and offshore looks worse on optics with MOM). [DECISION] Confirm with counsel.

---

## 6. The "ruffle some feathers" question

Derrick's notes say *"This business is meant to ruffle some feathers. Do not worry about consequences for now."* That energy is the right founder energy and this bundle backs it. But "ruffle feathers" is not the same as "ignore PDPA" — the goal is to be the platform that **forces an honest conversation** about worker reliability in temp employment, not the platform that gets a S$1M fine in year 2.

The Variant B architecture is **still bold**: there has never been a Singapore-headquartered worker-reputation platform that integrates Singpass and runs a structured scoring engine with mediation. It will draw attention. It will be controversial. It will get coverage in The Straits Times and ChannelNewsAsia. It will be raised in Parliament. The architecture in this bundle is designed to **survive that scrutiny**, not avoid it.

---

## 7. Things to do before MVP launch

- [ ] Retain Singapore data-protection counsel; commission privacy impact assessment (PIA)
- [ ] Draft TOS and privacy policy in collaboration with counsel
- [ ] Get E&O insurance quote
- [ ] Have counsel review the incident taxonomy in `05_LEMON_SCORE_ENGINE.md`
- [ ] Draft data subject rights workflows (access, correction, withdrawal) and have counsel review
- [ ] Appoint a Data Protection Officer (DPO) as required by PDPA. Can be a fractional DPO firm initially.
- [ ] Engage with TAFEP informally before launch (heads up + soft sounding-out)
- [ ] Consider an advisory board with one labour lawyer, one HR professional, one ex-MOM person
