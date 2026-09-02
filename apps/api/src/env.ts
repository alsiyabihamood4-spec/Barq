import "dotenv/config";

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Missing required env var ${name}`);
  return v;
}

export const env = {
  databaseUrl: required("DATABASE_URL"),
  redisUrl: required("REDIS_URL", "redis://localhost:6379"),
  jwtSecret: required("JWT_SECRET", "dev-secret-change-me"),
  port: Number(process.env.PORT ?? 4000),
  commissionPct: Number(process.env.COMMISSION_PCT ?? 15),
};
