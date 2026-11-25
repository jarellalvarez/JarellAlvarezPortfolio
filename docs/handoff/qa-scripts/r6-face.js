const { chromium } = require('playwright'); const out = process.argv[2];
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('http://localhost:4329/'); await p.waitForTimeout(1500);
  let n = 0; const clip = { x: 0, y: 560, width: 500, height: 240 };
  const snap = async (label) => { await p.screenshot({ path: `${out}/${String(n++).padStart(3, '0')}-${label}.png`, clip }); };
  const run = async (label, k, gap = 80) => { for (let i = 0; i < k; i++) { await snap(label); await p.waitForTimeout(gap); } };
  await run('idle', 3);
  await p.mouse.move(60, 730); await run('hover', 5, 100);                        // hover
  await p.mouse.move(700, 300); await p.waitForTimeout(300);
  await p.click('.bbtn'); await p.waitForSelector('.bchatui .bpill'); await run('open', 6, 90);   // click face + greeting
  await p.waitForTimeout(5000);
  await p.fill('.bform input', 'How did you'); await run('typing', 6, 100);       // typing: concerned
  await p.waitForTimeout(1400); await run('listen', 3, 120);
  await p.fill('.bform input', ''); await p.click('.bchatui .bpill'); await run('answer', 40, 100);  // nod then talk
  await p.mouse.move(700, 300);
  await p.waitForTimeout(1200); await run('after', 3, 120);
  console.log(n, JSON.stringify(errs));
  await b.close();
})();
