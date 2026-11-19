/* Homepage helper: Jarell's own sticky-note drawing, brought to life that answers questions from Jarell's written answers.
   Idle: blinks, eyes follow the pointer, small wiggle now and then. Hover: brows lift. Click: opens Ask Jarell as a window, or tucks it away when it is already up front. */
(() => {
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const wrap = document.createElement('div'); wrap.className = 'buddy';
  wrap.innerHTML = `
  <p class="bsay" aria-hidden="true">Need a hand?</p>
  <button type="button" class="bbtn" aria-label="Ask Jarell a question" data-open="ask" data-name="Ask Jarell">
    <svg viewBox="0 0 90 100" aria-hidden="true">
      <rect class="note" x="10" y="12" width="70" height="72" rx="4"/>
      <path class="drawn" d="M13 16h64v66H13z" transform="translate(0 0)"/>
      <g class="brows"><path d="M24 30c5-4 11-4 15-1"/><path d="M50 29c5-3 11-2 15 2"/></g>
      <g class="eyes"><ellipse cx="32" cy="44" rx="8" ry="9"/><ellipse cx="58" cy="44" rx="8" ry="9"/>
        <circle class="pupil" cx="32" cy="45" r="3.6"/><circle class="pupil" cx="58" cy="45" r="3.6"/></g>
      <path class="mouth" d="M38 58c4 3 10 3 14 0"/>
    </svg>
  </button>`;
  document.body.append(wrap);
  const btn = wrap.querySelector('.bbtn'), say = wrap.querySelector('.bsay');
  // the note itself is the outline from Stick Note.svg (its scribble lines are left out: the face goes there)
  fetch('/illustrations/stick-note.svg').then(r => r.ok ? r.text() : Promise.reject()).then(t => {
    const d = new DOMParser().parseFromString(t, 'image/svg+xml').querySelector('path')?.getAttribute('d'), vb = (t.match(/viewBox="([^"]+)"/) || [])[1];
    if (!d || !vb) return; const [x, y, w, h] = vb.split(' ').map(Number), k = Math.min(72 / w, 74 / h), p = wrap.querySelector('path.drawn');
    p.setAttribute('d', d); p.setAttribute('transform', `translate(${(90 - w * k) / 2} ${(100 - h * k) / 2 - 1}) scale(${k}) translate(${-x} ${-y})`);
  }).catch(() => {});
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
  btn.addEventListener('click', () => { say.classList.remove('on'); act('hop'); window.toggleWin(btn); });

  window.buddyHop = () => act('hop');
})();
