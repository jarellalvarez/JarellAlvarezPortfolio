# Handoff: Jarell Alvarez portfolio 2026 (start a new chat from this)

Read this first, then `docs/handoff/STATE.md`. Everything else is reference. Last updated Nov 25, after rounds 6 to 8 shipped.

## What this is
Jarell's portfolio ("Personal Design OS"): Astro 5 static site in `site/`, content in `content/`, repo `jarellalvarez/JarellAlvarezPortfolio`. Live on Netlify at jarellalvarez.com (root `netlify.toml`: base `site`, publish `dist`). DigitalOcean move is backlogged (`docs/migration-digitalocean.md`).
Working branch: `claude/gifted-gates-nwcd68` (the older `claude/confident-wozniak-8n4wv1` is retired). `master` = live, at `8eb884a` plus one setup commit (`b9ba902`, Claude Code cloud setup).

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

## Decisions this round (Nov 24 to 25, all shipped to master)
Phone navigation
- Ask Jarell is a normal labelled item in the phone bottom bar, shown after the first scroll (the face helper hides then). The bar is z-index 100 and sits above all page content; the last tour screen has extra bottom room so the mountains and volleyball clear it.
- Inner-page top bar on phones: name, a More menu (Home, About, Community, Photography) and Style. Work, About, Ask are not repeated up there. Desktop top bar is unchanged.
- Back pill always says "Back to Home" and goes to `/` (the history trail script was removed).
- Homepage windows: "Open as separate page" is now "View full page". On phones the window has expand and minimize buttons and a "View full page" pill at the top of the content (not in the Ask window).
Tour (desktop)
- One gesture plays one whole stage, then waits. While it plays, wheel, keys and swipes do nothing, so nobody can rush to the end. A gentle 2 to 4px wheel nudge starts the next stage; the fading tail of a trackpad flick is ignored.
- Glide is about 1.4s on a soft sine curve (quicker than the 2.7s version Jarell found too slow). Windows are fully opaque. Previews exit in reverse order and the end screen slides over them.
- Still skippable on purpose: side-rail dots, End key, "skip to the end" link. Ask Jarell whether to limit them.
Phones
- Flow mode (no pinned stage) with a fuller echo of the desktop cascade: cards fly in alternately with a turn, contents stagger in, pictures zoom and drift, cards shrink as they leave the top, home screen lifts away, end screen and chips spring in, folder icons float. Mountains show on the last screen; hover or tap replays the drawings.
Ask Jarell face (`site/public/js/face.js`, `talk.js`)
- Moods: happy, delighted, wow, curious, concerned, sorry, thinking, leaving, eager. Mouth snaps between drawn poses (cartoon cycle) with a light line-drawn inside and a tongue line; brows, eyes and tilt ease.
- Reactions: hover on the face (delighted), typing (concerned, then curious), nod on most clicks, wink on copy email, wow on Style and expand, sorry on close, eyes follow scroll direction, hello on arrival (big once per visit), worried goodbye and a line when the cursor leaves through the top, welcome back after a tab switch, idle glances. Hovering anything clickable gives a small perk-up (eager) that settles after about 1.5s.
- Rollercoaster (Nov 25, on the branch, awaiting "ship it"): when the page scrolls the face rides. A nervous climb (wide eyes, worried brows, small "oo" mouth, slight lean back), a screaming drop (brows up, wide mouth, head banks and shakes), then a happy grin. It also plays while he is talking or typing: the head shake is gentler, the eyes and brows lift a little and the mouth poses wobble (width and opening), all easing in and out so it is whimsical, not abrupt. Every tour glide plays it, scaled to the glide time; fast flicks on phones and inner pages play it too (slow scrolls only glance). Code: `Face.ride(ms)` in `face.js`, called from `goTo` in `journey.js`. Jarell confirmed the real-phone and trackpad checks passed.
- Talking: text and mouth share one timeline, fast and snappy (about 3s per answer, capped at 3.2s). No head bobbing while talking (only a slight brow lift); the head stays calm. Click an answer to finish it.
- Reduced motion turns all of it off. The phone bottom-bar face is a static icon.

## Gotchas
- Local build needs `ALLOW_PREVIEW_PASSWORD=1 npm run build` (production refuses without `STUDY_PASSWORD`). Never use that for the live build. Rebuilding replaces `dist`, so restart the `python3 -m http.server 4329` after each build.
- Wait more than 5s after load before testing the face; the arrival hello is still playing before that.
- Phone windows lock `transform` in CSS (`!important`), so their open/close motion uses the `translate` and `scale` properties instead. Tour cards on phones do the same for scroll scale.
- `.desk` has `z-index:auto` on phones so the dock can sit above everything.
- Netlify deploys can wait about 6 minutes in the team queue before they start. A first build on a cold cache converts images and takes about 4.5 more minutes.
- No push to `master` without "ship it". Docs-only pushes to `master` also trigger a build.
- QA scripts for this round are `docs/handoff/qa-scripts/r6-*.js`: `r6-gentle` and `r6-tail` (wheel nudges and trackpad tail), `r6-lock` (rush test), `r6-speed` (answer speed), `r6-talk` and `r6-face` (record the face), `r6-hover` (anticipation), `r6-mob` (phone scroll frames). Each takes an output folder as its argument.

## Needs Jarell
- Hand-drawn smaller home icon for the Back pill: displayed at 18px; draw on a 72x72 px canvas (4x), 6px stroke, export SVG `viewBox="0 0 24 24"` (about 1.75px stroke).
- Higher-res originals: 9 Copperleaf images under 1000px, headshot (800px).
- Confirm Netlify credits plan; DNS/DO migration is parked.
- Role line wording ("Senior Product Designer and Design Instructor"?), MAVI folder soft shadow (queued).
- Check the live site on a real phone and a real trackpad: nudge feel, glide speed, face calm, phone scroll motion. Tell the chat what is too much or too little.
- Confirm what "another type of gesture when the user scrolls" meant. I built eyes that follow the scroll direction; say if it should be something else.

## Next up (suggested order)
1. Fix the oversized images: `preview-mavi.webp` (1600px shown at 600px) and the CTA face image (800px at 96px); add width/height to the 7 home images; then re-check phone home LCP (was 2.06s throttled, caused by the folder entrance animation).
2. Decide whether the side-rail dots and End key should also be limited so the tour cannot be skipped.
3. Decide whether the exit face should need a faster, more deliberate move toward the top edge (it fires on any move there, once every 20s).
4. Give the phone bottom-bar Ask icon some life (it is static today), or leave it.
5. Role line wording, MAVI folder soft shadow, Back pill home icon (needs Jarell's drawing), higher-res Copperleaf images and headshot.
6. DigitalOcean move stays parked until the Netlify credits plan is confirmed.
