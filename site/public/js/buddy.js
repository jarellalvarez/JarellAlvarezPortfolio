/* Homepage helper: Jarell's own sticky-note drawing, brought to life that answers questions from Jarell's written answers.
   Idle: blinks, eyes follow the pointer, small wiggle now and then. Hover: brows lift. Click: opens Ask Jarell as a window. */
(() => {
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
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

  /* The chat itself. home.js calls this to fill the Ask Jarell tab, so it moves, resizes and tabs like any window. */
  const past = () => { try { return JSON.parse(sessionStorage.getItem('ask-hist') || '[]'); } catch { return []; } };
  const remember = q => { try { sessionStorage.setItem('ask-hist', JSON.stringify([q, ...past().filter(x => x !== q)].slice(0, 8))); } catch {} };
  const mail = q => `<a href="mailto:jarellalvarez@gmail.com?subject=${encodeURIComponent('Question from your portfolio')}&body=${encodeURIComponent(q)}">Email Jarell this question</a>`;
  window.buddyChat = async root => {
    root.classList.add('bchatui');
    root.innerHTML = `<ol class="blog" aria-live="polite" tabindex="0" aria-label="Conversation"></ol>
      <div class="bmenu" role="menu" aria-label="Questions" hidden></div>
      <form class="bform"><input type="text" maxlength="300" placeholder="Type a question" aria-label="Type a question" autocomplete="off" />
        <button type="button" class="bmore" aria-label="Suggested and previous questions" title="Suggested and previous questions" aria-haspopup="true" aria-expanded="false">…</button>
        <button type="submit" aria-label="Send">↑</button></form>`;
    const log = root.querySelector('.blog'), form = root.querySelector('form'), input = form.querySelector('input'), more = root.querySelector('.bmore'), menu = root.querySelector('.bmenu');
    const add = (who, html) => { const li = document.createElement('li'); li.className = who; li.innerHTML = html; log.append(li); log.scrollTop = log.scrollHeight; return li; };
    let data = [];
    const answer = async q => {
      log.querySelector('.starters')?.remove(); closeMenu(); remember(q); add('me', esc(q));
      const hit = window.Ask?.find(q)[0];
      if (hit) add('bot', `<p>${esc(hit.a)}</p>${hit.link ? `<a href="${esc(hit.link)}"${/^https?:/.test(hit.link) ? ' target="_blank" rel="noopener"' : ''}>${hit.link.startsWith('mailto') ? 'Email Jarell' : 'See more'}</a>` : ''}`);
      else {
        const wait = add('bot', '<p class="dots" aria-label="Thinking">…</p>'); let ai = null;
        try { ai = await window.askFallback?.(q); } catch {}
        wait.innerHTML = ai ? `<p>${esc(ai)}</p><small>AI answer, based on Jarell's site. It can be wrong.</small>` : `<p>I don't have a written answer for that yet.</p>${mail(q)}`;
        log.scrollTop = log.scrollHeight;
      }
      act('hop');
    };
    const closeMenu = () => { menu.hidden = true; more.setAttribute('aria-expanded', 'false'); };
    const item = q => `<button type="button" role="menuitem">${esc(q)}</button>`;
    more.onclick = () => {
      if (!menu.hidden) return closeMenu();
      const prev = past(), sug = ['For recruiters', 'Case studies', 'Personal'].flatMap(g => data.filter(x => x.group === g).slice(0, 3)).map(x => x.q).filter(q => !prev.includes(q));
      menu.innerHTML = (prev.length ? `<p>Previously asked</p>${prev.map(item).join('')}` : '') + `<p>Suggested</p>${sug.map(item).join('')}`;
      menu.hidden = false; more.setAttribute('aria-expanded', 'true'); menu.querySelector('button')?.focus();
    };
    menu.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { answer(b.textContent); input.focus(); } });
    menu.addEventListener('keydown', e => { const it = [...menu.querySelectorAll('button')], i = it.indexOf(document.activeElement);
      if (e.key === 'Escape') { e.stopPropagation(); closeMenu(); more.focus(); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); it[(i + (e.key === 'ArrowDown' ? 1 : -1) + it.length) % it.length].focus(); } });
    root.addEventListener('pointerdown', e => { if (!menu.hidden && !e.target.closest('.bmenu,.bmore')) closeMenu(); });
    form.onsubmit = e => { e.preventDefault(); const q = input.value.trim(); if (q) { input.value = ''; answer(q); } };
    add('bot', '<p>Hi! I can answer questions about Jarell\'s work, experience and life outside work. Pick one or type your own.</p>');
    try { data = await window.Ask.load();
      const pick = ['For recruiters', 'Case studies', 'Personal'].flatMap(g => data.filter(x => x.group === g).slice(0, 2));
      const st = add('starters', pick.map(x => `<button type="button">${esc(x.q)}</button>`).join(''));
      st.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { answer(b.textContent); input.focus(); } });
    } catch { add('bot', '<p>Answers did not load. <a href="mailto:jarellalvarez@gmail.com">Email Jarell</a>.</p>'); }
  };
})();
