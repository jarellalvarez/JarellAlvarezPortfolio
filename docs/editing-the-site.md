# Editing the site yourself

All the words and images live in plain files in this repo (`content/`). You do not need Claude to change them. Pick the route that fits.

## Route A: the visual editor on your Mac (recommended)
It looks like a normal form editor (pages, About, kind words, Ask answers, image uploads). It runs on your own computer, needs no login and is never put on the live site.

One-time setup (Terminal, in the project folder):
```bash
cd site
npm install
```

Each time you want to edit, open two Terminal windows in `site/`. First window:
```bash
npx decap-server
```
Second window:
```bash
npm run dev
```
Open `http://localhost:4321/admin/` in your browser. Edit, upload images, press Publish (this saves the files on your Mac only).

Then publish the changes:
```bash
git add -A
git commit -m "Edit content"
git push
```
Build and upload (the study password must be in `site/.env`):
```bash
npm run build
```
Upload the contents of `site/dist/` to the server with FileZilla (after the move to DigitalOcean). Check the live page.

## Route B: edit text on GitHub, no tools
Open the file on github.com (for example `content/about.md`), click the pencil, edit, commit. Then do the build and upload steps above. Good for a quick wording fix.

## Where things are
| What | File |
| --- | --- |
| About page text and work history | `content/about.md` |
| Case studies | `content/work/<name>/index.md` (images in its `img/` folder) |
| Kind words | `content/testimonials.md` |
| Ask Jarell written answers | `content/ask.json` |
| Resume | `site/public/resume.pdf` |

## Rules that keep things safe
- Put new images in the study's `img/` folder and refer to them in the text as `![A real description](img/file.png)`. The description is the caption and the lightbox text, and the build fails if it is missing.
- Everything below the `<!-- lock -->` line in a case study is password protected; do not move a locked image above it.
- Do not type the study password into any file in `content/`.
- No em dashes in the site's words.

## Later: automatic publishing
A GitHub Action can build and upload to the server every time you push, so Route B becomes the entire workflow. It is prepared in `deploy/` but not switched on.
