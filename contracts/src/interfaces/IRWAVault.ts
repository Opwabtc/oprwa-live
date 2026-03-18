/**
 * IRWAVault — Interface reference for RWAVault ABI generation.
 *
 * This file documents the public interface of RWAVault for tooling purposes.
 * It is NOT imported by the contract itself.
 *
 * Methods:
 *   mint(to: Address, tokenId: u256, amount: u256) → bool
 *   burn(from: Address, tokenId: u256, amount: u256) → bool
 *   transfer(to: Address, tokenId: u256, amount: u256) → bool
 *   balanceOf(account: Address, tokenId: u256) → u256
 *   totalSupplyOf(tokenId: u256) → u256
 *   collectFee(txValue: u256) → u256
 *   setDemandFactor(scaledValue: u256) → bool
 *   setWhitelistEnabled(enabled: bool) → bool
 *   setWhitelist(account: Address, approved: bool) → bool
 *   isWhitelisted(account: Address) → bool
 *   getAssetInfo(tokenId: u256) → (totalSupply: u256, whitelistEnabled: u256, demandFactor_scaled: u256)
 *
 * Fee Logic:
 *   demandFactor stored as u256 in [0, 1000]:
 *     0   = -0.05 demand (lowest fee)
 *     500 = 0.0 demand (base fee = 250 bps)
 *     1000 = +0.05 demand (highest fee)
 *   basisPoints computation (all integer math, no floats):
 *     if stored >= 500: basisPoints = 250 + (stored - 500) / 2  → max 750
 *     if stored < 500:  basisPoints = 250 - (500 - stored) / 2  → min 250 (clamped)
 *   pctFee = txValue * basisPoints / 100000
 *   fee = max(pctFee, 1000 sats)
 */

export {};
