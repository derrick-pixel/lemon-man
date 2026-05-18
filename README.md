# Lemon Man — Workforce Reliability Network

Marketing site for **Lemon Man**, a concept-stage workforce-reliability-network
venture in Singapore — a credit-bureau analogue for shift, contract and
freelance labour conduct.

> **Status: concept-stage.** This is a public-facing *marketing* site built as a
> design artefact. It is **not** a live service, offer, or regulatory filing.
> The repository is **private** and the pages carry `noindex, nofollow` — see
> *Going live* below before changing either.

## Stack

Static HTML/CSS/JS — no build step, no dependencies. Built with Derrick's
`dt-site-creator` methodology: multi-page scaffold, fixed glassmorphic nav,
shared design system, OG/social meta and an adaptive SVG favicon on every page.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Hero, the "market for lemons" problem, the reframing, how-it-works preview |
| `how-it-works.html` | The mechanism — record schema, 21-day reply window, scoring engine, decay schedule |
| `for-workers.html` | Worker side — claimed profiles, endorsements, rights, dispute & rehabilitation |
| `pricing.html` | Four employer tiers + token overage; workers free |
| `trust.html` | Regulatory architecture — MAS precedent, PDPA, defamation, WFA, the "never build" list |

```
assets/
  css/lemon.css      design system (tokens, components, responsive)
  js/lemon.js         nav, scroll-reveal, score-gauge animation, form stub
  img/favicon.svg     citrus-cross-section monogram
  img/og-image.png    1200×630 social card  (regenerate: scripts/generate-og.py)
scripts/
  generate-og.py      PIL-based OG card generator (rerunnable)
```

## Run locally

`fetch` is not used, so opening the files directly works — but a server is cleaner:

```
python3 -m http.server 8000
# → http://localhost:8000
```

## Design

Editorial-institutional. Warm cream paper (`#f5efdf`), deep warm ink, a single
deep-citrus accent (`#d99800`). Fraunces (display) + Hanken Grotesk (body) +
Spline Sans Mono (data). Deliberately **not** Elitez navy — this venture is
positioned as visually independent.

## Naming note

The folder, the legal memo and this build use the working name **"Lemon Man"**.
Business Plan v1.1 renamed the venture to **"Aver"** and flagged a trademark
collision on the Lemon name. If the brand is reconfirmed, a rename touches:
the `<title>`/wordmark in all 5 pages, `og:*` tags, `README.md`, and the OG
generator. Treat the source documents in `_source/` (gitignored) as canonical.

## Going live

Currently private + `noindex`. Before any public launch, the source documents
require brand and legal sign-off first. To publish: drop `noindex, nofollow`
from every page `<head>`, make the repo public, enable GitHub Pages — then bump
the `?v=` cache-busting query on the CSS/JS includes.

---
Concept-stage venture. Confidential.
