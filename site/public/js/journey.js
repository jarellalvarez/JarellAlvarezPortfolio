/* Scroll tour (desktop, motion allowed). The page is a tall track; a fixed stage plays as you scroll (progress p, 0 to 1):
   0 to .04 the top nav fades to 10%, .04 to .14 it glides to the left rail (glass panel appears), then three windows cascade,
   four preview cards arrive, and the end screen slides up. Native scroll, transform and opacity only. */
(() => {
  const stage = document.querySelector('.j-stage'); if (!stage) return;
  const track = document.querySelector('.j-track'), rail = document.querySelector('.rail'), nav = document.querySelector('nav.top'), hero = document.querySelector('.desk .hero'),
    toys = document.querySelector('.toys'), hint = document.querySelector('.j-hint'), end = stage.querySelector('.j-end'),
    wins = [...stage.querySelectorAll('.j-win')], pvs = [...stage.querySelectorAll('.j-pv')], flow = matchMedia('(max-width:720px), (max-height:560px), (prefers-reduced-motion:reduce)');
  const topEls = () => [nav.querySelector(':scope > a'), ...nav.querySelectorAll('ul a')], railEls = () => [rail.querySelector('.r-logo .logo'), ...rail.querySelectorAll('.r-item span')];
  const cl = (x, a, b) => Math.min(1, Math.max(0, (x - a) / (b - a))), ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, lerp = (a, b, t) => a + (b - a) * t;
  let deltas = [], last = -1, raf = 0, needMeasure = false;
  const vis = (el, on) => { const v = on ? 'visible' : 'hidden'; if (el.style.visibility !== v) el.style.visibility = v; if (el.inert === on) el.inert = !on; };

  function measure() { // how far each top-bar item has to travel to land on its place in the rail
    const tops = topEls(); tops.forEach(t => { if (t) t.style.transform = ''; }); const rails = railEls();
    deltas = tops.map((t, i) => { if (!t) return [0, 0]; const a = (i ? t : t.querySelector('.logo') || t).getBoundingClientRect(), b = rails[i].getBoundingClientRect(); return [b.left + b.width / 2 - (a.left + a.width / 2), b.top + b.height / 2 - (a.top + a.height / 2)]; });
    last = -1;
  }
  function clear() {
    [...topEls(), hero, toys, hint, end, ...wins, ...pvs].forEach(el => { if (el) { el.style.transform = ''; el.style.opacity = ''; el.style.visibility = ''; el.inert = false; } });
    hero.style.pointerEvents = ''; rail.style.opacity = ''; rail.style.removeProperty('--glass'); rail.classList.remove('on-dark'); rail.inert = true;
    document.body.classList.remove('j-on', 'j-dark'); if (nav.querySelector('ul')) nav.querySelector('ul').inert = false;
  }
  function render(p) {
    const vh = innerHeight, a = ease(cl(p, 0, .04)), m = ease(cl(p, .04, .14)), swap = cl(p, .13, .15);
    document.body.classList.toggle('j-on', p > .02);
    // top nav: fade to 10%, travel to the rail, then hand over to the real rail links
    const tops = topEls(), op = p < .04 ? lerp(1, .1, a) : lerp(.1, 1, m);
    tops.forEach((t, i) => { if (!t) return; t.style.transform = `translate(${deltas[i][0] * m}px,${deltas[i][1] * m}px)`; t.style.opacity = op * (1 - swap); });
    const ul = nav.querySelector('ul'); if (ul) ul.inert = p > .14; const lg = tops[0]; if (lg) lg.inert = p > .14;
    rail.style.opacity = swap; rail.style.setProperty('--glass', ease(cl(p, .12, .17))); rail.inert = p < .14;
    // first screen leaves
    const h = ease(cl(p, .06, .17)); hero.style.transform = `translate(${h * 40}px,${-h * 150}px) scale(${1 - h * .5})`; hero.style.opacity = 1 - cl(p, .1, .3); hero.style.pointerEvents = p > .03 ? 'none' : ''; hero.inert = p > .2;
    if (toys) { toys.style.opacity = 1 - cl(p, .02, .15); toys.inert = p > .2; }
    hint.style.opacity = 1 - cl(p, 0, .03);
    // three windows cascade, then recede
    const rec = ease(cl(p, .56, .66));
    wins.forEach((w, i) => { const s = .14 + i * .14, t = ease(cl(p, s, s + .16)); w.style.transform = `translate(-50%,${(1 - t) * vh * 1.05 + i * 30 - rec * 70}px) rotate(${(i - 1) * 1.2 * t}deg) scale(${lerp(.94, 1, t) * lerp(1, .8, rec)})`; w.style.opacity = t > 0 ? lerp(1, .35, rec) : 0; w.style.zIndex = i; vis(w, t > .02 && rec < .98); });
    // four previews
    pvs.forEach((v, i) => { const s = .6 + i * .04, t = ease(cl(p, s, s + .12)); v.style.transform = `translateY(${(1 - t) * vh * .8}px) rotate(${(i % 2 ? 1 : -1) * 1.5 * t}deg)`; v.style.opacity = t > 0 ? 1 : 0; vis(v, t > .02 && cl(p, .8, .9) < .5); });
    // the end screen
    const e = ease(cl(p, .8, .95)); end.style.transform = `translateY(${(1 - e) * 105}vh)`; vis(end, e > .02);
    rail.classList.toggle('on-dark', e > .5); document.body.classList.toggle('j-dark', e > .5);
  }
  function update() {
    raf = 0; if (needMeasure) { needMeasure = false; measure(); }
    if (flow.matches) { if (last !== -2) { last = -2; clear(); } document.body.classList.toggle('j-scrolled', scrollY > 20); return; }
    document.body.classList.remove('j-scrolled');
    const max = track.offsetHeight - innerHeight, p = max > 0 ? cl(scrollY / max, 0, 1) : 0; if (p === last) return; last = p; render(p);
  }
  const queue = () => { if (!raf) raf = requestAnimationFrame(update); };
  addEventListener('scroll', queue, { passive: true }); addEventListener('resize', () => { needMeasure = true; queue(); }); flow.addEventListener('change', () => { last = -1; needMeasure = true; queue(); });
  new MutationObserver(() => { needMeasure = true; queue(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-font', 'data-size', 'data-palette'] });
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches, go = top => scrollTo({ top, behavior: calm ? 'auto' : 'smooth' });
  document.getElementById('j-top')?.addEventListener('click', () => { go(0); const h = document.querySelector('.hero h1'); if (h) { h.tabIndex = -1; setTimeout(() => h.focus({ preventScroll: true }), calm ? 0 : 700); } });
  document.getElementById('j-ask')?.addEventListener('click', () => document.querySelector('.bbtn')?.click());
  document.querySelector('.j-skip')?.addEventListener('click', e => { if (!flow.matches) { e.preventDefault(); go(track.offsetHeight - innerHeight); } setTimeout(() => end.focus({ preventScroll: true }), calm ? 0 : 900); });
  const art = () => document.querySelectorAll('.j-arrow,.j-art').forEach(d => { const I = window.Illustrations; if (I) I.mount(d).then(() => I.play(d, 'in')); });
  if (document.readyState === 'complete') art(); else addEventListener('load', art);
  document.fonts?.ready.then(() => { needMeasure = true; queue(); }); needMeasure = true; queue();
})();
