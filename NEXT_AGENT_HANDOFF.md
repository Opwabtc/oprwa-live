# OPRWA Next Agent Handoff

**Repo:** https://github.com/Opwabtc/oprwa-live
**Live:** https://oprwa.vercel.app
**Worktree:** `C:/Users/peluc/OPWABTC/.claude/worktrees/loop-oprwa-rwa-platform/oprwa`
**Last commit:** 9b26a77

---

## What Was Completed (do NOT redo)

- Premium gradient canvas background (`bg-canvas` fixed, all sections transparent)
- Hero: scroll blur + opposite-direction mouse parallax on headline
- Marquee strip between hero and assets
- 3D buttons (reduced extrusion: 3px primary, 2px secondary)
- Light theme: orange → purple buttons
- Liquid glass cards: lavender in light, orange-tint in dark, deep 3D shadows
- StairOverlay removed; LoadingScreen 800ms
- Lenis smooth scroll (ReactLenis in main.tsx)
- Section eyebrows: "Markets", "How it works", "Built on Bitcoin"
- Why Bitcoin heading: centered, uses GSAP opacity (not autoAlpha)
- Footer: larger fonts, white dark / near-black light, no grey
- Mobile: full responsive (1-col mobile, 2-col tablet, 3-col desktop)
- Dashboard: BTC value pill next to Connected status
- Dashboard: TX history table (Etherscan-style, from portfolioStore)
- AssetDetail: simplified buy panel (total cost only, no full quote)
- Grey text replaced with readable colors
- Em-dashes removed from all copy
- Wallet dropdown: aligned right, light theme readable

---

## Remaining Tasks (implement these)

### Priority 1 — Pixel-perfect layout & visual polish

**A. SEO — add to `apps/web/index.html`:**
```html
<title>OPRWA — Real Asset Investment on Bitcoin</title>
<meta name="description" content="Buy fractional ownership of real estate, gold, and T-bills on Bitcoin. No bank. No minimum. Non-custodial." />
<meta name="keywords" content="Bitcoin RWA, real estate tokenization, Bitcoin investment, OPNet, fractional ownership" />
<meta property="og:title" content="OPRWA — Real Assets on Bitcoin" />
<meta property="og:description" content="Own a piece of the world. Real estate, gold, T-bills — on Bitcoin." />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://oprwa.vercel.app" />
<meta property="og:image" content="https://oprwa.vercel.app/og-image.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="OPRWA — Real Assets on Bitcoin" />
<meta name="twitter:description" content="Own a piece of the world. Real estate, gold, T-bills on Bitcoin." />
<link rel="canonical" href="https://oprwa.vercel.app" />
```
Also add semantic HTML: `<main>` wrapper in App.tsx around the Routes, `<article>` in AssetDetail, `aria-label` on sections.

**B. Pixel-perfect spacing audit (`apps/web/src/index.css`):**
- All cards must use consistent `padding: 1.75rem` (not mixed 1.5/2rem)
- `.asset-grid` gap: `1.5rem` consistently
- `.dashboard__stats` gap: `1rem`
- `.section-title` margin-bottom: `0.75rem` (then eyebrow above is 0.75rem above that)
- `.hero__content` padding-top: `calc(64px + 4rem)` (nav height + breathing room)
- `.btn` font-size: `0.9375rem` for primary/secondary (not 1rem which is too large)
- ALL `border-radius` on cards: use `var(--radius-card)` consistently

**C. Typography micro-adjustments:**
- `.hero__headline` line-height: `1.05`
- `.section-title` line-height: `1.15`
- `.asset-card__name` font-size: `1.0625rem`
- `.why-item__title` font-size: `1.1875rem`
- Letter-spacing on eyebrows: `0.14em`

**D. Dashboard on-chain data fix:**
The walletStore reads from contract via `adapter.balanceOf()` in `loadOnChainPortfolio()`.
Check `packages/contracts/src/RWAVaultAdapter.ts` — verify `balanceOf(walletAddress, assetId)` is calling the right contract method and returning BigInt correctly.
Contract address is in `packages/contracts/src/config.ts`.
If the adapter is failing, add error logging.

**E. TX history from on-chain (enhancement):**
The current TX history reads from `portfolioStore.transactions`.
Upgrade: also fetch from `GET https://testnet.opnet.org/api/v1/address/{wallet}/interactions` (or similar OPNet API endpoint — check what's available).
If the endpoint returns contract interaction data for the RWAVault contract, filter by contract address and show mint events.

### Priority 2 — Remaining UX

**F. Asset detail page breadcrumb:**
Current shows "Markets / {asset name}". The "Markets" link goes to `/marketplace` but we redirect `/marketplace` to `/#markets`.
Fix: breadcrumb "Markets" href should be `/#markets`.

**G. Light theme consistency:**
- `.buy-modal__panel` background in light theme: should be lavender glass not dark
- `.buy-modal__row` text in light theme: `#1a0533` not grey
- `.app-nav__link` in light theme: `#1a0533` not grey
- `.asset-card__stat-label` in light: `rgba(26,5,51,0.7)`

**H. Mobile nav — hamburger menu:**
Currently the hamburger opens `.app-nav__links` but there's no close-on-outside-click. Add it.
Also make the mobile menu have a glass background overlay.

**I. Footer link targets:**
- Twitter button: `href="https://twitter.com/oprwabtc"` target="_blank"
- GitHub button: `href="https://github.com/Opwabtc"` target="_blank"

---

## Deploy Command
```bash
cd C:/Users/peluc/OPWABTC/.claude/worktrees/loop-oprwa-rwa-platform/oprwa
git add -A -- apps/web/src/ apps/web/index.html
git commit -m "..."
git push origin main
vercel --prod --force
```

## TypeScript Check
```bash
cd C:/Users/peluc/OPWABTC/.claude/worktrees/loop-oprwa-rwa-platform/oprwa/apps/web
npx tsc --noEmit
```

## Key File Paths
- CSS: `apps/web/src/index.css`
- Landing: `apps/web/src/pages/Landing.tsx`
- Dashboard: `apps/web/src/pages/Dashboard.tsx`
- App: `apps/web/src/App.tsx`
- WalletStore: `apps/web/src/store/walletStore.ts`
- Contract adapter: `packages/contracts/src/RWAVaultAdapter.ts`
- HTML: `apps/web/index.html`

## Design Tokens Reference
```css
--accent: #FF9900 (dark) / --purple: #7c3aed (light buttons)
--bg: #0a0a0a dark / #fffdf8 light
--text-1: #f0ede8 dark / near-black light
--radius-card: (check current value in :root)
--font-heading: (check current value)
--font-mono: (check current value)
```
