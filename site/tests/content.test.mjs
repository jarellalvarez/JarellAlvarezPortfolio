import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
import { study, testimonials, encrypt, STUDIES } from '../src/lib/content.mjs';

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
  for (const s of STUDIES) {
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
