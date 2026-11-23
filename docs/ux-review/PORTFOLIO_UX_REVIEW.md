# Portfolio UX review (Ruben's feedback + Jarell's layout handoff)

Status: audit done, nothing implemented. Working branch `claude/confident-wozniak-8n4wv1` (clean, pushed). `master` is at the same commit but the Netlify build of it failed (missing `STUDY_PASSWORD`), so the live site still shows the older version. Source of truth is this repository, not the exported preview ZIP.

Ground rules: Ruben's points are one person's observations. Nothing below is approved until Jarell says Approve. Baseline screenshots are in `assets/` (`home-1440`, `home-1024`, `home-390`, `home-375`, `about-390`, `work-1440`, `mavi-390`).

## Review table (Ruben's observations)

| # | Ruben's observation | Observed problem? | Evidence from the source and the running site | Risk / effort | Jarell decision |
| --- | --- | --- | --- | --- | --- |
| A | Top-right nav and bottom bar look duplicated | **Yes, confirmed. Fixed (option C).** On the home page the dock (Home, Work, Resume, Contact) repeats the top bar (logo = Home, Work, About, Resume, Contact) with the same destinations. Only About is not in the dock. Inner pages have a header only, no dock. | `HomeNav.astro` vs `Dock.astro`; Playwright link inventory | Low to medium | **Pending (topic 1, options attached)** |
| B | Resume should pop more | **Partly.** Resume is in 4 places (top bar text link, dock icon, solid button on About, CTA card). In the top bar it looks like every other link. | `HomeNav.astro`, `Dock.astro`, `about.astro`, `Cta.astro`; PDF opens in a new tab | Low | Not started |
| C | Replace seven icons with a left rail that scales logos on scroll | **Unclear / likely no.** The seven icons are folders (3 case studies, About, Community, Photography, Kind words) that open windows or outside sites. The home page does not scroll on desktop, so scroll-scaling has nothing to attach to. | `index.astro`, `Folder.astro` | Medium | Not started (I would challenge this) |
| D | Richer previews while scrolling | **Already partly there.** Hover gives a typed preview card. The home page is a one-screen desktop, so scroll storytelling would change the concept. | `home.css` `.peek` | Medium | Not started (challenge) |
| E | MAVI case study: clearer A/B story, smaller images | **Needs content review first** (out of scope for layout push; no invented comparisons). | `content/work/mavi/index.md` | Medium | Deferred |
| F | Photography on the portfolio instead of a separate site | **Real friction, but depends on rights and sources.** Folder opens `jarell.photography` in a new tab. | `links.mjs`, `index.astro` | High | Not started |
| G | Chat entry point bigger and clearer | **Partly.** The helper is a 76x84px sticky note bottom-left with a "Need a hand?" bubble, but the bubble only shows now and then (`.bsay` is hidden until triggered). | `buddy.js`, `home.css` `.bsay` | Low | Not started |
| H | Style consistency / About on mobile | **Not reproduced.** Theme and size are restored before paint on every route. About is already one column on phones. Needs a reproducible case. | `Base.astro` inline script, axe and reflow tests | Low | Not started |
| I | Personality icons around the name | **Mostly exists.** The hand-drawn pieces around the name already do this. Linking them to facts would be new behaviour. | `.hero-art` | Medium | Not started (low priority) |
| J | Photography screensaver / autoplay | **Not on this site.** Likely refers to the photography site. | n/a | n/a | Defer or reject |

## Handoff items (Jarell's own layout push)

| Item | Finding | Proposed approach |
| --- | --- | --- |
| Netlify badge | **It is not in our code.** Playwright finds no badge element in the rendered DOM; it is added by Netlify on the deployed site (fixed, bottom right, about 176x40px, 16px margin). It cannot be moved from the repo, and it should not be hidden. A supported setting may exist in the Netlify dashboard; I cannot see it from here. | Keep the reserved zone, but tie every calculation to one token (`--badge-h`, `--badge-w`) and stop adding reservations elsewhere. Check the Netlify site settings for a supported option. |
| Logo shapes back to bottom right | They moved up only to clear the badge. | Put them on the bottom edge to the left of the badge zone, same baseline as the badge, so they stay bottom-right without being covered. |
| Mobile layout larger, may scroll | Current phone layout is tuned to fit one screen, which makes short phones tight. | Allow scrolling below the dock on short phones; larger tiles and labels. |
| MAVI tilted on mobile | **Verified bug, found in the drag tip, not the app tile.** The first-visit tip sets an inline `translate(0,-14px) rotate(-6deg)` on the MAVI folder. After Skip or finishing, `done()` removes the class but never clears that inline style, so MAVI stays lifted and tilted until reload. On a narrowed desktop window the same style shows on the phone tile. | One-line fix: clear the inline transform in `done()` and at phone width. Small, safe, awaiting approval. |
| Two sticky notes | Verified roles against `content/about.md`: Lead Product Designer, MAVI (2026 to now); Senior Product Designer, Copperleaf (2021 to 2024); Founding Product Designer, UI Avenue (2019 to 2021); Senior Product UI/UX Designer, Convertus (2017 to 2019); 9+ years. | Show placement options first (desktop has little free space around the centred hero). One illustration only, subtle. |
| Drag tip redesign | Banner is dark and wide; it sits under MAVI where the arrow and cursor drawings are. | Show 3 options before building. |

## Suggested order of topics
1. Navigation duplication (A), options attached.
2. MAVI tilt bug fix (tiny) and badge / bottom-right composition together.
3. Drag tip redesign.
4. Sticky notes.
5. Resume prominence (B), chat affordance (G).
6. Photography (F) after rights and sources are confirmed.
7. Challenge or reject: C, D, I, J.

## Decision log
| Date | Topic | Decision |
| --- | --- | --- |
| 2026-11-23 | Audit | Done, no code changed |
| 2026-11-23 | A. Navigation | **Approved: option C.** Desktop shows the top bar only (larger type), dock hidden. Phones show a labelled dock (Home, Work, Resume, Contact), top bar is logo plus Style. Built, tested at 8 sizes (axe clean on desktop and phones, light and dark). |
| 2026-11-23 | D. Scroll previews | **Approved: option 3, windows cascade**, plus a glass side rail the nav glides into (fade to 10%, then travel), a scroll hint, preview cards for About, Community, Photography and Kind words, and a full-screen end screen. Built on the working branch, independent Opus 5.5 review done (5 high, 6 medium findings fixed). Awaiting Jarell's visual review and end-copy approval. |
