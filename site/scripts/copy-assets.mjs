// Runs before every build. Copies case-study images and the 2020 archive into public/
// so there is one source of truth for each (content/ and the repo root).
import { cpSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
const root = new URL('../../', import.meta.url), pub = new URL('../public/', import.meta.url);
for (const dir of ['mavi', 'copperleaf', 'uiavenue']) {
  rmSync(new URL(`work/${dir}`, pub), { recursive: true, force: true });
  cpSync(new URL(`content/${dir}/img`, root), new URL(`work/${dir}`, pub), { recursive: true });
}
rmSync(new URL('2020', pub), { recursive: true, force: true });
mkdirSync(new URL('2020', pub), { recursive: true });
for (const f of readdirSync(root)) if (f.endsWith('.html')) cpSync(new URL(f, root), new URL(`2020/${f}`, pub));
for (const d of ['css', 'img', 'js']) cpSync(new URL(d, root), new URL(`2020/${d}`, pub), { recursive: true });
console.log('[portfolio] copied case-study images and the 2020 archive into public/');
