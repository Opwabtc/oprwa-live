# UI Polish Plan

## Files to modify
1. `apps/web/src/index.css` — primary CSS target
2. `apps/web/src/pages/Landing.tsx` — add eyebrow labels to sections
3. `apps/web/src/pages/Dashboard.tsx` — polish stats, empty state CTA
4. `apps/web/src/pages/AssetDetail.tsx` — no markup changes needed (CSS-only)
5. `apps/web/src/components/AssetCard.tsx` — no markup changes needed (CSS-only)

## CSS changes
- `.container` padding: `0 2rem`
- `.landing__section` padding: `7rem 0`
- `.asset-grid` fixed 3-col, 2-col tablet, 1-col mobile
- `.hero__headline` font-size clamp adjusted
- `.section-title` text-align center, margin-bottom 1rem
- `.section-body` font-size 1.125rem, max-width 560px, margin 0 auto 3rem
- Add `.section-eyebrow` styles
- Button size standards: sm/md/lg
- Nav logo font-size 1.125rem, link font-size 0.875rem
- Asset card: padding 2rem, flex column with margin-top: auto on actions
- Dashboard stats: text-align center, padding 1.5rem
- `.portfolio__empty` — CTA-ready centered state

## Landing.tsx changes
- Add `<div className="section-eyebrow">Markets</div>` before assets heading
- Add `<div className="section-eyebrow">How it works</div>` before StackedCards (passed via prop or wrapper)
- Add `<div className="section-eyebrow">Built on Bitcoin</div>` before Why Bitcoin heading

## Dashboard.tsx changes
- Wrap `portfolio__empty` content with a centered container and add a Link CTA button
- Stats cards already have text via classes; ensure text-align center in CSS
