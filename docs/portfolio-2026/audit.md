# Skill audit

| Step | Skill | What it changed | Left as is |
| --- | --- | --- | --- |
| Prototype | frontend-design | Folder glyphs built from the logo's shapes, one bold element (the name), no eyebrow labels or card grid | n/a |
| Prototype | apple-design | Drag follows the pointer 1:1 with grab offset, press feedback on pointer-down, translucent dock only, reduced motion / transparency / contrast handled | Springs and velocity handoff not built yet (CSS transitions for now) |
| Prototype | typography | Type scale tokens at ratio 1.25, body 17px / 1.6, 65ch column, balanced headings, tabular numerals | Hero name sits outside the scale on purpose |
| Copperleaf draft | portfolio-case-study-writer, jarell-alvarez-voice | Overview, problem, decisions, results, learnings structure. Plain first-person voice, no em dashes | Results table skipped: no before / after figures available |
| Homepage round 6 | apple-design, frontend-design | Menu springs from its trigger, shapes use squash and stretch, animations are transform-only and stop for reduced motion | Dock and window motion still CSS transitions, not springs |
| UI Avenue, About | jarell-alvarez-voice | New text kept plain and first-person. Old blurbs and the 2019 write-up left word for word, typos included | A copy-edit pass on the old text is Jarell's call |
| Round 9 | frontend-design, no-ai-slop | Removed the serif (cream + serif display is the most common generated-site look). New default Bricolage Grotesque. Copy scanned for em dashes, arrows, middle dots and stock phrases: none in Jarell's or my text | Two hits are inside LinkedIn testimonials, kept as written |
| Round 9 | accessibility | Style panel: 6 themes x light/dark checked by an automated test (text and errors 4.5:1, accents and folders 3:1). Keyboard and Escape work, status announced to screen readers, no overflow at 360px for all fonts and sizes | |

Not yet run: ui-ux-pro-max, no-ai-slop, webapp-testing, code-review, security-review.

## Code review and security review (2026-11-14)

Code review (high effort) found 10 issues; 9 fixed, 1 left on purpose.

| Finding | Outcome |
| --- | --- |
| Escape could close a hidden, minimized window | Fixed |
| Back button pointed forward after going back | Fixed (per-tab page trail) |
| Escape on the Style panel also closed a window | Fixed |
| Double-clicking minimize made two tray tabs | Fixed |
| A cancelled folder drag could swallow the next click | Fixed |
| Window title inserted into the page unescaped | Fixed |
| Replaced images kept a stale compressed copy | Fixed (rebuilds when the source is newer) |
| No security headers | Fixed (frame, nosniff, referrer, permissions in netlify.toml) |
| Image fallback path was never published | Fixed |
| Password kept in session storage to stay unlocked for the visit | Kept: no third-party scripts run on the site, and it only lives until the tab closes |

Security review (manual; the review tool could not run in this repo):

| Check | Result |
| --- | --- |
| Password or notes in the built site | None. `[JARELL]` notes and draft status are stripped |
| Locked text or locked images readable without the password | No. Text and images are encrypted together |
| Source maps or env files published | None |
| Old phone number on the 2020 archive pages | Was published; now removed at build |
| New-tab links without `noopener` | 2020 pages had some; now fixed at build |
| `innerHTML` from fetched pages | Same-site pages only; titles and testimonial text are escaped |
| Password strength | The lock runs in the browser, so a weak password can be guessed offline. "LockedOutofHeaven" is long enough; avoid short ones |
| Editor | Login through GitHub via Netlify; no keys in the repo |
