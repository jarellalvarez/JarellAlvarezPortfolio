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

## Accessibility at every size (WCAG 2.2 AA, 2026-11-15)

w3.org is blocked from this session, so the check follows WCAG 2.2 from memory and was run with automated tests.

| Check | Criterion | Result |
| --- | --- | --- |
| No sideways scroll at 320x568, 320x256 (1280 at 400% zoom), 568x320, 768x1024, 1024x768, 1280x800, 1920x1080, 2560x1440, on 9 pages | 1.4.10 Reflow | Pass after fixes: homepage grid, folders (3 across under 375px), top nav, quotes, stats, long headings, tooltips |
| Same sizes with text spacing raised (line 1.5, letters .12em, words .16em, paragraphs 2em) | 1.4.12 Text Spacing | Pass |
| Buttons and links at least 24x24 (inline text links exempt) | 2.5.8 Target Size | Pass |
| axe-core WCAG 2.0 to 2.2 AA rules, light and dark, 9 pages | Contrast, names, roles, structure | 0 violations |
| Style button's spoken name contains its visible word "Style" | 2.5.3 Label in Name | Fixed |
| Works in portrait and landscape | 1.3.4 Orientation | Pass |
| Not checked automatically | | Screen reader walkthrough, Windows High Contrast, real 400% browser zoom on a device |

## Backlog pass against the original plan (2026-11-15)

| Plan item | Status |
| --- | --- |
| Presentation mode for case studies | Built, then removed at Jarell's request (Nov 15) |
| Dock Home dead link (`#`) | Fixed, goes to `/` |
| Remove `prototypes/` once the real site replaced it | Done |
| Link previews for sharing | Added `og:image` (homepage hero, 1200x630) and large-card tags |
| Lighthouse mobile | Home 97/100/100/100, Copperleaf 91/100/100/66, About 97/100/100/100 (perf/a11y/best/SEO). Copperleaf SEO is low on purpose: locked studies are `noindex` |
| Image weight | Folder previews load on first hover; JPG previews and headshot converted to WebP (LCP 6.4s to 2.4s on home) |
| Waiting on Jarell | Prevue HR study, Q-2 dock icon, live `/admin` save test, domain for `og:image` (set to jarellalvarez.com), Round 2 ideas (music, concierge) |

## Audit, round 21 (2026-11-17)

Scope: everything since the last review (tabs, snap layouts, Ask Jarell, helper, drawings, About changes, AI function).

| Finding | Outcome |
| --- | --- |
| A written Ask answer (MAVI key decisions) named two details that only appear in the locked section (the match score, the merge with the PM's version). `ask.json` is public | Fixed: answer rewritten from the public overview. New test fails the build if Ask answers or the AI content repeat locked reveals |
| About window showed garbled text at the bottom: work-history summaries picked up an old leftover `.note` style | Fixed: class renamed, dead style removed, window gets proper work-history styles |
| Search panel would call the AI after every pause while typing | Fixed: AI is tried only on Enter, max 5 per visit |
| Drawings' pop-in could replay after other animations | Fixed |
| AI function | POST only, same-site origin required, question capped at 300 characters, 300 output tokens, answers from public content only, key only in Netlify env, fails closed to the email path. No server-side rate limit: the API key's monthly spend limit is the backstop |
| Tests | 34 pass. WCAG checks at 8 sizes and axe (light and dark): clean. Unlock works. Lighthouse mobile recorded below |
