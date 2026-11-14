// Keeps a per-tab trail of pages so Back always goes one step further back.
(() => {
  const name = () => location.pathname === '/' ? 'Home' : (document.querySelector('h1')?.textContent || document.title.split(',')[0]).trim();
  let trail = [];
  try { trail = JSON.parse(sessionStorage.getItem('trail') || '[]'); } catch {}
  const here = { path: location.pathname, name: name() };
  const last = trail[trail.length - 1], before = trail[trail.length - 2];
  if (last && last.path === here.path) {}                    // reload
  else if (before && before.path === here.path) trail.pop();  // went back
  else trail.push(here);                                      // new page
  trail = trail.slice(-30);
  try { sessionStorage.setItem('trail', JSON.stringify(trail)); } catch {}
  const link = document.getElementById('back-link'), label = document.getElementById('back-label');
  if (!link) return;
  const prev = trail[trail.length - 2];
  const target = prev || { path: '/', name: 'Home' };
  const short = target.name.length > 40 ? target.name.slice(0, 38) + '…' : target.name;
  link.href = target.path; label.textContent = 'Back to ' + short; link.setAttribute('aria-label', 'Back to ' + target.name);
  link.addEventListener('click', e => {
    if (prev && document.referrer.startsWith(location.origin) && new URL(document.referrer).pathname === prev.path) { e.preventDefault(); history.back(); }
  });
})();
