/**
 * RWAVault — OP_1155-style multi-token RWA distribution contract
 *
 * Supports 3 RWA asset tokenIds (0, 1, 2).
 * Admin mints/burns. Holders transfer (whitelist-gated on mainnet).
 * On-chain deterministic fee via collectFee(txValue).
 *
 * Storage layout (NEVER reorder — fixed pointers for on-chain stability):
 *   ptr   0: admin (StoredAddress)
 *   ptr   1: demandFactor_scaled (StoredU256) — u256 in [0, 1000], 500 = 0.0 demand
 *   ptr   2: whitelistEnabled (StoredU256) — 0=false (testnet), 1=true (mainnet)
 *   ptr  10: balances[tokenId=0] (StoredMapU256, key=address as u256)
 *   ptr  11: balances[tokenId=1]
 *   ptr  12: balances[tokenId=2]
 *   ptr  20: totalSupply[tokenId=0] (StoredU256)
 *   ptr  21: totalSupply[tokenId=1]
 *   ptr  22: totalSupply[tokenId=2]
 *   ptr  30: globalWhitelist (StoredMapU256, key=address as u256, value=1/0)
 */

import { u256 } from '@btc-vision/as-bignum/assembly';
import {
    Blockchain,
    Address,
    Calldata,
    BytesWriter,
    Revert,
    StoredAddress,
    StoredU256,
    StoredMapU256,
    SafeMath,
    NetEvent,
    EMPTY_POINTER,
    OP_NET,
} from '@btc-vision/btc-runtime/runtime';

// Fixed storage pointer constants
const PTR_ADMIN:             u16 = 0;
const PTR_DEMAND_FACTOR:     u16 = 1;
const PTR_WHITELIST_ENABLED: u16 = 2;

// Per-tokenId balance maps (ptr 10, 11, 12)
const PTR_BALANCES_BASE:     u16 = 10;

// Per-tokenId total supply (ptr 20, 21, 22)
const PTR_SUPPLY_BASE:       u16 = 20;

// Global whitelist map (ptr 30)
const PTR_WHITELIST:         u16 = 30;

// Maximum supported tokenIds
const MAX_TOKEN_IDS:         u32 = 3;

// Demand factor bounds
const DEMAND_MIN: u64 = 0;
const DEMAND_MAX: u64 = 1000;
const DEMAND_MID: u64 = 500;

// Fee constants (basis points math, /100000)
const FEE_BASE_BPS:   u64 = 250;   // 0.25% = 250/100000
const FEE_MAX_BPS:    u64 = 750;   // 0.75% = 750/100000
const MIN_FEE_SATS:   u64 = 1000;  // minimum 1000 sats
const FEE_DIVISOR:    u64 = 100000;

// Events

@final
class MintEvent extends NetEvent {
    constructor(tokenId: u256, to: Address, amount: u256) {
        const data = new BytesWriter(96);
        data.writeU256(tokenId);
        data.writeAddress(to);
        data.writeU256(amount);
        super('Mint', data);
    }
}

@final
class BurnEvent extends NetEvent {
    constructor(tokenId: u256, from: Address, amount: u256) {
        const data = new BytesWriter(96);
        data.writeU256(tokenId);
        data.writeAddress(from);
        data.writeU256(amount);
        super('Burn', data);
    }
}

@final
class TransferEvent extends NetEvent {
    constructor(from: Address, to: Address, tokenId: u256, amount: u256) {
        const data = new BytesWriter(128);
        data.writeAddress(from);
        data.writeAddress(to);
        data.writeU256(tokenId);
        data.writeU256(amount);
        super('Transfer', data);
    }
}

@final
class DemandFactorSetEvent extends NetEvent {
    constructor(scaledValue: u256) {
        const data = new BytesWriter(32);
        data.writeU256(scaledValue);
        super('DemandFactorSet', data);
    }
}

@final
class WhitelistSetEvent extends NetEvent {
    constructor(account: Address, approved: bool) {
        const data = new BytesWriter(33);
        data.writeAddress(account);
        data.writeBoolean(approved);
        super('WhitelistSet', data);
    }
}

@final
class WhitelistEnabledEvent extends NetEvent {
    constructor(enabled: bool) {
        const data = new BytesWriter(1);
        data.writeBoolean(enabled);
        super('WhitelistEnabled', data);
    }
}

// ── RWAVault contract ────────────────────────────────────────────────────────

@final
export class RWAVault extends OP_NET {
    // Fixed-pointer storage — NEVER reorder
    private _admin:             StoredAddress  = new StoredAddress(PTR_ADMIN);
    private _demandFactor:      StoredU256     = new StoredU256(PTR_DEMAND_FACTOR, EMPTY_POINTER);
    private _whitelistEnabled:  StoredU256     = new StoredU256(PTR_WHITELIST_ENABLED, EMPTY_POINTER);

    // Balance maps per tokenId
    private _balances0: StoredMapU256 = new StoredMapU256(PTR_BALANCES_BASE);
    private _balances1: StoredMapU256 = new StoredMapU256((PTR_BALANCES_BASE + 1) as u16);
    private _balances2: StoredMapU256 = new StoredMapU256((PTR_BALANCES_BASE + 2) as u16);

    // Total supply per tokenId
    private _supply0: StoredU256 = new StoredU256(PTR_SUPPLY_BASE, EMPTY_POINTER);
    private _supply1: StoredU256 = new StoredU256((PTR_SUPPLY_BASE + 1) as u16, EMPTY_POINTER);
    private _supply2: StoredU256 = new StoredU256((PTR_SUPPLY_BASE + 2) as u16, EMPTY_POINTER);

    // Global whitelist
    private _whitelist: StoredMapU256 = new StoredMapU256(PTR_WHITELIST);

    public constructor() {
        super();
        // ONLY pointer setup here. onDeployment() handles initialization.
    }

    public onUpdate(_calldata: Calldata): void {}

    public override onDeployment(_calldata: Calldata): void {
        // Set deployer as admin
        this._admin.value = Blockchain.tx.origin;
        // Default demand factor = 500 (neutral, 0.0 demand)
        this._demandFactor.value = u256.fromU64(DEMAND_MID);
        // Whitelist disabled by default (testnet: all pass)
        this._whitelistEnabled.value = u256.Zero;
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    private _onlyAdmin(): void {
        const admin = this._admin.value;
        if (!Blockchain.tx.sender.equals(admin)) {
            throw new Revert('RWAVault: not admin');
        }
    }

    private _validateTokenId(tokenId: u256): u32 {
        const id = tokenId.toU32();
        if (id >= MAX_TOKEN_IDS) {
            throw new Revert('RWAVault: invalid tokenId');
        }
        return id;
    }

    private _getBalanceMap(id: u32): StoredMapU256 {
        if (id == 0) return this._balances0;
        if (id == 1) return this._balances1;
        return this._balances2;
    }

    private _getSupplyStore(id: u32): StoredU256 {
        if (id == 0) return this._supply0;
        if (id == 1) return this._supply1;
        return this._supply2;
    }

    private _requireWhitelisted(account: Address): void {
        if (!this._isWhitelistedInternal(account)) {
            throw new Revert('RWAVault: address not whitelisted');
        }
    }

    private _isWhitelistedInternal(account: Address): bool {
        // If whitelist disabled (testnet), everyone is whitelisted
        if (this._whitelistEnabled.value.isZero()) return true;
        const key = u256.fromUint8ArrayBE(account);
        const val = this._whitelist.get(key);
        return !val.isZero();
    }

    /**
     * Compute dynamic fee rate in basis points.
     * demandFactor stored as u256 in [0, 1000]:
     *   500 = 0.0 demand  → 250 bps
     *   0   = -0.05 demand → 0 bps offset = 250-250 = 0, clamped to 250
     *   1000 = +0.05 demand → 250+250 = 500, but max is 750
     *
     * Safe integer math (all unsigned):
     *   if stored >= 500: basisPoints = 250 + (stored - 500) / 2
     *   if stored < 500:  basisPoints = 250 - (500 - stored) / 2
     *   clamp result to [250, 750]
     */
    private _computeFeeRateBps(): u64 {
        const stored = this._demandFactor.value.toU64();
        let bps: u64;
        if (stored >= DEMAND_MID) {
            bps = FEE_BASE_BPS + (stored - DEMAND_MID) / 2;
        } else {
            const deficit = (DEMAND_MID - stored) / 2;
            if (deficit >= FEE_BASE_BPS) {
                bps = 0;
            } else {
                bps = FEE_BASE_BPS - deficit;
            }
        }
        // Clamp to [250, 750]
        if (bps < FEE_BASE_BPS) bps = FEE_BASE_BPS;
        if (bps > FEE_MAX_BPS)  bps = FEE_MAX_BPS;
        return bps;
    }

    // ── mint(to, tokenId, amount) → bool ─────────────────────────────────────

    @method(
        { name: 'to',      type: ABIDataTypes.ADDRESS  },
        { name: 'tokenId', type: ABIDataTypes.UINT256  },
        { name: 'amount',  type: ABIDataTypes.UINT256  },
    )
    @returns({ name: 'success', type: ABIDataTypes.BOOL })
    public mint(calldata: Calldata): BytesWriter {
        this._onlyAdmin();

        const to      = calldata.readAddress();
        const tokenId = calldata.readU256();
        const amount  = calldata.readU256();

        if (to == Address.zero()) throw new Revert('RWAVault: mint to zero address');
        if (amount.isZero()) throw new Revert('RWAVault: mint amount must be > 0');

        const id = this._validateTokenId(tokenId);

        const balMap     = this._getBalanceMap(id);
        const supplyStore = this._getSupplyStore(id);
        const addrKey    = u256.fromUint8ArrayBE(to);

        const prevBal = balMap.get(addrKey);
        balMap.set(addrKey, SafeMath.add(prevBal, amount));
        supplyStore.value = SafeMath.add(supplyStore.value, amount);

        Blockchain.emit(new MintEvent(tokenId, to, amount));

        const result = new BytesWriter(1);
        result.writeBoolean(true);
        return result;
    }

    // ── purchase(tokenId, amount) → bool ─────────────────────────────────────
    // PUBLIC: any caller can mint to themselves (testnet, no payment required)

    @method(
        { name: 'tokenId', type: ABIDataTypes.UINT256 },
        { name: 'amount',  type: ABIDataTypes.UINT256 },
    )
    @returns({ name: 'success', type: ABIDataTypes.BOOL })
    public purchase(calldata: Calldata): BytesWriter {
        const tokenId = calldata.readU256();
        const amount  = calldata.readU256();

        if (amount.isZero()) throw new Revert('RWAVault: amount must be > 0');

        const id      = this._validateTokenId(tokenId);
        const to      = Blockchain.tx.sender;
        const balMap  = this._getBalanceMap(id);
        const addrKey = u256.fromUint8ArrayBE(to);

        balMap.set(addrKey, SafeMath.add(balMap.get(addrKey), amount));
        this._getSupplyStore(id).value = SafeMath.add(this._getSupplyStore(id).value, amount);

        Blockchain.emit(new MintEvent(tokenId, to, amount));

        const result = new BytesWriter(1);
        result.writeBoolean(true);
        return result;
    }

    // ── burn(from, tokenId, amount) → bool ───────────────────────────────────

    @method(
        { name: 'from',    type: ABIDataTypes.ADDRESS  },
        { name: 'tokenId', type: ABIDataTypes.UINT256  },
        { name: 'amount',  type: ABIDataTypes.UINT256  },
    )
    @returns({ name: 'success', type: ABIDataTypes.BOOL })
    public burn(calldata: Calldata): BytesWriter {
        const from    = calldata.readAddress();
        const tokenId = calldata.readU256();
        const amount  = calldata.readU256();

        if (amount.isZero()) throw new Revert('RWAVault: burn amount must be > 0');

        // Caller must be admin OR the holder themselves
        const sender = Blockchain.tx.sender;
        const admin  = this._admin.value;
        if (!sender.equals(admin) && !sender.equals(from)) {
            throw new Revert('RWAVault: not authorized to burn');
        }

        const id      = this._validateTokenId(tokenId);
        const balMap  = this._getBalanceMap(id);
        const addrKey = u256.fromUint8ArrayBE(from);
        const balance = balMap.get(addrKey);

        if (u256.lt(balance, amount)) throw new Revert('RWAVault: insufficient balance to burn');

        const supplyStore = this._getSupplyStore(id);

        // CEI: update state before emitting
        balMap.set(addrKey, SafeMath.sub(balance, amount));
        supplyStore.value = SafeMath.sub(supplyStore.value, amount);

        Blockchain.emit(new BurnEvent(tokenId, from, amount));

        const result = new BytesWriter(1);
        result.writeBoolean(true);
        return result;
    }

    // ── transfer(to, tokenId, amount) → bool ─────────────────────────────────

    @method(
        { name: 'to',      type: ABIDataTypes.ADDRESS  },
        { name: 'tokenId', type: ABIDataTypes.UINT256  },
        { name: 'amount',  type: ABIDataTypes.UINT256  },
    )
    @returns({ name: 'success', type: ABIDataTypes.BOOL })
    public transfer(calldata: Calldata): BytesWriter {
        const to      = calldata.readAddress();
        const tokenId = calldata.readU256();
        const amount  = calldata.readU256();

        if (to == Address.zero()) throw new Revert('RWAVault: transfer to zero address');
        if (amount.isZero()) throw new Revert('RWAVault: transfer amount must be > 0');

        const from = Blockchain.tx.sender;

        // Whitelist check: both from and to must be whitelisted when enabled
        if (!this._whitelistEnabled.value.isZero()) {
            this._requireWhitelisted(from);
            this._requireWhitelisted(to);
        }

        const id      = this._validateTokenId(tokenId);
        const balMap  = this._getBalanceMap(id);
        const fromKey = u256.fromUint8ArrayBE(from);
        const toKey   = u256.fromUint8ArrayBE(to);
        const fromBal = balMap.get(fromKey);

        if (u256.lt(fromBal, amount)) throw new Revert('RWAVault: insufficient balance');

        // CEI: update state before emitting
        balMap.set(fromKey, SafeMath.sub(fromBal, amount));
        balMap.set(toKey, SafeMath.add(balMap.get(toKey), amount));

        Blockchain.emit(new TransferEvent(from, to, tokenId, amount));

        const result = new BytesWriter(1);
        result.writeBoolean(true);
        return result;
    }

    // ── balanceOf(account, tokenId) → u256 ───────────────────────────────────

    @view
    @method(
        { name: 'account', type: ABIDataTypes.ADDRESS  },
        { name: 'tokenId', type: ABIDataTypes.UINT256  },
    )
    @returns({ name: 'balance', type: ABIDataTypes.UINT256 })
    public balanceOf(calldata: Calldata): BytesWriter {
        const account = calldata.readAddress();
        const tokenId = calldata.readU256();
        const id      = tokenId.toU32();

        let bal = u256.Zero;
        if (id < MAX_TOKEN_IDS) {
            const balMap = this._getBalanceMap(id);
            bal = balMap.get(u256.fromUint8ArrayBE(account));
        }

        const result = new BytesWriter(32);
        result.writeU256(bal);
        return result;
    }

    // ── totalSupplyOf(tokenId) → u256 ────────────────────────────────────────

    @view
    @method({ name: 'tokenId', type: ABIDataTypes.UINT256 })
    @returns({ name: 'supply', type: ABIDataTypes.UINT256 })
    public totalSupplyOf(calldata: Calldata): BytesWriter {
        const tokenId = calldata.readU256();
        const id      = tokenId.toU32();

        let supply = u256.Zero;
        if (id < MAX_TOKEN_IDS) {
            supply = this._getSupplyStore(id).value;
        }

        const result = new BytesWriter(32);
        result.writeU256(supply);
        return result;
    }

    // ── collectFee(txValue) → u256 ────────────────────────────────────────────
    // Pure view: deterministic fee based on stored demandFactor.

    @view
    @method({ name: 'txValue', type: ABIDataTypes.UINT256 })
    @returns({ name: 'fee', type: ABIDataTypes.UINT256 })
    public collectFee(calldata: Calldata): BytesWriter {
        const txValue = calldata.readU256();

        const bps    = this._computeFeeRateBps();
        const bpsU256 = u256.fromU64(bps);
        const divisor = u256.fromU64(FEE_DIVISOR);

        // pctFee = txValue * basisPoints / 100000
        const pctFee = SafeMath.div(SafeMath.mul(txValue, bpsU256), divisor);

        // Return max(pctFee, 1000 sats)
        const minFee = u256.fromU64(MIN_FEE_SATS);
        let fee = pctFee;
        if (u256.lt(pctFee, minFee)) {
            fee = minFee;
        }

        const result = new BytesWriter(32);
        result.writeU256(fee);
        return result;
    }

    // ── setDemandFactor(scaledValue) → bool ──────────────────────────────────
    // scaledValue must be in [0, 1000]. 500 = neutral.

    @method({ name: 'scaledValue', type: ABIDataTypes.UINT256 })
    @returns({ name: 'success', type: ABIDataTypes.BOOL })
    public setDemandFactor(calldata: Calldata): BytesWriter {
        this._onlyAdmin();

        let scaledValue = calldata.readU256();

        // Clamp to [0, 1000]
        const maxVal = u256.fromU64(DEMAND_MAX);
        if (u256.gt(scaledValue, maxVal)) {
            scaledValue = maxVal;
        }
        // Minimum is u256.Zero (0), already enforced by u256 unsigned type

        this._demandFactor.value = scaledValue;

        Blockchain.emit(new DemandFactorSetEvent(scaledValue));

        const result = new BytesWriter(1);
        result.writeBoolean(true);
        return result;
    }

    // ── setWhitelistEnabled(enabled) → bool ──────────────────────────────────

    @method({ name: 'enabled', type: ABIDataTypes.BOOL })
    @returns({ name: 'success', type: ABIDataTypes.BOOL })
    public setWhitelistEnabled(calldata: Calldata): BytesWriter {
        this._onlyAdmin();

        const enabled = calldata.readBoolean();
        this._whitelistEnabled.value = enabled ? u256.One : u256.Zero;

        Blockchain.emit(new WhitelistEnabledEvent(enabled));

        const result = new BytesWriter(1);
        result.writeBoolean(true);
        return result;
    }

    // ── setWhitelist(account, approved) → bool ───────────────────────────────

    @method(
        { name: 'account',  type: ABIDataTypes.ADDRESS },
        { name: 'approved', type: ABIDataTypes.BOOL    },
    )
    @returns({ name: 'success', type: ABIDataTypes.BOOL })
    public setWhitelist(calldata: Calldata): BytesWriter {
        this._onlyAdmin();

        const account  = calldata.readAddress();
        const approved = calldata.readBoolean();

        if (account == Address.zero()) throw new Revert('RWAVault: zero address');

        const key = u256.fromUint8ArrayBE(account);
        this._whitelist.set(key, approved ? u256.One : u256.Zero);

        Blockchain.emit(new WhitelistSetEvent(account, approved));

        const result = new BytesWriter(1);
        result.writeBoolean(true);
        return result;
    }

    // ── isWhitelisted(account) → bool ────────────────────────────────────────

    @view
    @method({ name: 'account', type: ABIDataTypes.ADDRESS })
    @returns({ name: 'whitelisted', type: ABIDataTypes.BOOL })
    public isWhitelisted(calldata: Calldata): BytesWriter {
        const account = calldata.readAddress();
        const wl      = this._isWhitelistedInternal(account);

        const result = new BytesWriter(1);
        result.writeBoolean(wl);
        return result;
    }

    // ── getAssetInfo(tokenId) → (totalSupply, whitelistEnabled, demandFactor_scaled) ──

    @view
    @method({ name: 'tokenId', type: ABIDataTypes.UINT256 })
    @returns(
        { name: 'totalSupply',        type: ABIDataTypes.UINT256 },
        { name: 'whitelistEnabled',   type: ABIDataTypes.UINT256 },
        { name: 'demandFactor_scaled', type: ABIDataTypes.UINT256 },
    )
    public getAssetInfo(calldata: Calldata): BytesWriter {
        const tokenId = calldata.readU256();
        const id      = tokenId.toU32();

        let supply = u256.Zero;
        if (id < MAX_TOKEN_IDS) {
            supply = this._getSupplyStore(id).value;
        }

        const result = new BytesWriter(96);
        result.writeU256(supply);
        result.writeU256(this._whitelistEnabled.value);
        result.writeU256(this._demandFactor.value);
        return result;
    }
}
