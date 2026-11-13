// Runs before every build. Copies case-study images and the 2020 archive into public/
// so there is one source of truth for each (content/ and the repo root).
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
const root = new URL('../../', import.meta.url), pub = new URL('../public/', import.meta.url);
const dirs = readdirSync(new URL('content/work/', root), { withFileTypes: true }).filter(d => d.isDirectory() && existsSync(new URL(`content/work/${d.name}/img`, root))).map(d => d.name);
for (const dir of dirs) {
  rmSync(new URL(`work/${dir}`, pub), { recursive: true, force: true });
  cpSync(new URL(`content/work/${dir}/img`, root), new URL(`work/${dir}`, pub), { recursive: true });
}
rmSync(new URL('2020', pub), { recursive: true, force: true });
mkdirSync(new URL('2020', pub), { recursive: true });
for (const f of readdirSync(root)) if (f.endsWith('.html')) cpSync(new URL(f, root), new URL(`2020/${f}`, pub));
for (const d of ['css', 'img', 'js']) cpSync(new URL(d, root), new URL(`2020/${d}`, pub), { recursive: true });
// the admin editor is served from our own files, not an outside CDN
rmSync(new URL('admin/vendor', pub), { recursive: true, force: true });
cpSync(new URL('../node_modules/decap-cms/dist', import.meta.url), new URL('admin/vendor', pub), { recursive: true, filter: f => !f.endsWith('.map') && (!f.includes('.') || f.includes('decap-cms')) });
// the preview pane uses the same styles as the site
const css = f => readFileSync(new URL(`../src/styles/${f}`, import.meta.url), 'utf8');
writeFileSync(new URL('admin/preview.css', pub), css('tokens.css') + css('site.css') +
  'body{background:var(--bg)} main{padding:2rem 1.5rem} .lockline{margin:2.5rem 0;padding:.6rem 1rem;border:1.5px dashed var(--ink);border-radius:10px;font-weight:600;font-size:.9375rem;max-width:none} .story{display:block!important}');
console.log('[portfolio] copied case-study images and the 2020 archive into public/');
