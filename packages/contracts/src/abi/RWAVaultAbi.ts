/**
 * RWAVault contract ABI in OPNet SDK format.
 * Uses ABIDataTypes and BitcoinAbiTypes from the opnet/btc-vision packages.
 */

import { ABIDataTypes } from '@btc-vision/transaction';
import { BitcoinAbiTypes } from 'opnet';
import type { BitcoinInterfaceAbi } from 'opnet';

export const RWA_VAULT_ABI: BitcoinInterfaceAbi = [
  {
    name: 'mint',
    type: BitcoinAbiTypes.Function,
    inputs: [
      { name: 'to', type: ABIDataTypes.ADDRESS },
      { name: 'tokenId', type: ABIDataTypes.UINT256 },
      { name: 'amount', type: ABIDataTypes.UINT256 },
    ],
    outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
  },
  {
    name: 'purchase',
    type: BitcoinAbiTypes.Function,
    inputs: [
      { name: 'tokenId', type: ABIDataTypes.UINT256 },
      { name: 'amount', type: ABIDataTypes.UINT256 },
    ],
    outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
  },
  {
    name: 'burn',
    type: BitcoinAbiTypes.Function,
    inputs: [
      { name: 'from', type: ABIDataTypes.ADDRESS },
      { name: 'tokenId', type: ABIDataTypes.UINT256 },
      { name: 'amount', type: ABIDataTypes.UINT256 },
    ],
    outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
  },
  {
    name: 'transfer',
    type: BitcoinAbiTypes.Function,
    inputs: [
      { name: 'to', type: ABIDataTypes.ADDRESS },
      { name: 'tokenId', type: ABIDataTypes.UINT256 },
      { name: 'amount', type: ABIDataTypes.UINT256 },
    ],
    outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
  },
  {
    name: 'balanceOf',
    type: BitcoinAbiTypes.Function,
    inputs: [
      { name: 'account', type: ABIDataTypes.ADDRESS },
      { name: 'tokenId', type: ABIDataTypes.UINT256 },
    ],
    outputs: [{ name: 'balance', type: ABIDataTypes.UINT256 }],
  },
  {
    name: 'totalSupplyOf',
    type: BitcoinAbiTypes.Function,
    inputs: [{ name: 'tokenId', type: ABIDataTypes.UINT256 }],
    outputs: [{ name: 'supply', type: ABIDataTypes.UINT256 }],
  },
  {
    name: 'collectFee',
    type: BitcoinAbiTypes.Function,
    inputs: [{ name: 'txValue', type: ABIDataTypes.UINT256 }],
    outputs: [{ name: 'fee', type: ABIDataTypes.UINT256 }],
  },
  {
    name: 'isWhitelisted',
    type: BitcoinAbiTypes.Function,
    inputs: [{ name: 'account', type: ABIDataTypes.ADDRESS }],
    outputs: [{ name: 'whitelisted', type: ABIDataTypes.BOOL }],
  },
  {
    name: 'getAssetInfo',
    type: BitcoinAbiTypes.Function,
    inputs: [{ name: 'tokenId', type: ABIDataTypes.UINT256 }],
    outputs: [
      { name: 'totalSupply', type: ABIDataTypes.UINT256 },
      { name: 'whitelistEnabled', type: ABIDataTypes.UINT256 },
      { name: 'demandFactor_scaled', type: ABIDataTypes.UINT256 },
    ],
  },
  {
    name: 'setDemandFactor',
    type: BitcoinAbiTypes.Function,
    inputs: [{ name: 'scaledValue', type: ABIDataTypes.UINT256 }],
    outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
  },
  {
    name: 'setWhitelistEnabled',
    type: BitcoinAbiTypes.Function,
    inputs: [{ name: 'enabled', type: ABIDataTypes.BOOL }],
    outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
  },
  {
    name: 'setWhitelist',
    type: BitcoinAbiTypes.Function,
    inputs: [
      { name: 'account', type: ABIDataTypes.ADDRESS },
      { name: 'approved', type: ABIDataTypes.BOOL },
    ],
    outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
  },
  {
    name: 'setTreasury',
    type: BitcoinAbiTypes.Function,
    inputs: [{ name: 'treasury', type: ABIDataTypes.ADDRESS }],
    outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
  },
  {
    name: 'getTreasury',
    type: BitcoinAbiTypes.Function,
    inputs: [],
    outputs: [{ name: 'treasury', type: ABIDataTypes.ADDRESS }],
  },
];
