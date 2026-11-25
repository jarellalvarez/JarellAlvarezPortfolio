const { chromium, devices } = require('playwright'); const out = process.argv[2];
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const p = await c.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:4329/'); await p.waitForTimeout(1800);
  let n = 0; const shot = async () => p.screenshot({ path: `${out}/m${String(n++).padStart(3, '0')}.png` });
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  // scroll down in smooth steps, capturing as we go (about 90 px per frame)
  for (let y = 0; y < H - 900; y += 110) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(120); await shot(); }
  console.log(n, H, JSON.stringify(errs)); await b.close();
})();
