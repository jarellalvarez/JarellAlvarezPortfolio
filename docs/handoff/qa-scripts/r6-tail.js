const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  await p.goto('http://localhost:4329/'); await p.waitForTimeout(1500); await p.mouse.move(640, 400);
  const prog = () => p.evaluate(() => Math.round(scrollY / (document.querySelector('.j-track').offsetHeight - innerHeight) * 100) / 100);
  const out = [];
  // a real trackpad flick: strong start, then a long fading tail of ~60 events, all within a second
  const flick = async () => { for (const d of [4, 9, 14, 12, 10, 8, 7, 6, 5, 4, ...Array(50).fill(0).map((_, i) => Math.max(1, 4 - i / 12))]) { await p.mouse.wheel(0, d); await p.waitForTimeout(16); } };
  await flick(); await p.waitForTimeout(3500); out.push(['one trackpad flick with tail', await prog()]);
  await flick(); await p.waitForTimeout(3500); out.push(['second flick', await prog()]);
  await p.mouse.wheel(0, 3); await p.waitForTimeout(3500); out.push(['gentle 3px', await prog()]);
  console.log(JSON.stringify(out)); await b.close();
})();
