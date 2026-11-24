# Current state and decisions (as of Nov 24, round 5)

## Shipped on master (round 4, 0e10652)
Scroll tour with guided stepping, 2x2 previews (60%+ of the screen), group headings "My work" / "Learn more", tags in folder hover cards, helper lines per tour stop, drag tip above the MAVI folder.

## On the branch, not shipped (round 5, awaiting "ship it")
- Tour windows 30% bigger, lighter body text, more padding, folder glyph in the title bar.
- Helper bubble: bounces in, types out, always shows the current stop's line (also scrolling up), narrower on desktop so it clears the cards.
- Scroll more sensitive on desktop (3px threshold).
- Phone: tour tiles one column and bigger; volleyball moved bottom left and small.
- Header on inner pages: Resume (new tab) and Contact (scrolls to the contact block); hidden on phones.
- Back pill: always "Back to Home" with a home icon (history-back behaviour kept).
- Phone app bar: dock floats centred beside the helper, becomes a full-width bottom bar after the first scroll on every page (`appbar.js`, `appbar.css`, `Dock.astro` with `sub` prop on inner pages, Ask tab there).
- Scroll reveal on About and case-study pages (`site.js`, `.rv` classes).
- Opus audit requested; findings in `docs/handoff/AUDIT.md` when done.

## Key architecture
- Tour: `site/public/js/journey.js` (STOPS = [0,.2,.34,.48,.66,1]; stage mode needs 721x561 and motion; flow mode = plain stack). Events: `journey:stop` drives the helper.
- Stacking: `.desk` z-index 1 over `.j-stage` z 0; Journey sits after `.desk` in `index.astro`.
- Helper: `buddy.js`; bubble CSS in `home.css` (`.bsay`, `.pop`).
- Tokens: `site/src/styles/tokens.css`, `themes.css` (6 themes x light/dark; contrast test in `tests/themes.test.mjs`).
- Content: `content/work/*/index.md` (with `tags:`), `content/about.md`, `content/ask.json`.
- Docs: `docs/design-system.md`, `docs/editing-the-site.md`, `docs/launch-checklist.md`, `docs/ux-review/PORTFOLIO_UX_REVIEW.md`, `PROGRESS.md` (log).

## Decision log (short)
Nov 12: light default, ivory + charcoal, Bricolage Grotesque, accent picker. Nov 14: window controls like macOS on the right, Earlier work pages, Back button. Nov 16: Netlify credits: deploy only on "ship it". Nov 17: Ask Jarell as a window, AI fallback (Haiku) behind `ANTHROPIC_API_KEY`. Nov 19: Illustrator SVGs inline with line-draw animation, lightbox, design tokens, Figma system. Nov 23: scroll tour ("windows cascade") with side rail and end screen. Nov 24: rounds 3 to 5 (guided scroll, previews, helper, app bar).
