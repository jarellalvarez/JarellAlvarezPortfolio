// Remembers the page you came from (per tab) and points the Back button at it.
(() => {
  const name = () => location.pathname === '/' ? 'Home' : (document.querySelector('h1')?.textContent || document.title.split(',')[0]).trim();
  let prev = null;
  try { prev = JSON.parse(sessionStorage.getItem('here') || 'null'); } catch {}
  const here = { path: location.pathname, name: name() };
  if (prev && prev.path === here.path) { try { prev = JSON.parse(sessionStorage.getItem('prev') || 'null'); } catch {} }
  else { try { sessionStorage.setItem('prev', JSON.stringify(prev)); sessionStorage.setItem('here', JSON.stringify(here)); } catch {} }
  const link = document.getElementById('back-link'), label = document.getElementById('back-label');
  if (!link) return;
  const target = prev && prev.path !== here.path ? prev : { path: '/', name: 'Home' };
  const short = target.name.length > 40 ? target.name.slice(0, 38) + '…' : target.name;
  link.href = target.path; label.textContent = 'Back to ' + short; link.setAttribute('aria-label', 'Back to ' + target.name);
  link.addEventListener('click', e => {
    if (prev && prev.path === target.path && document.referrer.startsWith(location.origin)) { e.preventDefault(); history.back(); }
  });
})();
