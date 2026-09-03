# @BARQ/api

Fastify + Prisma backend for BARQ.

## Local dev

```bash
# from the repo root
docker compose up -d          # Postgres+PostGIS, Redis
cp apps/api/.env.example apps/api/.env
pnpm install
pnpm --filter @BARQ/api prisma:generate
pnpm --filter @BARQ/api prisma:migrate
pnpm --filter @BARQ/api seed
pnpm dev:api                   # http://localhost:4000
```

`GET /health` confirms the server is up. Every route in `src/routes/` has a
comment naming the prototype screen it backs (e.g. "1b — bid comparison").

There is no SMS gateway wired up yet (see the Notification Engine box in
`docs/ARCHITECTURE.md`) — every OTP request logs and accepts the prototype's
demo code, `482715`, exactly like the design's OTP screens say.
