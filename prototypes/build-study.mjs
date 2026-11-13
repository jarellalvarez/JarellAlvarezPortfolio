// Builds a password-locked case study page from Markdown.
// Usage: STUDY_PASSWORD=... node build-study.mjs copperleaf
// The body is AES-256-GCM encrypted; only the teaser is readable in the page source.
import { readFileSync, writeFileSync } from 'node:fs';
import { pbkdf2Sync, randomBytes, createCipheriv } from 'node:crypto';
import { marked } from 'marked';

const slug = process.argv[2] || 'copperleaf';
const pw = process.env.STUDY_PASSWORD;
if (!pw) { console.error('Set STUDY_PASSWORD'); process.exit(1); }

const raw = readFileSync(new URL(`../content/${slug}/index.md`, import.meta.url), 'utf8');
const [, fm, md] = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
const meta = Object.fromEntries(fm.split('\n').map(l => l.split(/:\s(.*)/s).slice(0, 2)));
const body = md
  .replace('<!-- lock -->', '@@LOCK@@')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/^\[JARELL\].*$/gm, '')
  ;
const img = h => h.replace(/src="img\//g, `src="../../content/${slug}/img/`)
  .replace(/<p><img ([^>]*?)alt="([^"]*)"([^>]*)><\/p>/g, '<figure><img $1alt="$2"$3 loading="lazy"><figcaption>$2</figcaption></figure>');
// other case studies, shown at the bottom of every study
const all = ['mavi', 'copperleaf', 'uiavenue'].filter(s => s !== slug).map(s => {
  if (s === 'uiavenue') return { href: '../../uiavenue.html', company: 'UI Avenue', title: 'Making business analytics make sense', summary: 'A reporting app that makes Google Analytics readable for shop owners.' };
  const m = Object.fromEntries(readFileSync(new URL(`../content/${s}/index.md`, import.meta.url), 'utf8').match(/^---\n([\s\S]*?)\n---/)[1].split('\n').map(l => l.split(/:\s(.*)/s).slice(0, 2)));
  return { href: `${s}.html`, company: m.company, title: m.title, summary: m.summary };
});
const people = readFileSync(new URL('../content/testimonials.md', import.meta.url), 'utf8').split(/^## /m).slice(1).map(b => {
  const [name, pl, title, rel, , ...q] = b.trim().split('\n');
  return { name, place: pl.replace('place: ', ''), title, when: rel.replace(/\*/g, ''), quote: q.join(' ').replace(/^> /, '') };
});
writeFileSync(new URL('./os/testimonials.json', import.meta.url), JSON.stringify(people.filter(p => p.place === 'window')));
const mine = people.filter(p => p.place === slug).map(p => `<figure class="said"><blockquote><p>${p.quote}</p></blockquote><figcaption><strong>${p.name}</strong>${p.title}</figcaption></figure>`).join('');
const more = all.map(m => `<a class="card" href="${m.href}"><small>${m.company}</small><strong>${m.title}</strong><span>${m.summary}</span></a>`).join('');
const [pubMd, lockMd = ''] = body.replaceAll('{{presentation}}', meta.presentation || '#').split('@@LOCK@@');
const pub = img(marked.parse(pubMd));
const html = img(marked.parse(lockMd));

const salt = randomBytes(16), iv = randomBytes(12);
const key = pbkdf2Sync(pw, salt, 200000, 32, 'sha256');
const c = createCipheriv('aes-256-gcm', key, iv);
const ct = Buffer.concat([c.update(html, 'utf8'), c.final(), c.getAuthTag()]);
const b64 = b => b.toString('base64');

const page = readFileSync(new URL('./os/study.template.html', import.meta.url), 'utf8')
  .replaceAll('{{title}}', meta.title).replaceAll('{{company}}', meta.company)
  .replaceAll('{{role}}', meta.role).replaceAll('{{timeline}}', meta.timeline).replaceAll('{{team}}', meta.team)
  .replace('{{public}}', pub).replace('{{more}}', more).replace('{{said}}', mine)
  .replace('{{payload}}', JSON.stringify({ s: b64(salt), i: b64(iv), c: b64(ct) }));
writeFileSync(new URL(`./os/${slug}.html`, import.meta.url), page);
console.log(`built os/${slug}.html (${ct.length} encrypted bytes)`);
