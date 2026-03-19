# HANDOFF — OPRWA Frontend (continuar aqui)

**Data:** 2026-03-18
**Commit atual:** `90fb269` (landed) → push feito → deploy em `https://oprwa.vercel.app`
**Repo:** `https://github.com/Opwabtc/oprwa-live.git` branch `main`
**Worktree local:** `C:\Users\peluc\OPWABTC\.claude\worktrees\loop-oprwa-rwa-platform\oprwa`
**Deploy:** `vercel --prod` (projeto `oprwa`, team `opwabtcs-projects`)

---

## O QUE FOI FEITO NESTA SESSÃO

### Segurança (commits 36c0bb5, cfc5a66)
- C-01: supply cap 10M tokens por tokenId
- C-02: `_onlyAdmin()` usa `tx.origin` (não `tx.sender`)
- M-01: EOA gate em `purchase()`
- H-01: `Address.fromString(sender)` passado como 5º arg em `getContract()`
- H-02: balance polling substituiu `setTimeout(3000)` no BuyModal
- H-03: regex `/^[0-9a-f]{64}$/i` para validar txid real
- H-04: security headers completos no `vercel.json`
- M-02: validação de endereço wallet antes de chamar contrato
- M-03: erros de contrato nunca vazam para UI
- `docs/AUDIT.md` criado — VERDICT: PASS (27 padrões checados)

### Frontend (commits 2dff2d2, bb5cdea, 5053fec, 7d5dadb, 90fb269)
- Fontes: **Cabinet Grotesk** (headings, wt900) + **DM Sans** (corpo) + JetBrains Mono
- Hero: "Own a piece / of the world." — `font-size: clamp(3.5rem, 9vw, 7rem)`, `font-weight: 900`
- Stats bar horizontal após hero
- Assets direto após stats bar
- Seções: "Simple. Real. Yours." → "Three steps." → "Why Bitcoin?" → CTA
- Copy agressivo e simples (estilo TDHA-friendly)
- GSAP com `autoAlpha` (não `opacity`) — sem elementos sumindo
- Glass cards com noise texture `::before`
- Scroll indicator animado
- Modal overflow fix: `align-items: flex-start` + `max-height: calc(100dvh - 7rem)`
- CSP corrigido: `fonts.googleapis.com` em `style-src`, `fonts.gstatic.com` em `font-src`
- Wallet picker: opacity 0.62 + links de instalação
- `STATIC_ASSETS` exportado de `api.ts` — página nunca fica em branco

### Contrato
- WASM recompilado: 26,541 bytes (com todos os fixes)
- **AINDA NÃO REDEPLOYADO** — o contrato na chain ainda é o antigo
- Endereço atual: `opt1sqz3chv4dyhmsegr672qpumvy9se52kwlnyhq6q5d`
- Script de deploy: `contracts/scripts/deploy-rwaVault.ts`
- Comando: `OPNET_MNEMONIC="..." npx tsx scripts/deploy-rwaVault.ts` (dentro de `contracts/`)

---

## O QUE AINDA FALTA FAZER

### PRIORIDADE 1 — Redesign visual (pedido mas não 100% completo)
O agente aplicou as mudanças estruturais. O usuário pediu nível **Awwward 90/100**. Falta:

1. **Cursor customizado** — lag com lerp, magnetic buttons (prompt index.txt pede isso)
2. **Footer → Hero loop** (prompt index.txt feature principal) — hero clone com GSAP scrub
3. **Parallax layers** no hero (`.layer-back`, `.layer-mid`, `.layer-front`)
4. **Scroll tension** — `ScrollTrigger` velocity-based `y` modulation
5. **AssetCard hover** — GSAP `scale(1.03)` + cursor light shift + noise overlay
6. **Magnetic buttons** nos CTAs primários
7. **Cabinet Grotesk** pode não estar no Google Fonts público — verificar se carrega ou trocar para alternativa disponível (Clash Display, Bricolage Grotesque)

### PRIORIDADE 2 — Redeploy do contrato com fixes de segurança
```bash
cd C:\Users\peluc\OPWABTC\.claude\worktrees\loop-oprwa-rwa-platform\oprwa\contracts
OPNET_MNEMONIC="[pedir ao usuário]" npx tsx scripts/deploy-rwaVault.ts
```
Após deploy: atualizar `packages/contracts/src/deployed-address.json` com novo endereço.

### PRIORIDADE 3 — Verificar se Cabinet Grotesk carrega
Cabinet Grotesk é da Pangram Pangram — não está no Google Fonts oficial.
Alternativas no Google Fonts com personalidade similar:
- `Bricolage Grotesque` — editorial, premium ✓
- `Outfit` — geométrico, moderno ✓
- `Space Grotesk` — crypto-native vibe ✓

Se Cabinet Grotesk não carregar, trocar para `Bricolage Grotesque:wght@300;400;500;700;800`.

---

## ARQUITETURA ATUAL (não mudar sem ler isso)

```
oprwa/
├── apps/web/                    ← Frontend React + Vite
│   ├── src/
│   │   ├── lib/api.ts           ← fetchAssets, postBuy, STATIC_ASSETS (NÃO TOCAR)
│   │   ├── lib/lenis.ts         ← Lenis init + GSAP sync (lerp: 0.08)
│   │   ├── store/walletStore.ts ← wallet connect + portfolio (NÃO TOCAR)
│   │   ├── store/portfolioStore.ts (NÃO TOCAR)
│   │   ├── components/BuyModal.tsx   ← balance polling, txid regex (NÃO TOCAR)
│   │   ├── components/WalletPickerModal.tsx ← install links
│   │   ├── components/AssetCard.tsx  ← Framer Motion stagger
│   │   ├── pages/Landing.tsx    ← GSAP animations, nova estrutura
│   │   └── index.css            ← design system completo
│   └── index.html               ← Cabinet Grotesk + DM Sans + JetBrains Mono
├── contracts/
│   ├── src/op1155/RWAVault.ts   ← supply cap + admin origin + EOA gate
│   ├── build/RWAVault.wasm      ← 26,541 bytes (com todos os fixes)
│   └── scripts/deploy-rwaVault.ts
└── packages/contracts/src/
    ├── RWAVaultAdapter.ts        ← Address.fromString fix
    ├── deployed-address.json     ← opt1sqz3chv4dyhmsegr672qpumvy9se52kwlnyhq6q5d
    └── index.ts
```

---

## REGRAS ABSOLUTAS (não esquecer)

1. **OPRWA** e **OPWA** são projetos separados — nunca misturar
   - OPRWA: `oprwa-live` repo, `oprwa.vercel.app`
   - OPWA: `OPWABTC` repo, `op-real-estate-platform.vercel.app`
2. Para deployar no Vercel: `vercel --prod` (dentro do worktree)
3. Sempre `pnpm -F web typecheck` antes de commitar
4. `git push origin main` depois do commit
5. Lenis está em `ReactLenis` no `main.tsx` — não duplicar inicialização
6. GSAP usa `autoAlpha` (não `opacity`) para evitar elementos sumindo
7. `.asset-card` NÃO deve ser animado por GSAP — usa Framer Motion no AssetCard
8. Wallet connect: `window.opnet`, `window.unisat`, `window.okxwallet?.bitcoin`
9. Contrato real: `opt1sqz3chv4dyhmsegr672qpumvy9se52kwlnyhq6q5d` (testnet OPNet)

---

## PROMPT PARA PRÓXIMA SESSÃO

Cole isso no início da próxima conversa:

---

Estou continuando o desenvolvimento do projeto **OPRWA** (não confundir com OPWA — são projetos separados).

**Worktree:** `C:\Users\peluc\OPWABTC\.claude\worktrees\loop-oprwa-rwa-platform\oprwa`
**Repo:** `https://github.com/Opwabtc/oprwa-live.git`
**Site live:** `https://oprwa.vercel.app`
**Último commit:** `90fb269`

Leia o arquivo `docs/NEXT-SESSION.md` no worktree para ver o estado completo do projeto, o que foi feito e o que falta.

O site está no nível ~70/100. Precisamos chegar em 90/100. As prioridades são:

1. Verificar se **Cabinet Grotesk** carrega no Vercel — se não carregar, substituir por **Bricolage Grotesque** do Google Fonts
2. Implementar **cursor customizado** com lag (lerp), magnetic nos botões CTA
3. Implementar **footer → hero loop** conforme `docs/NEXT-SESSION.md` seção "O QUE AINDA FALTA"
4. **Redeploy do contrato** com os fixes de segurança (preciso fornecer o MNEMONIC)
5. Qualquer ajuste visual que ainda esteja fora do nível Awwward

Leia o NEXT-SESSION.md completo antes de fazer qualquer coisa.
