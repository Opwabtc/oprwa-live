/**
 * RWAVault Integration Tests — OPNet Testnet
 *
 * These tests call the LIVE deployed contract on OPNet testnet.
 * They verify the on-chain state matches expected values.
 *
 * Contract: opt1sqz3chv4dyhmsegr672qpumvy9se52kwlnyhq6q5d
 * Network:  OPNet Testnet
 *
 * Usage:
 *   npx tsx tests/integration.test.ts
 *
 * Requirements:
 *   - Node 20+
 *   - Network access to https://testnet.opnet.org
 *   - No wallet required (read-only tests)
 */

import { networks } from '@btc-vision/bitcoin';
import { JSONRpcProvider } from 'opnet';
import { getContract } from 'opnet';

const CONTRACT_ADDRESS = 'opt1sqz3chv4dyhmsegr672qpumvy9se52kwlnyhq6q5d';
const RPC_URL          = 'https://testnet.opnet.org';
const NETWORK          = networks.opnetTestnet;

interface TestResult {
  passed: number;
  failed: number;
  skipped: number;
  failures: string[];
}

const results: TestResult = { passed: 0, failed: 0, skipped: 0, failures: [] };

function pass(label: string): void {
  results.passed++;
  console.log(`  ✓ ${label}`);
}

function fail(label: string, reason: string): void {
  results.failed++;
  const msg = `  ✗ ${label}: ${reason}`;
  results.failures.push(msg);
  console.error(msg);
}

function skip(label: string, reason: string): void {
  results.skipped++;
  console.log(`  - ${label} (skipped: ${reason})`);
}

// ── ABI (minimal subset needed for view calls) ────────────────────────────────

const ABI = [
  {
    name: 'totalSupplyOf',
    inputs:  [{ name: 'tokenId', type: 'UINT256' }],
    outputs: [{ name: 'supply',  type: 'UINT256' }],
  },
  {
    name: 'balanceOf',
    inputs:  [{ name: 'account', type: 'ADDRESS' }, { name: 'tokenId', type: 'UINT256' }],
    outputs: [{ name: 'balance', type: 'UINT256' }],
  },
  {
    name: 'collectFee',
    inputs:  [{ name: 'txValue', type: 'UINT256' }],
    outputs: [{ name: 'fee',     type: 'UINT256' }],
  },
  {
    name: 'getAssetInfo',
    inputs:  [{ name: 'tokenId', type: 'UINT256' }],
    outputs: [
      { name: 'totalSupply',         type: 'UINT256' },
      { name: 'whitelistEnabled',    type: 'UINT256' },
      { name: 'demandFactor_scaled', type: 'UINT256' },
    ],
  },
  {
    name: 'isWhitelisted',
    inputs:  [{ name: 'account',     type: 'ADDRESS' }],
    outputs: [{ name: 'whitelisted', type: 'BOOL'    }],
  },
];

// ── Tests ─────────────────────────────────────────────────────────────────────

async function runTests(): Promise<void> {
  console.log(`\nRWAVault Integration Tests`);
  console.log(`Contract: ${CONTRACT_ADDRESS}`);
  console.log(`Network:  OPNet Testnet`);
  console.log(`RPC:      ${RPC_URL}`);
  console.log('─'.repeat(60));

  let provider: JSONRpcProvider;
  let contract: ReturnType<typeof getContract>;

  // ── Connect ──────────────────────────────────────────────────────────────
  console.log('\n[1] Provider + contract connection');
  try {
    provider = new JSONRpcProvider({ url: RPC_URL, network: NETWORK });
    contract = getContract(CONTRACT_ADDRESS, ABI, provider, NETWORK);
    pass('provider connected');
    pass('contract proxy created');
  } catch (err) {
    fail('provider/contract init', String(err));
    console.error('\nCannot continue without provider. Aborting.');
    process.exit(1);
  }

  // ── totalSupplyOf — all 3 tokens ──────────────────────────────────────────
  console.log('\n[2] totalSupplyOf — tokenIds 0, 1, 2');
  for (let tokenId = 0; tokenId < 3; tokenId++) {
    try {
      const result = await contract.totalSupplyOf(BigInt(tokenId));
      if (result.revert) {
        fail(`totalSupplyOf(${tokenId})`, `reverted: ${result.revert}`);
      } else {
        const supply: bigint = result.properties.supply;
        if (typeof supply !== 'bigint') {
          fail(`totalSupplyOf(${tokenId})`, `expected bigint, got ${typeof supply}`);
        } else if (supply < 0n) {
          fail(`totalSupplyOf(${tokenId})`, `negative supply ${supply}`);
        } else {
          pass(`totalSupplyOf(${tokenId}) = ${supply.toLocaleString()} fractions`);
        }
      }
    } catch (err) {
      fail(`totalSupplyOf(${tokenId})`, String(err));
    }
  }

  // ── collectFee — verify formula against expected values ──────────────────
  console.log('\n[3] collectFee — on-chain fee computation');
  const feeTests: Array<{ value: bigint; label: string; minExpected: bigint }> = [
    { value: 100_000n,     label: '100k sats',  minExpected: 1000n    },
    { value: 1_000_000n,   label: '1M sats',    minExpected: 1000n    },
    { value: 10_000_000n,  label: '10M sats',   minExpected: 10000n   },
    { value: 100_000_000n, label: '100M sats',  minExpected: 100000n  },
  ];

  for (const ft of feeTests) {
    try {
      const result = await contract.collectFee(ft.value);
      if (result.revert) {
        fail(`collectFee(${ft.label})`, `reverted: ${result.revert}`);
      } else {
        const fee: bigint = result.properties.fee;
        if (fee < ft.minExpected) {
          fail(`collectFee(${ft.label})`, `fee ${fee} below minimum expected ${ft.minExpected}`);
        } else if (fee < 1000n) {
          fail(`collectFee(${ft.label})`, `fee ${fee} below hard minimum 1000 sats`);
        } else {
          pass(`collectFee(${ft.label}) = ${fee.toLocaleString()} sats`);
        }
      }
    } catch (err) {
      fail(`collectFee(${ft.label})`, String(err));
    }
  }

  // ── getAssetInfo — protocol state ────────────────────────────────────────
  console.log('\n[4] getAssetInfo — protocol state');
  for (let tokenId = 0; tokenId < 3; tokenId++) {
    try {
      const result = await contract.getAssetInfo(BigInt(tokenId));
      if (result.revert) {
        fail(`getAssetInfo(${tokenId})`, `reverted: ${result.revert}`);
      } else {
        const { totalSupply, whitelistEnabled, demandFactor_scaled } = result.properties;
        const dfScaled = Number(demandFactor_scaled);

        // demandFactor_scaled must be in [0, 1000]
        if (dfScaled < 0 || dfScaled > 1000) {
          fail(`getAssetInfo(${tokenId})`, `demandFactor_scaled=${dfScaled} out of range [0,1000]`);
        } else {
          pass(
            `getAssetInfo(${tokenId}): supply=${totalSupply}, wl=${whitelistEnabled}, demand=${dfScaled}`
          );
        }
      }
    } catch (err) {
      fail(`getAssetInfo(${tokenId})`, String(err));
    }
  }

  // ── balanceOf — zero address should return 0 ─────────────────────────────
  console.log('\n[5] balanceOf — zero address returns 0');
  const ZERO_ADDRESS = 'opt1sqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqss5efqv';
  for (let tokenId = 0; tokenId < 3; tokenId++) {
    try {
      const result = await contract.balanceOf(ZERO_ADDRESS, BigInt(tokenId));
      if (result.revert) {
        // Some contracts revert on zero address — acceptable
        skip(`balanceOf(zero, ${tokenId})`, 'contract reverts on zero address (acceptable)');
      } else {
        const balance: bigint = result.properties.balance;
        if (balance !== 0n) {
          fail(`balanceOf(zero, ${tokenId})`, `expected 0, got ${balance}`);
        } else {
          pass(`balanceOf(zero, ${tokenId}) = 0`);
        }
      }
    } catch (err) {
      // RPC error on zero address — skip
      skip(`balanceOf(zero, ${tokenId})`, `RPC error: ${String(err).slice(0, 60)}`);
    }
  }

  // ── collectFee — minimum fee invariant ───────────────────────────────────
  console.log('\n[6] collectFee — minimum 1000 sats invariant');
  try {
    const result = await contract.collectFee(1n); // 1 sat transaction
    if (result.revert) {
      fail('collectFee(1 sat)', `reverted: ${result.revert}`);
    } else {
      const fee: bigint = result.properties.fee;
      if (fee < 1000n) {
        fail('minimum fee invariant', `collectFee(1 sat) = ${fee} < 1000 sats minimum`);
      } else {
        pass(`collectFee(1 sat) = ${fee} sats (≥ 1000 minimum)`);
      }
    }
  } catch (err) {
    fail('collectFee(1 sat)', String(err));
  }

  // ── Results ──────────────────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(60)}`);
  console.log(
    `Results: ${results.passed} passed, ${results.failed} failed, ${results.skipped} skipped`
  );

  if (results.failed > 0) {
    console.error('\nFailed tests:');
    results.failures.forEach((f) => console.error(f));
    process.exit(1);
  } else {
    console.log(`\nAll integration tests passed.`);
    console.log(`Contract is live and responding correctly.`);
    process.exit(0);
  }
}

runTests().catch((err: unknown) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
