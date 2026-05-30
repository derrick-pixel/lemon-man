# 04 — Data Model

This document is the source-of-truth for the database schema. Claude Code should translate this into Drizzle schema files under `packages/db/schema/` and corresponding RLS SQL files under `packages/db/policies/`.

## Conventions

- All IDs: `uuid` with `gen_random_uuid()` default
- All timestamps: `timestamptz`
- Soft-delete column: `deleted_at timestamptz NULL`
- Audit columns on most tables: `created_at`, `updated_at`, `created_by`, `updated_by`
- Money: `bigint` storing smallest currency unit (cents)
- Score: `int` (range 0–10000; presentation layer divides by 100 for the 0–100 user-facing score)
- Names: store both raw (`name`) and normalised (`name_normalised` — lowercase, accent-folded, spaces collapsed) — index on normalised
- Mobile: store E.164 format only (e.g., `+6591234567`)

---

## Tables

### `workers`
The worker's primary record.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `auth_user_id` | uuid FK auth.users | NULL until claimed |
| `name` | text NOT NULL | as displayed |
| `name_normalised` | text NOT NULL | for search; lowercased, accent-folded |
| `mobile_e164` | text NOT NULL | uniqueness enforced via constraint below |
| `email_lower` | text | nullable; unique-when-not-null |
| `last_4_nric` | text | nullable; ENCRYPTED at column level; never indexed |
| `nric_checksum` | char(1) | nullable; only stored if last_4 also provided |
| `myinfo_verified_at` | timestamptz | NULL until Phase 2 |
| `claimed` | boolean DEFAULT false | true if worker has logged in |
| `claimed_at` | timestamptz | |
| `opted_out` | boolean DEFAULT false | true if worker exercised PDPA withdrawal — quarantines all records |
| `opted_out_at` | timestamptz | |
| `score_cached` | int DEFAULT 0 | current trust score; recomputed by trigger |
| `score_recomputed_at` | timestamptz | |
| `created_at`, `updated_at`, `deleted_at` | timestamptz | |

**Constraints:**
- `UNIQUE (mobile_e164) WHERE deleted_at IS NULL`
- `UNIQUE (email_lower) WHERE email_lower IS NOT NULL AND deleted_at IS NULL`
- CHECK on `last_4_nric` format if not null (regex: 4 digits)

**Indexes:**
- `name_normalised` (GIN trigram)
- `mobile_e164` (B-tree)
- `claimed`
- `score_cached`

---

### `employers`
The hiring entity.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text NOT NULL | |
| `uen` | text NOT NULL | Singapore UEN; validated via ACRA lookup at signup |
| `uen_verified_at` | timestamptz | |
| `industry` | text | enum: f_n_b, events, retail, construction, healthcare, logistics, security, other |
| `size_band` | text | enum: <10, 10-49, 50-249, 250-999, 1000+ |
| `is_suspended` | boolean DEFAULT false | |
| `lemon_hirer_flag` | text | enum: clear, under_review, flagged, NULL. Set by anomaly detector; cleared by admin. |
| `lemon_hirer_flagged_at` | timestamptz | |
| `submission_rights_suspended` | boolean DEFAULT false | true if admin has paused this employer's ability to submit new records pending attestation |
| `created_at`, `updated_at`, `deleted_at` | timestamptz | |

**Constraints:**
- `UNIQUE (uen) WHERE deleted_at IS NULL`

---

### `employer_headcount_attestations`
Periodic declarations of workforce size, required when an employer crosses the submission-rate threshold. Used to validate that incident-upload volume is proportionate to actual workforce size — the asymmetric counterpart to worker contest rights.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `employer_id` | uuid FK employers NOT NULL | |
| `headcount_total` | int NOT NULL | declared total active workforce (permanent + temporary + contract) |
| `headcount_temp_contract` | int NOT NULL | subset that is temporary / contract / daily — the relevant pool for the platform |
| `attested_by` | uuid FK employer_users NOT NULL | who declared it |
| `attestation_method` | text NOT NULL | enum: self_declared, payroll_export, hris_integration |
| `evidence_storage_path` | text | optional supporting document |
| `valid_until` | date NOT NULL | attestations expire after 90 days |
| `created_at` | timestamptz | |

**Triggers / rules:**
- An employer crossing the threshold (>10 negative submissions in any rolling 90-day period) **must** have a current attestation before submitting further records. The submission endpoint blocks otherwise.
- The anomaly detector computes `submission_rate = negative_submissions_90d / headcount_temp_contract`. A rate above 0.3 (i.e. >30% of declared workforce listed) sets `employers.lemon_hirer_flag = 'under_review'` and queues an admin task.
- See `05_LEMON_SCORE_ENGINE.md` §Anomaly detection for the full ruleset.

---

### `employer_users`
Individual humans linked to an employer org.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `auth_user_id` | uuid FK auth.users NOT NULL | |
| `employer_id` | uuid FK employers NOT NULL | |
| `email` | text NOT NULL | |
| `role` | text NOT NULL | enum: owner, manager, submitter, viewer |
| `created_at`, `updated_at`, `deleted_at` | timestamptz | |

**Constraints:**
- `UNIQUE (auth_user_id)`

---

### `admins`
Platform staff.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `auth_user_id` | uuid FK auth.users NOT NULL UNIQUE | |
| `role` | text NOT NULL | enum: super_admin, moderator, support, dpo |
| `created_at`, `updated_at` | timestamptz | |

---

### `incident_types`
Reference table of allowed incident types. **This is the denylist gate.** No record can be submitted with an incident type not in this table.

| Column | Type | Notes |
|---|---|---|
| `code` | text PK | snake_case code, e.g., `late_no_reason` |
| `category` | text NOT NULL | e.g., reliability, performance, conduct, integrity, safety |
| `polarity` | text NOT NULL | `negative` or `positive` |
| `severity_min` | int NOT NULL | minimum allowed severity |
| `severity_max` | int NOT NULL | maximum allowed severity |
| `requires_evidence` | boolean NOT NULL | true for severity_min ≥ 4 |
| `description_label` | text NOT NULL | shown in UI |
| `description_help` | text | tooltip |
| `excluded_protected_proxy` | boolean DEFAULT false | always false in this table; the protected proxies don't get a row here, they're explicitly excluded by design |
| `active` | boolean DEFAULT true | can deactivate without deleting (preserves historical records) |
| `created_at`, `updated_at` | timestamptz | |

See `05_LEMON_SCORE_ENGINE.md` for the full catalog. Seed at migration time.

---

### `records`
The core entity. Each row is an employer-submitted record about a worker.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `worker_id` | uuid FK workers NOT NULL | |
| `employer_id` | uuid FK employers NOT NULL | |
| `submitted_by` | uuid FK employer_users NOT NULL | |
| `incident_type_code` | text FK incident_types NOT NULL | |
| `severity` | int NOT NULL | validated against incident_types range |
| `narrative` | text | optional; HTML-stripped on insert |
| `occurred_at` | date NOT NULL | when the incident happened |
| `submitted_at` | timestamptz DEFAULT now() | |
| `state` | text NOT NULL | enum: draft, submitted, notice_sent, contested, mediation, published, withdrawn, expired |
| `notice_sent_at` | timestamptz | |
| `contest_deadline_at` | timestamptz | submitted_at + 72h |
| `published_at` | timestamptz | |
| `worker_acknowledged_at` | timestamptz | |
| `worker_contested_at` | timestamptz | |
| `mediation_resolution` | text | enum: upheld, modified, withdrawn, NULL |
| `mediation_resolved_at` | timestamptz | |
| `mediation_resolution_severity` | int | new severity if modified |
| `corroborated_by_record_ids` | uuid[] | array of other records corroborating this one |
| `is_public` | boolean DEFAULT false | becomes true on publish |
| `affects_score` | boolean DEFAULT false | only true if ≥2 corroborators (negative records) or always (positive) |
| `created_at`, `updated_at`, `deleted_at` | timestamptz | |

**Constraints:**
- CHECK `severity` between incident_type's allowed range (via trigger)
- CHECK `state` transitions valid (via trigger)
- CHECK `corroborated_by_record_ids` are all records on the same worker but different employer

**Indexes:**
- `(worker_id, state)`
- `(employer_id, submitted_at DESC)`
- `(state, contest_deadline_at)` — for the contest-expiry edge function
- `(worker_id, occurred_at DESC)`

---

### `record_evidence`
Files attached to records.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `record_id` | uuid FK records NOT NULL | |
| `storage_path` | text NOT NULL | Supabase Storage path |
| `mime_type` | text NOT NULL | |
| `bytes` | bigint NOT NULL | |
| `uploaded_by` | uuid NOT NULL | employer_user_id |
| `uploaded_at` | timestamptz | |
| `description` | text | |

Files in Supabase Storage bucket `record-evidence/` with RLS policy: only the submitting employer's users, the worker (subject), admins.

---

### `contests`
Worker-initiated dispute of a record.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `record_id` | uuid FK records NOT NULL | |
| `worker_id` | uuid FK workers NOT NULL | |
| `reason` | text NOT NULL | enum: factually_wrong, context_missing, discriminatory, retaliatory, identity_mismatch, other |
| `narrative` | text NOT NULL | |
| `submitted_at` | timestamptz | |

---

### `contest_evidence`
Counter-evidence from worker.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `contest_id` | uuid FK contests NOT NULL | |
| `storage_path` | text NOT NULL | |
| `mime_type` | text NOT NULL | |
| `bytes` | bigint NOT NULL | |
| `uploaded_at` | timestamptz | |

---

### `mediation_actions`
Admin actions during mediation.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `record_id` | uuid FK records NOT NULL | |
| `admin_id` | uuid FK admins NOT NULL | |
| `action` | text NOT NULL | enum: requested_more_info, resolved_upheld, resolved_modified, resolved_withdrawn, escalated |
| `notes` | text | |
| `taken_at` | timestamptz | |

---

### `testimonials`
Positive records contributed by employers.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `worker_id` | uuid FK workers NOT NULL | |
| `employer_id` | uuid FK employers NOT NULL | |
| `submitted_by` | uuid FK employer_users NOT NULL | |
| `engagement_period_start` | date | |
| `engagement_period_end` | date | |
| `narrative` | text NOT NULL | |
| `score_contribution` | int NOT NULL | computed at submission |
| `state` | text NOT NULL | enum: submitted, worker_accepted, published, withdrawn |
| `created_at` | timestamptz | |

Note: testimonials still go through worker acknowledgement (they should be able to refuse a backhanded "testimonial"), but no contest/mediation needed.

---

### `training_records`
Worker-uploaded positive signals (WSQ certs, courses, etc.).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `worker_id` | uuid FK workers NOT NULL | |
| `type` | text NOT NULL | enum: wsq, ssg, ccs, vendor_cert, other |
| `title` | text NOT NULL | |
| `issuer` | text NOT NULL | |
| `issued_on` | date | |
| `verified` | boolean DEFAULT false | true if worker linked SSG MySkillsFuture (Phase 2) |
| `evidence_storage_path` | text | uploaded certificate |
| `created_at`, `updated_at`, `deleted_at` | timestamptz | |

---

### `worker_scores`
Materialised current score (also cached on `workers.score_cached` for query speed).

| Column | Type | Notes |
|---|---|---|
| `worker_id` | uuid PK FK workers | |
| `score` | int NOT NULL | 0–10000 |
| `breakdown_json` | jsonb NOT NULL | structured explanation; see scoring engine |
| `recomputed_at` | timestamptz | |

---

### `searches`
Audit of every employer search.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `employer_user_id` | uuid FK employer_users NOT NULL | |
| `query` | text NOT NULL | sanitised query |
| `query_hash` | text NOT NULL | for rate-limit detection |
| `result_count` | int NOT NULL | |
| `tokens_charged` | int NOT NULL | |
| `searched_at` | timestamptz | |

**Index:** `(employer_user_id, searched_at DESC)`

---

### `pii_access_log`
Every staff/admin access of PII. Append-only.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `admin_id` | uuid FK admins | nullable for system access |
| `subject_type` | text NOT NULL | enum: worker, employer, employer_user |
| `subject_id` | uuid NOT NULL | |
| `accessed_fields` | text[] NOT NULL | which columns were viewed |
| `justification` | text NOT NULL | enum: mediation, support, dpo_request, system, anomaly_review |
| `accessed_at` | timestamptz | |

**Trigger:** prevent UPDATE and DELETE on this table.

---

### `data_subject_requests`
PDPA access / correction / withdrawal requests.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `worker_id` | uuid FK workers NOT NULL | |
| `kind` | text NOT NULL | enum: access, correction, withdrawal, portability |
| `details` | text | |
| `state` | text NOT NULL | enum: submitted, processing, completed, rejected |
| `submitted_at` | timestamptz | |
| `completed_at` | timestamptz | |
| `processed_by_admin_id` | uuid FK admins | |
| `resolution_notes` | text | |

---

### `account_credits`
Employer token balance.

| Column | Type | Notes |
|---|---|---|
| `employer_id` | uuid PK FK employers | |
| `token_balance` | int NOT NULL DEFAULT 0 | |
| `subscription_active` | boolean DEFAULT false | |
| `subscription_tier` | text | enum: starter, pro, enterprise |
| `subscription_quota_tokens_per_month` | int | |
| `subscription_quota_used_this_period` | int | |
| `subscription_period_start` | timestamptz | |
| `subscription_period_end` | timestamptz | |
| `stripe_customer_id` | text | |
| `stripe_subscription_id` | text | |
| `updated_at` | timestamptz | |

---

### `credit_transactions`
Token spend / purchase log.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `employer_id` | uuid FK employers NOT NULL | |
| `delta` | int NOT NULL | positive for purchase, negative for spend |
| `reason` | text NOT NULL | enum: purchase, subscription_grant, search, record_submit, refund |
| `related_id` | uuid | record_id or search_id |
| `stripe_payment_intent` | text | |
| `created_at` | timestamptz | |

---

### `audit_log`
Append-only audit of every meaningful state change.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `actor_type` | text NOT NULL | enum: worker, employer_user, admin, system |
| `actor_id` | uuid | nullable for system |
| `entity_type` | text NOT NULL | enum: worker, employer, record, contest, mediation, testimonial, etc. |
| `entity_id` | uuid NOT NULL | |
| `action` | text NOT NULL | e.g., `record.submitted`, `record.published`, `worker.contested`, `mediation.resolved_upheld` |
| `payload` | jsonb | the change payload |
| `at` | timestamptz DEFAULT now() | |

**Trigger:** prevent UPDATE and DELETE.
**Index:** `(entity_type, entity_id, at DESC)`, `(actor_type, actor_id, at DESC)`

---

### `notifications`
Outbound notification log (defensive — proves we notified).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `recipient_type` | text NOT NULL | enum: worker, employer_user, admin |
| `recipient_id` | uuid NOT NULL | |
| `channel` | text NOT NULL | enum: email, sms |
| `template` | text NOT NULL | |
| `provider_message_id` | text | |
| `payload_json` | jsonb | |
| `status` | text NOT NULL | enum: queued, sent, delivered, failed |
| `sent_at`, `delivered_at`, `failed_at` | timestamptz | |

---

## Row-Level Security (RLS) policies

All tables have RLS enabled by default. Below is the policy intent; final SQL lives in `packages/db/policies/`.

### `workers`
- Worker can `SELECT` own row (`auth_user_id = auth.uid()`)
- Worker can `UPDATE` own non-system fields (name only)
- Employer users with active credits can `SELECT` rows matched by search (via a SECURITY DEFINER function, not direct row read)
- Admin can `SELECT`, `UPDATE` all

### `records`
- Submitting employer's users can `SELECT` their own submitted records
- Worker can `SELECT` own (`worker_id` matches their `workers.id`)
- Other employer users can `SELECT` records about a worker **only after publication** AND if record `is_public = true` AND only via search-result endpoints (not direct table access)
- Admin can `SELECT`, `UPDATE` all
- Inserts only via server-side route handler (no direct client INSERT)

### `record_evidence`
- Submitting employer's users can `SELECT`
- Worker (subject of parent record) can `SELECT`
- Admin can `SELECT`

### `contests` / `contest_evidence`
- Worker (their own) can `SELECT`, `INSERT`
- Submitting employer can `SELECT` the contest (for transparency)
- Admin: full access

### `testimonials`
- Public read for `state = 'published'` (visible on worker's shared profile)
- Worker can read own (all states)
- Submitting employer can read own contributions
- Admin: full

### `pii_access_log`
- INSERT only (via SECURITY DEFINER function called from server-side code)
- Admin (DPO role): SELECT
- No other access

### `audit_log`
- INSERT via trigger only
- Admin: SELECT
- No UPDATE or DELETE for anyone (enforced at DB role level)

### `data_subject_requests`
- Worker: INSERT own, SELECT own
- Admin: SELECT all, UPDATE state/resolution

### `account_credits` / `credit_transactions`
- Employer users (owner/manager role): SELECT own employer's rows
- Admin: full

---

## Triggers (key ones)

### `records_state_transition_check`
BEFORE UPDATE on `records`: validates state machine. e.g., can't go from `published` back to `submitted`.

### `records_score_recompute_trigger`
AFTER INSERT/UPDATE on `records` WHERE state changed to/from `published`: enqueues `score_recompute_worker` edge function for affected worker.

### `audit_log_immutability`
BEFORE UPDATE OR DELETE on `audit_log`, `pii_access_log`: RAISE EXCEPTION.

### `evidence_required_check`
BEFORE INSERT on `records`: if `severity >= 4`, requires at least one row in `record_evidence` (via deferred constraint or check via stored proc).

### `protected_proxy_guard`
BEFORE INSERT on `records`: checks `incident_type_code` is in `incident_types` table AND that incident_types row is `active = true`. Implicitly excludes anything not seeded — making the denylist a positive-list (allowlist) enforcement.

---

## Drizzle sketch (one example for reference)

```typescript
// packages/db/schema/workers.ts
import { pgTable, uuid, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const workers = pgTable('workers', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  authUserId: uuid('auth_user_id'),
  name: text('name').notNull(),
  nameNormalised: text('name_normalised').notNull(),
  mobileE164: text('mobile_e164').notNull(),
  emailLower: text('email_lower'),
  last4Nric: text('last_4_nric'),  // pgp_sym_encrypt at write time
  nricChecksum: text('nric_checksum'),
  myinfoVerifiedAt: timestamp('myinfo_verified_at', { withTimezone: true }),
  claimed: boolean('claimed').default(false).notNull(),
  claimedAt: timestamp('claimed_at', { withTimezone: true }),
  optedOut: boolean('opted_out').default(false).notNull(),
  optedOutAt: timestamp('opted_out_at', { withTimezone: true }),
  scoreCached: integer('score_cached').default(0).notNull(),
  scoreRecomputedAt: timestamp('score_recomputed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`now()`).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`now()`).notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
```

Claude Code: generate the rest in this style. Generate one file per logical group (`workers.ts`, `employers.ts`, `records.ts`, `scoring.ts`, `audit.ts`, `billing.ts`) and re-export from `packages/db/schema/index.ts`.

---

## Migration strategy

1. Initial migration: all tables + RLS + triggers + seed `incident_types`
2. Subsequent migrations: additive only; never DROP COLUMN in production
3. Use `drizzle-kit generate` and review before applying
4. Test migrations in preview env first
5. Backup before any prod migration

---

## Notes for Claude Code on first scaffold

When you scaffold the schema, also generate:

- `packages/db/policies/00_workers.sql` etc. — one SQL file per table with its RLS policies
- `packages/db/seed/incident_types.sql` — seed the catalog from `05_LEMON_SCORE_ENGINE.md`
- `packages/db/seed/dev_*.sql` — dev seed data, see `08_SEED_DATA.md`
- Tests in `packages/db/tests/policies/*.test.sql` — assert that worker-1 can/can't see record-X under various scenarios
