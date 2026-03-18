/**
 * Deterministic pricing engine — mirrors RWAVault.collectFee() contract logic exactly.
 * Same inputs ALWAYS produce the same outputs.
 */

/**
 * Compute demand factor from rolling 24h buy/sell volumes and pool liquidity.
 * Result is clamped to [-0.05, 0.05].
 */
export function computeDemandFactor(
  buys: number,
  sells: number,
  liquidity: number,
  k: number = 0.05,
): number {
  if (liquidity === 0) return 0;
  const raw = (k * (buys - sells)) / liquidity;
  return Math.max(-0.05, Math.min(0.05, raw));
}

/**
 * Convert real demand_factor to scaled integer [0, 1000].
 * 500 = neutral (demand_factor = 0)
 * 0   = min demand (demand_factor = -0.05)
 * 1000 = max demand (demand_factor = +0.05)
 */
export function toScaled(demandFactor: number): number {
  return Math.round(500 + demandFactor * 10000);
}

/**
 * Compute price per fraction.
 * price = nav * (1 + spread + demandFactor)
 * nav is expressed per-fraction (nav / total_fractions), result is in sats.
 */
export function computePrice(nav: number, spread: number, demandFactor: number): number {
  return Math.round(nav * (1 + spread + demandFactor));
}

/**
 * Compute fee mirroring contract collectFee() logic exactly.
 *
 * scaled in [0, 1000]:
 *   if scaled >= 500: bps = 250 + (scaled - 500) / 2
 *   if scaled < 500:  bps = 250 - (500 - scaled) / 2
 *   clamp bps to [250, 750]
 *   pctFee = floor(txValue * bps / 100000)
 *   fee = max(1000, pctFee)
 */
export function computeFee(txValue: number, demandFactor: number): number {
  const scaled = toScaled(demandFactor);
  let bps: number;
  if (scaled >= 500) {
    bps = 250 + (scaled - 500) / 2;
  } else {
    bps = 250 - (500 - scaled) / 2;
  }
  bps = Math.max(250, Math.min(750, bps));
  const pctFee = Math.floor((txValue * bps) / 100000);
  return Math.max(1000, pctFee);
}
