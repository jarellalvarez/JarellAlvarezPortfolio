/* Jarell's hand-drawn marks, traced from marker drawings. Decorative only: hidden from screen readers,
   drawn in once when they scroll into view, still under reduced motion. */
(() => {
  const mk = (name, cls) => { const s = document.createElement('span'); s.className = 'dd ' + (cls || ''); s.setAttribute('aria-hidden', 'true'); s.style.setProperty('--d', `url(/doodles/${name}.svg)`); return s; };
  const pick = (t, map) => { for (const [re, n] of map) if (re.test(t)) return n; return null; };
  // case studies: one mark per section heading, in the left margin
  if (document.querySelector('.lede')) {
    const map = [[/overview|at a glance/i, 'note'], [/problem/i, 'bubble'], [/hard/i, 'wireframe'], [/finding|research|users|competition|scope/i, 'bubble2'],
      [/decision|idea|wireframing|process/i, 'bulb'], [/result|stands|final|outcome/i, 'chart'], [/learn|next/i, 'star'], [/presentation|design system|style/i, 'shapes']];
    const place = () => document.querySelectorAll('.story h2').forEach(h => { if (h.querySelector('.dd')) return; const n = pick(h.textContent, map); if (n) h.prepend(mk(n, 'side')); });
    place(); const st = document.getElementById('story'); if (st) new MutationObserver(place).observe(st, { childList: true });
    document.querySelectorAll('.stats').forEach(s => s.after(mk('squiggle', 'under')));
  }
  // About: a drawing beside the blurbs that have one
  if (document.querySelector('.story.about')) {
    const map = [[/volleyball/i, 'volleyball'], [/hiking/i, 'boots'], [/book/i, 'book'], [/moment|photo/i, 'camera'], [/travel/i, 'globe'],
      [/community/i, 'bubble2'], [/teaching/i, 'bulb'], [/ai /i, 'cursor'], [/model/i, 'star']];
    document.querySelectorAll('.story.about h2').forEach(h => { const n = pick(h.textContent + ' ', map); if (n) h.append(mk(n, 'tag')); });
    document.querySelector('.timeline')?.before(mk('mountain', 'float'));
  }
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const once = (el, cls) => { if (calm || el.classList.contains(cls)) return; el.classList.add(cls); el.addEventListener('animationend', () => el.classList.remove(cls), { once: true }); };
  // homepage background: each drawing has its own move, played now and then and when the pointer comes near
  const bg = [...document.querySelectorAll('.doodle-bg .dd')], moves = { coffee: 'm-tilt', plane: 'm-fly', star: 'm-spin', curly: 'm-draw', cursor: 'm-click' };
  const moveOf = d => moves[(d.style.getPropertyValue('--d').match(/doodles\/(\w+)/) || [])[1]] || 'm-jump';
  if (bg.length && !calm) {
    (function idle() { setTimeout(() => { const d = bg[Math.floor(Math.random() * bg.length)]; once(d, moveOf(d)); idle(); }, 3500 + Math.random() * 3500); })();
    let q = 0; addEventListener('pointermove', e => { if (q) return; q = requestAnimationFrame(() => { q = 0; bg.forEach(d => { const r = d.getBoundingClientRect(), near = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < Math.max(r.width, 70);
      if (near && !d.classList.contains('near')) once(d, moveOf(d)); d.classList.toggle('near', near); }); }); });
  }
  // inner pages: the stats squiggle redraws on hover, margin and blurb drawings wiggle every so often
  document.querySelectorAll('.stats').forEach(st => st.addEventListener('pointerenter', () => { const u = st.nextElementSibling; if (u?.classList.contains('under')) once(u, 'redraw'); }));
  if (!bg.length && !calm) (function idle() { setTimeout(() => { const vis = [...document.querySelectorAll('.dd.in:not(.under)')].filter(d => { const r = d.getBoundingClientRect(); return r.width && r.top > 0 && r.bottom < innerHeight; });
    if (vis.length) once(vis[Math.floor(Math.random() * vis.length)], 'play'); idle(); }, 4000 + Math.random() * 4000); })();
  // draw in once when visible
  const all = document.querySelectorAll('.dd');
  if (!('IntersectionObserver' in window)) { all.forEach(d => d.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); once(e.target, 'pop'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  all.forEach(d => io.observe(d));
  new MutationObserver(() => document.querySelectorAll('.dd:not(.in)').forEach(d => io.observe(d))).observe(document.body, { childList: true, subtree: true });
})();
