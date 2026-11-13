// Style panel: theme, light/dark, font, text size, randomize. Choices are kept on this device and apply on every page.
(() => {
  const root = document.documentElement, $ = s => document.querySelector(s);
  const btn = $('#style-btn'), panel = $('#style-panel');
  if (!btn || !panel) return;
  const OPTS = { palette: ['ivory', 'stone', 'sage', 'ink', 'clay', 'contrast'], mode: ['light', 'dark'], font: ['bricolage', 'familjen', 'syne', 'atkinson'], size: ['s', 'm', 'l', 'xl'] };
  const DEFAULT = { palette: 'ivory', mode: 'light', font: 'bricolage', size: 'm' };
  const attr = { palette: 'palette', mode: 'theme', font: 'font', size: 'size' };
  const get = k => { try { return localStorage.getItem('style-' + k); } catch { return null; } };
  const put = (k, v) => { try { localStorage.setItem('style-' + k, v); } catch {} };
  const name = (k, v) => panel.querySelector(`[data-k="${k}"][data-v="${v}"]`)?.getAttribute('aria-label') || panel.querySelector(`[data-k="${k}"][data-v="${v}"] span:last-child`)?.textContent || v;
  const status = t => { $('#style-status').textContent = t; };

  function set(k, v, save = true) {
    root.dataset[attr[k]] = v;
    panel.querySelectorAll(`[data-k="${k}"]`).forEach(b => b.setAttribute('aria-pressed', b.dataset.v === v));
    if (save) put(k, v);
  }
  function pop() { btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop'); }
  for (const k in OPTS) set(k, get(k) || DEFAULT[k], false);

  const open = on => { panel.classList.toggle('on', on); btn.setAttribute('aria-expanded', on); if (on) panel.querySelector('[aria-pressed=true]')?.focus(); };
  btn.addEventListener('click', e => { e.stopPropagation(); open(!panel.classList.contains('on')); });
  panel.addEventListener('click', e => e.stopPropagation());
  addEventListener('click', () => open(false));
  addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('on')) { open(false); btn.focus(); } });

  panel.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => { set(b.dataset.k, b.dataset.v); pop(); status(`${b.dataset.k === 'palette' ? 'Theme' : b.dataset.k[0].toUpperCase() + b.dataset.k.slice(1)}: ${name(b.dataset.k, b.dataset.v)}`); }));

  const pick = a => a[Math.floor(Math.random() * a.length)];
  $('#style-random').addEventListener('click', e => {
    const now = { palette: root.dataset.palette, font: root.dataset.font };
    let p, f; do { p = pick(OPTS.palette); f = pick(OPTS.font); } while (p === now.palette && f === now.font);
    set('palette', p); set('font', f); set('size', pick(['m', 'm', 'l', 's']));
    const r = e.currentTarget; r.classList.remove('roll'); void r.offsetWidth; r.classList.add('roll'); pop();
    status(`Randomized: ${name('palette', p)} theme, ${name('font', f)} font`);
  });
  $('#style-reset').addEventListener('click', () => { for (const k in DEFAULT) set(k, DEFAULT[k]); pop(); status('Back to the default look'); });
})();
