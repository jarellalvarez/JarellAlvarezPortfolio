// Runs before every build and dev start.
// 1. Makes AVIF + WebP copies of every case-study image into .cache/img/ (full size up to 2400px, plus 800 and 1400px for srcset;
//    sources under 1000px wide are never enlarged and use higher quality)
// 2. Copies only the images used in the PUBLIC part of each study into public/work/.
//    Images used only below the lock are left out; the build embeds them inside the encrypted section.
// 3. Copies the 2020 archive, the editor files and the editor preview styles.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import matter from 'gray-matter';

const root = new URL('../../', import.meta.url), pub = new URL('../public/', import.meta.url);
const cache = new URL('../.cache/img/', import.meta.url);
// the cache is rebuilt whenever these settings change, so a quality change always takes effect
const SETTINGS = JSON.stringify({ v: 2, full: 2400, locked: 2000, steps: [800, 1400], q: 88, qSmall: 95, avif: [60, 70] }), stamp = new URL('settings.json', cache);
if (!existsSync(stamp) || readFileSync(stamp, 'utf8') !== SETTINGS) { rmSync(cache, { recursive: true, force: true }); mkdirSync(cache, { recursive: true }); writeFileSync(stamp, SETTINGS); }
const LOCK = '<!-- lock -->';
const refs = md => [...md.matchAll(/\(img\/([^)\s]+)\)/g)].map(m => m[1]);
export const webp = f => f.replace(/\.(png|jpe?g)$/i, '.webp');

// Sizes: the full file keeps the source's own detail up to 2400px wide (never enlarged), AVIF and WebP copies at 800 and 1400px
// feed srcset so phones and retina screens each download the right size. Locked images are embedded in the encrypted page,
// so they get one smaller copy (2000px max) to keep that page light.
const FULL = 2400, LOCKED = 2000, STEPS = [800, 1400], manifest = {};
const fresh = (t, i) => existsSync(t) && statSync(t).mtimeMs >= statSync(i).mtimeMs;
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
      const input = new URL(f, src), base = webp(f), stem = base.replace(/\.webp$/, ''), made = [];
      before += statSync(input).size;
      try {
        const meta = await sharp(readFileSync(input)).metadata(), small = meta.width < 1000, q = small ? 95 : 88, fullW = Math.min(meta.width, FULL);
        const jobs = [[base, fullW, 'webp'], [`${stem}.avif`, fullW, 'avif']];
        const steps = STEPS.filter(w => w < fullW * 0.9);
        for (const w of steps) jobs.push([`${stem}-${w}.webp`, w, 'webp'], [`${stem}-${w}.avif`, w, 'avif']);
        const locked = fullW > LOCKED; if (locked) jobs.push([`${stem}-locked.webp`, LOCKED, 'webp']);
        for (const [name, w, fmt] of jobs) {
          const t = new URL(name, cdir); made.push(name);
          if (!fresh(t, input)) { const img = sharp(readFileSync(input)).resize({ width: w, withoutEnlargement: true });
            await (fmt === 'avif' ? img.avif({ quality: small ? 70 : 60, effort: 4 }) : img.webp({ quality: q })).toFile(t.pathname); }
          after += statSync(t).size;
        }
        manifest[`${coll}/${dir}/${f}`] = { w: fullW, h: Math.round(meta.height * fullW / meta.width), steps, locked };
        if (publicRefs.has(f)) for (const name of made.filter(x => !x.endsWith('-locked.webp'))) cpSync(new URL(name, cdir), new URL(`${out}/${dir}/${name}`, pub));
      } catch (err) { console.warn(`[portfolio] could not convert ${coll}/${dir}/${f}, using the original:`, err.message); cpSync(input, new URL(f, cdir)); if (publicRefs.has(f)) cpSync(input, new URL(`${out}/${dir}/${f}`, pub)); after += statSync(input).size; }
      n++;
    }
  }
}
writeFileSync(new URL('manifest.json', cache), JSON.stringify(manifest));
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
