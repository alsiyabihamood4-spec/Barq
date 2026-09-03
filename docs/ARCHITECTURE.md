# BARQ — architecture

Implements the design bundle in `project/BARQ App.dc.html` (Claude Design export)
as a real, buildable monorepo. See `docs/IMPLEMENTATION_STATUS.md` for what is fully
built vs. scaffolded.

```
CLIENT APPS (iOS/Android/Web)          PARTNER APPS (brokers & transporters)
        \                                       /
         \                                     /
          apps/mobile — Expo / React Native (Expo Router, one codebase)
                             |
ADMIN WEB PANEL — apps/admin (Next.js SPA/app router)
                             |
                        HTTPS / WSS
                             |
                  apps/api — Fastify + TypeScript
        ┌───────────────┬───────────────┬────────────────┐
   Auth & RBAC      Tender engine    Escrow & pay     Notification
   (JWT, KYC)       (reverse         (commission      engine (stubbed:
                     auction,        split, wallet)   push/SMS/WS hooks)
                     geo-fence)
                             |
                   Prisma ORM (PostgreSQL + PostGIS)
                             |
                        Redis (ioredis)
             tender countdown pub/sub, session cache, rate limits
```

## Packages

- `packages/theme` — Industry design-system tokens (colors, ramps, type, spacing,
  radius) ported from `project/_ds/.../styles.css`, as plain TS + a Tailwind preset
  (admin) + a React Native theme object (mobile).
- `packages/i18n` — Arabic/English copy dictionaries pulled from the prototype's
  bilingual `<span class="ar">/<span class="en">` pairs and its `Component` state
  model, plus RTL helpers.
- `packages/types` — shared domain DTOs (User, Company, Port, Tender, Bid, Order,
  Escrow, Wallet, KycApplication, Dispute, …) used by api/admin/mobile.

## Apps

- `apps/api` — Fastify + Prisma. Auth (JWT, OTP), tenders/bids, orders/clearance
  stepper, escrow + wallet + 15% commission split, KYC review queue, ops monitor,
  disputes. `prisma/seed.ts` loads the exact Oman fixtures from the prototype
  (ports, bids, tenders, KYC queue, ops rows, tickets, payouts) so the UI matches
  the mockup on first run.
- `apps/admin` — Next.js. Five sections behind one sidebar: Overview, KYC queue,
  Operations monitor, Financial centre, Disputes & tickets.
- `apps/mobile` — Expo Router. Client app (13 screens) + Partner app (8 screens) +
  Welcome/Sign-in (2 screens), AR/EN toggle flipping RTL/LTR app-wide.

## Why these choices

Per the maintainer's decision: Node/TypeScript backend (one type system shared with
the two React frontends via `packages/types`), React Native + Expo for the mobile
client/partner apps (single codebase for iOS/Android, matches the diagram's
"CLIENT APPS (iOS/Android/Web)"), Next.js for the admin panel.
