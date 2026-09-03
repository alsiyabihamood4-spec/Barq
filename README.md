# BARQ · برق

Customs clearance & freight tender marketplace for the Sultanate of Oman —
implemented from the Claude Design handoff bundle in `project/`.

- **`apps/api`** — Fastify + Prisma backend (auth/OTP, tenders, bids, escrow,
  KYC, wallet, disputes, admin endpoints). See `apps/api/README.md` to run it.
- **`apps/admin`** — Next.js web admin console (overview, KYC queue,
  operations monitor, financial centre, disputes).
- **`apps/mobile`** — Expo React Native app: the client app (post shipments,
  compare bids, escrow checkout, live tracking) and the partner app
  (onboarding/KYC, tender feed, active jobs, wallet), AR/EN with full RTL.
- **`packages/theme`, `packages/i18n`, `packages/types`** — shared design
  tokens, bilingual copy, and domain DTOs used by all three apps.

Start here:

- `docs/ARCHITECTURE.md` — system diagram and why these technology choices.
- `docs/IMPLEMENTATION_STATUS.md` — what's fully wired vs. deliberately
  simplified (maps, payments, SMS gateway, PostGIS, admin auth).
- `apps/api/README.md` — how to run Postgres, Redis, migrate, seed, and
  start the API locally.

## Original design handoff

<details>
<summary>The bundle's original README (Claude Design → coding agent handoff notes)</summary>

# CODING AGENTS: READ THIS FIRST

This is a **handoff bundle** 

A user mocked up designs in HTML/CSS/JS using an AI design tool, then exported this bundle so a coding agent can implement the designs for real.

## What you should do — IMPORTANT

**Read the chat transcripts first.** There are 1 chat transcript(s) in `chats/`. The transcripts show the full back-and-forth between the user and the design assistant — they tell you **what the user actually wants** and **where they landed** after iterating. Don't skip them. The final HTML files are the output, but the chat is where the intent lives.

**Read `project/BARQ App.dc.html` in full.** The user had this file open when they triggered the handoff, so it's almost certainly the primary design they want built. Read it top to bottom — don't skim. Then **follow its imports**: open every file it pulls in (shared components, CSS, scripts) so you understand how the pieces fit together before you start implementing.

**If anything is ambiguous, ask the user to confirm before you start implementing.** It's much cheaper to clarify scope up front than to build the wrong thing.

## About the design files

The design medium is **HTML/CSS/JS** — these are prototypes, not production code. Your job is to **recreate them pixel-perfectly** in whatever technology makes sense for the target codebase (React, Vue, native, whatever fits). Match the visual output; don't copy the prototype's internal structure unless it happens to fit.

**Don't render these files in a browser or take screenshots unless the user asks you to.** Everything you need — dimensions, colors, layout rules — is spelled out in the source. Read the HTML and CSS directly; a screenshot won't tell you anything they don't.

## Bundle contents

- `README.md` — this file
- `chats/` — conversation transcripts (read these!)
- `project/` — the `Logistics clearance and freight app design` project files (HTML prototypes, assets, components)

</details>
