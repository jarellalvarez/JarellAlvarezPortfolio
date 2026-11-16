// Shared behavior for every page except the homepage desktop.
// Read more toggles
document.querySelectorAll('.rm').forEach(b => b.onclick = () => {
  const open = b.previousElementSibling.classList.toggle('open');
  b.textContent = open ? 'Show less' : 'Read more';
  b.setAttribute('aria-expanded', open);
});
// Email buttons: first click copies and reveals the address, a "Copied" tip shows for 2 seconds
document.querySelectorAll('.mail').forEach(b => {
  const email = b.dataset.email, label = b.querySelector('.label'), tip = b.querySelector('.tip');
  let t;
  b.onclick = async () => {
    let ok = true;
    try { await navigator.clipboard.writeText(email); } catch { ok = false; }
    label.textContent = email; b.classList.add('shown'); b.setAttribute('aria-label', 'Copy ' + email);
    tip.textContent = ok ? 'Copied' : 'Press and hold to copy';
    tip.classList.add('on'); clearTimeout(t); t = setTimeout(() => tip.classList.remove('on'), 2000);
  };
});

// Stat numbers count up once when they come into view
(() => {
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; io.unobserve(e.target);
    const el = e.target, full = el.textContent, m = full.match(/\d+(\.\d+)?/); if (!m) return;
    const end = parseFloat(m[0]), t0 = performance.now(), dur = 900;
    const tick = t => { const k = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - (1 - k) ** 3));
      el.textContent = full.replace(m[0], String(v)); if (k < 1) requestAnimationFrame(tick); else el.textContent = full; };
    requestAnimationFrame(tick);
  }), { threshold: .6 });
  document.querySelectorAll('.stats b').forEach(b => io.observe(b));
})();

// Sticky header gets a shadow once you scroll
(() => { const h = document.getElementById('top-bar'); if (!h) return;
  const f = () => h.classList.toggle('scrolled', scrollY > 8); addEventListener('scroll', f, { passive: true }); f(); })();

// Contents sidebar for case studies and About, built from the page's own headings; stays in view on wide screens
(() => {
  const main = document.querySelector('main');
  if (!main || !document.querySelector('.lede, .story.about')) return;
  const build = () => {
    main.querySelector('.page-toc')?.remove();
    const heads = [...main.querySelectorAll('.story h2, .story h3, main>h2.h-sec')].filter(h => h.offsetParent || h.closest('.clamp'));
    if (heads.length < 2) return;
    heads.forEach((h, i) => { if (!h.id) h.id = 's-' + i; });
    const nav = document.createElement('nav'); nav.className = 'page-toc'; nav.setAttribute('aria-label', 'Contents');
    nav.innerHTML = '<p>Contents</p><ol>' + heads.map(h => `<li${h.tagName === 'H3' ? ' class="sub"' : ''}><a href="#${h.id}"></a></li>`).join('') + '</ol>';
    nav.querySelectorAll('a').forEach((a, i) => { a.textContent = heads[i].textContent.trim(); a.onclick = () => {
      const c = heads[i].closest('.clamp'); if (c && !c.classList.contains('open')) c.nextElementSibling?.click(); }; });
    main.prepend(nav); document.body.classList.add('has-toc');
    const links = [...nav.querySelectorAll('a')];
    const io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return;
      links.forEach(a => a.removeAttribute('aria-current')); links.find(a => a.hash === '#' + e.target.id)?.setAttribute('aria-current', 'true'); }), { rootMargin: '0px 0px -70% 0px' });
    heads.forEach(h => io.observe(h));
  };
  build();
  // rebuild after a locked case study is unlocked
  new MutationObserver(build).observe(document.getElementById('story') || document.createElement('i'), { childList: true });
})();
