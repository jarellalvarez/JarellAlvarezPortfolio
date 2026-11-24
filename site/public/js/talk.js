/* Ask Jarell talks. While text types in, the helper's mouth snaps between drawn poses (cartoon style), the head punches on stressed syllables,
   and the face reacts to what is being said: a grin on happy words, a worried look on sorry ones, a tilt on questions, a nod at commas.
   The text is revealed in step with the mouth. Reduced motion: no movement, the text just appears. Skippable: clicking the answer finishes it. */
(() => {
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const BASE = 100, REST = 70, PAUSE = { ',': 190, ';': 220, ':': 220, '.': 330, '!': 330, '?': 330 };
  const FLAT = new Set(['the', 'a', 'an', 'of', 'to', 'in', 'on', 'at', 'and', 'or', 'is', 'it', 'i', 'my', 'me', 'be', 'as', 'so', 'for', 'with']);
  const POS = /^(great|love|loved|happy|glad|thanks|thank|yes|fun|enjoy|enjoyed|excited|proud|awesome|best|welcome|hi|hello|good)$/, NEG = /^(sorry|unfortunately|don't|can't|cannot|never|not|yet|wrong)$/;
  const pose = g => /^(oo|ou|ow|u)/i.test(g) ? 'oo' : /^(o|oa)/i.test(g) ? 'round' : /^(a|ai|au)/i.test(g) ? 'wide' : /^(ee|ea|ie|i|y)/i.test(g) ? 'ee' : 'small';
  // louder syllables open further, softer ones less, so the mouth never looks like one repeated shape
  const amp = (p, k) => [p[0] * (k > 1 ? 1.12 : .9), p[1], p[2] > 6 ? p[2] * (k > 1 ? 1.18 : .78) : p[2]];
  let cur = null;

  // text -> timeline of [{ at, pose, upto, hit, fx }]
  function plan(text, F) {
    const ev = []; let t = 0, i = 0; const push = (p, ms, upto, hit, fx) => { ev.push({ at: t, pose: p, upto, hit, fx }); t += ms; };
    (text.match(/\S+\s*/g) || []).forEach(w => {
      const start = i, core = w.trim(), end = i + w.length, word = core.toLowerCase().replace(/[^a-z']/g, ''), tail = core.slice(-1);
      const groups = [...core.matchAll(/[aeiouy]+/gi)], lead = !FLAT.has(word) && (groups.length > 1 || word.length > 3 || PAUSE[tail]);
      const fx = POS.test(word) ? () => F.flash('delight', 700) : NEG.test(word) ? () => F.flash('concerned', 700) : null;
      groups.forEach((m, gi) => {
        const hit = lead && gi === 0, before = core[m.index - 1] || '';
        if (gi === 0 && /[mbp]/i.test(before)) push(F.POSE.mm, 60, start + m.index);
        else if (/[fv]/i.test(before)) push(F.POSE.fv, 50, start + m.index);
        const base = gi === 0 && POS.test(word) ? F.POSE.grin : F.POSE[pose(m[0])];
        push(amp(base, hit ? 1.28 : .82), BASE, start + m.index + m[0].length, hit, gi === 0 ? fx : null);
      });
      if (!groups.length) push(F.POSE.fv, 70, end - (w.length - core.length));
      const q = tail === '?', ex = tail === '!', cm = tail === ',' || tail === ';' || tail === ':', dot = tail === '.';
      push(dot || ex ? F.POSE.smile : F.POSE.neutral, PAUSE[tail] || REST, end, false, q ? () => { F.tilt(8, 900); F.flash('curious', 900); } : ex ? () => { F.flash('wow', 500); F.punch(1); } : cm ? () => F.tilt(-3, 300) : null);
      i = end;
    });
    return { ev, total: t };
  }

  function say(text, reveal, done, opt = {}) {
    const F = window.Face; if (cur) cur.finish();
    if (calm || !text || !F) { reveal(text.length); done && done(); return { finish() {} }; }
    let { ev, total } = plan(text, F); const k = total > 7500 ? 7500 / total : 1; // long answers speed up a little
    ev = ev.map(e => ({ ...e, at: e.at * k }));
    let n = 0, shown = 0, side = 1; const t0 = performance.now(); let raf = 0, over = false, endAt = 0;
    F.talkMood(opt.mood || 'happy');
    const end = () => { cancelAnimationFrame(raf); F.mouthRelease(); F.talkMood(null); if (cur === handle) cur = null; };
    const tick = now => {
      const el = now - t0;
      while (n < ev.length && ev[n].at <= el) { const e = ev[n]; F.pose(e.pose); if (e.hit) { side = -side; F.punch(side); } if (e.fx) e.fx(); if (e.upto > shown) { shown = e.upto; reveal(shown); } n++; }
      if (n >= ev.length && !over) { over = true; shown = text.length; reveal(shown); done && done(); F.pose(F.POSE.smile); endAt = el + 260; }
      if (over && el > endAt) return end();
      raf = requestAnimationFrame(tick);
    };
    const handle = { finish() { if (!over) { over = true; reveal(text.length); done && done(); } end(); } };
    cur = handle; raf = requestAnimationFrame(tick); return handle;
  }
  window.Talk = { say, stop: () => cur && cur.finish() };
})();
