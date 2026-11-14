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

// locked = true embeds images inside the HTML so they travel encrypted with the text
export function render(md, { dir, meta, coll = 'work' }, locked = false) {
  const stats = (meta.stats || []).map(s => `<div><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join('');
  const src = md
    .replace(/<!--(?! lock -->)[\s\S]*?-->/g, '')
    .replace(/^\[JARELL\].*$/gm, '')
    .replaceAll('{{presentation}}', meta.presentation || '#')
    .replace(/^:::pair\s*$/gm, '<div class="duo">\n').replace(/^:::\s*$/gm, '\n</div>');
  return marked.parse(src)
    .replace(/<p>\{\{stats\}\}<\/p>/g, stats ? `<div class="stats">${stats}</div>` : '')
    .replace(/src="img\/([^"]+)"/g, (_, f) => {
      const file = new URL(`${coll}/${dir}/${webp(f)}`, cache);
      const orig = new URL(`${coll}/${dir}/${f}`, cache), use = existsSync(file) ? file : orig;
      if (locked && existsSync(use)) return `src="data:image/${use === file ? 'webp' : f.split('.').pop().replace('jpg', 'jpeg')};base64,${readFileSync(use).toString('base64')}"`;
      return `src="/${coll === 'work' ? 'work' : 'earlier-img'}/${dir}/${existsSync(file) ? webp(f) : f}"`;
    })
    .replace(/<p><img ([^>]*?)alt="([^"]*)"([^>]*)><\/p>/g, '<figure><img $1alt="$2"$3 loading="lazy"><figcaption>$2</figcaption></figure>');
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

