/* Ask Jarell chat. One renderer used by the homepage window (home.js) and the panel under the top-bar helper (chatpanel.js).
   Answers come from the written answers; with no match, the AI fallback (window.askFallback) is tried, then the email path. */
(() => {
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const past = () => { try { return JSON.parse(sessionStorage.getItem('ask-hist') || '[]'); } catch { return []; } };
  const remember = q => { try { sessionStorage.setItem('ask-hist', JSON.stringify([q, ...past().filter(x => x !== q)].slice(0, 8))); } catch {} };
  const mail = q => `<a href="mailto:jarellalvarez@gmail.com?subject=${encodeURIComponent('Question from your portfolio')}&body=${encodeURIComponent(q)}">Email Jarell this question</a>`;
  window.buddyChat = async root => {
    root.classList.add('bchatui');
    root.innerHTML = `<ol class="blog" aria-live="polite" tabindex="0" aria-label="Conversation"></ol>
      <div class="bmenu" role="menu" aria-label="All questions" hidden></div>
      <div class="bpills" aria-label="Suggested questions"></div>
      <form class="bform"><input type="text" maxlength="300" placeholder="Type a question" aria-label="Type a question" autocomplete="off" />
        <button type="submit" aria-label="Send">↑</button></form>`;
    const log = root.querySelector('.blog'), form = root.querySelector('form'), input = form.querySelector('input'), menu = root.querySelector('.bmenu'), pills = root.querySelector('.bpills');
    const add = (who, html) => { const li = document.createElement('li'); li.className = who; li.innerHTML = html; log.append(li); log.scrollTop = log.scrollHeight; return li; };
    let data = [], lastGroup = null;
    const asked = () => new Set(past());
    // three suggestions you have not asked yet, leaning toward the topic just discussed, plus a "…" pill for the full list
    const renderPills = () => {
      const seen = asked(), pool = data.filter(x => !seen.has(x.q));
      const same = pool.filter(x => x.group === lastGroup), rest = pool.filter(x => x.group !== lastGroup);
      const pick = [...same.slice(0, 2), ...rest.slice(0, 3)].slice(0, 3);
      pills.innerHTML = pick.map(x => `<button type="button" class="bpill">${esc(x.q)}</button>`).join('') + `<button type="button" class="bpill bmore" aria-label="More questions" title="More questions" aria-haspopup="true" aria-expanded="false">…</button>`;
    };
    const closeMenu = () => { menu.hidden = true; pills.querySelector('.bmore')?.setAttribute('aria-expanded', 'false'); };
    const answer = async q => {
      closeMenu(); remember(q); add('me', esc(q));
      const hit = window.Ask?.find(q)[0];
      if (hit) { lastGroup = hit.group; add('bot', `<p>${esc(hit.a)}</p>${hit.link ? `<a href="${esc(hit.link)}"${/^https?:/.test(hit.link) ? ' target="_blank" rel="noopener"' : ''}>${hit.link.startsWith('mailto') ? 'Email Jarell' : 'See more'}</a>` : ''}`); }
      else {
        const wait = add('bot', '<p class="dots" aria-label="Thinking">…</p>'); let ai = null;
        try { ai = await window.askFallback?.(q); } catch {}
        wait.innerHTML = ai ? `<p>${esc(ai)}</p><small>AI answer, based on Jarell's site. It can be wrong.</small>` : `<p>I don't have a written answer for that yet.</p>${mail(q)}`;
        log.scrollTop = log.scrollHeight;
      }
      renderPills(); window.buddyHop?.();
    };
    const openMenu = () => {
      const prev = past(), seen = new Set(prev), sug = ['For recruiters', 'Case studies', 'Personal'].flatMap(g => data.filter(x => x.group === g && !seen.has(x.q)).slice(0, 4)).map(x => x.q);
      const item = q => `<button type="button" role="menuitem">${esc(q)}</button>`;
      menu.innerHTML = (prev.length ? `<p>Previously asked</p>${prev.map(item).join('')}` : '') + (sug.length ? `<p>Suggested</p>${sug.map(item).join('')}` : '');
      menu.hidden = false; pills.querySelector('.bmore')?.setAttribute('aria-expanded', 'true'); menu.querySelector('button')?.focus();
    };
    pills.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.classList.contains('bmore')) return menu.hidden ? openMenu() : closeMenu(); answer(b.textContent); input.focus(); });
    menu.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { answer(b.textContent); input.focus(); } });
    menu.addEventListener('keydown', e => { const it = [...menu.querySelectorAll('button')], i = it.indexOf(document.activeElement);
      if (e.key === 'Escape') { e.stopPropagation(); closeMenu(); pills.querySelector('.bmore')?.focus(); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); it[(i + (e.key === 'ArrowDown' ? 1 : -1) + it.length) % it.length].focus(); } });
    root.addEventListener('pointerdown', e => { if (!menu.hidden && !e.target.closest('.bmenu,.bmore')) closeMenu(); });
    form.onsubmit = e => { e.preventDefault(); const q = input.value.trim(); if (q) { input.value = ''; answer(q); } };
    add('bot', '<p>Hi! I can answer questions about Jarell\'s work, experience and life outside work. Pick a question below or type your own.</p>');
    try { data = await window.Ask.load(); renderPills(); }
    catch { add('bot', '<p>Answers did not load. <a href="mailto:jarellalvarez@gmail.com">Email Jarell</a>.</p>'); }
  };
})();
