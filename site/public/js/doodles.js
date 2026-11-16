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
  // draw in once when visible
  const all = document.querySelectorAll('.dd');
  if (!('IntersectionObserver' in window)) { all.forEach(d => d.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  all.forEach(d => io.observe(d));
  new MutationObserver(() => document.querySelectorAll('.dd:not(.in)').forEach(d => io.observe(d))).observe(document.body, { childList: true, subtree: true });
})();
