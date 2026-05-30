# 07 — Brand & Copy

The brand carries Derrick's "ruffle some feathers" energy on the surface — playful, citrus-themed, slightly cheeky — while the underlying product behaviour is rigorous about procedural fairness. **The playful voice never enters legal pages, policy pages, contest flows, or mediation copy.** Those stay formal.

---

## Brand positioning

**One-line:** *The portable employment trust profile for Singapore's temp and short-contract workforce.*

**Audience-facing tagline candidates:**
- "Reliability, signed and verified."
- "Your work record. Owned by you."
- "Where reputations get receipts."

**Anti-positioning:** This is NOT a blacklist. NOT a background-check service. NOT a Glassdoor for workers (we don't review employers).

---

## Brand name — candidates

`[DECISION]` Derrick to pick one. My ranking with rationale:

### 1. **Lemonaid** — `lemonaid.work` or `lemonaid.sg`
- Pros: Keeps Derrick's "lemon" frame; "aid" softens the blacklist connotation toward "we help"; punny on lemonade (turning lemons into something useful); easy domain; works in English and reasonably in Mandarin context
- Cons: Lemonade brand collision in F&B; needs disambiguation

### 2. **Peachr** — `peachr.io` / `peachr.sg`
- Pros: Leads with the positive ("peach" = good hire in lemons-vs-peaches lit); friendlier brand; appeals to workers (who are the harder side to acquire); flips the negative framing
- Cons: Loses the "lemon" punchline; sounds startup-trendy

### 3. **Citrus** — `citrus.work` or `citruswork.com`
- Pros: Neutral citrus framing; works either way (peaches and lemons are both citrus-adjacent); short, brandable
- Cons: Common word; SEO competition

### 4. **Lemon Man** — `lemonman.sg`
- Pros: Memorable, Derrick's chosen brand, edgy
- Cons: Reads as gendered (Man); reads as antagonistic (which is the intent but creates legal optics); harder to position as worker-friendly

### 5. **Reckoner** — `reckoner.sg`
- Pros: Serious, professional; means "one who calculates accounts"; carries weight
- Cons: Loses all citrus humour; harder to do brand voice

### 6. **Trackr** / **Recordr** — generic startup names; functional but bland

**Recommendation:** **Lemonaid** as the consumer brand, with **"by Lemon Man Pte Ltd"** as the legal entity name. This lets you keep your branding instinct and also have a softer customer-facing identity.

---

## Brand voice

### Tone matrix

| Context | Voice | Example |
|---|---|---|
| Marketing landing pages | Playful + confident | "Hire with receipts. Skip the lemons." |
| Worker onboarding | Warm + reassuring | "Your work record, on your terms. You see everything. You respond to anything." |
| Employer onboarding | Direct + practical | "Search before you hire. Three tokens. Done." |
| Record submission UI | Neutral + procedural | "What happened? When? Any documents to attach?" |
| Contest UI (worker) | Calm + supportive | "You have 72 hours to respond. Take your time. We've paused publication." |
| Mediation copy | Formal + neutral | "Your dispute has been received. A platform moderator will review within 48 hours." |
| Legal / privacy pages | Formal + precise | "Personal data collected under this notice may be used for the purposes described in clause 4." |
| Error messages | Helpful + plain | "We couldn't verify your UEN. Check the number or contact support." |
| Marketing emails | Playful (capped) | "A new record awaits review. (Take a breath. You have time.)" |

### Banned phrases

These leak the playful voice into places it doesn't belong:

- ❌ "You've been lemonified" — fine in marketing copy, NEVER in a worker-facing notification
- ❌ "Bad apple" — apple is not citrus and it's also dismissive
- ❌ "Blacklisted" — never. We're not a blacklist.
- ❌ "Punked" / "Caught" — never on user-facing screens for the worker
- ❌ "Lemon hirer" as an accusation — fine internally, never on UI
- ❌ "Bad culture" — judgmental; describe behaviour, not character
- ❌ "Suspected of [X]" — we deal in evidenced incidents, not suspicions

### Approved playful copy

For marketing surfaces and admin-internal copy only:

- "You've been lemonified" — marketing only; *never* on the worker's notification of a record
- "You side-stepped a lemon" — employer-side success state ("you searched, you saw the score, you didn't hire")
- "You planted a lemon tree" — employer-side gamification when an employer crosses a contribution threshold (e.g., 10+ records with no contests upheld against them). Internal achievement copy; marketing only. Subtle reward for high-quality contributors without making it a leaderboard arms race.
- "Planting peaches" — testimonial submission flow internal name; marketing copy
- "Lemon detector" — marketing tagline; never product UI
- "Lemonade" — generic positive metaphor

---

## Key copy snippets

### Landing page hero

> # Reliability, signed and verified.
> Lemonaid is the portable employment trust profile for Singapore's temp and short-contract workforce. Workers own their record. Employers contribute with evidence. Mediation when it's needed. Receipts for both sides.
>
> **For workers** — your reliability, in one place. Share it with one click.
> **For employers** — search before you hire. Token-based, transparent, evidenced.

### Worker onboarding step 1

> ## Welcome.
> This is your work record. You own it.
>
> Employers can submit feedback about engagements where you worked for them. **You always see it before anyone else does.** You have 72 hours to respond. You can contest, request mediation, or accept.
>
> No one can publish a record about you without your verified mobile number receiving notice first.

### Worker receives a record (SMS)

> Lemonaid: An employer has submitted a record about a recent engagement. View and respond within 72 hours: https://lemonaid.sg/r/abc123
> Stop these messages: reply STOP

### Worker receives a record (email — subject)

> A new record on your work profile — your response is requested

### Worker receives a record (email — body, abridged)

> Hi {{name}},
>
> An employer who recently engaged you has submitted a record to your work profile. The record is currently **not published** — your response window is open until {{deadline_iso}} ({{hours_remaining}} hours from now).
>
> **Summary of the record**
> - From: {{employer_name}}
> - About engagement: {{engagement_period}}
> - Category: {{incident_category}}
>
> [View the full record and respond →]
>
> Your options:
> - **Acknowledge** — record publishes, the engagement period and severity become part of your record. Time decay starts.
> - **Contest** — submit your version and any counter-evidence. A platform moderator reviews and decides.
> - **Do nothing** — the record auto-publishes at the deadline.
>
> Need help? Email support@lemonaid.sg or reply to this message.

### Employer record submission form (intro)

> ## Submit a record
>
> A few things before you start:
> 1. The worker will be notified within minutes. They have **72 hours** to contest before publication.
> 2. Records with severity 4+ require **evidence**. We mean it — timesheets, emails, photos, supervisor reports.
> 3. We do not accept records on medical leave frequency, caregiving-related absences, or anything that could be a proxy for a protected characteristic under the Workplace Fairness Act 2024. [Learn more →]
> 4. Frivolous submissions cost you. We monitor for retaliation and mass-submission patterns.

### Employer search results — no record found

> No record found for **{{name}} ({{masked_mobile}})**.
> This worker isn't yet on the platform, or has a clean record. Token consumed: 1.
> 
> *Want to be the first to contribute? [Submit a record about an engagement →]*

### Employer search results — found

> **{{name}}** (verified mobile)
> Score: **{{score}}/100** ({{band_label}})
> Records: {{record_count}} ({{contributing_employer_count}} employers)
> Last activity: {{last_activity_relative}}
>
> [View full record →] *(consumes 1 token)*

### Marketing — feature card

> ### The score isn't the point.
> The contest, the mediation, and the receipt are. We're the platform where reputation gets due process.

### Why the worker should opt in (workers landing)

> ### Three reasons to own your work record
>
> **1. The conversations are already happening.** Operators talk to each other. Most of those conversations are unstructured, undocumented, and impossible to respond to. We make them visible, evidenced, and contestable.
>
> **2. Your reliability is your edge.** If you're better than the median worker — and most people are, in their own way — we let you prove it. Testimonials, training, attendance milestones, all in one place.
>
> **3. You stay in control.** Every record about you, you see first. You contest what's wrong. You respond to what's right. You take your record with you.

### Contest form intro (worker)

> ## Tell us your side.
>
> We've paused publication of this record. Take the time you need.
>
> What's most accurate?
> ☐ The facts are wrong
> ☐ Context is missing
> ☐ This may be discriminatory (e.g., related to a protected characteristic)
> ☐ This feels retaliatory
> ☐ The person they're describing isn't me
> ☐ Other
>
> Tell us more (free-text)
> [Upload counter-evidence — photos, messages, payslips, anything that helps]

### Mediation — admin-facing record card

(Internal — Derrick / mods see this on the admin queue)

> **Mediation queue · #M-001234**
> Record from: Acme F&B (verified UEN 1234567A)
> About: Tan Ah Kow (verified mobile, 8 months on platform)
> Incident: `no_show_confirmed` · severity 9 · 12 Apr 2026
> Evidence attached: ✓ (shift roster, internal WhatsApp screenshot)
> Worker contest reason: "context missing — was hospitalised that day, MC attached"
> Counter-evidence: ✓ (Tan Tock Seng A&E discharge summary, 12 Apr 2026)
>
> **Recommended action:** Withdraw — credible MC evidence overrides incident.
> [Withdraw] [Modify severity] [Uphold] [Escalate]

### Footer — every page

> Lemonaid is operated by Lemon Man Pte Ltd, a Singapore-registered company (UEN: TBD). We are committed to the Personal Data Protection Act 2012. DPO: dpo@lemonaid.sg. We are not affiliated with the Ministry of Manpower or any government agency.

---

## Visual direction

- **Palette:** Citrus yellow (#F9D923) + deep navy (#0B1F3A) + clean white. Coral (#FF6B6B) for severe / critical states only. Pastel green (#A8E6CF) for positive / clean states.
- **Type:** Inter for body, Geist or Söhne for headlines. Mono (JetBrains Mono) for codes and IDs.
- **Iconography:** Lucide-react (already in Derrick's stack). One custom lemon glyph — used sparingly.
- **Imagery:** Avoid stock photos. Use abstract gradients, citrus motifs, photographic black-and-white portraits of real workers only if those workers signed model releases. No staged "happy worker" stock.
- **Motion:** Framer Motion, restrained. Score-band transitions use subtle colour shifts. Publication events get a gentle "settle" animation. No confetti, no celebration UI when a record publishes.

---

## Tone red lines

- Never name workers in any marketing material.
- Never use real records — synthetic only, even in screenshots.
- Never make light of being lemonified.
- Never use casual language in contest, mediation, or PDPA flows.
- Never frame the product as "punishment."
