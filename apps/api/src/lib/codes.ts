function randomDigits(n: number): string {
  let s = "";
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
  return s;
}

export function generateTenderCode(): string {
  return `TND-${4000 + Math.floor(Math.random() * 999)}`;
}
export function generateOrderCode(): string {
  return `ORD-${800 + Math.floor(Math.random() * 999)}`;
}
export function generateWithdrawalCode(): string {
  return `WDR-${200 + Math.floor(Math.random() * 99)}`;
}
export function generateDisputeCode(): string {
  return `DSP-${1000 + Math.floor(Math.random() * 999)}`;
}
export function generateDeliveryOtp(): string {
  return randomDigits(6);
}
