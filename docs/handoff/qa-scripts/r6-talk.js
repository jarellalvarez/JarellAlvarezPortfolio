const { chromium } = require('playwright'); const out = process.argv[2];
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('http://localhost:4329/'); await p.waitForTimeout(1500);
  await p.click('.bbtn'); await p.waitForSelector('.bchatui .bpill'); await p.waitForTimeout(600);
  const win = await p.locator('.win').boundingBox(); const buddy = await p.locator('.bbtn').boundingBox();
  console.log(JSON.stringify({ win, buddy }));
  await p.click('.bchatui .bpill'); const t0 = Date.now(); let n = 0;
  const clipX = Math.min(buddy.x, win.x) - 10, clipY = Math.min(buddy.y, win.y) - 10;
  const clip = { x: Math.max(0, clipX), y: Math.max(0, clipY), width: 760, height: Math.min(800 - Math.max(0, clipY), 700) };
  while (Date.now() - t0 < 9000) {
    await p.screenshot({ path: `${out}/t${String(n++).padStart(3, '0')}.png`, clip });
    const talking = await p.evaluate(() => !!document.querySelector('.blog .tw')); if (!talking && Date.now() - t0 > 1500) { for (let k = 0; k < 3; k++) await p.screenshot({ path: `${out}/t${String(n++).padStart(3, '0')}.png`, clip }); break; }
  }
  console.log('frames', n, 'ms', Date.now() - t0, 'errors', JSON.stringify(errs));
  await b.close();
})();
