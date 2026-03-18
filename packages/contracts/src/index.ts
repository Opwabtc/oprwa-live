export type { IContractAdapter, TxResult } from './IContractAdapter.js';
export { OPNetRWAVaultAdapter, RWAVaultAdapter, TestAdapter } from './RWAVaultAdapter.js';

import deployedAddress from './deployed-address.json' assert { type: 'json' };

/** Default contract address — 'PENDING' until deployment. Overridden via VITE_CONTRACT_ADDRESS. */
export const CONTRACT_ADDRESS: string = deployedAddress.rwaVault ?? 'PENDING';

export const NETWORK = 'testnet' as const;
