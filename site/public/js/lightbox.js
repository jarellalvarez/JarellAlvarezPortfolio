/* Image lightbox. Any picture inside a case study, the About page or a homepage window opens full screen at its largest version.
   Close: X button, Esc or a click on the dark area. Zoom: one click or tap on the picture (again to zoom out), buttons, + / - / 0, wheel, pinch. Pan by dragging.
   Focus is kept inside the viewer and goes back to the picture that opened it. */
(() => {
  const SEL = '.story img, figure img, .duo img, .hero-photo, .win .read img';
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  let box, stage, img, cap, opener = null, s = 1, tx = 0, ty = 0, ct = 0, downBackdrop = false, downImg = false; const ptrs = new Map(); let pinch = 0;
  const MAX = 6;

  const captionFor = el => { const f = el.closest('figure'), t = (f && f.querySelector('figcaption')?.textContent) || el.getAttribute('alt') || ''; return t.trim(); };
  const bigSrc = el => el.dataset.full || el.currentSrc || el.src;

  // make every eligible picture reachable by keyboard
  function mark(root) {
    root.querySelectorAll(SEL).forEach(el => { if (el.dataset.lb || el.closest('a,button,.dd,.peek,.cta')) return; el.dataset.lb = '1';
      el.tabIndex = 0; el.setAttribute('role', 'button'); const c = captionFor(el); el.setAttribute('aria-label', 'Enlarge image' + (c ? ': ' + c : '')); });
  }

  function build() {
    box = document.createElement('div'); box.className = 'lb'; box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Image viewer');
    box.innerHTML = '<div class="lb-stage"><img class="lb-img" alt="" draggable="false"></div>' +
      '<div class="lb-bar" role="toolbar" aria-label="Image controls"><button type="button" data-a="out" aria-label="Zoom out">−</button><button type="button" data-a="reset" aria-label="Reset zoom">Fit</button><button type="button" data-a="in" aria-label="Zoom in">+</button></div>' +
      '<button type="button" class="lb-x" data-a="close" aria-label="Close image viewer"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>' +
      '<p class="lb-cap" id="lb-cap"></p>';
    document.body.appendChild(box); stage = box.querySelector('.lb-stage'); img = box.querySelector('.lb-img'); cap = box.querySelector('.lb-cap');
    box.setAttribute('aria-describedby', 'lb-cap');
    box.addEventListener('click', e => { const a = e.target.closest('[data-a]')?.dataset.a; if (a === 'close') close(); else if (a === 'in') zoom(1.4); else if (a === 'out') zoom(1 / 1.4); else if (a === 'reset') reset();
      else if (downBackdrop && !moved) close();
      else if (downImg && !moved) { s > 1.02 ? reset() : zoom(2.5, e.clientX, e.clientY); } }); // one click or tap on the picture: in, and the same again: out
    stage.addEventListener('wheel', e => { e.preventDefault(); zoom(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0018)), e.clientX, e.clientY); }, { passive: false });
    stage.addEventListener('pointerdown', down); stage.addEventListener('pointermove', move); stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
  }

  const apply = () => { img.style.transform = `translate(${tx}px,${ty}px) scale(${s})`; box.classList.toggle('lb-zoomed', s > 1.02); };
  function clamp() { const r = img.getBoundingClientRect(), W = innerWidth, H = innerHeight, w = r.width, h = r.height;
    // r already includes the current transform; keep at least a quarter of the picture on screen
    const dx = Math.max(0, (w - W) / 2 + W * 0.25), dy = Math.max(0, (h - H) / 2 + H * 0.25); if (!dx && !dy) { tx = ty = 0; return; }
    const cx = r.left + w / 2 - W / 2, cy = r.top + h / 2 - H / 2; if (Math.abs(cx) > dx) tx -= cx - Math.sign(cx) * dx; if (Math.abs(cy) > dy) ty -= cy - Math.sign(cy) * dy; }
  function zoom(f, cx, cy) { const n = Math.min(MAX, Math.max(1, s * f)); if (n === s) return; const k = n / s;
    const ox = (cx ?? innerWidth / 2) - innerWidth / 2, oy = (cy ?? innerHeight / 2) - innerHeight / 2;
    tx = ox - (ox - tx) * k; ty = oy - (oy - ty) * k; s = n; if (s === 1) { tx = ty = 0; } apply(); if (s > 1) { clamp(); apply(); } }
  function reset() { s = 1; tx = ty = 0; apply(); }

  let moved = false, sx = 0, sy = 0, stx = 0, sty = 0;
  function down(e) { downBackdrop = e.target === stage || e.target === box; downImg = e.target === img; stage.setPointerCapture?.(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]); moved = false;
    if (ptrs.size === 1) { sx = e.clientX; sy = e.clientY; stx = tx; sty = ty;  }
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); } }
  function move(e) { if (!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, [e.clientX, e.clientY]);
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch) zoom(d / pinch, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); pinch = d; moved = true; return; }
    if (ptrs.size === 1) { if (Math.hypot(e.clientX - sx, e.clientY - sy) > 4) moved = true; if (s > 1) { tx = stx + e.clientX - sx; ty = sty + e.clientY - sy; clamp(); apply(); } } }
  function up(e) { ptrs.delete(e.pointerId); pinch = 0; if (ptrs.size === 1) { const [p] = [...ptrs.values()]; sx = p[0]; sy = p[1]; stx = tx; sty = ty; } setTimeout(() => { moved = false; }, 0); }

  function open(el) {
    if (!box) build(); clearTimeout(ct); opener = el; reset();
    const thumb = el.currentSrc || el.src, full = bigSrc(el);
    img.alt = el.getAttribute('alt') || ''; img.src = thumb; img.dataset.want = full; box.classList.add('lb-loading');
    if (full !== thumb) { const pre = new Image(); pre.onload = () => { if (img.dataset.want === full) { img.src = full; box.classList.remove('lb-loading'); } }; pre.onerror = () => box.classList.remove('lb-loading'); pre.src = full; } else box.classList.remove('lb-loading');
    cap.textContent = captionFor(el) || 'Description coming soon'; cap.classList.toggle('lb-nocap', !captionFor(el));
    box.hidden = false; document.documentElement.classList.add('lb-open'); requestAnimationFrame(() => { box.classList.add('lb-on'); box.querySelector('.lb-x').focus(); });
  }
  function close() { if (!box || box.hidden) return; box.classList.remove('lb-on'); const done = () => { box.hidden = true; img.removeAttribute('src'); document.documentElement.classList.remove('lb-open'); (opener && document.contains(opener) ? opener : document.body).focus?.(); opener = null; };
    clearTimeout(ct); calm ? done() : (ct = setTimeout(done, 160)); }

  document.addEventListener('click', e => { const el = e.target.closest?.(SEL); if (el && el.dataset.lb) { e.preventDefault(); open(el); } });
  document.addEventListener('keydown', e => {
    if (box && !box.hidden) {
      e.stopPropagation(); // nothing behind the viewer (search, chat shortcuts) may react while it is open
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoom(1.4); } else if (e.key === '-' || e.key === '_') { e.preventDefault(); zoom(1 / 1.4); } else if (e.key === '0') { e.preventDefault(); reset(); }
      else if (s > 1 && e.key.startsWith('Arrow')) { e.preventDefault(); const k = 60; if (e.key === 'ArrowLeft') tx += k; if (e.key === 'ArrowRight') tx -= k; if (e.key === 'ArrowUp') ty += k; if (e.key === 'ArrowDown') ty -= k; clamp(); apply(); }
      else if (e.key === 'Tab') { const f = [...box.querySelectorAll('button')].filter(b => !b.disabled); const i = f.indexOf(document.activeElement); e.preventDefault(); f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus(); }
      return; }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.dataset?.lb) { e.preventDefault(); open(e.target); }
  }, true);

  mark(document);
  // pictures that appear later: unlocked case-study sections, homepage windows
  let queued = 0; new MutationObserver(() => { if (!queued) queued = requestAnimationFrame(() => { queued = 0; mark(document); }); }).observe(document.body, { childList: true, subtree: true });
})();
