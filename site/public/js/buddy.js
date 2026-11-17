/* Homepage helper: Jarell's own sticky-note drawing, brought to life that answers questions from Jarell's written answers.
   Idle: blinks, eyes follow the pointer, small wiggle now and then. Hover: brows lift. Click: opens Ask Jarell as a window. */
(() => {
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const wrap = document.createElement('div'); wrap.className = 'buddy';
  wrap.innerHTML = `
  <p class="bsay" aria-hidden="true">Need a hand?</p>
  <button type="button" class="bbtn" aria-label="Ask Jarell a question" data-open="ask" data-name="Ask Jarell">
    <svg viewBox="0 0 90 100" aria-hidden="true">
      <rect class="note" x="10" y="12" width="70" height="72" rx="4"/>
      <image class="drawn" href="/doodles/note.svg" x="2" y="4" width="86" height="88" preserveAspectRatio="none"/>
      <rect class="note cover" x="22" y="17" width="48" height="62" rx="2"/>
      <g class="brows"><path d="M24 30c5-4 11-4 15-1"/><path d="M50 29c5-3 11-2 15 2"/></g>
      <g class="eyes"><ellipse cx="32" cy="44" rx="8" ry="9"/><ellipse cx="58" cy="44" rx="8" ry="9"/>
        <circle class="pupil" cx="32" cy="45" r="3.6"/><circle class="pupil" cx="58" cy="45" r="3.6"/></g>
      <path class="mouth" d="M38 58c4 3 10 3 14 0"/>
    </svg>
  </button>`;
  document.body.append(wrap);
  const btn = wrap.querySelector('.bbtn'), say = wrap.querySelector('.bsay');
  const open = () => !!document.querySelector('.bchatui');
  const pupils = [...wrap.querySelectorAll('.pupil')], base = pupils.map(p => [+p.getAttribute('cx'), +p.getAttribute('cy')]);
  const act = c => { if (calm) return; btn.classList.remove('wiggle', 'tap', 'hop'); void btn.offsetWidth; btn.classList.add(c); };
  // eyes follow the pointer
  if (!calm) addEventListener('pointermove', e => { const r = btn.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1;
    pupils.forEach((p, i) => { p.setAttribute('cx', base[i][0] + dx / d * 3.2); p.setAttribute('cy', base[i][1] + dy / d * 3.2); }); });
  // blink, and an idle move every so often
  if (!calm) { (function blink() { setTimeout(() => { btn.classList.add('blink'); setTimeout(() => btn.classList.remove('blink'), 140); blink(); }, 2500 + Math.random() * 3500); })();
    (function idle() { setTimeout(() => { if (!open()) act(Math.random() < .5 ? 'wiggle' : 'tap'); idle(); }, 9000 + Math.random() * 6000); })(); }
  // say hi once, a few seconds in
  setTimeout(() => { if (!open()) { say.classList.add('on'); act('hop'); setTimeout(() => say.classList.remove('on'), 5000); } }, calm ? 0 : 4000);
  btn.addEventListener('pointerenter', () => btn.classList.add('curious')); btn.addEventListener('pointerleave', () => btn.classList.remove('curious'));
  btn.addEventListener('click', () => { say.classList.remove('on'); act('hop'); window.openWin(btn); });

  window.buddyHop = () => act('hop');
})();
