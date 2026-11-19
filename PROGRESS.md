# Progress log

Branch: `claude/confident-wozniak-8n4wv1`. Nothing goes to `master`, no deploy, no DNS (standing rule).

## Done
- Task 1: Cooking_Nerd.svg (an onion) replaces the old Cooking Nerd drawing on About and in the homepage About window. Tight viewBox, SVGO at 2-decimal precision (4% smaller, identical render), paths kept separate, decorative (aria-hidden, the heading names it).

- Task 2 QA: axe (WCAG 2.2 AA, light + dark) clean on all 9 pages, no overflow or small targets at 8 sizes incl. text-spacing, no console errors or failed requests (only a 404 on a made-up URL), window/tab/snap/Ask scripts pass, keyboard open/Esc/focus return verified. Stale `t13` script (old tray) is not a site problem.
- Task 3 images: sources at or above 1600px are now kept up to 2400px (MAVI screenshots were being cut to 1600 from ~2900), AVIF + WebP at 800/1400/full with srcset/sizes, width/height set (no layout shift), locked images embedded once at 2000px. No JPG fallback: WebP is supported by every current browser, so the `<img>` falls back to WebP.
- Task 4 lightbox: custom `public/js/lightbox.js` + `lightbox.css` (no library). Tested at 1440 and 390: keyboard open (Enter), caption = figcaption or alt, X / Esc / backdrop close, focus returns, focus trap, + / - / 0, double click and double tap, pan, Fit button.

## In progress
- (nothing)

## Next
- 5 design system, 6 Figma, 7 Opus review, 8 launch checklist, 9 DigitalOcean migration doc

## Needs Jarell
- Higher-res exports (too small to look sharp on a 2x screen; sizes are the minimum width in px): Copperleaf: value-model 775 (needs 1600), design-process 805 (1600), dual-track-agile 806 (1600), framework-designer 806 (1600), layout-explorations 887 (1600), research-1 and research-2 900 (1800), wireframing 900 (1800), pendo-resource-center 940 (1800), design-team-feedback 1004 (1800), resource-guide 1095 (1800). UI Avenue screens are 1536 (fine at the 720px column, a little soft in the lightbox; originals welcome). Headshot source is 800px: a 1500px export would sharpen About.
- Image descriptions: every image already has a description (a test now fails the build if one is missing). Some are short working titles ("competition 2"); better captions are yours to write.

## Open questions
- `docs/portfolio-qa-round-1.md` does not exist in the repo; round 1 is in `docs/portfolio-2026/decision-log.md`.
