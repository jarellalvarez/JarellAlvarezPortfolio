/* Ask Jarell talks, cartoon style. While an answer types in, the helper's mouth snaps between a few drawn poses
   (closed, small open, wide open, round), holding each for a beat like a 12 frames a second cycle. Open mouths are line drawn
   with a light inside and a little tongue. Stressed syllables punch the head: a tilt and bounce that alternates side to side,
   with the brows lifting. The text is revealed in step with the mouth. Reduced motion: no movement, the answer just appears.
   Skippable: clicking the answer finishes it. */
(() => {
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  // [width, top lip curve, bottom lip curve] in the face's own 90 x 100 drawing units
  const POSE = { closed: [14, 5, 5], small: [14, 1, 15], wide: [19, 0, 25], round: [10, 0, 21] };
  const BASE = 100, REST = 70, PAUSE = { ',': 170, ';': 200, ':': 200, '.': 300, '!': 300, '?': 300 };
  const FLAT = new Set(['the', 'a', 'an', 'of', 'to', 'in', 'on', 'at', 'and', 'or', 'is', 'it', 'i', 'my', 'me', 'be', 'as', 'so', 'for', 'with']);
  const pose = g => /^(ou|ow|oa|oo|o|u)/i.test(g) ? 'round' : /^(a|ai|au)/i.test(g) ? 'wide' : 'small';

  // text -> timeline of [{ at: ms, pose, upto: characters shown, hit: stressed syllable }]
  function plan(text) {
    const ev = []; let t = 0, i = 0, flip = 0; const push = (p, ms, upto, hit) => { ev.push({ at: t, pose: p, upto, hit }); t += ms; };
    const words = text.match(/\S+\s*/g) || [];
    words.forEach((w, wi) => {
      const start = i, core = w.trim(), end = i + w.length, word = core.toLowerCase().replace(/[^a-z']/g, ''), tail = core.slice(-1);
      const groups = [...core.matchAll(/[aeiouy]+/gi)];
      const lead = !FLAT.has(word) && (groups.length > 1 || word.length > 3 || PAUSE[tail]);
      let last = -1;
      groups.forEach((m, gi) => {
        const before = core[m.index - 1] || '', hit = lead && gi === 0;
        if (/[mbp]/i.test(before) && gi === 0) push('closed', 60, start + m.index, false);
        push(pose(m[0]), BASE, start + m.index + m[0].length, hit); last = gi;
      });
      if (last < 0) push('closed', 70, end - (w.length - core.length), false);
      push('closed', PAUSE[tail] || REST, end, false); i = end;
    });
    return { ev, total: t };
  }

  const shape = (b, p) => { const x1 = b.cx - p[0] / 2, x2 = b.cx + p[0] / 2, y = b.y; return `M${x1.toFixed(1)} ${y}Q${b.cx} ${(y + p[1]).toFixed(1)} ${x2.toFixed(1)} ${y}Q${b.cx} ${(y + p[2]).toFixed(1)} ${x1.toFixed(1)} ${y}Z`; };
  const tongue = (b, p) => { const dip = (p[2] + p[1]) / 2, w = p[0] * .5; return `M${(b.cx - w / 2).toFixed(1)} ${(b.y + dip * .8).toFixed(1)}Q${b.cx} ${(b.y + dip * .42).toFixed(1)} ${(b.cx + w / 2).toFixed(1)} ${(b.y + dip * .8).toFixed(1)}`; };
  let cur = null;

  function say(text, reveal, done) {
    if (cur) cur.finish();
    if (calm || !text) { reveal(text.length); done && done(); return { finish() {} }; }
    const mouths = [...document.querySelectorAll('.mouth')].filter(el => el.isConnected).map(el => {
      const n = (el.getAttribute('d').match(/-?\d+(\.\d+)?/g) || []).map(Number), NS = 'http://www.w3.org/2000/svg', tg = document.createElementNS(NS, 'path');
      tg.setAttribute('class', 'tongue'); tg.setAttribute('fill', 'none'); tg.style.display = 'none'; el.after(tg);
      return { el, tg, d: el.getAttribute('d'), cx: n[0] + n[n.length - 2] / 2, y: n[1], f: el.style.fill };
    });
    const heads = [...document.querySelectorAll('.bbtn, .ask-mini')], brows = [...document.querySelectorAll('.bbtn .brows')];
    let { ev, total } = plan(text); const k = total > 7500 ? 7500 / total : 1; // long answers speed up a little
    ev = ev.map(e => ({ ...e, at: e.at * k }));
    let n = 0, shown = 0, t0 = performance.now(), raf = 0, over = false, endAt = 0, flip = 1, browT = 0;
    const set = name => { const p = POSE[name], open = p[2] - p[1] > 4; mouths.forEach(m => {
      m.el.setAttribute('d', shape(m, p)); m.el.style.fill = open ? 'var(--surface)' : 'none';
      m.tg.style.display = open && p[2] > 11 ? '' : 'none'; if (open) m.tg.setAttribute('d', tongue(m, p)); }); };
    // a stressed syllable: the head tilts and bounces (alternating sides) and the brows lift
    const punch = () => {
      flip = -flip;
      heads.forEach(h => { const s = (h.getBoundingClientRect().width || 60) / 91; h.animate([
        { rotate: '0deg', translate: '0 0', scale: '1 1' }, { rotate: `${flip * 6}deg`, translate: `${flip * 2 * s}px ${-9 * s}px`, scale: '1.06 .97', offset: .35 },
        { rotate: `${flip * -2}deg`, translate: `0 ${2 * s}px`, scale: '.98 1.03', offset: .7 }, { rotate: '0deg', translate: '0 0', scale: '1 1' }], { duration: 300, easing: 'cubic-bezier(.3,1.4,.5,1)' }); });
      brows.forEach(b => { b.style.transform = 'translateY(-3.5px)'; }); clearTimeout(browT); browT = setTimeout(() => brows.forEach(b => { b.style.transform = ''; }), 260);
    };
    const end = () => { cancelAnimationFrame(raf); clearTimeout(browT); mouths.forEach(m => { m.el.setAttribute('d', m.d); m.el.style.fill = m.f; m.tg.remove(); }); brows.forEach(b => { b.style.transform = ''; }); if (cur === handle) cur = null; };
    const tick = now => {
      const el = now - t0;
      while (n < ev.length && ev[n].at <= el) { set(ev[n].pose); if (ev[n].hit) punch(); if (ev[n].upto > shown) { shown = ev[n].upto; reveal(shown); } n++; }
      if (n >= ev.length && !over) { over = true; shown = text.length; reveal(shown); done && done(); set('closed'); endAt = el + 200; }
      if (over && el > endAt) return end();
      raf = requestAnimationFrame(tick);
    };
    const handle = { finish() { if (!over) { over = true; reveal(text.length); done && done(); } end(); } };
    cur = handle; raf = requestAnimationFrame(tick); return handle;
  }
  window.Talk = { say, stop: () => cur && cur.finish() };
})();
