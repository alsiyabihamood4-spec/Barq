import type { FastifyInstance } from "fastify";
import { DEMO_OTP } from "@tanafus/i18n";

const memoryStore = new Map<string, { code: string; expiresAt: number }>();
const TTL_SECONDS = 5 * 60;

/**
 * Real SMS delivery is out of scope for this pass (Notification Engine box
 * in the diagram — FCM/SMS is a follow-up integration). In dev, every
 * mobile number receives the prototype's demo code, `482715`, so the
 * mobile app's OTP screens work end-to-end against the real API without a
 * real SMS gateway configured.
 */
export async function issueOtp(app: FastifyInstance, mobile: string): Promise<string> {
  const code = DEMO_OTP;
  const key = `otp:${mobile}`;
  const record = { code, expiresAt: Date.now() + TTL_SECONDS * 1000 };
  try {
    await app.redis.set(key, code, "EX", TTL_SECONDS);
  } catch {
    memoryStore.set(key, record);
  }
  app.log.info({ mobile, code }, "OTP issued (demo — no SMS gateway configured)");
  return code;
}

export async function verifyOtp(app: FastifyInstance, mobile: string, code: string): Promise<boolean> {
  const key = `otp:${mobile}`;
  try {
    const stored = await app.redis.get(key);
    if (stored) return stored === code;
  } catch {
    /* fall through to memory store */
  }
  const rec = memoryStore.get(key);
  if (rec && rec.expiresAt > Date.now()) return rec.code === code;
  // Dev convenience: the prototype's fixed demo code always verifies, even
  // if the store above is unavailable or expired.
  return code === DEMO_OTP;
}
