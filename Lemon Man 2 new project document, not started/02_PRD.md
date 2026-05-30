# 02 — Product Requirements (PRD)

## Personas

### P1 — The Manpower Agency Operator (Yvonne / Wayne type)
Runs an outsourcing book of 200–2,000 deployed staff. Bleeds money on no-shows, last-minute cancellations, daily-rate workers who go ghost. Spends 5–10 hours/week on reactive firefighting. Pays $200/shift loss when a worker no-shows for a client engagement. **Primary customer for Phase 1.**

### P2 — The F&B / Events Hirer
Hires 20–100 part-timers per month for shift work. Same pain at smaller scale. Currently relies on a WhatsApp group with other operators to swap names. Highly motivated to formalise this. **Best beachhead segment for non-Elitez customers.**

### P3 — The Construction Main-Con / Sub-Con
Brings in transient site labour. Already operates under heavy MOM scrutiny (BCA, safety). Cares about safety incidents and tool theft more than tardiness.

### P4 — The Reliable Worker
Knows they're better than the median. Wants the difference to be visible. Will trade some privacy for a portable reference. Income $1,800–$3,500/month range; mid-20s to mid-40s; often a parent.

### P5 — The Edge-Case Worker
Has a few black marks, mostly contestable. Needs the contest, mediation, and improvement-record pathways to be real and fair. Their experience determines whether the platform is seen as just.

### P6 — The Platform Admin (Derrick's ops team)
Runs the mediation queue, anomaly detection, employer verification, and customer support. Needs strong moderation tooling on Day 1.

---

## User stories — MVP

### Worker (P4/P5) stories

- **W-1.** As a worker, I can create an account using my mobile number and email so that I can claim my trust profile.
- **W-2.** As a worker, I can verify my identity via Singpass Myinfo (preferred) or mobile OTP + email + name + last-4-NRIC (fallback) so my profile is unique and credible.
- **W-3.** As a worker, I can view my full trust record including all employer-submitted feedback (adverse and positive), so I'm never surprised.
- **W-4.** As a worker, I am notified via SMS+email when an employer submits a record about me, with a 72h window to contest before publication.
- **W-5.** As a worker, I can contest a record by submitting my version of events + any counter-evidence; this triggers mediation.
- **W-6.** As a worker, I can upload positive signals — WSQ certificates, testimonials, training records — to my profile.
- **W-7.** As a worker, I can share my profile with a prospective employer via a one-time link.
- **W-8.** As a worker, I can request correction or deletion of my data under PDPA, and the platform processes the request within 30 days.
- **W-9.** As a worker, I can see my trust score and a plain-English explanation of how it was calculated.
- **W-10.** As a worker, I can opt out entirely; my profile is soft-deleted and adverse records about me are quarantined (not shown in search) per Variant B rules.

### Employer (P1/P2/P3) stories

- **E-1.** As an employer, I can create an account verified by my UEN (Unique Entity Number) so that I'm a legitimate participant.
- **E-2.** As an employer, I can search for a candidate by name + mobile (or other identifier) and see their trust score + record summary.
- **E-3.** As an employer, I can purchase token packs or subscribe monthly to access checks.
- **E-4.** As an employer, I can submit a record (adverse or positive) about a worker I've engaged, providing evidence (timesheets, photographs, emails).
- **E-5.** As an employer, I am informed about the worker's right to contest and the 72h pre-publication window.
- **E-6.** As an employer, I can see records I've submitted and their status (pending publication, published, contested, mediated, withdrawn).
- **E-7.** As an employer, I can corroborate another employer's record about a worker (with evidence of my own engagement), boosting the score impact.
- **E-8.** As an employer, I can write a positive testimonial that becomes part of the worker's portable profile.
- **E-9.** As an employer, I can be a counter-witness — submitting positive evidence that contradicts an adverse record.

### Admin (P6) stories

- **A-1.** As an admin, I can review the mediation queue, see disputed records and both sides' evidence, and issue a resolution (uphold / modify / withdraw).
- **A-2.** As an admin, I can flag and review anomalous submission patterns (e.g., one employer submitting 50 records in a week, or coordinated retaliation patterns).
- **A-3.** As an admin, I can issue refunds, suspend accounts, manage subscriptions.
- **A-4.** As an admin, I can run reports on score distribution, demographic correlation audits (per Workplace Fairness Act mitigation), and platform health metrics.
- **A-5.** As an admin, I can soft-delete or hard-delete records under PDPA requests, with full audit trail.
- **A-6.** As an admin, I can export an audit log for a specific worker or employer (for PDPA data subject access requests).
- **A-7.** As an admin, I am alerted to any employer flagged as a potential "Lemon Hirer" (>10 incident uploads per quarter without proportionate workforce attestation), can require a headcount declaration before they may submit further records, and can suspend submission rights pending review. This protects workers from being indexed by toxic or retaliatory employers and is the symmetric counterpart to worker contest rights.

---

## MVP scope freeze

### In scope
- Worker registration, verification (Myinfo + fallback), profile management
- Employer registration, UEN verification, account management
- Record submission (adverse + positive) with evidence upload
- OTP-based contest workflow with 72h window
- Trust score engine (see `05_LEMON_SCORE_ENGINE.md`)
- Search by name + mobile (employer side)
- Token + subscription billing (Stripe)
- Mediation queue (admin)
- Data subject rights workflow (access, correction, withdrawal)
- Email + SMS notifications (Resend + Twilio)
- Audit logging
- PDPA-compliant copy on all data-collection touchpoints

### Out of scope for MVP
- Singpass Myinfo deep integration (Phase 2; fallback identity verification only in MVP — but Myinfo button shown to capture intent)
- LinkedIn testimonial verification
- API for HRIS integrations
- Mobile native apps (responsive web only)
- Multi-language UI (English only; Mandarin/Bahasa/Tamil in Phase 2)
- Industry-specific scoring (single unified score in MVP)
- Predictive flight-risk model
- ML-based anomaly detection (rules-based only in MVP)
- Public profile pages (workers share only via OTP-generated links in MVP)

---

## Non-functional requirements

### Performance
- Worker search returns < 500ms p95
- Trust score computation < 200ms p95
- Page load: TTI < 2.5s on 4G

### Reliability
- 99.5% uptime in MVP (target 99.9% by month 6)
- Daily encrypted backups, 30-day retention
- Point-in-time recovery on Supabase

### Security
- All PII at rest: encrypted via Supabase's default encryption + column-level encryption for sensitive fields (last-4-NRIC, evidence files)
- All traffic: TLS 1.3
- Audit log: append-only, separate Postgres role with INSERT-only permissions
- Rate limiting: per-user, per-IP, per-endpoint
- 2FA mandatory for admin accounts and recommended for employer accounts
- Penetration test before public launch (use a SG-registered firm like Quann or Centurion)

### Compliance
- PDPA-compliant consent flows on every data collection point
- DPO contact published on every page
- "Do Not Sell My Data" / withdrawal flow visible from account page (1 click to start)
- Cookie consent (PDPA-aligned, not GDPR-strict — though GDPR-strict is fine too)
- Audit logging for every PII access by staff/admin

### Accessibility
- WCAG 2.1 AA on all user-facing flows
- Mobile-first (most workers will be on Android phones with smaller screens)

---

## Success metrics — first 90 days post-launch

| Metric | Target |
|--------|--------|
| Employer accounts (verified) | 50 |
| Worker accounts (verified) | 1,000 |
| Records submitted (total) | 500 |
| Records contested | < 25% (lower = healthier) |
| Mediation resolution time | < 7 days p95 |
| Token purchases | 200 packs |
| Active monthly subscriptions | 10 |
| MRR | S$2,000 |
| NPS (employer side) | > 30 |
| NPS (worker side) | > 0 (this is the hard one) |
| Data subject access requests | < 5% of worker base |
| Adverse press articles | < 3, with platform-positive resolution |
| MOM/PDPC enquiries | 0 enforcement actions; ≤ 2 informational |

---

## Anti-goals

The MVP is **not** trying to:
- Have the most workers on the platform (employer-side traction is the wedge)
- Be politically neutral (the brand has a point of view — see `07_BRAND_AND_COPY.md`)
- Be a general background-check service (we're temp/short-contract specific)
- Replace SkillsFuture or Workforce Singapore (we complement them)
- Get acquired in 18 months (this is a 5-year platform play)
