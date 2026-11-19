// Reads case studies, testimonials and the About text from /content and prepares them for pages.
// The admin editor (/admin) writes to the same files.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { pbkdf2Sync, randomBytes, createCipheriv } from 'node:crypto';
import { marked } from 'marked';
import matter from 'gray-matter';

const root = new URL('../../../content/', import.meta.url);
const read = p => readFileSync(new URL(p, root), 'utf8');

export const LOCK = '<!-- lock -->';

// Every folder in /content/work with an index.md is a case study. `order` sets the sequence.
// coll is 'work' (featured) or 'earlier' (the 2019 studies, kept as written)
export function studies(coll = 'work') {
  return readdirSync(new URL(`${coll}/`, root), { withFileTypes: true })
    .filter(d => d.isDirectory() && existsSync(new URL(`${coll}/${d.name}/index.md`, root)))
    .map(d => {
      const { data, content } = matter(read(`${coll}/${d.name}/index.md`));
      return { coll, dir: d.name, slug: data.slug || d.name, preview: data.preview || null, meta: data, md: content };
    })
    .sort((a, b) => (a.meta.order ?? 99) - (b.meta.order ?? 99));
}

export function testimonials() {
  return JSON.parse(read('testimonials.json')).items;
}

export function encrypt(html, password) {
  const salt = randomBytes(16), iv = randomBytes(12);
  const key = pbkdf2Sync(password, salt, 200000, 32, 'sha256');
  const c = createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([c.update(html, 'utf8'), c.final(), c.getAuthTag()]);
  return { s: salt.toString('base64'), i: iv.toString('base64'), c: ct.toString('base64') };
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Markdown plus three small additions: {{stats}}, {{presentation}} and :::pair ... ::: for two images side by side.
const cache = new URL('../../.cache/img/', import.meta.url);
const webp = f => f.replace(/\.(png|jpe?g)$/i, '.webp');
const manifest = (() => { try { return JSON.parse(readFileSync(new URL('manifest.json', cache), 'utf8')); } catch { return {}; } })();
// public images: <picture> with AVIF and WebP at several widths (the browser picks one); data-full is the biggest copy for the lightbox.
// locked images: one WebP embedded inside the encrypted page. Width and height are set so the page never jumps.
function image(attrs, f, coll, dir, locked) {
  f = decodeURIComponent(f); const m = manifest[`${coll}/${dir}/${f}`], base = webp(f), url = `/${coll === 'work' ? 'work' : 'earlier-img'}/${dir}/`;
  if (!m) { const orig = new URL(`${coll}/${dir}/${f}`, cache); return locked && existsSync(orig) ? `<img ${attrs.trim()} src="data:image/${f.split('.').pop().replace('jpg', 'jpeg')};base64,${readFileSync(orig).toString('base64')}" loading="lazy" decoding="async">` : `<img ${attrs.trim()} src="${url}${f}" loading="lazy" decoding="async">`; }
  if (locked) { const useLocked = m.locked, file = new URL(`${coll}/${dir}/${useLocked ? base.replace(/\.webp$/, '-locked.webp') : base}`, cache), w = useLocked ? 2000 : m.w;
    return `<img ${attrs.trim()} src="data:image/webp;base64,${readFileSync(file).toString('base64')}" width="${w}" height="${Math.round(m.h * w / m.w)}" loading="lazy" decoding="async">`; }
  const stem = base.replace(/\.webp$/, ''), set = ext => [...m.steps.map(w => `${url}${stem}-${w}.${ext} ${w}w`), `${url}${stem}.${ext} ${m.w}w`].join(', '), sizes = '(max-width: 760px) 100vw, 720px';
  return `<picture><source type="image/avif" srcset="${set('avif')}" sizes="${sizes}"><source type="image/webp" srcset="${set('webp')}" sizes="${sizes}"><img ${attrs.trim()} src="${url}${base}" data-full="${url}${base}" width="${m.w}" height="${m.h}" loading="lazy" decoding="async"></picture>`;
}

// locked = true embeds images inside the HTML so they travel encrypted with the text
export function render(md, { dir, meta, coll = 'work' }, locked = false) {
  const stats = (meta.stats || []).map(s => `<div><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join('');
  const src = md
    .replace(/<!--(?! lock -->)[\s\S]*?-->/g, '')
    .replace(/^\[JARELL\].*$/gm, '')
    .replaceAll('{{presentation}}', meta.presentation || '#')
    .replace(/^:::pair[ \t]*$/gm, '<div class="duo">\n').replace(/^:::[ \t]*$/gm, '\n</div>\n');
  return marked.parse(src)
    .replace(/<p>\{\{stats\}\}<\/p>/g, stats ? `<div class="stats">${stats}</div>` : '')
    // figure + caption first (the caption is the image's own alt text), then each image becomes a responsive <picture>
    .replace(/<p><img ([^>]*?)alt="([^"]*)"([^>]*)><\/p>/g, '<figure><img $1alt="$2"$3><figcaption>$2</figcaption></figure>')
    .replace(/<img ([^>]*?)src="img\/([^"]+)"([^>]*)>/g, (_, a, f, c) => image(a + c, f, coll, dir, locked));
}

export function study(slug, password, coll = 'work') {
  const all = studies(coll);
  const entry = all.find(s => s.slug === slug);
  const [pub, locked = ''] = entry.md.split(LOCK);
  const isLocked = locked.trim().length > 0;
  return {
    meta: entry.meta,
    publicHtml: render(pub, entry),
    payload: isLocked ? encrypt(render(locked, entry, true), password) : null,
    quotes: testimonials().filter(p => p.place === entry.dir),
    more: coll === 'work' ? all.filter(s => s.slug !== slug) : studies('work'),
  };
}

export function about() {
  const { data, content } = matter(read('about.md'));
  return { meta: data, html: marked.parse(content.replace(/^\[JARELL\].*$/gm, '')) };
}

