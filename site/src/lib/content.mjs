// Reads case studies and testimonials from /content and prepares them for pages.
import { readFileSync } from 'node:fs';
import { pbkdf2Sync, randomBytes, createCipheriv } from 'node:crypto';
import { marked } from 'marked';

const root = new URL('../../../content/', import.meta.url);
const read = p => readFileSync(new URL(p, root), 'utf8');

// folder name in /content -> URL slug
export const STUDIES = [
  { dir: 'mavi', slug: 'mavi', preview: null },
  { dir: 'copperleaf', slug: 'copperleaf', preview: '/img/preview-copperleaf.jpg' },
  { dir: 'uiavenue', slug: 'ui-avenue', preview: '/img/preview-ui-avenue.jpg' },
];

function parse(dir) {
  const [, fm, md] = read(`${dir}/index.md`).match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const meta = Object.fromEntries(fm.split('\n').map(l => l.split(/:\s(.*)/s).slice(0, 2)));
  return { meta, md };
}

export function testimonials() {
  return read('testimonials.md').split(/^## /m).slice(1).map(b => {
    const [name, place, title, , , ...q] = b.trim().split('\n');
    return { name, place: place.replace('place: ', ''), title, quote: q.join(' ').replace(/^> /, '') };
  });
}

export function encrypt(html, password) {
  const salt = randomBytes(16), iv = randomBytes(12);
  const key = pbkdf2Sync(password, salt, 200000, 32, 'sha256');
  const c = createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([c.update(html, 'utf8'), c.final(), c.getAuthTag()]);
  return { s: salt.toString('base64'), i: iv.toString('base64'), c: ct.toString('base64') };
}

export function study(slug, password) {
  const entry = STUDIES.find(s => s.slug === slug);
  const { meta, md } = parse(entry.dir);
  const body = md
    .replace('<!-- lock -->', '@@LOCK@@')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^\[JARELL\].*$/gm, '')
    .replaceAll('{{presentation}}', meta.presentation || '#');
  const html = m => marked.parse(m)
    .replace(/src="img\//g, `src="/work/${entry.dir}/`)
    .replace(/<p><img ([^>]*?)alt="([^"]*)"([^>]*)><\/p>/g, '<figure><img $1alt="$2"$3 loading="lazy"><figcaption>$2</figcaption></figure>');
  const [pub, locked = ''] = body.split('@@LOCK@@');
  const isLocked = locked.trim().length > 0;
  return {
    meta,
    publicHtml: html(pub),
    payload: isLocked ? encrypt(html(locked), password) : null,
    quotes: testimonials().filter(p => p.place === entry.dir),
    more: STUDIES.filter(s => s.slug !== slug).map(s => ({ ...s, meta: parse(s.dir).meta })),
  };
}

export function about() {
  const [, fm, md] = read('about.md').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  return { html: marked.parse(md.replace(/^\[JARELL\].*$/gm, '')) };
}

// Older case studies kept as they were in 2020, reachable from the Work page.
export const EARLIER = [
  { href: '/2020/chiropractor.html', title: 'Realigning Chiropractor Clinics', note: 'Freelance, 2019' },
  { href: '/2020/automotiveindustry.html', title: 'Redefining the Automotive Industry', note: 'Convertus, 2017 to 2019' },
  { href: '/2020/landingpageredesign.html', title: 'Redesigning Auto Landing Pages', note: 'Convertus, 2018 to 2019' },
];
