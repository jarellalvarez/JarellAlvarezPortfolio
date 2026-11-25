const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  await p.goto('http://localhost:4329/'); await p.waitForTimeout(1500); await p.mouse.move(640, 400);
  const prog = () => p.evaluate(() => Math.round(scrollY / (document.querySelector('.j-track').offsetHeight - innerHeight) * 100) / 100);
  const out = [];
  for (const d of [2, 3, 4]) {                                   // one tiny nudge each time, resting between
    await p.mouse.wheel(0, d); await p.waitForTimeout(3400); out.push([`nudge ${d}px`, await prog()]);
  }
  // a trackpad flick with a fading tail right after a stage ends: must not trigger a second stage
  await p.mouse.wheel(0, 30); await p.waitForTimeout(3400); const at = await prog();
  for (const d of [3, 2, 2, 1, 1, 1]) { await p.mouse.wheel(0, d); await p.waitForTimeout(16); }
  await p.waitForTimeout(300); out.push(['fading tail right after a stage', at, await prog()]);
  // reverse: one gentle nudge up goes back one stop
  await p.waitForTimeout(1200); await p.mouse.wheel(0, -3); await p.waitForTimeout(3400); out.push(['nudge up 3px', await prog()]);
  console.log(JSON.stringify(out)); await b.close();
})();
