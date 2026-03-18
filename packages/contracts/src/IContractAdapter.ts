/**
 * IContractAdapter — frontend and backend ONLY interact with this interface.
 * Implementation (RWAVaultAdapter) is injected via React context.
 * Swappable: testnet/mainnet/test implementations are interchangeable.
 */

export interface TxResult {
  txId: string;
  status: 'PENDING' | 'SETTLED' | 'FAILED';
  error?: string;
}

export interface IContractAdapter {
  /**
   * Mint fractions of an RWA token to the caller's address.
   * Admin-only on mainnet; auto-approved on testnet.
   */
  mint(assetId: string, amount: bigint): Promise<TxResult>;

  /**
   * Burn fractions held by the caller.
   */
  burn(assetId: string, amount: bigint): Promise<TxResult>;

  /**
   * Transfer fractions to another address.
   * Whitelist-gated when whitelist is enabled.
   */
  transfer(to: string, assetId: string, amount: bigint): Promise<TxResult>;

  /**
   * Get the caller's balance of a specific asset.
   */
  balanceOf(address: string, assetId: string): Promise<bigint>;

  /**
   * Compute the fee for a transaction value (in sats).
   * Mirrors the on-chain collectFee() logic exactly.
   */
  collectFee(txValue: bigint): Promise<bigint>;

  /**
   * Check whether an address is whitelisted.
   * Always returns true on testnet.
   */
  isWhitelisted(address: string): Promise<boolean>;
}
