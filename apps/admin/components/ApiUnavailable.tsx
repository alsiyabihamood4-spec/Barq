export function ApiUnavailable({ detail }: { detail?: string | null }) {
  return (
    <div className="border border-divider p-6 text-center text-[13px] text-ink/60">
      <div className="lbl mb-2">API NOT REACHABLE</div>
      <p>Could not reach apps/api on {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}.</p>
      {detail && <p className="mono text-[11px] mt-2 text-ink/40">{detail}</p>}
      <p className="mt-2">
        Run <code className="mono">docker compose up -d && pnpm dev:api</code> from the repo root, then reload.
      </p>
    </div>
  );
}
