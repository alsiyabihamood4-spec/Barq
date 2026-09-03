"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Blueprint } from "../../components/Blueprint";

/** Real admin sign-in: mobile + SMS OTP, same mechanism as the client and
 * partner apps. Replaces the old dev-only auto-login — the design bundle
 * has no admin sign-in screen of its own (the console assumes
 * pre-authenticated ops staff), so this borrows the pattern from 6b/3b. */
export default function SignInPage() {
  const router = useRouter();
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestOtp() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      if (!res.ok) throw new Error("Could not send the code");
      setStep("otp");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mobile, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Sign-in failed");
      router.push("/overview");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-bg text-ink px-4">
      <Blueprint className="w-full max-w-sm p-6 flex flex-col gap-4">
        <div>
          <span className="mono text-[10px] bg-accent text-bg px-1.5 py-0.5 tracking-widest">BARQ ADMIN</span>
          <h1 className="text-[22px] font-semibold tracking-wide mt-3">Sign in</h1>
          <p className="text-[12.5px] text-ink/58 mt-1">Ops staff only — sign in with your registered mobile number.</p>
        </div>

        {step === "mobile" ? (
          <>
            <label className="flex flex-col gap-1.5">
              <span className="lbl">Mobile number</span>
              <input
                className="border border-divider bg-transparent px-3 py-2.5 text-[14px] mono focus:border-accent outline-none"
                placeholder="+968 9 000 000"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                autoFocus
              />
            </label>
            <button
              onClick={requestOtp}
              disabled={loading || mobile.length < 6}
              className="bg-accent text-bg py-2.5 text-[13px] font-semibold tracking-wide disabled:opacity-50"
            >
              {loading ? "Sending…" : "SEND CODE"}
            </button>
          </>
        ) : (
          <>
            <label className="flex flex-col gap-1.5">
              <span className="lbl">Verification code</span>
              <input
                className="border border-divider bg-transparent px-3 py-2.5 text-[16px] mono tracking-[0.3em] text-center focus:border-accent outline-none"
                placeholder="······"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                autoFocus
              />
            </label>
            <p className="text-[11px] text-ink/48 mono">DEMO CODE IS 482715</p>
            <button
              onClick={verifyOtp}
              disabled={loading || code.length !== 6}
              className="bg-accent text-bg py-2.5 text-[13px] font-semibold tracking-wide disabled:opacity-50"
            >
              {loading ? "Verifying…" : "VERIFY & SIGN IN"}
            </button>
            <button onClick={() => setStep("mobile")} className="text-[11.5px] text-ink/55 text-center">
              Use a different number
            </button>
          </>
        )}

        {error && <p className="text-[12px] text-accent-800 border border-accent-400 bg-accent-100 px-3 py-2">{error}</p>}
      </Blueprint>
    </div>
  );
}
