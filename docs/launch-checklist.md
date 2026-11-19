# Launch checklist

Status key: [x] done and checked, [ ] needs you, [~] partly done. Nothing here deploys or changes DNS.

## Pages and metadata
- [x] Every page has a `<title>`, description, canonical URL, Open Graph and Twitter tags (`site/src/layouts/Base.astro`).
- [x] Share image `/img/og.jpg` exists.
- [ ] Look at the share preview once the domain is live (paste the URL into LinkedIn's Post Inspector).
- [x] Favicon: SVG, 32px PNG and Apple touch icon, plus theme color.
- [x] 404 page (`/404.html`); Netlify serves it automatically, the Nginx template has `error_page 404 /404.html`.
- [x] `robots.txt` (blocks `/admin/` and the 2020 archive) and `sitemap.xml` (public pages only).
- [x] Locked and editor pages stay out of search results (`noindex`).
- [ ] After launch, submit `https://jarellalvarez.com/sitemap.xml` in Google Search Console (optional).

## Analytics
- None installed on purpose (no cookies, no consent banner). Add one later only if you want visit numbers.

## Content
- [ ] Read every page once on your phone for wording (I only checked facts against your sources).
- [ ] Replace short working image captions with real ones (a test requires every image to have a description; some are short, like "competition 2").
- [ ] Send higher-resolution exports for the soft images (list in `PROGRESS.md`).
- [x] Study password is only in Netlify env and local `site/.env`; production builds stop without it.
- [ ] Confirm the Slack invite link on About still works (invite links can expire).

## Checks I ran (Chromium, desktop and phone sizes)
- [x] Broken-link check: `node scripts/check-links.mjs` (0 broken on 13 pages).
- [x] Accessibility: axe on 9 pages in light and dark, no violations; no sideways scroll or small touch targets at 320 to 2560px; text-spacing test passes.
- [x] No console errors or failed requests on any page.
- [x] 38 automated tests pass (locked-content leak, themes contrast, illustrations, image descriptions).
- [x] Lightbox: keyboard, focus return, zoom and pan tested at 1440 and 390px.
- [ ] Cross-browser: only Chromium is available in my environment. Open the site once in Safari (Mac and iPhone) and Firefox, and try: open a folder, drag a window, open a case study, unlock, open an image and zoom.

## Final Lighthouse (mobile emulation, local server)
See the table in `PROGRESS.md`.

## Before you say go
- [ ] Decide hosting: Netlify now, or DigitalOcean (`docs/migration-digitalocean.md`).
- [ ] Make the Netlify site public and point the domain (steps in the decision log), or follow the migration plan.
- [ ] Test the live URL once from a phone on mobile data.
