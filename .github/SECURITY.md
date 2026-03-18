# Security Policy

## Supported Versions

| Version | Status |
|---------|--------|
| Testnet v2 (current) | Active |
| Mainnet v1 (upcoming) | Planned — Q2 2026 |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Report security vulnerabilities by emailing: **security@opwabtc.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Affected components (contract / frontend / infrastructure)
- Potential impact assessment
- Suggested fix (optional)

### Response timeline

| Step | Target |
|------|--------|
| Acknowledgment | 48 hours |
| Initial assessment | 5 business days |
| Fix deployed (critical) | 72 hours after confirmation |
| Fix deployed (high/medium) | 14 days after confirmation |
| Public disclosure | 30 days after fix deployment |

## Scope

### In scope

- `contracts/src/op1155/RWAVault.ts` — smart contract logic
- `apps/web/` — frontend application
- `packages/` — shared libraries
- Vercel deployment configuration
- GitHub Actions workflows

### Out of scope

- OPNet protocol itself (report to the OPNet team)
- Bitcoin L1 vulnerabilities
- Wallet software (OPWallet, UniSat, OKX — report to their respective teams)
- Denial of service against RPC endpoints
- Social engineering attacks

## Security Design Guarantees

OPRWA is designed with these non-negotiable security properties:

1. **Non-custodial** — the protocol never holds user funds at any layer
2. **Sign-only** — private keys never leave the user's wallet
3. **On-chain fees** — `RWAVault.collectFee()` is the sole fee authority; the frontend cannot manipulate fees
4. **No hidden routing** — all fund flows are on-chain and auditable via OPScan
5. **Deterministic pricing** — same inputs always produce the same output; no oracle dependency

Any vulnerability that undermines these properties is considered critical.

## Known Limitations (Testnet Only)

The following are testnet-intentional behaviors that will be addressed before mainnet:

- `purchase()` does not enforce BTC payment — testnet tokens have no real value
- Whitelist is disabled on testnet — all addresses can transfer
- KYC is auto-verified on testnet via `TestnetKYC`

These will all be enforced on mainnet via contract upgrade and KYC adapter swap.
