/* Ask Jarell: search over written answers. No outside service, no key, no tracking.
   Opens from any [data-ask] button, Cmd/Ctrl+K or "/". Unanswered questions offer an email instead.
   AI-ready: if a site adds window.askFallback(question) later, it is used when nothing matches. */
(() => {
  let data = null, dlg, input, list, idx = -1;
  const words = t => (t.toLowerCase().match(/[a-z0-9+]+/g) || []).map(w => w.replace(/(ing|ed|es|s)$/, '')).filter(w => w.length > 1);
  const STOP = new Set(['work', 'job', 'what', 'do', 'you', 'your', 'the', 'a', 'an', 'is', 'are', 'how', 'i', 'me', 'can', 'did', 'have', 'of', 'to', 'in', 'on', 'at', 'for', 'about', 'tell', 'and', 'with', 'my', 'it', 'any']);
  const esc = t => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function score(item, q) {
    const qs = words(q).filter(w => !STOP.has(w)); if (!qs.length) return 0;
    const head = words(item.q + ' ' + item.tags), body = words(item.a);
    let s = 0; for (const w of qs) { if (head.some(h => h === w)) s += 3; else if (head.some(h => h.startsWith(w) || w.startsWith(h) && h.length > 3)) s += 2; else if (body.includes(w)) s += 1; }
    return s / qs.length;
  }
  const card = (it, i) => `<li><a class="ask-hit" id="ask-${i}" role="option" href="${esc(it.link || '#')}"${/^https?:/.test(it.link) ? ' target="_blank" rel="noopener"' : ''}><strong>${esc(it.q)}</strong><span>${esc(it.a)}</span></a></li>`;
  function render() {
    const q = input.value.trim(); idx = -1; input.removeAttribute('aria-activedescendant');
    if (!data) { list.innerHTML = '<li class="ask-note">Loading…</li>'; return; }
    if (!q) {
      const groups = [...new Set(data.map(d => d.group))];
      list.innerHTML = groups.map(g => `<li class="ask-group">${esc(g)}</li>` + data.map((d, i) => [d, i]).filter(([d]) => d.group === g).slice(0, 4)
        .map(([d, i]) => `<li><button type="button" class="ask-sug" data-i="${i}">${esc(d.q)}</button></li>`).join('')).join('');
      return;
    }
    const hits = data.map(d => [d, score(d, q)]).filter(([, s]) => s >= 1).sort((a, b) => b[1] - a[1]).slice(0, 4);
    list.innerHTML = hits.length ? hits.map(([d], i) => card(d, i)).join('')
      : `<li class="ask-note"><p>I don't have a written answer for that yet.</p><a class="btn solid" href="mailto:jarellalvarez@gmail.com?subject=${encodeURIComponent('Question from your portfolio')}&body=${encodeURIComponent(q)}">Email Jarell this question</a></li>`;
    dlg.querySelector('.ask-live').textContent = hits.length ? hits.length + ' answers' : 'No answer found';
  }
  function build() {
    dlg = document.createElement('dialog'); dlg.className = 'ask'; dlg.setAttribute('aria-labelledby', 'ask-h');
    dlg.innerHTML = `<form method="dialog" class="ask-top"><h2 id="ask-h" class="sr">Ask Jarell</h2>
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>
      <input type="search" placeholder="Ask about my work, experience or me" aria-label="Ask Jarell a question" role="combobox" aria-expanded="true" aria-controls="ask-list" autocomplete="off" />
      <button class="ask-x" value="close" aria-label="Close">Esc</button></form>
      <ul id="ask-list" role="listbox" aria-label="Answers"></ul><p class="ask-live sr" aria-live="polite"></p>`;
    document.body.append(dlg); input = dlg.querySelector('input'); list = dlg.querySelector('ul');
    input.addEventListener('input', render);
    list.addEventListener('click', e => { const b = e.target.closest('.ask-sug'); if (b) { input.value = data[b.dataset.i].q; render(); list.querySelector('a')?.focus(); } });
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); dlg.close(); return; }
      const hits = [...list.querySelectorAll('.ask-hit, .ask-sug')]; if (!hits.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); idx = (idx + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length;
        hits.forEach((h, i) => h.classList.toggle('on', i === idx)); hits[idx].scrollIntoView({ block: 'nearest' }); if (hits[idx].id) input.setAttribute('aria-activedescendant', hits[idx].id); }
      if (e.key === 'Enter' && idx >= 0) { e.preventDefault(); hits[idx].click(); }
    });
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  }
  async function open() {
    if (!dlg) build();
    if (!dlg.open) dlg.showModal(); input.value = ''; render(); input.focus();
    if (!data) try { data = (await (await fetch('/ask.json')).json()).items; render(); } catch { list.innerHTML = '<li class="ask-note">Search did not load. <a href="mailto:jarellalvarez@gmail.com">Email Jarell</a>.</li>'; }
  }
  // shared with the homepage helper's chat
  window.Ask = { load: async () => data || (data = (await (await fetch('/ask.json')).json()).items), find: q => (data || []).map(d => [d, score(d, q)]).filter(([, s]) => s >= 1).sort((a, b) => b[1] - a[1]).map(([d]) => d) };
  document.addEventListener('click', e => { const t = e.target.closest('[data-ask]'); if (t) { e.preventDefault(); open(); } });
  addEventListener('keydown', e => {
    if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !document.activeElement.isContentEditable)) { e.preventDefault(); open(); }
  });
})();
