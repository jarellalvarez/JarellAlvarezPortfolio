const { chromium } = require('playwright'); const out = process.argv[2];
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  await p.goto('http://localhost:4329/'); await p.waitForTimeout(5200); await p.mouse.move(900, 200); await p.waitForTimeout(600);
  const clip = { x: 0, y: 640, width: 200, height: 160 }; let n = 0; const sn = async l => p.screenshot({ path: `${out}/h${String(n++).padStart(2, '0')}-${l}.png`, clip });
  await sn('calm'); const f = p.locator('.folder').first(); await f.hover(); await p.waitForTimeout(150); await sn('hover1'); await p.waitForTimeout(350); await sn('hover2');
  await p.waitForTimeout(1700); await sn('settled'); await b.close();
})();
