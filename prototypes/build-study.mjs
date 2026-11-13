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
const img = h => h.replace(/src="img\//g, `src="../../content/${slug}/img/`);
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
  .replace('{{public}}', pub)
  .replace('{{payload}}', JSON.stringify({ s: b64(salt), i: b64(iv), c: b64(ct) }));
writeFileSync(new URL(`./os/${slug}.html`, import.meta.url), page);
console.log(`built os/${slug}.html (${ct.length} encrypted bytes)`);
