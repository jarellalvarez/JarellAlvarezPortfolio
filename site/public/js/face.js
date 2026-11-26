/* The helper's face: moods, mouth poses and small reactions, drawn on every helper face on the page (the homepage note and the top-bar face).
   Moods blend smoothly (brows, eyes, tilt); the mouth snaps between drawn poses like a cartoon cycle.
   Priority when several things are happening: a quick reaction, then thinking, then talking, then typing (concerned), then hover (delighted), then neutral.
   Reduced motion: every method does nothing, the face stays still. */
(() => {
  const NS = 'http://www.w3.org/2000/svg', calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const API = ['pose', 'mouthRelease', 'flash', 'nod', 'wink', 'punch', 'tilt', 'glance', 'think', 'typing', 'talkMood', 'hover', 'wave', 'hello', 'leaving', 'back', 'look', 'eager', 'ride', 'sweat', 'sick'];
  if (calm) { window.Face = Object.fromEntries(API.map(k => [k, () => {}])); return; }

  // mouth poses: [width, top lip curve, bottom lip curve] in the face's 90 x 100 units. Curves above the line (negative) turn the mouth down.
  const POSE = { neutral: [14, 5, 5], smile: [19, 10, 10], grin: [24, 6, 18], frown: [14, -4, -4], frown2: [11, -7, -7], pursed: [8, 2, 3.5], oh: [12, -1, 26],
    small: [15, 1, 17], wide: [20, 0, 26], queasy: [12, -2.5, 2], round: [11, 0, 22], ee: [23, 2, 11], oo: [7, 0, 14], fv: [15, 3, 7], mm: [13, 4.5, 4.5] };
  // moods: brows [lift, tilt] each, eyes [sx, sy], pupils, mouth pose, head tilt (deg). Brow tilt: left negative / right positive = worried.
  const MOOD = {
    neutral:   { bl: [0, 0],   br: [0, 0],   eye: [1, 1],     pup: [0, 0],     mouth: 'neutral', tilt: 0 },
    happy:     { bl: [-2, 0],  br: [-2, 0],  eye: [1, .78],   pup: [0, 0],     mouth: 'smile',   tilt: 0 },
    delight:   { bl: [-3.5, 0], br: [-3.5, 0], eye: [1.04, .62], pup: [0, 0],   mouth: 'grin',    tilt: -1.5 },
    wow:       { bl: [-6, 0],  br: [-6, 0],  eye: [1.12, 1.2], pup: [0, 0],    mouth: 'oh',      tilt: 0 },
    curious:   { bl: [0, 3],   br: [-6, -2], eye: [1, 1],     pup: [1.8, -1],  mouth: 'pursed',  tilt: -2 },
    concerned: { bl: [-3, -15], br: [-3, 15], eye: [.94, .92], pup: [0, 1.4],  mouth: 'frown',   tilt: 1 },
    sorry:     { bl: [-2, -18], br: [-2, 18], eye: [.9, .8],   pup: [0, 1.8],   mouth: 'frown2',  tilt: -2 },
    climb:     { bl: [-4, -10], br: [-4, 10], eye: [1.1, 1.14], pup: [0, -2.4], mouth: 'oo', tilt: -4 },
    drop:      { bl: [-7, 0], br: [-7, 0], eye: [1.2, 1.28], pup: [0, -1], mouth: 'wide', tilt: 0 },
    eager:     { bl: [-4, -2], br: [-4, 2], eye: [1.07, 1.1], pup: [0, 0], mouth: 'smile', tilt: 0 },
    leaving:   { bl: [-6, -18], br: [-6, 18], eye: [1.12, 1.16], pup: [0, -3.2], mouth: 'frown2', tilt: -2 },
    sleepy:    { bl: [3, 0],   br: [3, 0],   eye: [1, .22],   pup: [0, 2],     mouth: 'neutral', tilt: 0 },
    thinking:  { bl: [0, 2],   br: [-6, -3], eye: [1, 1],     pup: [2.8, -3],   mouth: 'pursed',  tilt: 2 },
    sick:      { bl: [1, -12], br: [1, 12],  eye: [.96, .5],   pup: [-1.6, 1.6], mouth: 'queasy',  tilt: 3 },
  };
  const S = { flash: null, think: false, talk: null, typing: false, hover: false, eager: false, ride: null, wink: false, winkAnim: false, lock: false, lift: false, tilt: 0, glance: null };
  const T = {}; const later = (k, fn, ms) => { clearTimeout(T[k]); T[k] = setTimeout(fn, ms); };
  const cache = new WeakMap();
  const parts = svg => {
    if (cache.has(svg)) return cache.get(svg);
    const el = svg.querySelector('.mouth'); if (!el) return null;
    const n = (el.getAttribute('d').match(/-?\d+(\.\d+)?/g) || []).map(Number), tg = document.createElementNS(NS, 'path');
    tg.setAttribute('class', 'tongue'); tg.style.display = 'none'; el.after(tg);
    const f = { svg, head: svg.closest('.bbtn,.ask-mini') || svg, mouth: el, tg, d0: el.getAttribute('d'), cx: n[0] + n[n.length - 2] / 2, y: n[1],
      bl: svg.querySelector('.bl'), br: svg.querySelector('.br'), eyes: [...svg.querySelectorAll('.eyes ellipse')], pupils: [...svg.querySelectorAll('.pupil')] };
    cache.set(svg, f); return f;
  };
  const faces = () => [...document.querySelectorAll('.bbtn svg, .ask-mini svg')].map(parts).filter(Boolean);

  const shape = (f, p) => { const x1 = f.cx - p[0] / 2, x2 = f.cx + p[0] / 2, y = f.y; return `M${x1.toFixed(1)} ${y}Q${f.cx} ${(y + p[1]).toFixed(1)} ${x2.toFixed(1)} ${y}Q${f.cx} ${(y + p[2]).toFixed(1)} ${x1.toFixed(1)} ${y}Z`; };
  const draw = (f, p) => {
    const open = p[2] - p[1] > 4; f.mouth.setAttribute('d', shape(f, p)); f.mouth.style.fill = open ? 'var(--surface)' : 'none';
    const tongue = open && p[1] >= 0 && p[2] > 12; f.tg.style.display = tongue ? '' : 'none';
    if (tongue) { const dip = (p[1] + p[2]) / 2, w = p[0] * .5; f.tg.setAttribute('d', `M${(f.cx - w / 2).toFixed(1)} ${(f.y + dip * .8).toFixed(1)}Q${f.cx} ${(f.y + dip * .42).toFixed(1)} ${(f.cx + w / 2).toFixed(1)} ${(f.y + dip * .8).toFixed(1)}`); }
  };
  const rest = f => { f.mouth.setAttribute('d', f.d0); f.mouth.style.fill = ''; f.tg.style.display = 'none'; };

  const current = () => S.flash || (S.think && 'thinking') || (S.typing && 'concerned') || S.talk || S.ride || (S.eager && 'eager') || (S.hover && 'delight') || 'neutral';
  function apply() {
    const m = MOOD[current()], rz = S.riding && (S.talk || S.typing || S.flash) ? 1 : 0, lift = (S.lift ? -1.8 : 0) - 2.2 * rz, g = S.glance || [0, 0];
    faces().forEach(f => {
      const set = (b, v, org) => { if (!b) return; b.style.transformBox = 'fill-box'; b.style.transformOrigin = org; b.style.transform = `translateY(${v[0] + lift}px) rotate(${v[1]}deg)`; };
      set(f.bl, m.bl, '100% 50%'); set(f.br, m.br, '0% 50%');
      f.eyes.forEach((e, i) => { e.style.transformBox = 'fill-box'; e.style.transformOrigin = '50% 50%'; e.style.transition = i === 1 && S.winkAnim ? 'transform .08s linear' : ''; e.style.transform = S.wink && i === 1 ? 'scale(1.05,.1)' : `scale(${m.eye[0] * (S.lift ? 1.03 : 1) * (1 + .08 * rz)},${m.eye[1] * (S.lift ? 1.04 : 1) * (1 + .1 * rz)})`; });
      f.pupils.forEach((p, i) => { if (i === 1) p.style.transition = `translate .4s cubic-bezier(.25,.7,.3,1), opacity 0s linear ${S.wink ? '.065s' : '0s'}`; p.style.opacity = S.wink && i === 1 ? 0 : ''; p.style.translate = `${m.pup[0] + g[0]}px ${m.pup[1] + g[1]}px`; });
      if (!S.riding) f.head.style.rotate = `${m.tilt + S.tilt}deg`;
      if (!S.lock) { const mp = m.mouth; if (current() === 'neutral') rest(f); else draw(f, POSE[mp]); }
    });
  }
  const render = () => apply();

  const heads = () => faces().map(f => f.head);
  const Face = {
    POSE,
    pose(p) { S.lock = true; S.pose = typeof p === 'string' ? POSE[p] : p; faces().forEach(f => draw(f, S.pose)); },
    mouthRelease() { S.lock = false; S.pose = null; render(); },
    flash(mood, ms = 900) { S.flash = mood; render(); later('flash', () => { S.flash = null; render(); }, ms); },
    talkMood(m) { S.talk = m; render(); },
    think(on) { S.think = on; render(); },
    typing(on) { S.typing = on; render(); },
    hover(on) { S.hover = on; render(); },
    tilt(deg, ms = 700) { S.tilt = deg; render(); later('tilt', () => { S.tilt = 0; render(); }, ms); },
    glance(dx, dy, ms = 900) { S.glance = [dx, dy]; render(); later('glance', () => { S.glance = null; render(); }, ms); },
    // approval nod: a double dip and rise, with a happy squint
    nod(power = 1) {
      heads().forEach(h => { const s = (h.getBoundingClientRect().width || 60) / 91 * power; h.animate([
        { translate: '0 0', scale: '1 1' }, { translate: `0 ${2.5 * s}px`, scale: '1.01 .975', offset: .3 }, { translate: `0 ${-.5 * s}px`, scale: '1 1.005', offset: .5 },
        { translate: `0 ${2 * s}px`, scale: '1.005 .98', offset: .75 }, { translate: '0 0', scale: '1 1' }], { duration: 760, easing: 'ease-in-out' }); });
      Face.flash('happy', 620);
    },
    wink() { S.winkAnim = true; S.wink = true; Face.flash('delight', 760); later('wink', () => { S.wink = false; render(); }, 300); later('winkAnim', () => { S.winkAnim = false; render(); }, 700); },
    // a wave: the head sways side to side a few times (slow and small when it is a sad goodbye)
    wave(sad) {
      const a = sad ? 2.5 : 5, d = sad ? 1800 : 1300;
      heads().forEach(h => h.animate([{ rotate: '0deg', translate: '0 0' }, { rotate: `${-a}deg`, translate: `0 ${sad ? 0 : -1.5}px`, offset: .2 }, { rotate: `${a}deg`, offset: .4 }, { rotate: `${-a * .8}deg`, offset: .6 }, { rotate: `${a * .6}deg`, offset: .8 }, { rotate: '0deg', translate: '0 0' }],
        { duration: d, easing: 'ease-in-out', composite: 'add' }));
    },
    // arriving: it wakes with wide eyes, waves and grins. The big hello is once a visit; later pages get a small smile.
    hello() {
      let first = true; try { first = !sessionStorage.getItem('hello'); sessionStorage.setItem('hello', '1'); } catch {}
      if (!first) return Face.flash('happy', 1100);
      Face.flash('sleepy', 380); setTimeout(() => { Face.flash('wow', 520); }, 380);
      setTimeout(() => { Face.flash('delight', 1500); Face.wave(); }, 900);
    },
    // about to leave: worried face, a slow sad wave, and (on the homepage) a line from the helper
    leaving() {
      const now = performance.now(); if (now - (Face._left || -1e9) < 20000 || S.talk || S.typing) return; Face._left = now;
      Face.flash('leaving', 2600); Face.wave(true);
      window.buddySay && window.buddySay("Leaving already? Ask me anything first.");
    },
    // follows the scroll with its eyes: down when you go forward, up (with a raised brow) when you go back
    look(dir) { Face.glance(0, dir * 3.2, 1300); if (dir < 0) Face.flash('curious', 1000); },
    // a rollercoaster ride: a nervous climb, a screaming drop that banks and shakes, then a happy "wheee" as it rolls into the station.
    // ms = how long the scroll takes. The shake only runs while the ride does.
    // too many steps too fast: a bead of sweat runs down his temple
    sweat() {
      heads().forEach(h => { if (!h.querySelector('.sweat')) h.insertAdjacentHTML('beforeend', '<span class="sweat" aria-hidden="true"><svg viewBox="0 0 10 14"><path d="M5 .5C5 .5.5 6 .5 9a4.5 4.5 0 0 0 9 0C9.5 6 5 .5 5 .5z"/></svg></span>');
        h.classList.remove('sweating'); void h.offsetWidth; h.classList.add('sweating'); });
      later('sweat', () => heads().forEach(h => h.classList.remove('sweating')), 1300);
    },
    // several screens in a row: he turns a little green and woozy, then shakes it off and smiles
    sick() {
      heads().forEach(h => h.classList.add('sick')); Face.flash('sick', 1700); Face.wave(true);
      later('unsick', () => { heads().forEach(h => h.classList.remove('sick')); Face.flash('happy', 1100); }, 1700);
    },
    ride(ms = 1400, dir = 1) {
      // count recent steps: three in 2.5s makes him sweat, four in 4s makes him a little sick once the ride ends
      const n0 = performance.now(); S.steps = (S.steps || []).filter(t => n0 - t < 4000); S.steps.push(n0);
      if (S.steps.length >= 4 && n0 - (S.sickAt || -1e9) > 12000) S.sickAt = n0, S.queasy = true;
      else if (S.steps.filter(t => n0 - t < 2500).length >= 3 && n0 - (S.sweatAt || -1e9) > 3000) S.sweatAt = n0, Face.sweat();
      heads().forEach(h => h.classList.toggle('up', dir < 0));   // the speed lines rise instead of fall when the page goes back up
      // already riding (a quick second flick): stretch the same ride to end with the new glide, so he never finishes after the page stops
      if (S.riding) { const now = performance.now(); S.rideEnd = Math.max(S.rideEnd, now + ms); S.ride = 'drop'; heads().forEach(h => h.classList.add('dropping')); render(); later('r2', S.rideFin, S.rideEnd - now - ms * .18); return; }
      S.riding = true; const t0 = performance.now(); let raf = 0; S.rideEnd = t0 + ms;
      heads().forEach(h => { if (!h.querySelector('.speed')) { // [x, y, length, in front of the face]; the face itself sits at about x 31 to 100, y 18 to 82
        const L = [[22, 20, 11], [109, 26, 9], [18, 44, 9], [48, 30, 7, 1], [112, 50, 12], [25, 64, 10], [84, 58, 8, 1], [106, 72, 9], [20, 80, 8], [62, 74, 6, 1]];
        h.insertAdjacentHTML('afterbegin', '<span class="speed" aria-hidden="true"><svg viewBox="0 0 130 100">' + L.map(([x, y, n, f], k) => `<path${f ? ' class="f"' : ''} d="M${x} ${y}v${n}" style="animation-delay:${-(k * .047).toFixed(3)}s"/>`).join('') + '</svg></span>'); }
        h.classList.add('riding'); });
      const climb = ms * .3, drop = ms * .82, hs = heads(), sm = x => x * x * (3 - 2 * x);
      const tick = now => {
        const t = now - t0, len = S.rideEnd - t0; if (t > len) return stop();
        const env = sm(Math.min(1, t / 320)) * sm(Math.min(1, (len - t) / 380));          // eases in and out, never abrupt
        const busy = S.talk || S.typing, dropping = S.ride === 'drop', k = dropping ? sm(Math.min(1, (t - climb) / 260)) : 0, a = busy ? .65 : 1;
        const sway = (dropping ? Math.sin(t / 60) * 4.2 * k + Math.sin(t / 140) * 2.4 : Math.sin(t / 260) * .9) * a * env;
        const lean = (t < climb ? -3.5 : dropping ? 2.4 * k : 0) * a * env;
        hs.forEach(h => { h.style.rotate = `${lean + sway}deg`; h.style.translate = dropping ? `${Math.sin(t / 41) * .7 * a * env}px ${Math.sin(t / 31) * 1 * k * a * env}px` : '0 0'; });
        // whatever the mouth is doing shivers a little: a quick wobble in its width and opening, strongest on the drop
        const p = S.lock ? S.pose : S.typing ? POSE.frown : null;
        if (p) { const w = .6 * Math.sin(t / 34) + .4 * Math.sin(t / 19 + 1), amp = env * (dropping ? 1 : .55); const q = [p[0] * (1 + .09 * w * amp), p[1], p[1] + (p[2] - p[1]) * (1 + .16 * Math.sin(t / 27 + 2) * amp)]; faces().forEach(f => draw(f, q)); }
        raf = requestAnimationFrame(tick);
      };
      const stop = () => { cancelAnimationFrame(raf); S.riding = false; S.ride = null; hs.forEach(h => { h.style.translate = ''; h.style.rotate = ''; h.classList.remove('riding', 'dropping', 'up'); }); render(); };
      S.ride = 'climb'; render(); raf = requestAnimationFrame(tick);
      later('r1', () => { S.ride = 'drop'; hs.forEach(h => h.classList.add('dropping')); render(); }, climb);
      S.rideFin = () => { S.ride = null; hs.forEach(h => h.classList.remove('dropping')); render(); if (S.queasy) { S.queasy = false; Face.sick(); } else if (!S.talk && !S.typing) Face.flash('delight', Math.max(600, ms * .3)); };
      later('r2', S.rideFin, drop);
    },
    back() { Face.flash('delight', 1400); Face.wave(); },
    // a stressed syllable: tilt and bounce (alternating sides), brows lift, eyes widen a touch
    punch() { S.lift = true; render(); later('lift', () => { S.lift = false; render(); }, 320); },
    // anticipation: a quick perk-up (brows and eyes up, a small lift) when the pointer meets something it could click, then it settles
    eager(on) {
      const was = S.eager; S.eager = on; render();
      if (on && !was) heads().forEach(h => h.animate([{ translate: '0 0', scale: '1' }, { translate: `0 ${-2.5 * ((h.getBoundingClientRect().width || 60) / 91)}px`, scale: '1.025', offset: .45 }, { translate: '0 0', scale: '1' }], { duration: 650, easing: 'ease-in-out' }));
      clearTimeout(T.eagerOff); if (on) T.eagerOff = setTimeout(() => { S.eager = false; render(); }, 1500);
    },
  };
  window.Face = Face;

  // ---- reactions to what happens on the page ----
  let lastClick = 0, lastStop;
  const isFace = el => el.closest?.('.bbtn,.ask-mini');
  document.addEventListener('pointerover', e => { if (isFace(e.target)) Face.hover(true); });
  document.addEventListener('pointerout', e => { if (isFace(e.target) && !isFace(e.relatedTarget || document.body)) Face.hover(false); });
  // typing a question: concerned while the keys are going, curious when they stop
  document.addEventListener('input', e => {
    if (!e.target.matches?.('.bform input, .ask input')) return;
    if (!e.target.value) { Face.typing(false); return; }
    Face.typing(true); later('typing', () => { Face.typing(false); Face.flash('curious', 1100); }, 1300);
  });
  document.addEventListener('submit', e => { if (e.target.matches?.('.bform')) { clearTimeout(T.typing); Face.typing(false); Face.nod(); } }, true);
  // clicks: an approval nod for most things, something different for a few
  document.addEventListener('click', e => {
    const t = e.target.closest?.('a,button,[role=button],.folder,.j-win'); if (!t) return;
    const now = performance.now(); if (now - lastClick < 450) return; lastClick = now;
    if (t.closest('.bbtn,.ask-mini,.dock-ask')) { Face.flash('delight', 900); return; }
    if (t.closest('.bform button, .bpill, .bmenu')) return;       // the chat reacts to those itself
    if (t.closest('.close-btn')) return Face.flash('sorry', 750);
    if (t.closest('.max-btn, .style-btn, .style-panel button')) return Face.flash('wow', 700);
    if (t.closest('[data-copy], .mail')) return Face.wink();
    Face.nod();
  }, true);
  // hovering something clickable: a small perk-up in anticipation, then it settles
  const HOT = 'a[href],button,[role=button],.folder,.j-win,summary,.j-chip'; let hot = null;
  document.addEventListener('pointerover', e => { if (e.pointerType && e.pointerType !== 'mouse') return; const t = e.target.closest?.(HOT); if (!t || isFace(t) || t.closest('.bform')) return; if (t === hot) return; hot = t; clearTimeout(T.eagerCalm); Face.eager(true); });
  document.addEventListener('pointerout', e => { const t = e.target.closest?.(HOT); if (!t || t !== hot || (e.relatedTarget && t.contains(e.relatedTarget))) return; hot = null; clearTimeout(T.eagerCalm); T.eagerCalm = setTimeout(() => Face.eager(false), 350); });
  // heading for the exit: the cursor leaves through the top of the window (tabs, address bar, close), or a "leave the site" prompt opens
  document.addEventListener('mouseout', e => { if (!e.relatedTarget && e.clientY <= 6 && e.clientX > 0 && e.clientX < innerWidth) Face.leaving(); });
  new MutationObserver(() => { if (document.querySelector('dialog#leave[open]')) Face.flash('sorry', 2400); }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });
  // back after being away
  let away = false; document.addEventListener('visibilitychange', () => { if (document.hidden) away = true; else if (away) { away = false; setTimeout(Face.back, 250); } });
  // arriving
  const hi = () => setTimeout(Face.hello, 600); if (document.readyState === 'complete') hi(); else addEventListener('load', hi, { once: true });
  // the scroll tour: a nod at each new stop
  document.addEventListener('journey:stop', e => {
    lastStop = e.detail.i;
    lastStop = e.detail.i; });
  // ordinary scrolling (phones, inner pages): its eyes follow the page down or up now and then
  let sy = scrollY, st = performance.now(), sT = 0; addEventListener('scroll', () => {
    const now = performance.now(), d = scrollY - sy, dt = Math.max(1, now - st); if (S.riding || now - sT < 2200) { sy = scrollY; st = now; return; }
    if (Math.abs(d) < 160 && !(Math.abs(d) > 70 && Math.abs(d) / dt > 1.4)) return;
    sy = scrollY; st = now; sT = now; if (Math.abs(d) / dt > 1.1) Face.ride(1500, d > 0 ? 1 : -1); else Face.look(d > 0 ? 1 : -1); }, { passive: true });
  // idle: now and then it glances around, raises a brow or smiles
  (function idle() { setTimeout(() => {
    if (!document.hidden && !S.talk && !S.typing && !S.hover && !S.think && !S.flash && faces().length) {
      const r = Math.random(); if (r < .4) Face.glance(Math.random() < .5 ? -3 : 3, Math.random() < .5 ? -1 : 1.5, 1100); else if (r < .7) Face.flash('curious', 1100); else if (r < .93) Face.flash('happy', 1200); else Face.wink(); }
    idle(); }, 7000 + Math.random() * 7000); })();
})();
