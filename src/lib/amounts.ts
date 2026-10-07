export const SCALE = 10n ** 18n;
export const MAX_AMOUNT = 1_000_000n * SCALE;
export function parseAmount(input: string): bigint {
  if (!/^\d+(\.\d{1,2})?$/.test(input.trim()))
    throw new Error("Enter an amount with up to 2 decimal places.");
  const [whole, fraction = ""] = input.trim().split(".");
  const amount =
    BigInt(whole) * SCALE + BigInt(fraction.padEnd(2, "0")) * 10n ** 16n;
  if (amount <= 0n || amount > MAX_AMOUNT)
    throw new Error("Enter an amount between 0.01 and 1,000,000 USDC.");
  return amount;
}
export function parsePercent(input: string): number {
  if (!/^\d+(\.\d{1,2})?$/.test(input.trim()))
    throw new Error("Use percentages with up to 2 decimal places.");
  const [whole, fraction = ""] = input.trim().split(".");
  const bps = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(bps) || bps < 1 || bps > 10000)
    throw new Error("Each share must be greater than 0% and at most 100%.");
  return bps;
}
export function allocation(amount: bigint, bps: number[]): bigint[] {
  if (
    !bps.length ||
    bps.some((n) => !Number.isInteger(n) || n < 1) ||
    bps.reduce((a, b) => a + b, 0) !== 10000
  )
    throw new Error("Shares must total 100%.");
  let allocated = 0n;
  return bps.map((n, i) => {
    const share =
      i === bps.length - 1 ? amount - allocated : (amount * BigInt(n)) / 10000n;
    allocated += share;
    return share;
  });
}
// Show up to six decimal places so a tiny share is never silently rounded to zero.
export function formatMoney(value: bigint): string {
  const whole = value / SCALE;
  const fraction = (value % SCALE)
    .toString()
    .padStart(18, "0")
    .slice(0, 6)
    .replace(/0+$/, "")
    .padEnd(2, "0");
  return `${whole.toLocaleString("en-US")}.${fraction}`;
}
export const percent = (bps: number) => `${bps / 100}%`;
export const shortAddress = (address: string) =>
  `${address.slice(0, 6)}…${address.slice(-4)}`;
