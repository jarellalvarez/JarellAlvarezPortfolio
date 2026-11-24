/* Scroll tour (desktop, motion allowed). The page is a tall track; a fixed stage plays as you scroll (progress p, 0 to 1).
   Guided: one scroll gesture (wheel, swipe, arrow, Page Down, space) plays the whole next stage, easing the page to the next stop.
   Stops: 0 homescreen, .20 mavi, .34 copperleaf, .48 ui avenue, .66 more places, 1 goodbye.
   Timeline: the menu fades to 10% and glides to the side rail, the home screen leaves, three windows cascade, four preview cards stack into a 2x2 grid, the end screen slides up.
   Native scroll underneath (scrollbar, keys and the progress marks still work). Transform and opacity only. */
(() => {
  const stage = document.querySelector('.j-stage'); if (!stage) return;
  const track = document.querySelector('.j-track'), rail = document.querySelector('.rail'), nav = document.querySelector('nav.top'), hero = document.querySelector('.desk .hero'),
    toys = document.querySelector('.toys'), hint = document.querySelector('.j-hint'), hintT = document.getElementById('j-hint-t'), prog = document.querySelector('.j-prog'), marks = [...document.querySelectorAll('.j-prog li')],
    end = stage.querySelector('.j-end'), wins = [...stage.querySelectorAll('.j-win')], pvs = [...stage.querySelectorAll('.j-pv')],
    flow = matchMedia('(max-width:720px), (max-height:560px), (prefers-reduced-motion:reduce)');
  const STOPS = [0, .2, .34, .48, .66, 1], MID = [0, .1, .27, .41, .57, .83];
  const topEls = () => [...nav.querySelectorAll('ul a')], railEls = () => [...rail.querySelectorAll('.r-item span')];
  const cl = (x, a, b) => Math.min(1, Math.max(0, (x - a) / (b - a))), ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, lerp = (a, b, t) => a + (b - a) * t;
  let deltas = [], last = -1, raf = 0, needMeasure = false;
  const vis = (el, on) => { const v = on ? 'visible' : 'hidden'; if (el.style.visibility !== v) el.style.visibility = v; if (el.inert === on) el.inert = !on; };
  const maxScroll = () => track.offsetHeight - innerHeight;

  function measure() { // how far each top-bar item has to travel to land on its place in the rail (the logo stays where it is)
    const tops = topEls(); tops.forEach(t => { t.style.transform = ''; }); const rails = railEls();
    deltas = tops.map((t, i) => { const a = t.getBoundingClientRect(), b = rails[i].getBoundingClientRect(); return [b.left + b.width / 2 - (a.left + a.width / 2), b.top + b.height / 2 - (a.top + a.height / 2)]; });
    last = -1;
  }
  function clear() {
    [...topEls(), hero, toys, hint, end, ...wins, ...pvs].forEach(el => { if (el) { el.style.transform = ''; el.style.opacity = ''; el.style.visibility = ''; el.inert = false; } });
    hero.style.pointerEvents = ''; rail.style.opacity = ''; rail.style.removeProperty('--glass'); rail.classList.remove('on-dark'); prog.classList.remove('on-dark'); rail.inert = true;
    document.body.classList.remove('j-on', 'j-dark'); const ul = nav.querySelector('ul'); if (ul) ul.inert = false;
  }
  function render(p) {
    const vh = innerHeight, a = ease(cl(p, 0, .04)), m = ease(cl(p, .04, .14)), swap = cl(p, .13, .15);
    document.body.classList.toggle('j-on', p > .02);
    // menu: fade to 10%, travel to the rail, then hand over to the real rail links
    const op = p < .04 ? lerp(1, .1, a) : lerp(.1, 1, m);
    topEls().forEach((t, i) => { t.style.transform = `translate(${deltas[i][0] * m}px,${deltas[i][1] * m}px)`; t.style.opacity = op * (1 - swap); });
    const ul = nav.querySelector('ul'); if (ul) ul.inert = p > .14;
    rail.style.opacity = swap; rail.style.setProperty('--glass', ease(cl(p, .12, .17))); rail.inert = p < .14;
    // first screen leaves
    const h = ease(cl(p, .04, .16)); hero.style.transform = `translate(${h * 40}px,${-h * 150}px) scale(${1 - h * .5})`; hero.style.opacity = 1 - cl(p, .06, .2); hero.style.pointerEvents = p > .03 ? 'none' : ''; hero.inert = p > .1;
    if (toys) { toys.style.opacity = 1 - cl(p, .02, .15); toys.inert = p > .1; }
    // scroll cue: invites the first scroll, then keeps encouraging until the end screen arrives
    const ht = p < .02 ? 'Scroll to explore' : 'Keep scrolling'; if (hintT.textContent !== ht) hintT.textContent = ht; hint.style.opacity = 1 - cl(p, .8, .9);
    let cur = 0; MID.forEach((s, i) => { if (p >= s) cur = i; });
    marks.forEach((li, i) => { li.classList.toggle('on', i === cur); li.classList.toggle('prev', i === cur - 1); const b = li.firstElementChild; if (i === cur) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    // three windows cascade, then recede
    const rec = ease(cl(p, .46, .56));
    wins.forEach((w, i) => { const s = .06 + i * .14, t = ease(cl(p, s, s + .14)); w.style.transform = `translate(-50%,${(1 - t) * vh * 1.05 + i * 30 - rec * 70}px) rotate(${(i - 1) * 1.2 * t}deg) scale(${lerp(.94, 1, t) * lerp(1, .8, rec)})`; w.style.opacity = t > 0 ? 1 : 0; w.style.zIndex = i; vis(w, t > .02 && rec < .98); });
    // four previews stack into a 2x2 grid
    pvs.forEach((v, i) => { const s = .47 + i * .035, t = ease(cl(p, s, s + .08)); const o = ease(cl(p, .69 + (pvs.length - 1 - i) * .035, .69 + (pvs.length - 1 - i) * .035 + .1)), k = Math.min(t, 1 - o);
      v.style.transform = `translateY(${(1 - k) * vh * .9}px) rotate(${(i % 2 ? 1 : -1) * 2 * (1 - k)}deg) scale(${lerp(.9, 1, k)})`; v.style.opacity = t > 0 ? 1 : 0; v.style.zIndex = i; vis(v, t > .02 && o < .98); });
    // the end screen
    const e = ease(cl(p, .74, 1)); end.style.transform = `translateY(${(1 - e) * 105}vh)`; vis(end, e > .02);
    rail.classList.toggle('on-dark', e > .5); prog.classList.toggle('on-dark', e > .5); document.body.classList.toggle('j-dark', e > .5);
  }
  function update() {
    raf = 0; if (needMeasure) { needMeasure = false; measure(); }
    if (flow.matches) { if (last !== -2) { last = -2; clear(); } document.body.classList.toggle('j-scrolled', scrollY > 20); return; }
    document.body.classList.remove('j-scrolled');
    const max = maxScroll(), p = max > 0 ? cl(scrollY / max, 0, 1) : 0; if (p === last) return; last = p; render(p);
  }
  const queue = () => { if (!raf) raf = requestAnimationFrame(update); };
  let settleT = 0, held = false; const settle = () => { if (flow.matches || calm || busy || held) return; const i = nearest(), to = STOPS[i] * maxScroll(); if (Math.abs(scrollY - to) > 3) goTo(i); else announce(i); };
  addEventListener('pointerdown', () => { held = true; }, true); addEventListener('pointerup', () => { held = false; clearTimeout(settleT); settleT = setTimeout(settle, 300); }, true); addEventListener('pointercancel', () => { held = false; }, true);
  addEventListener('scroll', () => { queue(); clearTimeout(settleT); settleT = setTimeout(settle, 700); }, { passive: true }); addEventListener('resize', () => { needMeasure = true; queue(); }); flow.addEventListener('change', () => { last = -1; needMeasure = true; queue(); });
  new MutationObserver(() => { needMeasure = true; queue(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-font', 'data-size', 'data-palette'] });
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* Guided scroll: a gesture plays the whole next stage (the same idea as a stepped, scene-by-scene portfolio) */
  let lastStop = -1; const announce = i => { if (i === lastStop) return; lastStop = i; document.dispatchEvent(new CustomEvent('journey:stop', { detail: { i } })); };
  let anim = 0, busy = false, lockUntil = 0, acc = 0, accT = 0, touchY = null, aim = -1, lastAbs = 0;
  const nearest = () => { const p = maxScroll() > 0 ? scrollY / maxScroll() : 0; let b = 0, d = 9; STOPS.forEach((s, i) => { const dd = Math.abs(s - p); if (dd < d) { d = dd; b = i; } }); return b; };
  const ez = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function goTo(i, force) {
    if (flow.matches || calm || i < 0 || i >= STOPS.length || (busy && !force)) return;
    cancelAnimationFrame(anim); const from = scrollY, to = Math.round(STOPS[i] * maxScroll()), dist = Math.abs(to - from); if (!dist) { busy = false; return; }
    aim = i; busy = true; const dur = Math.min(1050, 480 + dist / Math.max(1, maxScroll()) * 2200), t0 = performance.now();
    const tick = now => { const t = Math.min(1, (now - t0) / dur); scrollTo(0, from + (to - from) * ez(t)); if (t < 1) anim = requestAnimationFrame(tick); else { busy = false; lockUntil = performance.now() + 120; announce(i); } };
    anim = requestAnimationFrame(tick);
  }
  const ignore = el => !!(el && el.closest && el.closest('.win,dialog,.style-panel,.askpanel,.bchatui,.more-menu,.lb,input,textarea,select,[contenteditable]'));
  const canScroll = (el, dir) => { for (; el && el !== document.body; el = el.parentElement) { const cs = getComputedStyle(el); if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 1 && (dir > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0)) return true; } return false; };
  addEventListener('wheel', e => {
    if (flow.matches || calm || e.ctrlKey || ignore(e.target) || canScroll(e.target, e.deltaY)) return; if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; e.preventDefault();
    // a flick that speeds up again after the last one fades is a new gesture: it moves on right away, even mid-glide; the tail of one flick is ignored
    const now = performance.now(), ad = Math.abs(e.deltaY), fresh = ad > lastAbs + 3 && now - accT > 40; lastAbs = ad;
    if (busy || now < lockUntil) { if (fresh && ad > 8) { const cur = busy && aim >= 0 ? aim : nearest(), d = e.deltaY > 0 ? 1 : -1; accT = now; goTo(cur + d, true); } else lockUntil = Math.max(lockUntil, now + 60); accT = now; return; }
    if (now - accT > 180) acc = 0; accT = now; acc += e.deltaY; if (Math.abs(acc) > 3) { const d = acc > 0 ? 1 : -1; acc = 0; goTo(nearest() + d); }
  }, { passive: false });
  addEventListener('keydown', e => {
    if (flow.matches || calm || e.altKey || e.metaKey || e.ctrlKey || ignore(e.target) || document.querySelector('dialog[open]') || (e.target.closest && e.target.closest('.j-end') && canScroll(e.target, ['ArrowUp','PageUp'].includes(e.key) || (e.key === ' ' && e.shiftKey) ? -1 : 1))) return;
    const k = e.key, onBody = e.target === document.body || e.target === document.documentElement; let d = 0;
    if (k === 'ArrowDown' || k === 'PageDown') d = 1; else if (k === 'ArrowUp' || k === 'PageUp') d = -1; else if (k === ' ' && onBody) d = e.shiftKey ? -1 : 1;
    else if (k === 'Home') { e.preventDefault(); goTo(0); return; } else if (k === 'End') { e.preventDefault(); goTo(STOPS.length - 1); return; }
    if (d && (onBody || k !== ' ')) { e.preventDefault(); goTo(nearest() + d); }
  });
  const tStart = e => { touchY = e.touches.length === 1 ? e.touches[0].clientY : null; };
  const tMove = e => { if (touchY !== null && e.touches.length === 1 && !calm && !ignore(e.target) && !canScroll(e.target, touchY - e.touches[0].clientY)) e.preventDefault(); };
  const tEnd = e => { if (touchY === null || calm || ignore(e.target)) { touchY = null; return; } const dy = touchY - e.changedTouches[0].clientY; touchY = null; if (Math.abs(dy) > 14 && !canScroll(e.target, dy)) goTo(nearest() + (dy > 0 ? 1 : -1)); };
  let touching = false; const bindTouch = () => { const on = !flow.matches && !calm; if (on === touching) return; touching = on; const f = on ? 'addEventListener' : 'removeEventListener'; window[f]('touchstart', tStart, { passive: true }); window[f]('touchmove', tMove, { passive: false }); window[f]('touchend', tEnd); };
  bindTouch(); flow.addEventListener('change', bindTouch);
  marks.forEach((li, i) => li.firstElementChild.addEventListener('click', () => { if (calm) scrollTo(0, Math.round(STOPS[i] * maxScroll() + (i ? 2 : 0))); else goTo(i, true); }));
  const go = top => scrollTo({ top, behavior: calm ? 'auto' : 'smooth' });
  document.getElementById('j-top')?.addEventListener('click', () => { if (calm) go(0); else goTo(0, true); const h = document.querySelector('.hero h1'); if (h) { h.tabIndex = -1; setTimeout(() => h.focus({ preventScroll: true }), calm ? 0 : 1500); } });
  document.getElementById('j-ask')?.addEventListener('click', () => document.querySelector('.bbtn')?.click());
  document.querySelector('.j-skip')?.addEventListener('click', e => { if (!flow.matches) { e.preventDefault(); if (calm) go(maxScroll()); else goTo(STOPS.length - 1, true); } setTimeout(() => end.focus({ preventScroll: true }), calm ? 0 : 1600); });
  // links that leave the site ask first, like the folders do
  const leave = document.getElementById('leave'), lp = document.getElementById('leave-p');
  if (leave && lp) document.querySelectorAll('.j-pv a[target=_blank], .j-chip[target=_blank]').forEach(a => { let host = ''; try { host = new URL(a.href).host; } catch {} if (!host || host === location.host) return;
    a.addEventListener('click', e => { e.preventDefault(); const name = (a.querySelector('h3') || a).textContent.trim(); lp.textContent = `This opens ${name} (${host}) in a new tab.`; leave.returnValue = ''; leave.showModal(); leave.onclose = () => { if (leave.returnValue === 'go') window.open(a.href, '_blank', 'noopener'); }; }); });
  const art = () => document.querySelectorAll('.j-arrow,.j-art').forEach(d => { const I = window.Illustrations; if (!I) return; I.mount(d).then(() => { if (!d.classList.contains('j-art')) I.play(d, 'in'); }); });
  // the two drawings on the last screen play again when you hover or tap them
  document.querySelectorAll('.j-art').forEach(d => { let on = false; const again = () => { if (on || !window.Illustrations) return; on = true; window.Illustrations.play(d, 'play'); setTimeout(() => { on = false; }, 1400); }; d.addEventListener('pointerenter', again); d.addEventListener('click', again); });
  if (document.readyState === 'complete') art(); else addEventListener('load', art);
  document.fonts?.ready.then(() => { needMeasure = true; queue(); }); needMeasure = true; queue();
  /* Phones: the same cards, previews and end screen rise in as they scroll into view (a lighter echo of the desktop cascade) */
  if (!calm && 'IntersectionObserver' in window && matchMedia('(max-width:720px)').matches) {
    const els = [...stage.querySelectorAll('.j-win, .j-pv, .j-end h2, .j-end p, .j-chips li')];
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('m-in'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    els.forEach((el, i) => { el.classList.add('m-rv'); el.style.setProperty('--md', (el.matches('.j-chips li') ? (i % 8) * 45 : 0) + 'ms'); if (el.matches('.j-win')) el.style.setProperty('--mr', (els.indexOf(el) % 2 ? 1.2 : -1.2) + 'deg'); io.observe(el); });
  }
})();
