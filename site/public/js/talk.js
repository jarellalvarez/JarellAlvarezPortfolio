/* Ask Jarell talks. While an answer types in, the helper's mouth follows the words: each syllable opens to a shape that suits its vowel
   (wide "ah", round "oh", narrow "oo", stretched "ee"), lips press for m, b and p, and the mouth rests at the end of a phrase.
   The text is revealed in step with the mouth, so what you read is what is being said. Shapes are blended every frame, so it stays smooth.
   Reduced motion: no mouth movement, the answer just appears. Skippable: clicking the answer finishes it. */
(() => {
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  // [width, top lip curve, bottom lip curve]; the bigger the gap between the two curves, the more open the mouth
  const V = { rest: [14, 5, 5], ah: [15, 0, 21], eh: [16, 2, 15], ee: [19, 3, 11], oh: [9, 1, 18], oo: [7, 2, 14], mm: [13, 4.2, 4.2], ff: [14, 2.6, 7.5] };
  const BASE = 105, PAUSE = { ',': 170, ';': 200, ':': 200, '.': 300, '!': 300, '?': 300 };
  const vowel = g => /^(ou|ow|oa|oo|u)/i.test(g) ? 'oo' : /^o/i.test(g) ? 'oh' : /^a/i.test(g) ? 'ah' : /^(ee|ea|i|y)/i.test(g) ? 'ee' : 'eh';

  // text -> timeline: [{ at: ms, shape, upto: characters shown from this moment }]
  function plan(text) {
    const ev = []; let t = 0, i = 0; const push = (shape, ms, upto) => { ev.push({ at: t, shape, upto }); t += ms; };
    const words = text.match(/\S+\s*/g) || [];
    for (const w of words) {
      const start = i, core = w.trim(), end = i + w.length; let last = 0, any = false;
      const re = /[aeiouy]+/gi; let m;
      while ((m = re.exec(core))) {
        any = true; const before = core[m.index - 1] || '';
        if (/[mbp]/i.test(before)) push('mm', 45, start + m.index);
        else if (/[fv]/i.test(before)) push('ff', 40, start + m.index);
        push(vowel(m[0]), BASE, start + m.index + m[0].length); last = m.index + m[0].length;
      }
      if (!any) push('ff', 60, end - (w.length - core.length));
      const tail = core.slice(-1), gap = PAUSE[tail] || 0;
      push('rest', gap || 55, end); i = end;
    }
    return { ev, total: t };
  }

  const shape = (b, p) => { const x1 = b.cx - p[0] / 2, x2 = b.cx + p[0] / 2, y = b.y; return `M${x1.toFixed(2)} ${y}Q${b.cx} ${(y + p[1]).toFixed(2)} ${x2.toFixed(2)} ${y}Q${b.cx} ${(y + p[2]).toFixed(2)} ${x1.toFixed(2)} ${y}Z`; };
  let cur = null;

  function say(text, reveal, done) {
    if (cur) cur.finish();
    if (calm || !text) { reveal(text.length); done && done(); return { finish() {} }; }
    const mouths = [...document.querySelectorAll('.mouth')].filter(el => el.isConnected).map(el => {
      const n = (el.getAttribute('d').match(/-?\d+(\.\d+)?/g) || []).map(Number); return { el, d: el.getAttribute('d'), cx: n[0] + n[n.length - 2] / 2, y: n[1], f: el.style.fill };
    });
    const btns = [...document.querySelectorAll('.bbtn, .ask-mini')];
    let { ev, total } = plan(text); const k = total > 7500 ? 7500 / total : 1; // long answers speed up a little
    ev = ev.map(e => ({ ...e, at: e.at * k }));
    const pos = V.rest.slice(); let n = 0, shown = 0, last = performance.now(), t0 = last, raf = 0, over = false, tail = 0;
    btns.forEach(b => b.classList.add('talking'));
    const paint = () => mouths.forEach(m => { m.el.setAttribute('d', shape(m, pos)); m.el.style.fill = 'var(--ink)'; m.el.style.fillOpacity = Math.max(0, Math.min(.92, (pos[2] - pos[1] - 1.5) / 6)); });
    const end = () => { cancelAnimationFrame(raf); mouths.forEach(m => { m.el.setAttribute('d', m.d); m.el.style.fill = m.f; m.el.style.fillOpacity = ''; }); btns.forEach(b => b.classList.remove('talking')); if (cur === handle) cur = null; };
    const tick = now => {
      const dt = Math.min(64, now - last) / 1000; last = now; const el = now - t0;
      while (n < ev.length && ev[n].at <= el) { target = V[ev[n].shape]; if (ev[n].upto > shown) { shown = ev[n].upto; reveal(shown); } n++; }
      if (n >= ev.length && !over) { over = true; shown = text.length; reveal(shown); done && done(); target = V.rest; tail = el + 260; }
      const a = 1 - Math.exp(-dt * 26); for (let j = 0; j < 3; j++) pos[j] += (target[j] - pos[j]) * a;
      paint();
      if (over && el > tail) return end();
      raf = requestAnimationFrame(tick);
    };
    let target = V.rest;
    const handle = { finish() { if (!over) { over = true; reveal(text.length); done && done(); } end(); } };
    cur = handle; raf = requestAnimationFrame(tick); return handle;
  }
  window.Talk = { say, stop: () => cur && cur.finish() };
})();
