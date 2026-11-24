# Handoff: Jarell Alvarez portfolio 2026 (start a new chat from this)

Read this first, then `docs/handoff/STATE.md`. Everything else is reference.

## What this is
Jarell's portfolio ("Personal Design OS"): Astro 5 static site in `site/`, content in `content/`, repo `jarellalvarez/JarellAlvarezPortfolio`. Live on Netlify at jarellalvarez.com (root `netlify.toml`: base `site`, publish `dist`). DigitalOcean move is backlogged (`docs/migration-digitalocean.md`).
Working branch: `claude/confident-wozniak-8n4wv1`. `master` = live.

## Standing rules (do not break)
- No deploy, no merge to `master` without Jarell saying "ship it". Each push to `master` costs Netlify credits.
- Show results (screenshots, GIFs) before shipping. Work on the branch.
- Netlify build needs `STUDY_PASSWORD` (Builds scope, Production). Never commit it. Build refuses without it (`site/src/lib/password.mjs`).
- Plan first, get approval, then build (he usually answers with changes in one message). One topic at a time for server or troubleshooting.
- Opus 5.5 does independent reviews of big rounds (Agent with `model: "opus"`, read-only).
- Hidden constraints: no em dashes anywhere, concise answers, no AI-sounding filler, do not mention Murrick Insurance or Fideli Software, prefer newer information when facts conflict.
- Not in scope unless he asks: image descriptions, case-study content accuracy rewrites, the three mini-game concepts.

## How the chat should respond (his preferences)
Short paragraphs, tables when useful, "at a glance" summaries, direct recommendations, copy-paste-ready wording. Warm but direct. Lead with what changed and what needs his decision. List "Please check" items for assumptions. When he sends screenshots with notes, answer each note in order in a table (ask, result). Report failures honestly (tests, builds).

## Skills and tools used
Installed in `.claude/skills` (see `skills-lock.json`): `apple-design` (motion, springs, materials), `svg-animation` (his Illustrator drawings), `typography`. Also used from the environment: `ui-ux-pro-max`, `frontend-design`, `no-ai-slop`, `jarell-alvarez-voice`, `portfolio-case-study-writer`, `code-review`, `security-review`, `figma-use` and `figma-generate-library` (Figma file `5TjQUqil2gUNCFHOoAzBnt`, page "Portfolio 2026 Design System"). Playwright (`require('playwright')`) for screenshots, axe-core for accessibility, PIL for GIFs.

## QA scripts (docs/handoff/qa-scripts)
Run against a local server: `cd site/dist && python3 -m http.server 4329`.
`guided.js` (one gesture = one tour step), `axejr.js` (axe at six tour positions, light and dark), `ph.js` (phone layout at 5 sizes), `r4.js`/`r5.js` (previews, bubble, phone bar screenshots), `badge.js`, `stops.js`. Tests: `cd site && npm test` (52 tests).
Build: `cd site && npm run build` (about 4.5 min the first time because AVIF images; cached later).

## Needs Jarell
- Hand-drawn smaller home icon for the Back pill: displayed at 18px; draw on a 72x72 px canvas (4x), 6px stroke, export SVG `viewBox="0 0 24 24"` (about 1.75px stroke).
- Higher-res originals: 9 Copperleaf images under 1000px, headshot (800px).
- Confirm Netlify credits plan; DNS/DO migration is parked.
- Role line wording ("Senior Product Designer and Design Instructor"?), MAVI folder soft shadow (queued).
