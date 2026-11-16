/* Homepage helper: an original hand-doodled sticky note that answers questions from Jarell's written answers.
   Idle: blinks, eyes follow the pointer, small wiggle now and then. Hover: brows lift. Click: opens a chat. */
(() => {
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const wrap = document.createElement('div'); wrap.className = 'buddy';
  wrap.innerHTML = `
  <section class="bchat" id="bchat" role="dialog" aria-label="Ask Jarell" hidden>
    <header><strong>Ask Jarell</strong><button type="button" class="bx" aria-label="Close chat">×</button></header>
    <ol class="blog" aria-live="polite"></ol>
    <div class="bchips"></div>
    <form class="bform"><input type="text" placeholder="Type a question" aria-label="Type a question" autocomplete="off" /><button type="submit" aria-label="Send">↑</button></form>
  </section>
  <p class="bsay" aria-hidden="true">Need a hand?</p>
  <button type="button" class="bbtn" aria-label="Ask Jarell a question" aria-expanded="false" aria-controls="bchat">
    <svg viewBox="0 0 90 100" aria-hidden="true">
      <path class="note" d="M14 18c20-3 42-4 62-1 2 18 3 40 1 62-8 3-18 5-28 4-12 0-24-1-35-3-2-20-3-41 0-62z"/>
      <path class="fold" d="M62 81c6-1 11-3 15-6-4 1-9 1-14 0z"/>
      <path class="line" d="M24 66c10 2 22 2 34 0M27 74c8 1 16 1 22 0"/>
      <g class="brows"><path d="M24 30c5-4 11-4 15-1"/><path d="M50 29c5-3 11-2 15 2"/></g>
      <g class="eyes"><ellipse cx="32" cy="44" rx="8" ry="9"/><ellipse cx="58" cy="44" rx="8" ry="9"/>
        <circle class="pupil" cx="32" cy="45" r="3.6"/><circle class="pupil" cx="58" cy="45" r="3.6"/></g>
      <path class="mouth" d="M38 58c4 3 10 3 14 0"/>
    </svg>
  </button>`;
  document.body.append(wrap);
  const btn = wrap.querySelector('.bbtn'), chat = wrap.querySelector('.bchat'), log = wrap.querySelector('.blog'), chips = wrap.querySelector('.bchips'), form = wrap.querySelector('form'), input = form.querySelector('input'), say = wrap.querySelector('.bsay');
  const pupils = [...wrap.querySelectorAll('.pupil')], base = pupils.map(p => [+p.getAttribute('cx'), +p.getAttribute('cy')]);
  const act = c => { if (calm) return; btn.classList.remove('wiggle', 'tap', 'hop'); void btn.offsetWidth; btn.classList.add(c); };
  // eyes follow the pointer
  if (!calm) addEventListener('pointermove', e => { const r = btn.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1;
    pupils.forEach((p, i) => { p.setAttribute('cx', base[i][0] + dx / d * 3.2); p.setAttribute('cy', base[i][1] + dy / d * 3.2); }); });
  // blink, and an idle move every so often
  if (!calm) { (function blink() { setTimeout(() => { btn.classList.add('blink'); setTimeout(() => btn.classList.remove('blink'), 140); blink(); }, 2500 + Math.random() * 3500); })();
    (function idle() { setTimeout(() => { if (chat.hidden) act(Math.random() < .5 ? 'wiggle' : 'tap'); idle(); }, 9000 + Math.random() * 6000); })(); }
  // say hi once, a few seconds in
  setTimeout(() => { if (chat.hidden) { say.classList.add('on'); act('hop'); setTimeout(() => say.classList.remove('on'), 5000); } }, calm ? 0 : 4000);
  const add = (who, html) => { const li = document.createElement('li'); li.className = who; li.innerHTML = html; log.append(li); log.scrollTop = log.scrollHeight; };
  const answer = q => {
    add('me', esc(q)); const hit = window.Ask?.find(q)[0];
    if (hit) add('bot', `<p>${esc(hit.a)}</p>${hit.link ? `<a href="${esc(hit.link)}"${/^https?:/.test(hit.link) ? ' target="_blank" rel="noopener"' : ''}>${hit.link.startsWith('mailto') ? 'Email Jarell' : 'See more'}</a>` : ''}`);
    else add('bot', `<p>I don't have a written answer for that yet.</p><a href="mailto:jarellalvarez@gmail.com?subject=${encodeURIComponent('Question from your portfolio')}&body=${encodeURIComponent(q)}">Email Jarell this question</a>`);
    act('hop');
  };
  async function open() {
    chat.hidden = false; btn.setAttribute('aria-expanded', 'true'); say.classList.remove('on'); act('hop');
    if (!log.children.length) {
      add('bot', '<p>Hi! I can answer questions about Jarell\'s work, experience and life outside work. Pick one or type your own.</p>');
      try { const d = await window.Ask.load(); const pick = ['For recruiters', 'Case studies', 'Personal'].flatMap(g => d.filter(x => x.group === g).slice(0, 2));
        chips.innerHTML = pick.map(x => `<button type="button">${esc(x.q)}</button>`).join(''); } catch { add('bot', '<p>Answers did not load. <a href="mailto:jarellalvarez@gmail.com">Email Jarell</a>.</p>'); }
    }
    input.focus();
  }
  const close = () => { chat.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.focus(); };
  btn.onclick = () => chat.hidden ? open() : close();
  btn.addEventListener('pointerenter', () => btn.classList.add('curious')); btn.addEventListener('pointerleave', () => btn.classList.remove('curious'));
  wrap.querySelector('.bx').onclick = close;
  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (b) answer(b.textContent); });
  form.onsubmit = e => { e.preventDefault(); const q = input.value.trim(); if (q) { answer(q); input.value = ''; } };
  chat.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } });
})();
