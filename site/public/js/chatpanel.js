/* Top-bar helper on inner pages: opens the Ask Jarell chat as a small panel that drops down underneath it.
   Draggable by its title bar; Escape or the × closes it. Cmd/Ctrl+K still opens the quick search. */
(() => {
  const btn = document.querySelector('.ask-mini'); if (!btn) return;
  let panel = null;
  const place = () => { if (!panel) return; const r = btn.getBoundingClientRect(), w = panel.offsetWidth;
    panel.style.top = (r.bottom + 8) + 'px'; panel.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.right - w)) + 'px'; };
  async function open() {
    if (!panel) {
      panel = document.createElement('section'); panel.className = 'askpanel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Ask Jarell');
      panel.innerHTML = '<header><strong>Ask Jarell</strong><button type="button" class="apx" aria-label="Close chat">×</button></header><div class="apbody"></div>';
      document.body.append(panel); place();
      panel.querySelector('.apx').onclick = close;
      panel.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } });
      // drag by the title bar
      const bar = panel.querySelector('header');
      bar.addEventListener('pointerdown', e => { if (e.target.closest('button') || matchMedia('(max-width:640px)').matches) return;
        const sx = e.clientX - panel.offsetLeft, sy = e.clientY - panel.offsetTop; bar.setPointerCapture(e.pointerId);
        const mv = ev => { panel.style.left = Math.max(0, Math.min(innerWidth - 80, ev.clientX - sx)) + 'px'; panel.style.top = Math.max(0, Math.min(innerHeight - 60, ev.clientY - sy)) + 'px'; };
        const up = () => { bar.removeEventListener('pointermove', mv); bar.removeEventListener('pointerup', up); };
        bar.addEventListener('pointermove', mv); bar.addEventListener('pointerup', up); });
      addEventListener('resize', place);
      await window.buddyChat(panel.querySelector('.apbody'));
    }
    panel.hidden = false; btn.setAttribute('aria-expanded', 'true'); place(); panel.querySelector('input')?.focus();
  }
  function close() { if (!panel) return; panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
  addEventListener('keydown', e => { if (e.key === 'Escape' && panel && !panel.hidden && !document.querySelector('dialog[open],.style-panel.on')) close(); });
  btn.setAttribute('aria-haspopup', 'dialog'); btn.setAttribute('aria-expanded', 'false');
  btn.addEventListener('click', () => (!panel || panel.hidden) ? open() : close());
  document.addEventListener('pointerdown', e => { if (panel && !panel.hidden && !e.target.closest('.askpanel,.ask-mini') && matchMedia('(max-width:640px)').matches) close(); });
})();
