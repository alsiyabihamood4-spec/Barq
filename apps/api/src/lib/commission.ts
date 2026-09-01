/**
 * Platform commission split — 15% by default (tunable 5–25% in the
 * prototype's tweak panel, `COMMISSION_PCT` env var here). Charged to the
 * provider, never the client: the client's escrow total is untouched, and
 * the provider's payout is the bid amount net of commission.
 */
export function splitCommission(amountOmr: number, commissionPct: number) {
  const commissionOmr = round3((amountOmr * commissionPct) / 100);
  const netOmr = round3(amountOmr - commissionOmr);
  return { amountOmr: round3(amountOmr), commissionPct, commissionOmr, netOmr };
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
