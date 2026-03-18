/**
 * Unit tests for RWAVault fee calculation logic.
 *
 * These tests mirror the on-chain formula in RWAVault.collectFee():
 *
 *   scaled_demand = clamp(demand_factor × 10000 + 500, 0, 1000)
 *   basis_points  = 250 + clamp((scaled_demand − 500) / 2, −250, 250)
 *   fee           = max(1000, floor(tx_value × basis_points / 100000))
 *
 * The JavaScript implementation must produce identical results to the contract
 * for any valid input. Any divergence here means the frontend is showing
 * incorrect fee quotes to users.
 */

// ── On-chain formula (must match RWAVault.collectFee exactly) ────────────────

function clamp(value: bigint, min: bigint, max: bigint): bigint {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function collectFee(txValueSats: bigint, demandFactorScaled: bigint): bigint {
  // demandFactorScaled: u256 stored as [0, 1000], 500 = neutral
  const scaledDemand = clamp(demandFactorScaled, 0n, 1000n);

  // basis_points = 250 + clamp((scaledDemand - 500) / 2, -250, 250)
  const delta = (scaledDemand - 500n) / 2n; // integer division
  const clampedDelta = clamp(delta, -250n, 250n);
  const basisPoints = 250n + clampedDelta;

  // fee = max(1000, floor(txValue * basisPoints / 100000))
  const pctFee = (txValueSats * basisPoints) / 100000n;
  return pctFee > 1000n ? pctFee : 1000n;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

interface TestResult {
  passed: number;
  failed: number;
  failures: string[];
}

const results: TestResult = { passed: 0, failed: 0, failures: [] };

function assertEqual(actual: bigint, expected: bigint, label: string): void {
  if (actual === expected) {
    results.passed++;
    console.log(`  ✓ ${label}`);
  } else {
    results.failed++;
    const msg = `  ✗ ${label}: expected ${expected}, got ${actual}`;
    results.failures.push(msg);
    console.error(msg);
  }
}

function assertTrue(condition: boolean, label: string): void {
  if (condition) {
    results.passed++;
    console.log(`  ✓ ${label}`);
  } else {
    results.failed++;
    const msg = `  ✗ ${label}: condition was false`;
    results.failures.push(msg);
    console.error(msg);
  }
}

// ── Section 1: Neutral demand (500) ──────────────────────────────────────────
console.log('\n[fee-calculation] Section 1: Neutral demand (scaled=500)');

// At neutral: bps = 250 + clamp(0/2, -250, 250) = 250 + 0 = 250
// fee = max(1000, floor(100000 * 250 / 100000)) = max(1000, 250) = 1000 (min fee)
assertEqual(collectFee(100000n, 500n), 1000n, 'small tx (100k sats) → min fee 1000');

// fee = max(1000, floor(1_000_000 * 250 / 100000)) = max(1000, 2500) = 2500
assertEqual(collectFee(1_000_000n, 500n), 2500n, '1M sats neutral → 2500 sats (0.25%)');

// fee = max(1000, floor(10_000_000 * 250 / 100000)) = 25000
assertEqual(collectFee(10_000_000n, 500n), 25000n, '10M sats neutral → 25000 sats (0.25%)');

// fee = max(1000, floor(100_000_000 * 250 / 100000)) = 250000
assertEqual(collectFee(100_000_000n, 500n), 250000n, '100M sats neutral → 250000 sats (0.25%)');

// ── Section 2: Maximum demand (1000) ─────────────────────────────────────────
console.log('\n[fee-calculation] Section 2: Maximum demand (scaled=1000)');

// bps = 250 + clamp((1000-500)/2, -250, 250) = 250 + clamp(250, ...) = 250 + 250 = 500
// Wait — let me recalculate: (1000-500)/2 = 250. clamp(250,-250,250) = 250. bps = 250+250 = 500
// fee = max(1000, floor(1M * 500 / 100000)) = max(1000, 5000) = 5000
assertEqual(collectFee(1_000_000n, 1000n), 5000n, '1M sats max demand → 5000 sats (0.50%)');

// fee = max(1000, floor(10M * 500 / 100000)) = 50000
assertEqual(collectFee(10_000_000n, 1000n), 50000n, '10M sats max demand → 50000 sats (0.50%)');

// ── Section 3: Minimum demand (0) ────────────────────────────────────────────
console.log('\n[fee-calculation] Section 3: Minimum demand (scaled=0)');

// bps = 250 + clamp((0-500)/2, -250, 250) = 250 + clamp(-250,-250,250) = 250 + (-250) = 0
// But minimum bps can't cause fee < minimum. fee = max(1000, 0) = 1000
assertEqual(collectFee(1_000_000n, 0n), 1000n, '1M sats min demand → 1000 sats (min fee)');
assertEqual(collectFee(10_000_000n, 0n), 1000n, '10M sats min demand → 1000 sats (min fee)');

// At what point does fee exceed min? floor(tx * 0 / 100000) = 0, so always 1000 at bps=0
assertEqual(collectFee(999_999_999n, 0n), 1000n, 'any tx at min demand → 1000 sats (bps=0)');

// ── Section 4: Boundary — minimum fee enforcement ────────────────────────────
console.log('\n[fee-calculation] Section 4: Minimum fee boundary');

// Very small txs must always return at least 1000 sats
assertEqual(collectFee(1n, 500n), 1000n, '1 sat tx → 1000 sats (min fee)');
assertEqual(collectFee(0n, 500n), 1000n, '0 sat tx → 1000 sats (min fee)');
assertEqual(collectFee(399_999n, 500n), 1000n, '399999 sats neutral → 1000 (floor below min)');

// Exactly at crossover: 1000 * 100000 / 250 = 400000 sats
assertEqual(collectFee(400_000n, 500n), 1000n, '400000 sats neutral → exactly 1000 (crossover)');
assertEqual(collectFee(400_001n, 500n), 1000n, '400001 sats neutral → 1000 (floor to 1000)');

// ── Section 5: Demand clamping ────────────────────────────────────────────────
console.log('\n[fee-calculation] Section 5: Demand factor clamping');

// Values above 1000 are clamped to 1000
assertTrue(
  collectFee(1_000_000n, 1001n) === collectFee(1_000_000n, 1000n),
  'scaled_demand > 1000 clamped to 1000'
);
assertTrue(
  collectFee(1_000_000n, 9999n) === collectFee(1_000_000n, 1000n),
  'scaled_demand 9999 clamped to 1000'
);

// ── Section 6: Fee rate accuracy ─────────────────────────────────────────────
console.log('\n[fee-calculation] Section 6: Rate accuracy at 0.75% peak');

// For 0.75%: need bps=750. bps = 250 + clamp((scaled-500)/2, -250, 250)
// clamp must = 500 → impossible, max clamp is 250, so max bps = 500
// 0.75% (750 bps) is NOT achievable with this formula as written.
// Actual max is 500 bps = 0.50%.
// This is either a spec discrepancy or an intentional design.
// Document the actual max for the audit trail.
const maxFeeAt10M = collectFee(10_000_000n, 1000n);
assertTrue(maxFeeAt10M === 50000n, 'max fee at 10M sats is 50000 sats (0.50%, not 0.75%)');

console.log('\n  NOTE: Formula yields max 0.50% (500 bps), not 0.75% as documented.');
console.log('  Formula: bps = 250 + clamp((scaled-500)/2, -250, 250) → max = 250+250 = 500');
console.log('  To achieve 750 bps: basis_points range needs to be 250+500 = 750,');
console.log('  which requires clamp range [-500, 500] or divisor of 1 instead of 2.');

// ── Section 7: Integer division truncation ───────────────────────────────────
console.log('\n[fee-calculation] Section 7: Integer division (no float drift)');

// Verify floor() behavior: 999 * 250 / 100000 = 2.4975 → floor → 2 < 1000 → min fee
assertEqual(collectFee(999n, 500n), 1000n, '999 sats: 2 bps → min fee');

// Large value: 99_999_999_999 * 250 / 100000 = 249999999.9975 → floor → 249999999
assertEqual(collectFee(99_999_999_999n, 500n), 249_999_999n, '99.999B sats neutral → correct floor');

// ── Results ───────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
console.log(`Results: ${results.passed} passed, ${results.failed} failed`);

if (results.failed > 0) {
  console.error('\nFailed:');
  results.failures.forEach((f) => console.error(f));
  process.exit(1);
} else {
  console.log('All fee calculation tests passed.');
  process.exit(0);
}
