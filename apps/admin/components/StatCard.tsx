export function StatRow({ stats }: { stats: { ar: string; en: string; v: string; note: string; accent?: boolean }[] }) {
  return (
    <div className="grid grid-cols-4 border border-divider">
      {stats.map((s, i) => (
        <div key={i} className="border-e border-divider px-4 py-3 last:border-e-0">
          <div className="lbl text-[8.5px]">
            <span className="ar">{s.ar}</span>
            <span className="en">{s.en}</span>
          </div>
          <div className={`mono text-[25px] font-semibold leading-none mt-1.5 ${s.accent ? "text-accent-700" : "text-ink"}`}>{s.v}</div>
          <div className="mono text-[9.5px] text-ink/50 mt-1">{s.note}</div>
        </div>
      ))}
    </div>
  );
}
