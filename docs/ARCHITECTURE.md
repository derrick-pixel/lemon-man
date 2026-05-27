# Lemon-man (Candidate Lemon Platform) — Architecture

## Purpose
- Worker-screening venture under Elitez Group, targeting SG temp / daily-rated / short-contract workforce.
- Pre-product: this repo is a 5-page marketing site plus a private intel cabinet. No real screening engine exists yet; the on-page "Lemon Score" simulator is a static calculator (`assets/js/lemon.js`).
- Playful "Lemon Score" demerit framing — high score = sour (bad hire), low / negative = peach (clean). Mascot-led citrus B2B aesthetic.
- LIVE since 2026-05-19 at `derrick-pixel.github.io/lemon-man/`, but every page carries `noindex, nofollow` until commercial launch.
- Built per the dt-site-creator marketing-site archetype (static-informational): multi-page scaffold, shared design system, full OG/Twitter meta, adaptive favicon, cache-busted includes.

## Tech stack
- **Static HTML / CSS / JS only** — no build step, no dependencies, no server. Deployable to any static host; currently GitHub Pages.
- `assets/css/lemon.css` (cache-busted via `?v=20`) — citrus B2B design system v2.
- `assets/js/lemon.js` (~740 lines) — nav, scroll-reveal, confetti burst, Lemon Score calculator, 50-incident simulator, confessions feed loader, **front-end-only access-form stub** (no network call; just shows a thank-you message).
- **Supabase project: `suehogmzjspagcsrqvsw`** (shared) — referenced by `admin/assets/kit/js/auth-gate.js` for email-OTP gating, **but the gate is currently disabled** (script tag removed from every admin page in commit `a3298d1`, 2026-05-21 "drop admin gate"). The auth-gate file remains on disk for re-enable.
- Admin intel kit: `admin/assets/kit/js/` (app.js, auth-gate.js, dom.js, format.js + viz + report) and `admin/assets/kit/vendor/` (chart.umd.js, html2canvas.min.js, jspdf.umd.min.js) — the standard `competitor-intel-template` runtime, loading JSON from `admin/data/`.

## Page inventory

### Public marketing (5 pages, all `noindex, nofollow`)
- `index.html` — Hero, Akerlof lemon-economics framing, two problems, the Lemon Score, hard/soft power, lemon-detector scoreboard, "Request access" email form (stub only).
- `how-it-works.html` — Lemon Score engine: incident points, quadratic corroboration multiplier, decay, 24–72h contest window.
- `for-workers.html` — "Un-lemon yourself": contesting the upload, ripening into a peach, free independent appeal.
- `pricing.html` — Lemon tokens, monthly plans, removal pricing, >10-lemons-a-quarter headcount rule.
- `trust.html` — "The Squeeze": paid uploads, contest window, Mutually Assured Sourness, corroboration weighting.

### Auxiliary
- `simulator.html` — Full 50-incident calculator with the same corroboration multiplier as the friendly on-index gauge.
- `404.html` — Branded "Page squeezed" fallback.

### Private intel cabinet (`/admin/`, all `noindex, nofollow`)
- `admin/index.html` — Intel Cabinet landing / dashboard.
- `admin/competitors.html` — Competitor landscape (JSON-driven from `admin/data/competitors.json`).
- `admin/insights.html` — Market sizing + pricing strategy.
- `admin/whitespace.html` — Whitespace atlas.
- `admin/design-audit.html` — Design audit.
- `admin/government.html` — Tripartite / government brief.
- `admin/report.html` — Board-grade printable report (html2canvas + jsPDF).
- `admin/data/*.json` — competitors, market-intelligence, pricing-strategy, whitespace-framework, design-audit, brand-tokens, plus a canonical `_FIELD-DICTIONARY.md` schema reference.

## Deploy
- GitHub Pages from `derrick-pixel/lemon-man` (public repo).
- Public URL: `https://derrick-pixel.github.io/lemon-man/`.
- No custom domain; no edge CDN beyond GitHub Pages.
- No CI / no build — push to `main` and the site updates.
- No server-side anything: zero data is collected by the site itself (the email form is a UI-only stub).

## Edge cases & warnings for future developers
- **`noindex, nofollow` MUST remain on every page until Derrick approves launch.** Verified present on all 7 public HTML files and all 7 admin HTML files at the time of writing. Removing it prematurely surfaces a pre-product venture in Google / search before regulatory and product readiness — and given the legal posture below, that exposure is non-trivial.
- **Legal review is a known-deferred item.** Derrick instructed stand-down on all legal/PDPA concerns at launch time (2026-05-19); the README itself flags this explicitly: *"v2 build re-flavours the site to the founder's v1.0 brief — including mechanics (Mutual Assured Destruction framing, 'blacklist', pay-to-upload, pay-to-remove) that Business Plan v1.1 §7.5 and the legal assessment explicitly rejected. Built this way on the founder's explicit, informed instruction. Do not publish without the venture's lawyers clearing this version."* A `Legal Assessment of Project Lemon Man.pdf` sits at the repo root — read it before changing copy in this direction. **Re-engage legal before any real data collection (or any indexable publication).**
- **Admin gate is currently OFF.** `admin/assets/kit/js/auth-gate.js` exists and is wired for Supabase email-OTP against project `suehogmzjspagcsrqvsw`, but commit `a3298d1` (2026-05-21) removed the `<script>` tag from every `admin/*.html`. The admin pages and their JSON data are therefore **publicly accessible by URL** — protected only by obscurity and `noindex`. Treat the admin intel as effectively public until the gate is re-enabled.
- **Sibling-not-duplicate.** Lemon-man is a sibling of `flashcart` and `discounter` only in the sense that all three are Elitez ventures with separate repos; they are **different verticals** (worker reliability screening, vs. on-site event commerce, vs. FMCG clearance for dormitories). Don't conflate the data models or the buyers.
- **"Lemon Score" framing is intentionally playful.** Keep the citrus-mascot tone consistent across copy changes; don't slip into clinical, punitive, or "blacklist registry" language without Derrick's review — the playful framing is load-bearing for both legal-defensibility and brand differentiation.
- **Shared Supabase project (`suehogmzjspagcsrqvsw`).** Per the portfolio health report bottleneck R4#1, this project is shared with 22+ other Elitez products (ESOP, Elitez Aviation /admin intel, Lemon-man admin gate, etc.). Any schema or auth-hook change here can affect every tenant. Treat schema migrations on this project as a portfolio-wide change, not a per-repo change.
- **Pages are NOT under the `dt-public/` mirror.** This repo is its own GitHub Pages site (`derrick-pixel/lemon-man`); the `dt-public` admin-exposure caveats from the May-2026 security audit do not apply here. The admin-gate-disabled exposure is a separate, narrower issue specific to this repo.
- **The on-page "Request access" form does nothing.** Submissions are validated client-side and discarded; the success message is theatrical. If someone reports "we got their email but never followed up", this is why — wire the form to a real endpoint (Formspree, Supabase, or Resend) before collecting any leads.
- **Three Stitch illustration set directories** (`stitch_lemon_man_illustration_set`, `... V2`, `... V3`) ship raw mockup folders in the repo. They are not consumed by the live pages directly — the live `assets/img/` set is the chosen subset. Safe to leave alone; deleting would lose source material.

## Known tech debt
- Legal review deferred per Derrick's 2026-05-19 stand-down (see above).
- Admin gate disabled; admin/ pages and JSON publicly fetchable.
- "Request access" form is a UI stub with no backend.
- Repo retains three large Stitch illustration source directories (mockups) — bloat, not load-bearing.
- No real product backend exists; the Lemon Score engine described on `how-it-works.html` is a marketing artefact, not a deployed system.
- `noindex` is the only thing keeping pre-launch copy off search; no robots.txt-level enforcement audited.
- Cache-bust tokens are manual (`?v=20`) — easy to forget on CSS/JS edits.
- No analytics wired (no GA / Plausible) — launch-readiness will need this.

## Related memories / docs
- `/Users/derrickteo/codings/docs/ARCHITECTURE-HEALTH-REPORT.md` — portfolio-wide architecture and tenancy health, including the shared-Supabase bottleneck (R4#1) that this repo participates in.
- `/Users/derrickteo/.claude/projects/-Users-derrickteo-codings/memory/project_lemon_man.md` — venture-level memory (positioning, launch state, legal stand-down).
- `/Users/derrickteo/codings/Lemon-man/README.md` — in-repo README with the same legal warning and the page table.
- `/Users/derrickteo/codings/Lemon-man/Lemon Man_business_plan_v1.1.md` — business plan v1.1 (the version §7.5 of which rejected the MAD / blacklist mechanics that the current site re-introduces).
- `/Users/derrickteo/codings/Lemon-man/Legal Assessment of Project Lemon Man.pdf` — counsel's written assessment.
- `/Users/derrickteo/codings/Lemon-man/Lemon Man cowork_handoff_brief.md` — earlier handoff brief from the cowork session.
