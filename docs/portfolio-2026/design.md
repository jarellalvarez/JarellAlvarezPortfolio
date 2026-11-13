# Portfolio 2026: design doc

For approval. One page. Approving this is the go-ahead to build the real site.

## What it is

A portfolio for a senior product designer that reads clearly in the first minute and has personality after that. The homepage is a small desktop: your name, a row of folders, a dock. Everything a recruiter needs also works as a plain page with its own link.

## Color

| Token | Light | Dark |
| --- | --- | --- |
| Page | Ivory `#F7F4EC` | Charcoal `#1F1E1C` |
| Surface (windows, cards) | `#FDFCF8` | `#292826` |
| Ink (name, text) | Charcoal `#2B2A28` | Ivory `#F7F4EC` |
| Secondary text | `#6B665C` | `#B3ADA1` |
| Folders | `#5F5A52` | `#BDB6A8` |
| Shapes | `#DEDAD1` / `#B9B2A3` | `#6F6A60` |

- No pure black or pure white anywhere.
- Loads in light mode. Dark is one click away in the theme menu.
- Accent is off by default. Visitors can pick yellow `#FFD400`, blue `#1447FF`, taupe `#9F947A` (the original logo color) or red `#FF3B1F`. The accent only touches hover states, the active contents item and the corner shapes.

## Type

| Use | Font |
| --- | --- |
| Name, headings, pull quotes | Instrument Serif |
| Everything else | Instrument Sans |

- Both are open-source and hosted with the site, no outside font service.
- One scale, ratio 1.25 from 17px body. Body line height 1.6, text column capped at 65 characters.
- Headings 1.1 to 1.2 line height and balanced line breaks. Numbers in tables and stats line up.

## Logo and shapes

- The logo stays as drawn, shown in ink (charcoal or ivory depending on mode).
- Its three pieces (rounded bar, triangle, rectangle) are the site's only decoration:
  - small, bottom right of the homepage, where they play every few seconds
  - one mark at the end of each case study
  - a corner on the lock card
  - the placeholder for projects that cannot show screens
- Not used as section bullets, dividers or backgrounds behind text.

## Motion

| Thing | Behavior |
| --- | --- |
| Folders | Lift and open slightly on hover, paper peeks out, preview card appears |
| Dock | Icons grow toward the pointer |
| Windows | Follow the pointer exactly when dragged. Expand to an inset view |
| Theme menu | Springs open from its button |
| Corner shapes | One short hop, tumble or pop every 6 to 8 seconds, and on click |

Reduced-motion setting: shapes hold still, transitions become instant, nothing auto-plays.

## Components

Folder, window (title bar with Expand and Close, contents sidebar when expanded), dock, theme menu, case-study header (title + facts), stat row, figure with caption, two-up images, lock card, quote card with faded Read more, more-work card with preview, end mark.

## Pages and URLs

| URL | Page | Locked |
| --- | --- | --- |
| `/` | Homepage desktop | No |
| `/work/mavi` | MAVI Client Portal | Overview public, details behind password |
| `/work/copperleaf` | Copperleaf Framework Designer | Overview public, details and deck link behind password |
| `/work/ui-avenue` | UI Avenue | No |
| `/work` | All work, including earlier projects | No |
| `/about` | About, with four quotes | No |
| `/kind-words` | The rest of the quotes (also opens as a window) | No |
| Resume | Current PDF | No |

Old 2020 pages stay reachable under `/2020/`.

## How it gets built

- **Astro**, a static site generator. Every page is a real HTML file, so it loads fast, works without scripts, and can be hosted anywhere.
- Content stays in the Markdown files that already exist in `content/`. Editing a case study means editing one text file.
- The desktop behavior (windows, dock, theme, shapes) is one small script on top.
- Locked sections are encrypted when the site is built, the same way the prototype does it. Locked images get the same treatment. The password is set at build time and never stored in the repo.
- Images are resized and compressed automatically at build.
- No database, no CMS, no tracking for launch.

## Launch scope

| In | Later |
| --- | --- |
| Homepage, three case studies, About, Kind words, All work, resume, copy-email | Typed cursor notes, several windows open at once, minimize |
| Light / dark, accent menu, phone layout | Community and Photography pages in full |
| Password lock, reduced-motion support | AI concierge, background music |

## Still open

- Final case-study titles (MAVI's is a placeholder)
- Current resume PDF
- About: volleyball, AI and hiking details, travel count
- What `nav4` / Prevue HR refers to
- Hosting and domain switch (decided at launch, separately)
