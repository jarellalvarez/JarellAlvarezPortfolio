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
      <g class="brows"><path class="bl" d="M24 30c5-4 11-4 15-1"/><path class="br" d="M50 29c5-3 11-2 15 2"/></g>
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
  // speech bubbles: it opens with what it is for, then moves through a few topics, with a long quiet gap between each, two rounds at most.
  // It never talks while the chat is open, while the tour plays, or in a background tab, and stops for good once someone uses it.
  const LINES = ['I can answer any questions here', 'Curious about my work?', 'Ask me about my case studies', 'Or what I do off screen'];
  let li = 0, rounds = 0, quiet = false, t = 0;
  const canSay = () => !quiet && !open() && !document.hidden && !document.body.classList.contains('j-on');
  const hush = () => { quiet = true; clearTimeout(t); say.classList.remove('on'); };
  function next() {
    clearTimeout(t); if (quiet) return;
    if (!canSay()) { t = setTimeout(next, 4000); return; }
    show(LINES[li]); act('hop');
    t = setTimeout(() => { say.classList.remove('on'); cur = ''; li++; if (li >= LINES.length) { li = 0; rounds++; } if (calm || rounds >= 2) { quiet = true; return; } t = setTimeout(next, 8000); }, 5000);
  }
  // while the scroll tour plays, the helper always shows the line for the stop you are on (it stays until the next stop, and comes back when you scroll up)
  const TOUR = { 1: 'This is MAVI, a client portal I led from brief to build.', 2: 'Copperleaf: research for an enterprise tool, shipped as a guide.', 3: 'UI Avenue, a Shopify analytics app I helped start.', 4: 'A few more places: about me, community, photos and kind words.', 5: "That's the tour. Ask me anything below." };
  let typeT = 0, cur = '';
  const show = (m, mood = 'happy') => {
    if (cur === m && say.classList.contains('on')) return; cur = m; clearInterval(typeT);
    say.classList.add('on'); say.classList.remove('pop'); void say.offsetWidth; if (!calm) say.classList.add('pop');
    if (calm) { say.textContent = m; return; }
    say.textContent = ''; if (window.Talk) { window.Talk.say(m, n => { say.textContent = m.slice(0, n); }, null, { mood }); return; }
    let n = 0; typeT = setInterval(() => { say.textContent = m.slice(0, n += 2); if (n >= m.length) { say.textContent = m; clearInterval(typeT); } }, 12);
  };
  document.addEventListener('journey:stop', e => {
    const m = TOUR[e.detail.i];
    if (!m) { if (cur) { cur = ''; clearInterval(typeT); say.classList.remove('on'); } if (!quiet) { clearTimeout(t); t = setTimeout(next, 8000); } return; }  // back on the home screen: the idle lines take over
    if (open()) { cur = ''; say.classList.remove('on'); return; } clearTimeout(t); show(m);
  });
  t = setTimeout(next, calm ? 600 : 3500);
  addEventListener('beforeunload', hush);
  btn.addEventListener('click', () => { hush(); act('hop'); window.toggleWin(btn); });

  // the face can say a line on its own (used when the visitor looks like leaving)
  let sayT = 0; window.buddySay = m => { if (open() || document.body.classList.contains('j-on') && false) return; clearTimeout(sayT); show(m, 'sorry'); sayT = setTimeout(() => { say.classList.remove('on'); cur = ''; }, 4200); };
  window.buddyHop = () => act('hop');
})();
