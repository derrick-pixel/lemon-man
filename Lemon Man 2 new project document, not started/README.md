# Lemon Man — Claude Code Planning Bundle

**Project codename:** Lemon Man
**Working title for the product:** TBD (see `07_BRAND_AND_COPY.md` — "Lemon Man" works as internal/marketing voice but is probably not the legal entity name)
**Owner:** Derrick Teo
**Region:** Singapore launch, SEA expansion
**Status:** Pre-MVP planning
**Date prepared:** May 2026

---

## What this bundle is

A complete set of planning documents designed to be dropped into a Claude Code project. Each file is self-contained and addresses one concern. You can feed individual files into Claude Code as context, or point Claude Code at the whole folder via `CLAUDE.md`.

## Reading order

If you have 15 minutes, read these three:
1. `00_PROJECT_BRIEF.md` — what we're building, in one page
2. `01_LEGAL_AND_RISK.md` — the legal landscape and the two product variants this bundle supports
3. `06_BUILD_PLAN.md` — phased delivery plan

If you have an hour, read everything in numerical order.

## File map

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project context for Claude Code — auto-loaded when Claude Code runs in this folder |
| `00_PROJECT_BRIEF.md` | One-page exec summary |
| `01_LEGAL_AND_RISK.md` | PDPA, NRIC, defamation, Workplace Fairness Act, and the **Bold vs. Consent-First** product variants |
| `02_PRD.md` | Product requirements, personas, user stories, MVP scope |
| `03_ARCHITECTURE.md` | Tech stack (Next.js 15, Supabase, Drizzle, Cloudflare), system design, key services |
| `04_DATA_MODEL.md` | Postgres schema with Drizzle ORM definitions and Supabase RLS policies |
| `05_LEMON_SCORE_ENGINE.md` | Scoring formula, decay curve, quadratic corroboration uplift, **70 incident definitions** |
| `06_BUILD_PLAN.md` | Phase 0–4 build plan with deliverables, owners, and dependencies |
| `07_BRAND_AND_COPY.md` | Brand voice, playful lexicon, key copy, name alternatives |
| `08_SEED_DATA.md` | Sample seed data structures for development |
| `09_RESEARCH_INTEGRATION.md` | Audit trail reconciling the SEA Business Viability research paper (May 2026) with this bundle — what was adopted, what was modified, what was rejected, and why |

## Two product variants

This bundle supports both:

- **Variant A — Bold (your original idea):** Employer-controlled blacklist with employee contest window. Legally aggressive in Singapore; viable in some SEA markets with different consent regimes. Detailed in §3 of `01_LEGAL_AND_RISK.md`.
- **Variant B — Consent-First (recommended for SG launch):** Worker-owned trust profile with employer-submitted feedback. All entries pre-published with worker's awareness and right to respond. Captures most of the business goal at materially lower legal risk. Detailed in §4 of `01_LEGAL_AND_RISK.md`.

The data model and scoring engine work for both; the difference is in publication flow and the consent capture step. The build plan assumes Variant B for MVP with a "Variant A toggle" architected for later SEA markets.

## How to use with Claude Code

```bash
cd ~/projects/
git init lemon-man
cd lemon-man
# drop this whole folder in as /docs
mkdir -p docs
cp /path/to/lemon-man-planning/* docs/
mv docs/CLAUDE.md ./CLAUDE.md
git add . && git commit -m "Initial planning docs"
claude
```

Then in Claude Code:

```
Read CLAUDE.md and docs/02_PRD.md. Scaffold the Next.js 15 + Supabase project per docs/03_ARCHITECTURE.md. Start with the Drizzle schema from docs/04_DATA_MODEL.md.
```

## Open questions flagged in this bundle

These are decisions only you can make. Each is tagged `[DECISION]` in the relevant file:

1. Variant A or Variant B for MVP (or both with feature flag)?
2. Domain — `lemonman.sg`? `lemonaid.work`? `peachr.io`? See `07_BRAND_AND_COPY.md`
3. Singpass Myinfo integration in MVP, or defer to Phase 2?
4. Whether to register the operating entity in Singapore or in a jurisdiction with looser data-broker regimes (this is more a tax/legal call than a tech call — flagged in `01_LEGAL_AND_RISK.md`)
5. Monetisation in MVP: subscription only, token only, or both?
6. Score decay half-life — 12 months (current default), 6 months (more aggressive rehabilitation), or band-dependent (12 mo for severe, 6 mo for moderate, 3 mo for minor)? Flagged in `05_LEMON_SCORE_ENGINE.md` and `09_RESEARCH_INTEGRATION.md` §B.1.
