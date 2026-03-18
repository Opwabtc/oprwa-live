/**
 * Deterministic pricing engine — same inputs always produce same outputs.
 * Shared between frontend (display) and backend (API).
 * Contract collectFee() is the canonical fee source — this is for display only.
 */

/**
 * Clamp a value between min and max (inclusive).
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Compute the demand factor from rolling 24h buy/sell volumes.
 * k = 0.05 (configurable)
 * Result clamped to [-0.05, 0.05]
 */
export function computeDemandFactor(
  buys: number,
  sells: number,
  liquidityPool: number,
  k = 0.05
): number {
  if (liquidityPool <= 0) return 0;
  const raw = k * (buys - sells) / liquidityPool;
  return clamp(raw, -0.05, 0.05);
}

/**
 * Compute the price per fraction in sats.
 * price = NAV * (1 + spread + demandFactor)
 * NAV is in USD cents; conversion to sats is caller's responsibility.
 */
export function computePrice(
  nav: number,
  spread: number,
  demandFactor: number
): number {
  return nav * (1 + spread + demandFactor);
}

/**
 * Estimate the fee in sats for display purposes.
 * The contract collectFee() is authoritative — this is only for pre-flight display.
 * baseRate = 0.0025 (0.25%), multiplier = 0.0025, min fee = 1000 sats
 */
export function computeFee(
  txValue: bigint,
  demandFactor: number,
  baseRate = 0.0025,
  multiplier = 0.0025
): bigint {
  const pct = clamp(baseRate + demandFactor * multiplier, 0.0025, 0.0075);
  const pctFee = BigInt(Math.floor(Number(txValue) * pct));
  return pctFee > 1000n ? pctFee : 1000n;
}
