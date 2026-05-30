# 05 — Lemon Score Engine

This is the technical specification for the scoring engine. Implementation lives in `packages/scoring/`. Pure functions, no DB dependency, deterministic, testable.

## 1. Score range

User-facing score: **0–100 integer**, where higher = more concerning.

Internal score: stored as `int` in range 0–10000, divided by 100 for display.

**Bands (for UI display only — score itself is the raw integer):**

| Score | Band | Colour | Label |
|---|---|---|---|
| 0–10 | Clean | Green | "Peach" — no significant adverse records |
| 11–25 | Mild | Yellow | Minor incidents, possibly isolated |
| 26–50 | Moderate | Orange | Pattern of issues; investigate |
| 51–75 | Significant | Red-orange | Material concerns; multiple corroborated incidents |
| 76–100 | Severe | Red | Serious / multiple corroborated severe incidents |

> The internal data is stored as 0–10000 with full precision; we present bands rather than exact scores in the UI to avoid false precision and to discourage gaming.

---

## 2. Inputs

Each input record:

```typescript
type ScoringRecord = {
  incident_type_code: string;
  polarity: 'negative' | 'positive';
  severity: number;              // 1-50
  occurred_at: Date;
  corroborator_count: number;    // 0 if uncorroborated; the SUBMITTING employer counts as 1, additional employers add to count
  state: 'published' | 'mediation_upheld' | 'mediation_modified' | 'mediation_withdrawn' | 'testimonial_published';
  mediation_modified_severity?: number;
};
```

Only records in `published`, `mediation_upheld`, `mediation_modified`, or `testimonial_published` states contribute to the score. Anything in `submitted`, `notice_sent`, `contested`, `mediation` (in progress), `withdrawn`, or `expired` is ignored.

---

## 3. Formula

For each record:

```
effective_severity = severity (or mediation_modified_severity if state == 'mediation_modified')

time_decay = exp(-months_since_occurred / TAU)
  where TAU = 12  (half-life-ish; 12 months halves the impact)

corroboration_multiplier = 1 + ALPHA * (max(corroborator_count, 1) - 1)^2
  where ALPHA = 0.25
  — uncorroborated (count = 1): multiplier = 1.0
  — 2 corroborators: multiplier = 1.25
  — 3 corroborators: multiplier = 2.00
  — 4 corroborators: multiplier = 3.25
  — 5 corroborators: multiplier = 5.00

raw_contribution = effective_severity * time_decay * corroboration_multiplier * 10
  // ×10 puts it in the 0–10000 integer scale

if polarity == 'positive':
  raw_contribution = -raw_contribution

score_internal = clamp(sum(raw_contribution) + BASELINE, 0, 10000)
  where BASELINE = 0  (we may shift this later to give positive records "headroom")
```

**Critical rule (Variant B):** Records with `corroborator_count == 1` AND `polarity == 'negative'` do NOT contribute to score unless `corroborator_count == 1 AND mediation_resolution_upheld == true` (i.e., the worker contested and lost). This is the procedural-fairness gate. Such records are still visible in the worker's record list and to the submitting employer's organisation, just not in the public score.

```typescript
function shouldAffectScore(r: ScoringRecord): boolean {
  if (r.polarity === 'positive') return true;
  if (r.state === 'mediation_upheld') return true;  // contested and lost
  if (r.corroborator_count >= 2) return true;
  return false;
}
```

### Time decay table (for reference)

| Months since | Weight |
|---|---|
| 0 | 1.00 |
| 3 | 0.78 |
| 6 | 0.61 |
| 12 | 0.37 |
| 18 | 0.22 |
| 24 | 0.14 |
| 36 | 0.05 |
| 48 | 0.02 |

Records older than 48 months are excluded entirely (under the retention limit policy regardless).

### Corroboration uplift table

| Corroborators | Multiplier | Notes |
|---|---|---|
| 1 | 1.00 | Single source — does not affect public score (V-B) |
| 2 | 1.25 | First true corroboration; unlocks score impact |
| 3 | 2.00 | Strong corroboration |
| 4 | 3.25 | Very strong |
| 5+ | 5.00 (capped) | We cap at 5.00 to prevent runaway scores |

---

## 4. Worked example

Worker W has 4 records:

| # | Incident | Severity | Polarity | Occurred | Corrob | State |
|---|---|---|---|---|---|---|
| 1 | `no_show_confirmed_shift` | 8 | neg | 8 mo ago | 1 | published |
| 2 | `no_show_confirmed_shift` | 7 | neg | 2 mo ago | 2 | published |
| 3 | `theft_minor` | 12 | neg | 14 mo ago | 1 | mediation_upheld |
| 4 | `testimonial_completed_full_contract` | 5 | pos | 4 mo ago | 1 | testimonial_published |

Compute:

**Record 1:** corroborator=1, negative — does NOT affect score (Variant B rule). Visible in record list only.

**Record 2:** severity=7, decay = exp(-2/12) = 0.846, corrob = 1.25
contribution = 7 × 0.846 × 1.25 × 10 = **74**

**Record 3:** severity=12, decay = exp(-14/12) = 0.311, corrob = 1.00 (single but contested + upheld)
contribution = 12 × 0.311 × 1.00 × 10 = **37**

**Record 4 (positive):** severity=5, decay = exp(-4/12) = 0.717, corrob = 1.00
contribution = -(5 × 0.717 × 1.00 × 10) = **-36**

Sum = 74 + 37 − 36 = **75**

Internal score: 75
Display score: 0.75 → rounded → **1** (negligible) → Band: Clean

Wait — that's intuitively too low. Let me revisit. The point of the score is to be USEFUL to employers. If a worker had a 2x-corroborated no-show two months ago AND a court-upheld minor theft 14 months ago, that should NOT be "Clean."

Let me recalibrate the scale. The issue is I'm dividing too early. Let me re-scale:

**Revised formula (final):**

```
raw_contribution = effective_severity * time_decay * corroboration_multiplier
// removed the ×10; we sum raw and then scale at presentation
score_internal = clamp(round(sum * 50), 0, 10000)
// scale factor of 50 chosen so a single severe corroborated recent incident lands around 50-75
```

Re-running the example:
- Record 2: 7 × 0.846 × 1.25 = 7.40
- Record 3: 12 × 0.311 × 1.00 = 3.73
- Record 4: -(5 × 0.717 × 1.00) = -3.58

Sum = 7.55; × 50 = 378 internal → display 3.78 → Clean band.

Still feels low. OK let me think more carefully about calibration. The scale factor should be set such that:

- A single recent (0 mo) corroborated (2 employers) major incident (severity 15) → user-facing 50+
  → raw = 15 × 1.00 × 1.25 = 18.75 → need × 27 to reach 50 (scale=27 → 506 internal → 5.06 display) — still too low

OK the issue: my severity scale goes 1-50 but most realistic severities are 1-15. Let me re-think. The user-facing 0-100 scale should map roughly to:

- 0-10: clean / minor noise
- 25: one significant corroborated incident
- 50: pattern of significant incidents OR one severe corroborated incident
- 75: multiple severe corroborated incidents
- 90+: persistent severe pattern, recent

So a single severity-15 recent corroborated incident should land around 35-40 user-facing. Let me set:

```
score_internal = clamp(round(sum * 200), 0, 10000)
```

Recompute example:
- Record 2: 7.40
- Record 3: 3.73  
- Record 4: -3.58
- Sum: 7.55 × 200 = 1510 → display 15.10 → Mild band

A single fresh corroborated severity-15 incident: 15 × 1.0 × 1.25 = 18.75 × 200 = 3750 → display 37.5 → Moderate band ✓

A single fresh contested-and-upheld severity-12 minor theft: 12 × 1.0 × 1.0 = 12 × 200 = 2400 → 24 → Mild-Moderate boundary ✓

A fresh 3-employer-corroborated severity-20 incident: 20 × 1.0 × 2.0 = 40 × 200 = 8000 → 80 → Severe ✓

That's a calibrated scoring scale. Let me lock it in as **scale factor = 200**.

### Final formula (locked)

```typescript
export function computeScore(records: ScoringRecord[], now: Date = new Date()): {
  score: number;
  breakdown: BreakdownLine[];
} {
  const TAU = 12;
  const ALPHA = 0.25;
  const CORROB_CAP = 5.0;
  const SCALE = 200;
  const MAX_AGE_MONTHS = 48;

  const lines: BreakdownLine[] = [];
  let sum = 0;

  for (const r of records) {
    if (!shouldAffectScore(r)) continue;

    const effectiveSeverity = r.state === 'mediation_modified'
      ? (r.mediation_modified_severity ?? r.severity)
      : r.severity;

    const monthsSince = monthsBetween(r.occurred_at, now);
    if (monthsSince > MAX_AGE_MONTHS) continue;

    const decay = Math.exp(-monthsSince / TAU);
    const corrobMult = Math.min(
      1 + ALPHA * Math.pow(Math.max(r.corroborator_count, 1) - 1, 2),
      CORROB_CAP
    );

    let contribution = effectiveSeverity * decay * corrobMult;
    if (r.polarity === 'positive') contribution = -contribution;

    sum += contribution;
    lines.push({
      record_id: r.id,
      incident_type_code: r.incident_type_code,
      effective_severity: effectiveSeverity,
      months_since: monthsSince,
      decay_weight: decay,
      corroboration_multiplier: corrobMult,
      polarity: r.polarity,
      contribution,
    });
  }

  const scoreInternal = Math.max(0, Math.min(10000, Math.round(sum * SCALE)));
  return { score: scoreInternal, breakdown: lines };
}
```

### Alternative formulation considered

The *Southeast Asia Business Viability Research* paper (May 2026) proposes the closed form `S_c = α × E^γ × Σ(w_i × I_i)` with `α=10`, `γ=1` if `E<2`, `γ=2` if `E≥2`, and a 3-month half-life.

This was considered and rejected for three reasons documented in `09_RESEARCH_INTEGRATION.md` §B.1:

1. **Single-employer × 10 multiplier is defamation-exposed.** Our Variant B model uses a 1× multiplier on uncorroborated records (and they do not affect the public score at all). The paper's formula attributes 10× weight to a single employer's claim before any corroboration. This is high defamation risk under Singapore law and undermines the platform's procedural-fairness defence.
2. **The E=2 cliff is too sharp.** Jumping from 10× to 40× the moment a second employer files is hard to defend in mediation. Our `1 + 0.25×(E−1)²` curve is smoother and survives "explain to a mediator" tests better.
3. **3-month half-life is too aggressive.** Severe corroborated incidents would halve in weight in 12 weeks, undermining deterrence. We use 12 months as the default; **`[DECISION]` whether to reduce to 6 months is open and tagged in `README.md`.**

The paper's formula is preserved as a documented alternative because a future SEA market (Phase 3+) with a different legal regime might justify it as a `jurisdiction_publication_mode` variant. **Not enabled in code.**

---

## 5. Incident catalog (70 incidents + 12 positives + excluded list)

Format: `code | category | severity range | requires evidence | display label | help text`

### Reliability & attendance (negative)

| # | Code | Severity | Evidence | Label |
|---|---|---|---|---|
| 1 | `late_no_reason` | 1–3 | No | Late to shift without reason given |
| 2 | `no_show_unconfirmed` | 3–6 | Yes | Failed to attend after expressing interest (not confirmed booking) |
| 3 | `no_show_confirmed` | 6–12 | Yes | No-show on confirmed shift |
| 4 | `cancellation_very_late` | 5–10 | Yes | Cancellation < 2 hours before shift (no acceptable reason) |
| 5 | `cancellation_late` | 2–5 | No | Cancellation 2–12 hours before shift (no acceptable reason) |
| 6 | `walked_off_shift` | 8–15 | Yes | Walked off active shift without notice |
| 7 | `early_departure_unauthorised` | 2–5 | No | Left early without supervisor approval |
| 8 | `repeated_lateness` | 4–7 | Yes | 3+ instances of lateness within single engagement |
| 9 | `unannounced_absence` | 6–12 | Yes | Absent without notice for full day |
| 10 | `first_day_no_show` | 8–15 | Yes | Failed to report for first day of confirmed engagement |
| 11 | `contract_cancellation_pre_start` | 3–6 | No | Cancelled engagement after signing, before start date |

### Performance & quality (negative)

| # | Code | Severity | Evidence | Label |
|---|---|---|---|---|
| 12 | `task_not_completed` | 3–7 | Yes | Failed to complete agreed tasks within shift |
| 13 | `quality_below_standard` | 3–7 | Yes | Work consistently below contracted standard |
| 14 | `property_damage_negligent` | 6–15 | Yes | Damaged client property through negligence |
| 15 | `operational_delay_caused` | 2–5 | Yes | Caused documented operational delay |
| 16 | `repeated_correction_needed` | 2–4 | No | Required repeated correction after clear instruction |
| 17 | `productivity_below_target` | 3–6 | Yes | Persistently below agreed productivity targets |

### Conduct & behaviour (negative)

| # | Code | Severity | Evidence | Label |
|---|---|---|---|---|
| 18 | `verbal_abuse_colleague` | 8–15 | Yes | Verbal abuse of colleague |
| 19 | `verbal_abuse_customer` | 10–20 | Yes | Verbal abuse of customer |
| 20 | `physical_altercation` | 15–25 | Yes | Physical altercation at work |
| 21 | `insubordination_lawful_instruction` | 5–10 | Yes | Refused lawful and reasonable instruction |
| 22 | `profanity_customer_facing` | 3–7 | No | Used profanity in customer-facing role |
| 23 | `disruptive_behaviour` | 4–8 | Yes | Disruptive behaviour during shift |
| 24 | `harassment_colleague` | 12–25 | Yes | Bullying or harassment of colleague |
| 25 | `sleeping_on_duty` | 5–10 | Yes | Sleeping on duty |
| 26 | `phone_use_violation` | 1–3 | No | Personal phone use in violation of explicit policy |
| 27 | `refused_reasonable_task` | 3–7 | Yes | Refused reasonable task within scope of role |
| 28 | `argued_supervisor_public` | 3–6 | No | Argued with supervisor in customer-facing setting |
| 29 | `social_media_breach` | 3–8 | Yes | Posted negative company content in breach of social media policy |

### Integrity & honesty (negative)

| # | Code | Severity | Evidence | Label |
|---|---|---|---|---|
| 30 | `timesheet_falsification` | 10–20 | Yes | Timesheet falsification |
| 31 | `theft_minor` | 8–15 | Yes | Theft of company property — under SGD 500 |
| 32 | `theft_major` | 20–40 | Yes | Theft of company property — over SGD 500 |
| 33 | `theft_colleague` | 15–25 | Yes | Theft from colleague |
| 34 | `theft_customer` | 20–40 | Yes | Theft from customer |
| 35 | `false_references` | 8–15 | Yes | Provided false references at hiring |
| 36 | `misrepresented_qualifications` | 10–20 | Yes | Misrepresented qualifications or experience |
| 37 | `falsified_documents` | 10–20 | Yes | Falsified medical certificate, timesheet, or operational documents |
| 38 | `embezzlement_cash` | 25–50 | Yes | Embezzlement or cash handling fraud |
| 39 | `fraudulent_expense` | 8–15 | Yes | Fraudulent expense claim |
| 40 | `overlapping_shifts` | 8–15 | Yes | Submitted to multiple employers for overlapping shifts |
| 41 | `recorded_without_consent` | 4–10 | Yes | Recorded conversations or workplace without consent in breach of policy |

### Safety & compliance (negative)

| # | Code | Severity | Evidence | Label |
|---|---|---|---|---|
| 42 | `ppe_violation` | 4–10 | Yes | Failed to wear required PPE |
| 43 | `under_influence_alcohol` | 15–30 | Yes | Worked under influence of alcohol |
| 44 | `under_influence_drugs` | 20–40 | Yes | Worked under influence of drugs |
| 45 | `smoking_prohibited_area` | 3–8 | Yes | Smoking in prohibited area |
| 46 | `safety_procedure_violation` | 6–15 | Yes | Violated documented safety procedure |
| 47 | `caused_accident_negligence` | 15–30 | Yes | Caused workplace accident through gross negligence |
| 48 | `failed_safety_training` | 3–6 | Yes | Failed mandatory safety training requirement |
| 49 | `equipment_unauthorised_use` | 8–15 | Yes | Operated equipment without authorisation |
| 50 | `vehicle_misuse` | 6–12 | Yes | Misused company vehicle |

### Data & confidentiality (negative)

| # | Code | Severity | Evidence | Label |
|---|---|---|---|---|
| 51 | `confidentiality_breach` | 10–20 | Yes | Breach of confidentiality clause |
| 52 | `data_portability_breach` | 15–30 | Yes | Took customer or operational data to new employer |
| 53 | `internal_info_shared` | 8–15 | Yes | Shared internal company information externally |
| 54 | `trade_secret_disclosure` | 20–40 | Yes | Unauthorised disclosure of trade secrets or IP |
| 55 | `resource_misuse_personal` | 4–10 | Yes | Used company resources for personal business |

### Communication (negative)

| # | Code | Severity | Evidence | Label |
|---|---|---|---|---|
| 56 | `unresponsive_to_ops` | 2–5 | Yes | Failed to respond to operational communications within agreed SLA |
| 57 | `inappropriate_customer_comms` | 4–10 | Yes | Inappropriate communications with customers |
| 58 | `misrepresented_company` | 6–12 | Yes | Misrepresented the company or contract scope to client |

### Termination-related (negative)

| # | Code | Severity | Evidence | Label |
|---|---|---|---|---|
| 59 | `walked_off_mid_contract` | 10–20 | Yes | Walked off mid-contract with no notice |
| 60 | `company_property_not_returned` | 5–12 | Yes | Failed to return company property after exit |
| 61 | `damage_on_exit` | 8–15 | Yes | Caused damage on last day |
| 62 | `competitor_breach_during_notice` | 8–15 | Yes | Engaged with competitor during notice period in breach of contract |

### Financial (negative)

| # | Code | Severity | Evidence | Label |
|---|---|---|---|---|
| 63 | `advance_not_repaid` | 5–12 | Yes | Failed to repay agreed salary advance or loan |
| 64 | `financial_loss_caused` | 4–10 | Yes | Caused documented financial loss through error |

### Minor / dress / grooming (negative)

| # | Code | Severity | Evidence | Label |
|---|---|---|---|---|
| 65 | `grooming_standard_breach` | 1–3 | No | Failed to follow grooming standards |
| 66 | `dress_code_breach` | 1–3 | No | Failed to follow dress code |
| 67 | `excessive_personal_calls` | 1–3 | No | Excessive personal calls during shift |
| 68 | `unauthorised_breaks` | 1–4 | No | Took unauthorised breaks |
| 69 | `cleanliness_workspace` | 1–3 | No | Failed to maintain reasonable workspace cleanliness |
| 70 | `tool_handling_negligent` | 2–6 | Yes | Negligent handling of tools or equipment (no damage caused) |

---

### Positive incidents

| # | Code | Severity (subtracted) | Label |
|---|---|---|---|
| P1 | `completed_full_contract` | 3 | Verified completion of full contract term |
| P2 | `customer_commendation_minor` | 4 | Customer commendation — minor |
| P3 | `customer_commendation_major` | 8 | Customer commendation — major / written |
| P4 | `internal_recommendation` | 5 | Internal recommendation or promotion offered |
| P5 | `training_completed_during_engagement` | 3 | Completed certified training during engagement |
| P6 | `mentored_colleague` | 4 | Mentored or trained a colleague |
| P7 | `worked_overtime_critical_ops` | 3 | Worked overtime to support critical operations |
| P8 | `safety_hazard_identified` | 6 | Identified safety hazard, prevented incident |
| P9 | `customer_complaint_resolved_well` | 5 | Resolved customer complaint exceptionally |
| P10 | `long_tenure_engagement` | 8 | Long tenure (12+ months) at single engagement |
| P11 | `wsq_completion` | 3 | Verifiable WSQ / SSG certification completion (max 3 stack) |
| P12 | `testimonial_verified_employer` | 3-8 | Testimonial from verified employer (quality-scored 3/5/8) |

---

### EXCLUDED — must NOT be added to incident_types table

These represent the Workplace Fairness Act protected-characteristic proxy zone. Any code adding them to `incident_types` is a regression.

- ❌ Frequency of medical certificate (proxy for disability, mental health, pregnancy)
- ❌ Q4 medical leave pattern (same)
- ❌ "Suspected malingering" framing on MC (same)
- ❌ Personality conflicts not tied to specific documented behaviour (subjective; opens proxy door)
- ❌ Religious observance accommodations (proxy for religion)
- ❌ Caregiving-related cancellations when reason given (proxy for caregiving responsibilities)
- ❌ Pregnancy-related absences (direct)
- ❌ Disability-related accommodations or related "performance" framing (direct)
- ❌ Age-related performance assumptions (proxy for age)
- ❌ Cultural / language miscommunication without specific incident (proxy for nationality, language, race)
- ❌ Sexual orientation or gender identity comments (PDPA + general dignity)
- ❌ "Bad attitude" without specific behavioural anchor (subjective; opens proxy door)
- ❌ "Slow" without productivity-target context (proxy for age, disability)
- ❌ Mental-health-related observations (PDPA-sensitive + WFA proxy)
- ❌ Voluntary union or employee-rights activity (Employment Act / TUO protected)

**These exclusions are non-negotiable.** Even if a contributing employer wants to upload one, the form must not present these options, and any free-text narrative must be screened for these patterns before publication.

**Explicit rejection of external taxonomies that include these:** the *Southeast Asia Business Viability Research* paper (May 2026) proposes a 50-incident taxonomy that includes:
- `L10 — Submitting a medical certificate suspected of malingering` (severity 45)
- `L11 — Excessive, pattern-based sick leave (specifically during Q4)` (severity 50)

**Both are rejected.** They are direct WFA proxies for disability, mental health, pregnancy, and caregiving responsibilities. Including them would expose the platform to per-breach WFA penalties (S$5K–S$10K) and would become the single most cited example in any case against the platform. See `09_RESEARCH_INTEGRATION.md` §C.1–C.2 for the full reasoning. The remaining 48 incidents from the paper's taxonomy map to codes in our catalogue with no issue.

---

## 6. Anomaly detection (for admin)

Beyond the score itself, the engine produces signals for admin moderation:

- **Single-source dominance:** worker has 5+ records all from one employer organisation. Flag for review (possible retaliation or systemic misuse).
- **Submission velocity:** employer submits more than 10 records in 7 days. Flag for review.
- **Lemon Hirer detection (asymmetric counterpart to worker contest rights):** any employer with >10 negative submissions in a rolling 90-day window is required to submit an `employer_headcount_attestations` row before they can submit further records. Once attested, the detector computes `submission_rate = negative_submissions_90d / headcount_temp_contract`. Thresholds:
  - `submission_rate > 0.15` → `under_review` flag, admin task queued
  - `submission_rate > 0.30` → `flagged` (visible internally), submission rights paused pending admin review
  - Sustained `flagged` status across two quarters → admin may suspend the employer account, retain audit records, but mark all records they contributed as `affects_score = false` pending re-review
  - This is the structural protection against retaliatory employer behaviour and the symmetric counterpart to worker contest rights. See `04_DATA_MODEL.md` §`employer_headcount_attestations`.
- **Demographic correlation alert:** if Singpass-Myinfo data is available, periodic test for correlation between score quintile and protected characteristics. Significant correlation = review the incident taxonomy and individual records.
- **Contest pattern:** worker has 3+ records all contested. May indicate platform misuse against them.
- **Retaliation pattern:** worker has submitted complaint about employer X, and employer X subsequently submits record about worker. Tag for special-care review.

---

## 7. Test cases

`packages/scoring/tests/` should include these scenarios at minimum:

1. Empty record list → score 0
2. Single uncorroborated minor late record → score 0 (does not affect score)
3. Single uncorroborated severe theft → score 0 (does not affect score) — covered by Variant B rule
4. Single uncorroborated severe theft, then mediation_upheld → score reflects the record
5. Two-corroborator severity-7 no-show, 2 months old → score around 18–20
6. Five-corroborator severity-15, recent → score around 75
7. Time decay: same record at 0, 6, 12, 24 months → scores in descending order
8. Positive testimonial reduces score → verify reduction
9. Record older than 48 months → not included
10. Corroborator count of 7 → multiplier capped at 5
11. Score clamped at 0 (lots of positives, no negatives) → score = 0
12. Score clamped at 100 (impossibly bad worker) → score = 10000 internal / 100 display
13. Calibration: severity-15 fresh corroborated incident → ~35–40 display
14. Mediation_modified → uses modified severity
15. Mix of polarities, mix of states → correct selective inclusion

---

## 8. Recomputation strategy

- Trigger on records table state change to/from `published` or `mediation_upheld` or `mediation_modified` → enqueue `score_recompute_worker` edge function with `worker_id`
- Edge function fetches all records for worker → calls pure scoring fn → upserts into `worker_scores` table → updates `workers.score_cached`
- Idempotent; safe to call repeatedly
- Performance budget: < 100ms p95 (with worker having up to 30 records). Beyond 30 records, paginate or use materialised view.
