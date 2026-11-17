// Runs before every build and dev start.
// 1. Compresses every case-study image to WebP (max 1600px wide) into .cache/img/
// 2. Copies only the images used in the PUBLIC part of each study into public/work/.
//    Images used only below the lock are left out; the build embeds them inside the encrypted section.
// 3. Copies the 2020 archive, the editor files and the editor preview styles.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import matter from 'gray-matter';

const root = new URL('../../', import.meta.url), pub = new URL('../public/', import.meta.url);
const cache = new URL('../.cache/img/', import.meta.url);
const LOCK = '<!-- lock -->';
const refs = md => [...md.matchAll(/\(img\/([^)\s]+)\)/g)].map(m => m[1]);
export const webp = f => f.replace(/\.(png|jpe?g)$/i, '.webp');

let n = 0, before = 0, after = 0;
for (const [coll, out] of [['work', 'work'], ['earlier', 'earlier-img']]) {
  const collDir = new URL(`content/${coll}/`, root);
  if (!existsSync(collDir)) continue;
  rmSync(new URL(out, pub), { recursive: true, force: true });
  const dirs = readdirSync(collDir, { withFileTypes: true }).filter(d => d.isDirectory() && existsSync(new URL(`${d.name}/img`, collDir))).map(d => d.name);
  for (const dir of dirs) {
    const src = new URL(`${dir}/img/`, collDir), cdir = new URL(`${coll}/${dir}/`, cache);
    mkdirSync(cdir, { recursive: true }); mkdirSync(new URL(`${out}/${dir}/`, pub), { recursive: true });
    const { content } = matter(readFileSync(new URL(`${dir}/index.md`, collDir), 'utf8'));
    const publicRefs = new Set(refs(content.split(LOCK)[0]));
    for (const f of readdirSync(src)) {
      if (!/\.(png|jpe?g)$/i.test(f)) continue;
      const target = new URL(webp(f), cdir), input = new URL(f, src);
      before += readFileSync(input).length;
      let file = target, name = webp(f);
      if (!existsSync(target) || statSync(target).mtimeMs < statSync(input).mtimeMs) {
        try { await sharp(readFileSync(input)).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(target.pathname); }
        catch (err) { console.warn(`[portfolio] could not convert ${coll}/${dir}/${f}, using the original:`, err.message); rmSync(target, { force: true }); cpSync(input, new URL(f, cdir)); file = new URL(f, cdir); name = f; }
      }
      after += readFileSync(file).length; n++;
      if (publicRefs.has(f)) cpSync(file, new URL(`${out}/${dir}/${name}`, pub));
    }
  }
}
console.log(`[portfolio] ${n} images: ${(before / 1e6).toFixed(1)} MB -> ${(after / 1e6).toFixed(1)} MB`);

rmSync(new URL('2020', pub), { recursive: true, force: true });
mkdirSync(new URL('2020', pub), { recursive: true });
// 2020 pages: drop the old phone number and make new-tab links safe
for (const f of readdirSync(root)) if (f.endsWith('.html'))
  writeFileSync(new URL(`2020/${f}`, pub), readFileSync(new URL(f, root), 'utf8')
    .replace(/<p[^>]*>\s*778-867-2408\s*<\/p>/g, '').replace(/778[-. ]?867[-. ]?2408/g, '')
    .replace(/target="_blank"(?![^>]*rel=)/g, 'target="_blank" rel="noopener"'));
for (const d of ['css', 'img', 'js']) cpSync(new URL(d, root), new URL(`2020/${d}`, pub), { recursive: true });

// the admin editor is served from our own files, not an outside CDN
rmSync(new URL('admin/vendor', pub), { recursive: true, force: true });
mkdirSync(new URL('admin/vendor', pub), { recursive: true });
cpSync(new URL('../node_modules/decap-cms/dist/decap-cms.js', import.meta.url), new URL('admin/vendor/decap-cms.js', pub));
// the editor's preview pane uses the same styles as the site
const css = f => readFileSync(new URL(`../src/styles/${f}`, import.meta.url), 'utf8');
writeFileSync(new URL('admin/preview.css', pub), css('tokens.css') + css('site.css') +
  'body{background:var(--bg)} main{padding:2rem 1.5rem} .lockline{margin:2.5rem 0;padding:.6rem 1rem;border:1.5px dashed var(--ink);border-radius:10px;font-weight:600;font-size:.9375rem;max-width:none} .story{display:block!important}');

// 4. Approved public content for the Ask Jarell AI fallback (netlify/functions/ask.mjs). Public parts only:
//    everything below a lock marker and every [JARELL] note is left out.
{
  const strip = t => t.replace(/^\[JARELL\].*$/gm, '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\{\{\w+\}\}/g, '').replace(/:::\w*/g, '').replace(/\n{3,}/g, '\n\n').trim();
  const out = [];
  const ask = JSON.parse(readFileSync(new URL('content/ask.json', root), 'utf8')).items;
  out.push('# Written answers\n' + ask.map(i => `Q: ${i.q}\nA: ${i.a}`).join('\n\n'));
  const about = matter(readFileSync(new URL('content/about.md', root), 'utf8'));
  out.push('# About\n' + (about.data.summary || '') + '\n\nWork history:\n' + (about.data.timeline || []).map(t => `- ${t.years}: ${t.role}, ${t.org}. ${t.note || ''}`).join('\n') + '\n\n' + strip(about.content));
  const workDir = new URL('content/work/', root);
  for (const d of readdirSync(workDir)) { const f = new URL(`${d}/index.md`, workDir); if (!existsSync(f)) continue;
    const m = matter(readFileSync(f, 'utf8')); if (m.data.draft) continue;
    out.push(`# Case study: ${m.data.title} (${m.data.company}, ${m.data.role}, ${m.data.timeline})\n` + (m.data.summary || '') + '\n\n' + strip(m.content.split(LOCK)[0])); }
  mkdirSync(new URL('../netlify/', import.meta.url), { recursive: true });
  writeFileSync(new URL('../netlify/kb.mjs', import.meta.url), 'export default ' + JSON.stringify(out.join('\n\n')) + ';\n');
}
