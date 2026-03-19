# Contributing to OPRWA

Thank you for your interest in OPRWA — real-world assets on Bitcoin.

## Before you start

- Read [SECURITY.md](.github/SECURITY.md) before reporting any vulnerability.
- Check open issues before opening a duplicate.
- For large changes, open an issue first to discuss intent.

---

## Development setup

```bash
# Prerequisites: Node.js 20+, pnpm 9+

git clone https://github.com/Opwabtc/oprwa-live.git
cd oprwa-live

pnpm install

# Start the web app
pnpm --filter @oprwa/web dev

# Typecheck all packages
pnpm typecheck

# Build
pnpm build
```

Copy `.env.example` to `apps/web/.env` and fill in your values.

---

## Repository structure

```
oprwa/
├── apps/
│   └── web/          # React + Vite frontend
├── contracts/
│   └── src/op1155/   # AssemblyScript OP-1155 contract
├── packages/
│   ├── contracts/    # TypeScript adapter + ABI
│   ├── core/         # Shared utilities (pricing, wallet)
│   └── ui/           # Design system tokens
└── docs/             # Architecture, whitepaper, setup
```

---

## Smart contract changes

The contract is written in AssemblyScript and compiles to WASM via `asc`.

```bash
cd contracts
npx asc src/op1155/index.ts --target rwaVault --measure --uncheckedBehavior never
```

**Critical rules:**
- Never use `Blockchain.nextPointer` in class field initializers — use fixed constants
- All arithmetic on `u256` must use `SafeMath.add/sub/mul/div`
- Never commit your mnemonic — always use `OPNET_MNEMONIC` env var
- After any `npm install` in `contracts/`, re-apply the two btc-runtime patches documented in `CLAUDE.md`

---

## Pull request checklist

- [ ] `pnpm typecheck` passes with no new errors
- [ ] `pnpm build` completes successfully
- [ ] No hardcoded addresses, mnemonics or API keys
- [ ] No `console.log` left in web source
- [ ] Contract changes include storage layout comments with pointer values
- [ ] CHANGELOG.md updated under `[Unreleased]`

---

## Code style

- TypeScript strict mode — no `any`, no `// @ts-ignore`
- React functional components with explicit return types
- Zustand for global state; React hooks for local state
- CSS custom properties from the OPWA Design System v4 (`index.css :root`)
- No inline styles except for dynamic values (mouse position, GSAP overrides)

---

## Reporting bugs

Open a GitHub issue with:
1. Steps to reproduce
2. Expected vs actual behavior
3. Browser / wallet / OS version
4. Console errors (if any)

For security vulnerabilities, do **not** open a public issue — see [SECURITY.md](.github/SECURITY.md).

---

## License

By contributing you agree that your contributions will be licensed under the [MIT License](LICENSE).
