# Design system

One source of truth: `site/src/styles/tokens.css` (type, spacing, shape, motion, layers) and `site/src/styles/themes.css` (color). Every other stylesheet reads these variables. The live reference page is `/design-system/`.

## Color
Six palettes, each with a light and a dark version: Ivory (default), Stone, Sage, Ink, Clay, High contrast. Switched by `html[data-palette]` and `html[data-theme]`. `tests/themes.test.mjs` fails the build if any pair drops below these ratios.

| Token | Use | Rule |
| --- | --- | --- |
| `--bg` | Page background | |
| `--surface` | Cards, windows, inputs | |
| `--ink` | Body text, main icons | 4.5:1 on `--bg` and `--surface` |
| `--ink-2` | Secondary text, drawings | 4.5:1 |
| `--folder` | Folder icons | 3:1 on `--bg` |
| `--accent` / `--on-accent` | Primary button and its text | 3:1 |
| `--pop` | Role line, lightbulb glow, underline squiggle | 3:1 |
| `--danger` | Errors | 4.5:1 |
| `--shape`, `--toy` | Logo shapes (decorative) | |
| `--line` | Hairlines, derived from `--ink` | derived |
| `--chrome` | Translucent bars (dock, window title) | derived |
| `--ctl-close`, `--ctl-min`, `--ctl-max` | Window dots, same in every theme | |

## Type
Four pairings (Bricolage Grotesque default, Familjen Grotesk, Syne with Manrope, Atkinson Hyperlegible), chosen in the Style panel by `data-font`. Scale ratio 1.25 from 17px: `--t--2` .75rem, `--t--1` .85rem, `--t-0` 1.0625rem, `--t-1` 1.328rem, `--t-2` 1.66rem, `--t-3` 2.075rem, `--t-4` 2.594rem, `--t-5` 3.242rem. `--display` for the name and headings, `--sans` for everything else. Text size (`data-size`: s, default, l, xl) scales the whole site because everything is in rem.

## Spacing, shape, layers
- Spacing `--s-1` .25rem to `--s-9` 5rem (4px base).
- Radius `--r-sm` 6px, `--r-md` 10px, `--r-card` / `--r-win` 14px, `--r-pill` 999px.
- Shadow `--shadow` (one soft elevation; dark mode adds a hairline ring).
- Layers: `--z-header` 80, `--z-coach` 80, `--z-ask` 300, `--z-snap` 390, `--z-lightbox` 1000. Homepage windows stack from 21 upward and sit at 120 on phones.

## Motion
Durations `--dur-1` .12s (press), `--dur-2` .22s (hover, close), `--dur-3` .36s (window open), `--dur-4` .6s (page rise). Curves: `--ease-out`, `--ease-inout`, `--spring` (small overshoot), `--ease-sketch`, `--soft`. Only transform, opacity, clip-path, stroke-dashoffset and one short glow are animated. `prefers-reduced-motion` turns movement off everywhere and leaves every drawing fully visible; phones keep only the line-draw.

## Illustrations
Jarell's Illustrator drawings, inlined so each part can move. Sizes come from one scale: `--ill` (heading drawing, 3.6rem; 2.9rem on phones), `--ill-max-h`, `--slot`, with `--k = sqrt(width/height)` set per drawing so tall and wide drawings carry equal weight. Variants: `.dd.lead` (heading), `.dd.float` (mountains), `.dd.under` (stats squiggle), `.dd.portrait` (self portrait), `.hero-art .dd` (homepage). First load draws the outline with a pen stroke, then the fill settles in; each drawing then does one small action (coffee steam, plane glide, bulb glow, arrow boing, volleyball bounce).

## Components and states

| Component | States | Notes |
| --- | --- | --- |
| Folder (`Folder.astro`) | rest, hover (paper lifts, preview types in), focus-visible, dragging, occupied (window open: filled paper), minimized | Draggable on desktop only; Enter/Space opens. |
| Window (`Window.astro`, `home.js`) | floating, expanded, minimized, dragging, resizing, focused/unfocused, phone inset with scrim | Title bar drags; dots are 32px hit areas; double-click a grip for full size. |
| Tabs | active, inactive, dragging, solo (no X, no pill), overflow "..." menu | Drag a tab out to tear it off or snap. |
| Snap panel | hidden, visible, target hover | Tile left or right, stack, full screen. |
| Dock (`Dock.astro`) | rest, hover (label tooltip), focus-visible, copied (contact) | Four items. |
| Buttons (`.btn`, `.btn.solid`, `.rm`, `.mail`) | rest, hover, active (scale .97), focus-visible, disabled | 44px minimum target on touch. |
| Lightbox (`lightbox.js`) | closed, loading (thumbnail first), open, zoomed, panning | Close: X, Esc, backdrop. Zoom: + / - / 0, wheel, pinch, double click or tap. Focus trapped, returns to the picture. |
| Tooltip (`.tip`) | hidden, shown on hover and focus | Never the only way to get information. |
| Ask Jarell (`ask.js`, `chat.js`) | closed, spotlight, window pane, top-bar panel, answering, AI answer label, no match (email) | Pills: 3 normally, 1 after a typed question, "..." menu. |
| Style panel | closed, open, randomize | Theme, font, size, mode. |
| Lock card | locked, wrong password, unlocked | Locked text and images are encrypted at build time. |
| Quote, stats row, more-work card, CTA | rest, hover | |

## Rules of the system
- New colors go in `themes.css` with a contrast check; new sizes, durations, layers and radii go in `tokens.css` first.
- No em dashes in UI copy, no invented metrics, decorative drawings are `aria-hidden`.
- Every image needs a description (it is the caption and the lightbox text); a test enforces it.
