# Progress log

Branch: `claude/confident-wozniak-8n4wv1`. Nothing goes to `master`, no deploy, no DNS (standing rule).

## Done
- Task 1: Cooking_Nerd.svg (an onion) replaces the old Cooking Nerd drawing on About and in the homepage About window. Tight viewBox, SVGO at 2-decimal precision (4% smaller, identical render), paths kept separate, decorative (aria-hidden, the heading names it).

- Task 2 QA: axe (WCAG 2.2 AA, light + dark) clean on all 9 pages, no overflow or small targets at 8 sizes incl. text-spacing, no console errors or failed requests (only a 404 on a made-up URL), window/tab/snap/Ask scripts pass, keyboard open/Esc/focus return verified. Stale `t13` script (old tray) is not a site problem.
- Task 3 images: sources at or above 1600px are now kept up to 2400px (MAVI screenshots were being cut to 1600 from ~2900), AVIF + WebP at 800/1400/full with srcset/sizes, width/height set (no layout shift), locked images embedded once at 2000px. No JPG fallback: WebP is supported by every current browser, so the `<img>` falls back to WebP.
- Task 4 lightbox: custom `public/js/lightbox.js` + `lightbox.css` (no library). Tested at 1440 and 390: keyboard open (Enter), caption = figcaption or alt, X / Esc / backdrop close, focus returns, focus trap, + / - / 0, double click and double tap, pan, Fit button.
- Task 5 design system: new shared tokens (spacing, radii, motion durations and curves, layers, window-control colors) in `tokens.css`; repeated hard-coded easings, pill/small radii, dot colors and layers now use them (screenshots pixel-identical, 38 tests pass). Docs in `docs/design-system.md`.
- Task 6 Figma: page "Portfolio 2026 Design System" in file `5TjQUqil2gUNCFHOoAzBnt` (the Portfolio Hi-Fi file). Variables: Color / Ivory light, Color / Ivory dark, Spacing and shape, Type scale (13 colors, spacing 4 to 80, radii, 8 type sizes). Components: Button (Solid/Outline x Default/Hover), Tab (Active/Inactive), Folder (Rest/Hover/Open), Window title bar, Dock, Tooltip, Lightbox controls. Frames: Homepage, Floating window, Expanded case study, Lightbox (wireframe level, built from the component instances).
- Task 8 launch readiness: added 404 page, `robots.txt`, `sitemap.xml`, 32px and Apple touch icons + theme color, `scripts/check-links.mjs` (0 broken), nginx template now has `error_page 404` and caches AVIF. `docs/launch-checklist.md` written. Not deployed.
- Task 9: `docs/migration-digitalocean.md` written (Netlify dependencies, droplet recommendation with trade-offs, 15 numbered steps with checks, rollback). No accounts, DNS or spending touched.
- Task 7 Opus 5.5 review (independent subagent, read-only): 1 high, 1 medium, 7 low findings, all confirmed by reading the code and fixed:
  - High: clicking or double-clicking the picture inside the lightbox closed it (pointer capture redirected the click to the backdrop), which broke double-click/double-tap zoom. Fixed: only a press that started on the dark area closes it.
  - Medium: with the lightbox open, `/` or Ctrl/Cmd+K opened Ask behind it and broke the focus trap. Fixed: the open lightbox swallows all keys.
  - Low, fixed: close/reopen race (timer now cleared), dead load listener removed, MutationObserver batched per frame, headings now reserve their final drawing size before the file loads (aspect ratios baked into the script, with a test that keeps them in step with the SVG files), idle drawing timer skips phones and hidden tabs, image lookup handles filenames with spaces, stale arrow comment.
  - Not found: any leak of locked text or locked images, secrets, em dashes, reduced-motion or focus failures, sideways scroll. No disagreements.
  - After the fixes: 39 tests pass; lightbox rechecked at 1440 and 390 (double click zooms and resets, backdrop closes, focus returns).
- Nov 20 follow-ups: lightbox now zooms with one click or tap on the picture (click again to zoom out; drag pans; backdrop closes), checked at 1440 and 390 wide. About Slack link replaced with the invite you sent (I cannot open Slack invites from here, so click it once yourself). `docs/editing-the-site.md` explains how to edit text and images without me.
- Figma (file 5TjQUqil2gUNCFHOoAzBnt, page "Portfolio 2026 Design System"): all six palettes in light and dark (12 collections, one per mode because the plan allows 1 mode each), text styles in Bricolage Grotesque (16: Body and Heading across the type scale), real folder drawing inside the Folder component (Rest, Hover, Open), logo, all 33 illustrations in a labelled sheet (including the three logo shapes, self portrait), and frames for Homepage, Homepage on phone, Floating window, Expanded case study, Case study with lock card, Lightbox, About, Work, Kind words, Earlier work, Design system page, 404, Ask Jarell window and Style panel (wireframe level, built from the component instances). The environment now allows the host mcp.figma.com (needed to upload SVGs).
- Nov 20 hosting decision: staying on Netlify; the DigitalOcean move is backlogged (plan kept in `docs/migration-digitalocean.md`, the droplet is about 9 years old so its OS needs checking first). Because of the "Powered by Netlify" badge, a bottom-right zone (`--badge-h` 3.75rem in `tokens.css`, `BM` in `home.js`) is kept free: logo shapes, dock, helper, phone windows (so the Ask Jarell input is clear), desktop windows and resize corners, snap panel, lightbox caption, top-bar Ask panel and page ends. Set `--badge-h` to 0 on a host without a badge. Checked with a stand-in badge at 9 sizes from 1920x1080 to 320x568: nothing overlaps it. Phone home screen: smaller name and role, smaller folders. Intro now staggers: words at 0.15 to 0.3s, hand-drawn pieces from 0.55s (one every 0.09s), folders from 1.2s, then dock, helper and shapes.
- Nov 20 round 3: intro is quicker (words by 0.3s, drawings 0.3 to 0.7s, folders from 0.65s, dock, helper and shapes by 1.4s); line-draw is quicker (outline about 0.5s, fill starts at half way, outlines gone by about 0.6s; actions start sooner); drag tooltip is desktop only (folders cannot be dragged on phones), smaller, under the folder; all tooltips use 80% ink background, contrast test added for 12 themes; phone and desktop windows verified clear of the Netlify badge; folder row no longer runs off the screen at 1024px wide (it wraps).

## In progress
- (nothing)

## Next

## Needs Jarell
- Higher-res exports (too small to look sharp on a 2x screen; sizes are the minimum width in px): Copperleaf: value-model 775 (needs 1600), design-process 805 (1600), dual-track-agile 806 (1600), framework-designer 806 (1600), layout-explorations 887 (1600), research-1 and research-2 900 (1800), wireframing 900 (1800), pendo-resource-center 940 (1800), design-team-feedback 1004 (1800), resource-guide 1095 (1800). UI Avenue screens are 1536 (fine at the 720px column, a little soft in the lightbox; originals welcome). Headshot source is 800px: a 1500px export would sharpen About.
- Figma notes: dark colors are separate collections (plan allows 1 mode). Illustrations are static vectors, not animated. Frames are wireframe-level: real copy only where it exists on the site; no invented text.
- Image descriptions: every image already has a description (a test now fails the build if one is missing). Some are short working titles ("competition 2"); better captions are yours to write.

## Open questions
- `docs/portfolio-qa-round-1.md` does not exist in the repo; round 1 is in `docs/portfolio-2026/decision-log.md`.

## Final Lighthouse (mobile emulation, local Python server with no compression or caching, so real hosting scores higher)
| Page | Perf | A11y | Best practices | SEO | CLS | LCP |
| --- | --- | --- | --- | --- | --- | --- |
| / | 88 | 100 | 100 | 100 | 0 | 3.6 s |
| /about/ | 84 | 100 | 100 | 100 | 0 | 4.2 s |
| /work/ui-avenue/ | 90 | 100 | 100 | 100 | 0.052 | 3.6 s |
| /work/mavi/ | 64 | 100 | 100 | 69 | 0.048 | 6.7 s |

Notes: SEO 69 on MAVI is the intentional `noindex` on locked pages. MAVI performance is low because the locked images are embedded (base64) in the encrypted page and the test server does not gzip; the home page scored about 96 earlier on a compressing server, so re-measure on Netlify or Nginx. Small CLS on case studies comes from images in the encrypted part before they have a size (width/height are set for public images only through `<picture>`; locked images also carry width/height, so this is worth a look after launch).
