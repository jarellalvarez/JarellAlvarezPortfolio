/* Jarell's own Illustrator drawings, shown inline so each part can move on its own.
   Decorative only (hidden from screen readers). Each drawing sketches itself in once when it scrolls into view,
   does one small thing that suits what it is, then rests. Hover and idle replays are short. Reduced motion: still, fully visible.
   Traced drawings with no Illustrator original yet (bubble, chart, shapes) still come from /doodles/. */
(() => {
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const TRACED = { bubble: 1, chart: 1, shapes: 1 };
  const cache = {};
  const load = n => cache[n] ||= fetch(TRACED[n] ? `/doodles/${n}.svg` : `/illustrations/${n}.svg`).then(r => r.ok ? r.text() : Promise.reject()).catch(() => null);
  const mk = (name, cls) => { const s = document.createElement('span'); s.className = 'dd ' + (cls || ''); s.dataset.art = name; s.setAttribute('aria-hidden', 'true'); return s; };
  const pick = (t, map) => { for (const [re, n] of map) if (re.test(t)) return n; return null; };

  // put the SVG inside its box; every path gets pN so motion can target parts
  async function mount(el) {
    const name = el.dataset.art, text = await load(name); if (!text || el.firstElementChild) return;
    el.innerHTML = text; const svg = el.firstElementChild; if (!svg || svg.tagName.toLowerCase() !== 'svg') { el.innerHTML = ''; return; }
    svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false'); svg.removeAttribute('width'); svg.removeAttribute('height');
    svg.classList.add('art', 'art-' + name); svg.querySelectorAll('path').forEach((p, i) => p.classList.add('p' + i));
    const vb = svg.viewBox.baseVal; if (vb && vb.height) el.style.setProperty('--ar', (vb.width / vb.height).toFixed(3));
    if (!calm) svg.classList.add('pre');
    watch(el);
  }
  // kind: 'in' = sketch in plus the drawing's action; 'play' = the action again
  function play(el, kind) {
    const svg = el.firstElementChild; if (!svg || !svg.classList) return;
    svg.classList.remove('pre'); if (calm) return;
    svg.classList.remove('in', 'play'); void svg.getBoundingClientRect(); svg.classList.add(kind);
    clearTimeout(svg._t); svg._t = setTimeout(() => svg.classList.remove(kind), kind === 'in' ? 3200 : 2400);
  }
  const busy = el => { const s = el.firstElementChild; return !s || s.classList.contains('in') || s.classList.contains('play') || s.classList.contains('pre'); };

  let io = null;
  function watch(el) {
    if (!('IntersectionObserver' in window)) { play(el, 'in'); return; }
    io ||= new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); play(e.target, 'in'); } }), { rootMargin: '0px 0px -10% 0px' });
    io.observe(el);
  }

  // case studies: one drawing per section heading, in the left margin
  if (document.querySelector('.lede')) {
    const map = [[/overview|at a glance/i, 'stick-note'], [/problem/i, 'bubble'], [/hard/i, 'wireframe'], [/finding|research|users|competition|scope/i, 'chat-bubble'],
      [/decision|idea|wireframing|process/i, 'lightbulb'], [/result|stands|final|outcome/i, 'chart'], [/learn|next/i, 'star'], [/presentation|design system|style/i, 'shapes']];
    const place = () => document.querySelectorAll('.story h2').forEach(h => { if (h.querySelector('.dd')) return; const n = pick(h.textContent, map); if (!n) return;
      const d = mk(n, 'side'); h.prepend(d); mount(d); h.addEventListener('pointerenter', () => { if (!busy(d)) play(d, 'play'); }); });
    place(); const st = document.getElementById('story'); if (st) new MutationObserver(place).observe(st, { childList: true });
    document.querySelectorAll('.stats').forEach(s => { const u = mk('squiggly-underline', 'under'); s.after(u); mount(u); s.addEventListener('pointerenter', () => { if (!busy(u)) play(u, 'play'); }); });
  }
  // About: a drawing in front of each blurb heading (it replaces the old emoji). Also used by the About window on the homepage.
  const aboutMap = [[/lifting|weights/i, 'lifting-weights-repeatedly'], [/fashion/i, 'anything-fashion-related'], [/music/i, 'classifying-music'], [/cook/i, 'cooking-nerd'], [/board game/i, 'board-game-nerd'],
    [/volleyball/i, 'volleyball'], [/hiking/i, 'hiking'], [/book club/i, 'book'], [/moment|photo/i, 'camera'], [/travel/i, 'glove'], [/community/i, 'chat-bubble'],
    [/teaching/i, 'lightbulb'], [/\bai\b/i, 'cursor'], [/model/i, 'star']];
  function about(root) {
    root.querySelectorAll('.story.about h2').forEach(h => { if (h.querySelector('.dd')) return; const n = pick(h.textContent, aboutMap); if (!n) return;
      const d = mk(n, 'tag'); h.prepend(d); mount(d); h.addEventListener('pointerenter', () => { if (!busy(d)) play(d, 'play'); }); });
  }
  if (document.querySelector('.story.about')) {
    about(document);
    const tl = document.querySelector('.timeline'); if (tl) { const d = mk('vancouver-mountains', 'float'); tl.before(d); mount(d); }
  }
  // homepage background: each drawing arrives in turn, then moves now and then and when the pointer comes near
  const bg = [...document.querySelectorAll('.doodle-bg .dd[data-art]')];
  if (bg.length) {
    bg.forEach(d => mount(d));
    if (!calm) {
      (function idle() { setTimeout(() => { const d = bg[Math.floor(Math.random() * bg.length)]; if (!busy(d)) play(d, 'play'); idle(); }, 4200 + Math.random() * 3800); })();
      let q = 0; addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || q) return; q = requestAnimationFrame(() => { q = 0; bg.forEach(d => { const r = d.getBoundingClientRect(),
        near = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < Math.max(r.width, 70);
        if (near && !d.classList.contains('near') && !busy(d)) play(d, 'play'); d.classList.toggle('near', near); }); }); });
    }
  }
  window.Illustrations = { mount, play, about };
})();
