const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  await p.goto('http://localhost:4329/'); await p.waitForTimeout(1500);
  await p.click('.bbtn'); await p.waitForSelector('.bchatui .bpill'); await p.waitForFunction(() => !document.querySelector('.blog .tw'), null, { timeout: 15000 });
  const res = [];
  for (let i = 0; i < 3; i++) {
    await p.waitForTimeout(600); const pill = p.locator('.bchatui .bpill:not(.bmore)').first(); const q = await pill.textContent(); await pill.click();
    const t0 = Date.now(); await p.waitForSelector('.blog li.bot:last-child .tw', { timeout: 4000 }).catch(() => {});
    // sample text length vs mouth state while it types
    const samples = []; while (await p.evaluate(() => !!document.querySelector('.blog .tw')) && Date.now() - t0 < 9000) { samples.push(await p.evaluate(() => document.querySelector('.blog .tw')?.textContent.length || 0)); await p.waitForTimeout(100); }
    const full = await p.evaluate(() => document.querySelector('.blog li.bot:last-child p')?.textContent.length || 0);
    res.push({ q: q.slice(0, 30), chars: full, ms: Date.now() - t0, cps: Math.round(full / ((Date.now() - t0) / 1000)), mono: samples.every((v, k) => k === 0 || v >= samples[k - 1]) });
  }
  console.log(JSON.stringify(res)); await b.close();
})();
