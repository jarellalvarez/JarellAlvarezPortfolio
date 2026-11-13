// Runs before every build and dev start.
// 1. Compresses every case-study image to WebP (max 1600px wide) into .cache/img/
// 2. Copies only the images used in the PUBLIC part of each study into public/work/.
//    Images used only below the lock are left out; the build embeds them inside the encrypted section.
// 3. Copies the 2020 archive, the editor files and the editor preview styles.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import matter from 'gray-matter';

const root = new URL('../../', import.meta.url), pub = new URL('../public/', import.meta.url);
const cache = new URL('../.cache/img/', import.meta.url);
const LOCK = '<!-- lock -->';
const refs = md => [...md.matchAll(/\(img\/([^)\s]+)\)/g)].map(m => m[1]);
export const webp = f => f.replace(/\.(png|jpe?g)$/i, '.webp');

const workDir = new URL('content/work/', root);
const dirs = readdirSync(workDir, { withFileTypes: true }).filter(d => d.isDirectory() && existsSync(new URL(`${d.name}/img`, workDir))).map(d => d.name);
rmSync(new URL('work', pub), { recursive: true, force: true });
let n = 0, before = 0, after = 0;
for (const dir of dirs) {
  const src = new URL(`${dir}/img/`, workDir), out = new URL(`${dir}/`, cache);
  mkdirSync(out, { recursive: true }); mkdirSync(new URL(`work/${dir}/`, pub), { recursive: true });
  const { content } = matter(readFileSync(new URL(`${dir}/index.md`, workDir), 'utf8'));
  const publicRefs = new Set(refs(content.split(LOCK)[0]));
  for (const f of readdirSync(src)) {
    if (!/\.(png|jpe?g)$/i.test(f)) continue;
    const target = new URL(webp(f), out), input = new URL(f, src);
    before += readFileSync(input).length;
    if (!existsSync(target)) await sharp(readFileSync(input)).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(target.pathname);
    after += readFileSync(target).length; n++;
    if (publicRefs.has(f)) cpSync(target, new URL(`work/${dir}/${webp(f)}`, pub));
  }
}
console.log(`[portfolio] ${n} images: ${(before / 1e6).toFixed(1)} MB -> ${(after / 1e6).toFixed(1)} MB`);

rmSync(new URL('2020', pub), { recursive: true, force: true });
mkdirSync(new URL('2020', pub), { recursive: true });
for (const f of readdirSync(root)) if (f.endsWith('.html')) cpSync(new URL(f, root), new URL(`2020/${f}`, pub));
for (const d of ['css', 'img', 'js']) cpSync(new URL(d, root), new URL(`2020/${d}`, pub), { recursive: true });

// the admin editor is served from our own files, not an outside CDN
rmSync(new URL('admin/vendor', pub), { recursive: true, force: true });
mkdirSync(new URL('admin/vendor', pub), { recursive: true });
cpSync(new URL('../node_modules/decap-cms/dist/decap-cms.js', import.meta.url), new URL('admin/vendor/decap-cms.js', pub));
// the editor's preview pane uses the same styles as the site
const css = f => readFileSync(new URL(`../src/styles/${f}`, import.meta.url), 'utf8');
writeFileSync(new URL('admin/preview.css', pub), css('tokens.css') + css('site.css') +
  'body{background:var(--bg)} main{padding:2rem 1.5rem} .lockline{margin:2.5rem 0;padding:.6rem 1rem;border:1.5px dashed var(--ink);border-radius:10px;font-weight:600;font-size:.9375rem;max-width:none} .story{display:block!important}');
