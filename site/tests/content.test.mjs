import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
import { study, studies, testimonials, encrypt, render } from '../src/lib/content.mjs';

const dec = b => Uint8Array.from(Buffer.from(b, 'base64'));
async function decrypt(p, pw) {
  const k = await webcrypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
  const key = await webcrypto.subtle.deriveKey({ name: 'PBKDF2', salt: dec(p.s), iterations: 200000, hash: 'SHA-256' }, k, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  return new TextDecoder().decode(await webcrypto.subtle.decrypt({ name: 'AES-GCM', iv: dec(p.i) }, key, dec(p.c)));
}

test('every testimonial has one place, and nobody appears twice', () => {
  const all = testimonials();
  assert.equal(new Set(all.map(t => t.name)).size, all.length);
  for (const t of all) assert.ok(['window', 'about', 'mavi', 'copperleaf'].includes(t.place), `${t.name}: ${t.place}`);
});

test('locked content decrypts with the right password and fails with the wrong one', async () => {
  const p = encrypt('<p>secret</p>', 'right');
  assert.equal(await decrypt(p, 'right'), '<p>secret</p>');
  await assert.rejects(decrypt(p, 'wrong'));
});

test('MAVI and Copperleaf are locked, UI Avenue is open', () => {
  assert.ok(study('mavi', 'x').payload);
  assert.ok(study('copperleaf', 'x').payload);
  assert.equal(study('ui-avenue', 'x').payload, null);
});

test('public part never contains locked text or notes to Jarell', () => {
  for (const s of studies()) {
    const { publicHtml } = study(s.slug, 'x');
    assert.ok(!publicHtml.includes('[JARELL]'), s.slug);
    assert.ok(!publicHtml.includes('@@LOCK@@'), s.slug);
  }
  assert.ok(!study('copperleaf', 'x').publicHtml.includes('Clippy'));
  assert.ok(!study('copperleaf', 'x').publicHtml.includes('figma.com'));
  assert.ok(!study('mavi', 'x').publicHtml.includes('match score'));
});

test('built pages do not leak locked text (run after build)', { skip: !existsSync(new URL('../dist/work/copperleaf/index.html', import.meta.url)) }, () => {
  const c = readFileSync(new URL('../dist/work/copperleaf/index.html', import.meta.url), 'utf8');
  const m = readFileSync(new URL('../dist/work/mavi/index.html', import.meta.url), 'utf8');
  assert.ok(!c.includes('Clippy') && !c.includes('figma.com'));
  assert.ok(!m.includes('match score') && !m.includes('20% match'));
});

test('stats, paired images and study images render from plain Markdown', () => {
  const html = render('{{stats}}\n\n:::pair\n\n![a](img/a.jpg)\n\n![b](img/b.jpg)\n\n:::\n', { dir: 'x', meta: { stats: [{ value: '3', label: 'things' }] } });
  assert.match(html, /<div class="stats"><div><b>3<\/b><span>things<\/span><\/div><\/div>/);
  assert.match(html, /<div class="duo">[\s\S]*src="\/work\/x\/a\.jpg"[\s\S]*src="\/work\/x\/b\.jpg"[\s\S]*<\/div>/);
});

test('case studies come out in their set order', () => {
  assert.deepEqual(studies().map(s => s.slug), ['mavi', 'copperleaf', 'ui-avenue']);
});

test('images below the lock are not published as files (run after build)', { skip: !existsSync(new URL('../dist/work/mavi/', import.meta.url)) }, () => {
  const published = readdirSync(new URL('../dist/work/mavi/', import.meta.url));
  for (const f of ['candidates-comparison.webp', 'mvp-flow.webp', 'navigation-comparison.webp']) assert.ok(!published.includes(f), f);
});

// The Ask Jarell answers are public (served as /ask.json and given to the AI fallback).
// Nothing that only appears below a lock marker may show up in them.
test('Ask Jarell answers contain no locked case-study details', async () => {
  const { readFileSync, readdirSync, existsSync } = await import('node:fs');
  const root = new URL('../../content/', import.meta.url);
  const ask = readFileSync(new URL('ask.json', root), 'utf8').toLowerCase();
  const kb = existsSync(new URL('../netlify/kb.mjs', import.meta.url)) ? readFileSync(new URL('../netlify/kb.mjs', import.meta.url), 'utf8').toLowerCase() : '';
  for (const d of readdirSync(new URL('work/', root))) {
    const f = new URL(`work/${d}/index.md`, root); if (!existsSync(f)) continue;
    const [pub, locked = ''] = readFileSync(f, 'utf8').split('<!-- lock -->');
    // bolded phrases and decision headings in the locked part are its key reveals
    const marks = [...locked.matchAll(/\*\*([^*]{12,60})\*\*|^## Decision \d+: (.{8,60})$/gm)].map(m => (m[1] || m[2]).toLowerCase().replace(/[.:]$/, ''));
    for (const m of marks) { if (pub.toLowerCase().includes(m)) continue;
      assert.ok(!ask.includes(m), `ask.json repeats locked text from ${d}: "${m}"`);
      assert.ok(!kb.includes(m), `AI content repeats locked text from ${d}: "${m}"`); }
    for (const term of ['match score']) if (locked.toLowerCase().includes(term) && !pub.toLowerCase().includes(term)) { assert.ok(!ask.includes(term), `ask.json mentions "${term}"`); assert.ok(!kb.includes(term), `AI content mentions "${term}"`); }
  }
});

// Illustrations: every drawing the site asks for must exist, be inline-safe, and carry a viewBox.
test('every illustration the site uses exists and is a clean inline SVG', () => {
  const js = readFileSync(new URL('../public/js/illustrations.js', import.meta.url), 'utf8');
  const names = new Set([...js.matchAll(/'([a-z][a-z0-9-]+)'\]/g)].map(m => m[1]).concat([...js.matchAll(/'squiggly-underline'/g)].map(() => 'squiggly-underline')));
  const home = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
  for (const m of home.matchAll(/data-art="([a-z-]+)"/g)) names.add(m[1]);
  assert.ok(names.size >= 20, 'found the drawing names');
  for (const n of names) {
    const file = new URL(`../public/illustrations/${n}.svg`, import.meta.url);
    assert.ok(existsSync(file), `${n}.svg is missing`);
    const svg = readFileSync(file, 'utf8');
    assert.match(svg, /viewBox="[\d. -]+"/, `${n} has no viewBox`);
    assert.ok(!/id="Layer_1"/.test(svg) && !/<script/i.test(svg) && !/on\w+=/i.test(svg), `${n} is not clean`);
  }
});

// The About page uses Jarell's drawings, not emoji.
test('About headings and intro carry no emoji', () => {
  const md = readFileSync(new URL('../../content/about.md', import.meta.url), 'utf8');
  assert.ok(!/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u.test(md), 'about.md still has an emoji');
});

test('self portrait is inlined clean and no hanging side drawings remain', async () => {
  const { readFileSync } = await import('node:fs');
  const svg = readFileSync(new URL('../public/illustrations/self-portrait.svg', import.meta.url), 'utf8');
  assert.ok(!svg.includes('<metadata') && !svg.includes('xpacket'));
  assert.ok(!readFileSync(new URL('../src/styles/illustrations.css', import.meta.url), 'utf8').includes('.dd.side'));
});

test('every case-study image has a description (it is the caption and the lightbox text)', () => {
  const dirs = [['work', 'content/work'], ['earlier', 'content/earlier']];
  for (const [, d] of dirs) {
    const base = new URL(`../../${d}/`, import.meta.url); if (!existsSync(base)) continue;
    for (const s of readdirSync(base)) { const f = new URL(`${s}/index.md`, base); if (!existsSync(f)) continue;
      for (const m of readFileSync(f, 'utf8').matchAll(/!\[([^\]]*)\]\(img\/[^)]+\)/g)) assert.ok(m[1].trim().length > 3, `${d}/${s} has an image with no description`); }
  }
});

test('the drawing sizes baked into illustrations.js match the SVG files', () => {
  const js = readFileSync(new URL('../public/js/illustrations.js', import.meta.url), 'utf8'), AR = JSON.parse(js.match(/const AR = (\{[^}]*\})/)[1]);
  for (const [n, r] of Object.entries(AR)) { const [w, h] = readFileSync(new URL(`../public/illustrations/${n}.svg`, import.meta.url), 'utf8').match(/viewBox="([\d. -]+)"/)[1].split(' ').slice(2).map(Number); assert.ok(Math.abs(w / h - r) < 0.002, `${n} ratio is out of date`); }
});
