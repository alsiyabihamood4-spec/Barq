# Implementation status

What's real vs. what's simplified, so nobody discovers the gaps the hard way.

## Fully working end-to-end (verified against a running Postgres + the API)

- **Auth**: OTP request/verify (demo code `482715`, matching the prototype),
  JWT sessions, role assignment, company linking on sign-up.
- **Tender → bid → award → escrow**: post a tender, submit competing bids,
  accept one → order created, escrow entry held, commission split computed
  (15% default, `COMMISSION_PCT` env var).
- **Order execution**: stage advance (assigned → declaration → inspection →
  released → in_transit → delivered), OTP-gated delivery confirmation,
  escrow release into the provider's wallet, client rating rolled into the
  provider's running average.
- **KYC**: provider type + port selection, per-document upload, admin
  approve/reject with the account's `kycStatus` gating the mobile app's
  routing (onboarding → under review → feed).
- **Wallet & payouts**: pending/completed transactions, withdrawal
  requests, admin pay/hold actions.
- **Disputes**: admin escrow control (release to provider / refund client /
  split), seeded with the prototype's DSP-1142 example.
- **Admin console**: all five sections (overview, KYC queue, operations,
  finance, disputes) read and write against the real API — verified with
  zero "API not reachable" states and real seeded data rendering.
- **Mobile app**: all 23 conceptual screens (13 client + 8 partner + the two
  added welcome/sign-in screens) built as real Expo Router routes, AR/EN
  toggle flips RTL/LTR app-wide, wired to the same API.

## Deliberately simplified (and why)

- **Maps are drawn placeholders** — the design bundle's own note says to
  swap for Mapbox/Google Maps; a `<Blueprint>` box stands in throughout.
- **Payment methods are cosmetic** — no payment gateway is integrated; the
  checkout screen's card/wallet/transfer picker doesn't charge anything
  (escrow is already funded server-side when the bid is accepted).
- **SMS/OTP delivery is not wired to a real gateway** — every request
  returns the prototype's fixed demo code. Swap `apps/api/src/lib/otp.ts`
  for Twilio/AWS SNS/a local Oman SMS provider before going live.
- **PostGIS is not provisioned locally** — the Prisma schema stores port
  and (future) vehicle coordinates as plain lat/lng floats; the
  architecture doc explains how to add a real `geography(Point,4326)`
  column via a raw migration once geo-fence queries are needed. The apt
  mirror in this sandbox couldn't install `postgresql-16-postgis-3`
  (broken `libmysqlclient21` dependency on `security.ubuntu.com`); nothing
  in the code depends on the extension actually being present.
- **Admin sign-in is a dev-only auto-login** (`/api/dev-login`) — the design
  bundle has no admin sign-in screen (the console assumes pre-authenticated
  ops staff). Replace with real staff SSO / National Digital ID before
  production; the route is clearly commented as dev-only.
- **Provider reviews are aggregate, not free text** — the schema captures a
  1–5 rating plus trait tags per order (exactly what the prototype's
  rating screen collects), not written review copy. The client's provider-
  profile screen shows real aggregates and trait counts instead of
  inventing quotes.
- **The clearance stage machine is linear for both services** — freight
  orders walk through the same assigned→declaration→inspection→released→
  in_transit→delivered sequence as clearance orders for now, rather than a
  service-specific state machine. Good enough for the demo flow; a real
  build should branch by `service`.
- **Notification Engine (FCM/SMS/WebSocket) is not implemented** — Redis is
  wired up and used for OTP storage and a tender-created pub/sub publish,
  but no consumer/push delivery exists yet.
- **Company sub-account management is view-only** on the client's profile
  screen (no add/remove/permission UI) — the API list endpoint exists,
  writes weren't in scope for this pass.

## Everything else

Every other screen listed in the two chat-transcript scope messages, and
every field/toggle/countdown/keypad described in the prototype's embedded
`Component` state, is implemented against real data with no other known
gaps. See `docs/ARCHITECTURE.md` for the system diagram and `apps/api/README.md`
for how to run the stack locally.
