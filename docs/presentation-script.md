# QuickMove Tracker — Project Overview & Presentation Script

For explaining/demoing the project live (interview, walkthrough call, or just to have the story straight in your own head before you submit). Part 1 is the reference overview; Part 2 is a spoken script with demo cues, timed for roughly 8–10 minutes.

---

## Part 1 — Project Overview (reference)

### The problem

QuickMove runs 200+ relocations/month across 8 cities, growing 20% quarter over quarter, coordinated by 5 ops people working entirely through WhatsApp, Google Sheets, and email — no engineering team. Every relocation moves through the same 6 visible stages (Housing → Moving → Utilities → Documentation → Settling in), but the assignment's own framing was right: anyone can list those 6 stages. The real system underneath has 31 distinct workflows, and the checklist looks the same across all 8 cities while the actual vendors, timelines, and failure modes don't.

The core failure of the current process isn't any single broken step — it's that **nothing surfaces itself**. A blocked lease and a stalled utility connection look identical in a WhatsApp thread: silent, until someone happens to scroll back far enough to notice.

### Why this workflow, out of 31

Ranked in the Map (Submission 1), in this order and for this reason:
1. **Structured status tracking + escalation detection** — the foundation. Touches every workflow, every day. Nothing else compounds without it.
2. **AI parsing of WhatsApp-style updates into structured state** — the *adoption unlock* for #1, not a separate value source. Ops already communicates this way; forcing a second manual data-entry step is why spreadsheet trackers die in a month.
3. **AI-drafted customer status messages** — the visible win, correctly ranked last, since drafting from untrustworthy state produces a useless message.

What got built is #1 and #2 combined, with #3 layered on top.

### What it is

A relocation operations tracker: a dashboard of every relocation in flight, a per-move checklist across the 5 real stages (Housing/Moving/Utilities/Documentation/Settling In), automatic detection of blocked and stalled items, and two AI features that turn the team's existing WhatsApp habit into structured data instead of fighting it.

**Core features:** dashboard with live counts, search/filter, per-city-capable checklist templates, audit history on every status change, escalation detection (persisted, not just computed on the fly), mobile-responsive master-detail layout, and an offline mode that transparently falls back to local storage if the backend is unreachable.

**AI features:**
- *Paste a WhatsApp update* → Claude extracts which checklist items it speaks to and what changed → ops reviews and approves each suggestion individually → nothing is ever auto-applied.
- *Draft a customer update* → generates a warm, honest WhatsApp-style message from the live checklist state, editable before sending.

Both AI calls are server-side only — the original reference prototype called the Anthropic API directly from the browser, which would leak an API key; that was a non-negotiable fix, not an optional hardening step.

### Stack

React + Vite + Tailwind + Framer Motion + React Query + Zustand + React Hook Form + React Router on the frontend; Node/Express + Prisma + SQLite (schema is Postgres-portable) on the backend; Claude API for the two AI features. Deploys as a single service — Express serves the built frontend directly, so it's one URL, no CORS, no cross-origin config.

### What's live

- App: `https://clever-youth-production-fc5f.up.railway.app`
- Repo: `https://github.com/ritheshsuvarna/stampmyvisaaa`

---

## Part 2 — Presentation script

*Read naturally, don't recite word for word. Bracketed lines are demo actions.*

### Opening — 30 sec

> "This is a relocation operations tracker I built for QuickMove — a company that coordinates relocations across 8 cities for 200-plus customers a month, with a 5-person ops team running the whole thing through WhatsApp, Google Sheets, and email.
>
> I picked this out of a system map I did first — I found 31 distinct workflows hiding under what looks like a 6-step checklist, and this one — status tracking plus escalation detection, unlocked by AI — came out as the highest-leverage thing to build, for reasons I'll get into."

### The problem — 60–90 sec

> "The thing that stood out mapping this out wasn't any one broken step. It's that in the current process, *nothing surfaces itself*. A blocked lease signing and a customer quietly waiting three extra days on a bank address update look exactly the same in a WhatsApp thread — you only find out something's wrong if someone happens to scroll back far enough.
>
> And it's not evenly distributed — utilities, documentation, movers, all of it varies by city. A relocation to Bengaluru and one to Kolkata share a checklist template; they don't share a single vendor or timeline. So the tool had to be built for that variation, not just for one happy path."

**[If asked "why this one, not the other 30 workflows":]**
> "Ranked it three ways. Status tracking is the foundation because it touches all 31 workflows, every day. The AI parser isn't valuable by itself — it's what makes ops actually *use* the tracker instead of abandoning it, because it removes the double-data-entry tax that kills every WhatsApp-to-spreadsheet project. And the AI message drafter only works once the first two make the underlying state trustworthy — drafting a customer update from garbage data just produces a garbage message."

### Live demo — 3–4 min

**[Open the dashboard]**
> "This is the dashboard — every relocation in flight, blocked/stalled counts up top, open escalations feed below. Right now it's clean."

**[Click "Add relocation," fill in a customer, submit]**
> "Adding a relocation — customer, origin and destination city, move date, ops owner. It validates the obvious stuff — can't pick the same city twice, can't backdate a move — and it also catches duplicates server-side, so two ops people can't accidentally create the same customer twice."

**[Land on the detail page]**
> "Every relocation gets the same 14-item checklist across five real stages, grouped the way the actual work happens — Housing, Moving, Utilities, Documentation, Settling In. The bar up top is literally the route, filled by percentage complete."

**[Click a status pill, e.g. set "Lease signed" to Blocked]**
> "Watch what happens when I mark something blocked—"

**[Point to the banner that appears / go back to dashboard to show the escalation chip/panel]**
> "—it surfaces immediately, both here and on the dashboard. That's the whole point: this used to be invisible until someone happened to ask. Now it's a persisted record — not just a computed flag — so we can actually answer 'how long was this blocked before anyone noticed,' which you can't do with a spreadsheet."

**[Open the AI update parser, paste a sample WhatsApp-style note]**
> "This is the adoption unlock I mentioned. Ops doesn't want to fill out a form — they want to paste what they already typed in WhatsApp. I paste something like 'lease signed today, movers still haven't confirmed for the 14th' — Claude reads it against the current checklist state and suggests specific changes."

**[Show the suggestion checkboxes, apply selectively]**
> "It never applies anything automatically — every suggestion is a checkbox ops reviews and approves. And if the model returns something malformed, the backend retries once with a corrective prompt before giving up with a clear error, instead of silently failing."

**[Open the message drafter]**
> "And this drafts the customer-facing update from the same live state — three to five sentences, honest about what's blocked, nothing fabricated, editable before it's copied and sent."

**[Optional: resize to mobile width]**
> "It's genuinely responsive too — on mobile it's a real master-detail pattern, not a squeezed desktop layout. Ops are in the field, not at desks."

### Technical decisions worth mentioning — 60–90 sec

> "A few choices I'd defend if asked. Everything's server-side for the AI calls — the reference prototype I started from actually called the Anthropic API directly from the browser, which would leak a key. That's not optional hardening, that's a correctness fix.
>
> I used SQLite instead of Postgres for the database — deliberate tradeoff for zero-setup speed under the time limit, but the schema's written to be Postgres-portable, it's a one-line provider swap, documented in the README.
>
> And the deploy is a single service — Express serves the built frontend directly — so it's one URL instead of coordinating two platforms. That came from a mid-build pivot; I'd originally set it up as two services and simplified it when it turned out to be more friction than it was worth."

### Wrap-up — 30 sec

> "So — that's the foundation and its adoption unlock, built and actually working, not mocked. The Map has the rest of the roadmap: vendor/partner directories, predictive SLA-breach alerts, the things that depend on this data existing first. Happy to go deeper on any part of it — the escalation logic, the AI safety pattern, or the parts I'd still call unfinished, which I've been upfront about in the README rather than hiding."

---

## Anticipated questions (short answers)

- **"Why no authentication?"** — 5 known internal ops users; name-selection is proportionate to the actual risk at this scale. Flagged explicitly as a gap for anything beyond that.
- **"What happens if the AI makes something up?"** — It only ever returns *suggestions* a human approves; nothing writes to the database without a click. Output is also schema-validated server-side before it's even shown.
- **"Why not build the shortlist-matching or predictive-alerts features instead?"** — Ranked lower in the Map explicitly because they're blocked on data that doesn't exist yet (partner feeds) or depend on this foundation existing first (predictive alerts need historical structured data to predict from).
- **"How do you know it actually works, not just looks like it does?"** — Every feature was tested in a real browser against the live deploy, not just locally — created real relocations, flipped real statuses, killed the backend to confirm the offline fallback, and caught three real bugs doing it (a timezone display bug, a duplicate error message, and an offline-detection blind spot caused by the dev proxy). All documented in the Build Log.
