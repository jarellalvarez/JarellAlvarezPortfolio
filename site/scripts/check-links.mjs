// Broken-link check on the built site: every internal href and src in dist/ must point at a real file.
// Run after a build:  node scripts/check-links.mjs
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
const dist = new URL('../dist/', import.meta.url).pathname, bad = [];
const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const exists = u => { const p = join(dist, decodeURIComponent(u.split('#')[0].split('?')[0])); return existsSync(p) && (!statSync(p).isDirectory() || existsSync(join(p, 'index.html'))); };
let pages = 0;
for (const f of walk(dist).filter(f => f.endsWith('.html') && !f.includes('/2020/') && !f.includes('/admin/'))) {
  pages++; const html = readFileSync(f, 'utf8').replace(/src="data:[^"]*"/g, '');
  for (const m of html.matchAll(/(?:href|src|srcset)="([^"]+)"/g)) for (const raw of m[1].split(',')) { const u = raw.trim().split(/\s+/)[0];
    if (!u.startsWith('/') || u.startsWith('//')) continue; if (!exists(u)) bad.push(`${f.replace(dist, '/')} -> ${u}`); }
}
console.log(`${pages} pages checked, ${bad.length} broken`); if (bad.length) { console.log([...new Set(bad)].join('\n')); process.exit(1); }
