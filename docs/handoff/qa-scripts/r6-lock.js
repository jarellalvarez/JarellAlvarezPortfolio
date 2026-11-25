const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  await p.goto('http://localhost:4329/'); await p.waitForTimeout(1500); await p.mouse.move(640, 400);
  const prog = () => p.evaluate(() => Math.round(scrollY / (document.querySelector('.j-track').offsetHeight - innerHeight) * 100) / 100);
  const log = [];
  // 1) rush: spam the wheel for 1.5s straight after the first flick
  const t0 = Date.now(); await p.mouse.wheel(0, 40);
  while (Date.now() - t0 < 1500) { await p.mouse.wheel(0, 120); await p.waitForTimeout(90); }
  log.push(['after 1.5s of spamming', await prog()]);
  await p.waitForTimeout(2800); log.push(['once the stage has finished', await prog()]);
  // 2) one step takes how long?
  const s = Date.now(); await p.mouse.wheel(0, 40); let last = await prog(); while (true) { await p.waitForTimeout(100); const c = await prog(); if (c === last && Date.now() - s > 400) break; last = c; }
  log.push(['one step (ms)', Date.now() - s, await prog()]);
  // 3) a steady slow flick after resting moves exactly one stop
  await p.waitForTimeout(900); await p.mouse.wheel(0, 40); await p.waitForTimeout(3300); log.push(['next flick', await prog()]);
  console.log(JSON.stringify(log)); await b.close();
})();
