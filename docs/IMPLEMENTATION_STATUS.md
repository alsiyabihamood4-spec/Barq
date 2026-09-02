# Implementation status

What's real vs. what's simplified, so nobody discovers the gaps the hard way.

## Fully working end-to-end (verified against a running Postgres + the API)

- **Auth**: OTP request/verify (demo code `482715`, matching the prototype),
  JWT sessions, role assignment, company linking on sign-up. Admin console
  sign-in uses the same mechanism, gated to accounts whose real database
  role is `ADMIN` — see "Admin sign-in" below.
- **Tender → bid → award → escrow**: post a tender, submit competing bids,
  accept one → order created, escrow entry held, commission split computed
  (15% default, `COMMISSION_PCT` env var).
- **Order execution — service-specific stage machine**: clearance/
  inspection/gov orders walk assigned → declaration → inspection →
  released → delivered (Bayan filing, physical inspection, release note);
  freight orders skip customs entirely — assigned → in_transit →
  delivered. One sequence table (`STAGE_SEQUENCE` in `apps/api/src/lib/dto.ts`)
  drives both `POST /orders/:id/advance` and the `stageIndex`/`stageCount`
  every client reads, so they can't drift apart.
- **Live GPS tracking (freight)**: the carrier's app posts positions to
  `POST /orders/:id/location`, stored in Redis via `GEOADD` (the
  architecture diagram's "Live Vehicle GPS Buffer" — deliberately not
  Postgres, since it's fast-changing, ephemeral data); the client's
  tracking screen polls `GET /orders/:id/location`, which reports real
  remaining distance via Redis `GEODIST`. The map canvas itself is still a
  drawn placeholder (see below) — only the distance number is real.
- **Live tender feed (WebSocket)**: `GET /ws/tenders` fans out real Redis
  pub/sub events — a new tender posted, a bid landing on one — to every
  connected partner-app client (one shared Redis subscriber for all
  sockets, not one per connection). The partner feed screen refetches on
  message instead of polling; verified with a raw WS client receiving both
  `tenders:new` and `tenders:bid` the instant they happen.
- **PostGIS nearest-port query**: `GET /ports/nearest?lat&lng` orders every
  port by real great-circle distance using the `geography(Point,4326)`
  column's `ST_Distance`/`<->` operators (see the migration in
  `apps/api/prisma/migrations/`). Provisioned and verified — see "PostGIS"
  below for how, since the sandbox's package mirror initially couldn't
  install it.
- **KYC**: provider type + port selection, per-document upload, admin
  approve/reject with the account's `kycStatus` gating the mobile app's
  routing (onboarding → under review → feed).
- **Wallet & payouts**: pending/completed transactions, withdrawal
  requests, admin pay/hold actions.
- **Company sub-accounts**: add, toggle active/inactive, and remove a team
  member from the client's profile screen (3h) — the prototype's `toggle()`
  demo state is now three real endpoints (`POST`/`PATCH`/`DELETE
  /companies/:id/sub-accounts`).
- **Disputes**: admin escrow control (release to provider / refund client /
  split), seeded with the prototype's DSP-1142 example.
- **Admin console**: all five sections (overview, KYC queue, operations,
  finance, disputes) read and write against the real API — verified with
  zero "API not reachable" states and real seeded data rendering.
- **Mobile app**: all 23 conceptual screens (13 client + 8 partner + the two
  added welcome/sign-in screens) built as real Expo Router routes, AR/EN
  toggle flips RTL/LTR app-wide, wired to the same API.

## Admin sign-in

Real sign-in, not the earlier dev-only auto-login: `apps/admin/app/sign-in`
collects a mobile number, requests an OTP through apps/api (same endpoint
every other role uses), and on verify checks the **database's** role for
that account — not anything the client claims — refusing the session
unless it's `ADMIN`. There is no admin self-registration path: apps/api's
`/auth/otp/verify` only auto-creates new accounts for
client/broker/carrier/driver. Seed an admin (see `prisma/seed.ts`, mobile
`+968900000`) or create one directly in Postgres before sign-in works.
`(admin)/layout.tsx` redirects to `/sign-in` for anyone without a session
cookie, and the sidebar now shows the real signed-in user's name/mobile
with a working sign-out button, instead of a hardcoded "Ahmed Al Saadi."

## PostGIS

Provisioned on the local dev database (`CREATE EXTENSION postgis`, now
declared in `schema.prisma`'s `datasource` block). The sandbox's default
apt mirror initially failed on `postgresql-16-postgis-3` because of a
broken `libmysqlclient21` dependency on `security.ubuntu.com`; the fix was
pulling the slightly older `8.0.36-2ubuntu3` build (plus `mysql-common`)
from the regular `archive.ubuntu.com` pocket instead, then installing
postgis normally. `Port.geog` is a real `geography(Point,4326)` column
(Prisma's `Unsupported(...)` type — read/written only via raw SQL), kept in
sync with the existing `lat`/`lng` floats by a Postgres trigger, indexed
with GiST, and queried for real by `GET /ports/nearest`.

## Deliberately simplified (and why)

- **Maps are drawn placeholders** — the design bundle's own note says to
  swap for Mapbox/Google Maps; a `<Blueprint>` box stands in throughout.
  Distance numbers next to those placeholders (freight tracking) are real,
  per the Redis GEO note above — only the visual map canvas is a stand-in.
- **Payment methods are cosmetic** — no payment gateway is integrated; the
  checkout screen's card/wallet/transfer picker doesn't charge anything
  (escrow is already funded server-side when the bid is accepted).
- **SMS/OTP delivery is not wired to a real gateway** — every request
  returns the prototype's fixed demo code. Swap `apps/api/src/lib/otp.ts`
  for Twilio/AWS SNS/a local Oman SMS provider before going live.
- **Provider reviews are aggregate, not free text** — the schema captures a
  1–5 rating plus trait tags per order (exactly what the prototype's
  rating screen collects), not written review copy. The client's provider-
  profile screen shows real aggregates and trait counts instead of
  inventing quotes.
- **Push notifications (FCM/SMS) are not implemented** — the live pieces of
  the diagram's Notification Engine box are real (see "Live tender feed"
  below); device push and SMS alerts are not.

## Everything else

Every other screen listed in the two chat-transcript scope messages, and
every field/toggle/countdown/keypad described in the prototype's embedded
`Component` state, is implemented against real data with no other known
gaps. See `docs/ARCHITECTURE.md` for the system diagram and `apps/api/README.md`
for how to run the stack locally.
