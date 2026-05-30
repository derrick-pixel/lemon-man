# CLAUDE.md — Project Context for Claude Code

This file is auto-loaded by Claude Code when run in this directory. It tells you everything you need to know to work productively on this project.

## Project: Lemon Man

A two-sided trust platform for Singapore / SEA temporary and short-contract employment. Employers contribute structured feedback on hires; workers maintain a portable trust profile; both sides have rights of correction and contest. Built to address the asymmetry where workers can review employers (Glassdoor) but employers have no equivalent signal on workers.

**Region:** Singapore launch, SEA expansion (MY, ID, PH, TH, VN)
**Owner:** Derrick Teo (Elitez Group)
**Status:** Pre-MVP

## Operating principles for Claude Code

1. **Read `docs/` before touching code.** Especially `01_LEGAL_AND_RISK.md` — this product has real legal exposure and the architecture exists to mitigate it. Don't shortcut consent flows, contest windows, or audit logging.
2. **Default to Variant B (Consent-First)** unless the user explicitly says "build the bold variant." See `01_LEGAL_AND_RISK.md` §3–4 for the distinction.
3. **Never collect full NRIC.** Last 4 digits + checksum is the legal maximum under PDPC guidelines. Prefer Singpass Myinfo when integrated.
4. **Every adverse record must have an audit trail.** Who uploaded, when, on what basis, what evidence was attached, who saw it, whether contested, mediation history. Audit log is append-only.
5. **Soft delete only for adverse records.** Hard delete for PII when user requests under PDPA's data correction/withdrawal right; soft delete with retention timer for everything else.
6. **No protected-characteristic incidents.** The scoring engine must not directly or by proxy capture: age, nationality, race, religion, language, sex, marital status, pregnancy, caregiving, disability, mental health. See `05_LEMON_SCORE_ENGINE.md` for the "Excluded incidents" list — these go in code as a denylist. **External taxonomies that include these (e.g., the May 2026 research paper's `L10 — MC suspected of malingering` and `L11 — Q4 sick leave pattern`) are rejected on legal grounds; see `09_RESEARCH_INTEGRATION.md` §C.**
7. **Symmetric protection for workers — Lemon Hirer detection.** The platform is two-sided. Any employer with more than 10 negative submissions in a rolling 90-day period must submit an `employer_headcount_attestations` row before further submissions are accepted. Submission rate per declared headcount triggers admin review thresholds. See `04_DATA_MODEL.md` and `05_LEMON_SCORE_ENGINE.md` §Anomaly detection. This is non-negotiable: without it, the platform is structurally asymmetric and will not survive its first defamation case.

## Tech stack (preferred)

- **Frontend:** Next.js 15 (App Router), Tailwind CSS v4, shadcn/ui, Framer Motion
- **Backend:** Supabase (Postgres, Auth, Storage, Edge Functions)
- **ORM:** Drizzle ORM
- **Hosting:** Cloudflare Pages (frontend), Supabase (backend)
- **Email/transactional:** Resend
- **OTP/SMS:** Twilio (already in MCP) or AWS SNS
- **Auth providers:** Email magic link, Singpass (via Myinfo where possible), Google OAuth
- **Payments:** Stripe (cards) + Stripe-supported local methods (PayNow via Stripe SG)
- **Charts/viz (admin):** Recharts
- **Background jobs:** Supabase Edge Functions on cron, or Cloudflare Workers + Queues

## Project conventions

- **Monorepo via Turborepo:** `apps/web` (Next.js), `apps/admin` (admin dashboard, may be same app with route group), `packages/db` (Drizzle schema + migrations), `packages/scoring` (the scoring engine, isolated so it can be unit tested + reused server-side and in edge functions).
- **Schema-first.** Drizzle schema in `packages/db/schema/` is the source of truth. Migrations via `drizzle-kit`. RLS policies live alongside schema in `packages/db/policies/` as SQL files committed to repo.
- **All money in cents/SGD smallest unit.** All scores as integers (multiply final float × 100).
- **All timestamps `timestamptz`,** all IDs `uuid` (use `gen_random_uuid()`), all soft-delete fields `deleted_at timestamptz`.
- **Audit logs are append-only.** Use a Postgres trigger to prevent updates/deletes on the audit table.
- **PDPA-sensitive operations log to a separate `pii_access_log` table** including who accessed, what they saw, why (justification field), timestamp.
- **Edge functions deploy via Supabase CLI**, not hand-rolled. Each function has a `_test.ts` next to it.

## Branding tone

Playful exterior, serious interior. The brand voice uses citrus humour ("you've been lemonified," "you side-stepped a lemon") on user-facing copy, but the underlying product is rigorous about due process. See `07_BRAND_AND_COPY.md`. **Do not let the playful voice leak into legal/policy pages, contest workflows, or admin tools — those stay formal.**

## What "done" looks like for any feature

- Drizzle schema migrated and tested
- RLS policies in place and verified (write a `test_*.sql` that asserts what each role can/can't see)
- Unit tests for any scoring logic
- E2E test for any user-facing flow that touches PII or adverse records (Playwright)
- PDPA audit fields populated where applicable
- Copy reviewed against `07_BRAND_AND_COPY.md`

## Quick reference — directory layout

```
lemon-man/
├── CLAUDE.md                 ← you are here
├── docs/                     ← planning docs (read first)
├── apps/
│   ├── web/                  ← Next.js 15 main app
│   └── admin/                ← admin/moderation UI (may be a route group in web)
├── packages/
│   ├── db/                   ← Drizzle schema, migrations, RLS policies
│   ├── scoring/              ← lemon score engine (pure functions, testable)
│   ├── ui/                   ← shadcn-based shared components
│   └── config/               ← shared config, env validation (zod)
├── supabase/
│   ├── functions/            ← edge functions
│   └── migrations/           ← auto-generated by drizzle-kit
└── turbo.json
```

## Commands you'll use often

```bash
pnpm dev                      # start everything
pnpm db:generate              # generate migration from Drizzle schema
pnpm db:migrate               # apply migrations
pnpm db:seed                  # seed dev data (see docs/08_SEED_DATA.md)
pnpm test                     # run all tests
pnpm typecheck                # turborepo-wide tsc
pnpm lint
supabase functions deploy <name>
```

## When in doubt

Default to the most conservative option (most consent, most audit, most reversible). This product's defensibility is procedural fairness, not feature velocity.
