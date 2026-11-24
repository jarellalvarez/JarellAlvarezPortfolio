/* Phones: the dock floats centred beside the helper at the top of a page, and becomes a full-width bottom bar once the page scrolls. */
(() => {
  const mq = matchMedia('(max-width:720px)'); let on = false;
  const set = v => { if (v === on) return; on = v; document.body.classList.toggle('bar-full', v); };
  const check = () => set(mq.matches && scrollY > (on ? 6 : 28));
  addEventListener('scroll', check, { passive: true }); mq.addEventListener('change', check); check();
  document.querySelector('.dock-ask')?.addEventListener('click', () => document.querySelector('.ask-mini')?.click());
})();
