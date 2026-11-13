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
