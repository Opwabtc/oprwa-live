import { Address, AddressMap, ExtendedAddressMap, SchnorrSignature } from '@btc-vision/transaction';
import { CallResult, OPNetEvent, IOP_NETContract } from 'opnet';

// ------------------------------------------------------------------
// Event Definitions
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// Call Results
// ------------------------------------------------------------------

/**
 * @description Represents the result of the mint function call.
 */
export type Mint = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the purchase function call.
 */
export type Purchase = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the burn function call.
 */
export type Burn = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the transfer function call.
 */
export type Transfer = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the balanceOf function call.
 */
export type BalanceOf = CallResult<
    {
        balance: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the totalSupplyOf function call.
 */
export type TotalSupplyOf = CallResult<
    {
        supply: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the collectFee function call.
 */
export type CollectFee = CallResult<
    {
        fee: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the setDemandFactor function call.
 */
export type SetDemandFactor = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the setWhitelistEnabled function call.
 */
export type SetWhitelistEnabled = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the setWhitelist function call.
 */
export type SetWhitelist = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the isWhitelisted function call.
 */
export type IsWhitelisted = CallResult<
    {
        whitelisted: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getAssetInfo function call.
 */
export type GetAssetInfo = CallResult<
    {
        totalSupply: bigint;
        whitelistEnabled: bigint;
        demandFactor_scaled: bigint;
    },
    OPNetEvent<never>[]
>;

// ------------------------------------------------------------------
// IRWAVault
// ------------------------------------------------------------------
export interface IRWAVault extends IOP_NETContract {
    mint(to: Address, tokenId: bigint, amount: bigint): Promise<Mint>;
    purchase(tokenId: bigint, amount: bigint): Promise<Purchase>;
    burn(from: Address, tokenId: bigint, amount: bigint): Promise<Burn>;
    transfer(to: Address, tokenId: bigint, amount: bigint): Promise<Transfer>;
    balanceOf(account: Address, tokenId: bigint): Promise<BalanceOf>;
    totalSupplyOf(tokenId: bigint): Promise<TotalSupplyOf>;
    collectFee(txValue: bigint): Promise<CollectFee>;
    setDemandFactor(scaledValue: bigint): Promise<SetDemandFactor>;
    setWhitelistEnabled(enabled: boolean): Promise<SetWhitelistEnabled>;
    setWhitelist(account: Address, approved: boolean): Promise<SetWhitelist>;
    isWhitelisted(account: Address): Promise<IsWhitelisted>;
    getAssetInfo(tokenId: bigint): Promise<GetAssetInfo>;
}
