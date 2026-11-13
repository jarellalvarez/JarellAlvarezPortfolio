import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/themes.css', import.meta.url), 'utf8');
const lum = hex => { const v = hex.match(/\w\w/g).map(x => parseInt(x, 16) / 255).map(c => c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + .05) / (y + .05); };
const blocks = [...css.matchAll(/^([^{\n]*\[data-palette=(\w+)\](\[data-theme=dark\])?)\{([^}]*)\}/gm)]
  .map(m => ({ name: m[2] + (m[3] ? ' dark' : ' light'), vars: Object.fromEntries([...m[4].matchAll(/--([\w-]+):(#[0-9a-f]{6})/g)].map(v => [v[1], v[2]])) })).filter(b => b.vars.bg);

test('there are 6 themes, each with light and dark', () => assert.equal(blocks.length, 12));
for (const { name, vars } of blocks) {
  test(`${name}: text, secondary text and errors pass 4.5:1`, () => {
    for (const fg of ['ink', 'ink-2', 'danger']) for (const bg of ['bg', 'surface'])
      assert.ok(ratio(vars[fg], vars[bg]) >= 4.5, `${fg} on ${bg}: ${ratio(vars[fg], vars[bg]).toFixed(2)}`);
  });
  test(`${name}: accents, folders and button labels pass 3:1 / 4.5:1`, () => {
    assert.ok(ratio(vars.accent, vars.bg) >= 3, `accent ${ratio(vars.accent, vars.bg).toFixed(2)}`);
    assert.ok(ratio(vars.folder, vars.bg) >= 3, `folder ${ratio(vars.folder, vars.bg).toFixed(2)}`);
    assert.ok(ratio(vars['on-accent'], vars.accent) >= 4.5, `on-accent ${ratio(vars['on-accent'], vars.accent).toFixed(2)}`);
    assert.ok(ratio(vars.bg, vars.ink) >= 4.5, 'solid buttons (bg text on ink)');
  });
}
