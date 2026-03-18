# SETUP

## Install
```bash
npm install -g pnpm@9
pnpm install
```

## Dev
```bash
pnpm --filter @oprwa/api dev   # backend → http://localhost:3001
pnpm --filter @oprwa/web dev   # frontend → http://localhost:5173
```

## Build
```bash
pnpm --filter @oprwa/web build
```

## Deploy
```bash
vercel --prod --yes
```
Vercel settings:
- Build Command: `pnpm --filter @oprwa/web build`
- Output Directory: `apps/web/dist`
- Install Command: `pnpm install`
