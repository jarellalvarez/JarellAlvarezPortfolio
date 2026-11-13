// Shared behavior for every page except the homepage desktop.
// Read more toggles
document.querySelectorAll('.rm').forEach(b => b.onclick = () => {
  const open = b.previousElementSibling.classList.toggle('open');
  b.textContent = open ? 'Show less' : 'Read more';
  b.setAttribute('aria-expanded', open);
});
// Email buttons: first click copies and reveals the address, a "Copied" tip shows for 2 seconds
document.querySelectorAll('.mail').forEach(b => {
  const email = b.dataset.email, label = b.querySelector('.label'), tip = b.querySelector('.tip');
  let t;
  b.onclick = async () => {
    let ok = true;
    try { await navigator.clipboard.writeText(email); } catch { ok = false; }
    label.textContent = email; b.classList.add('shown'); b.setAttribute('aria-label', 'Copy ' + email);
    tip.textContent = ok ? 'Copied' : 'Press and hold to copy';
    tip.classList.add('on'); clearTimeout(t); t = setTimeout(() => tip.classList.remove('on'), 2000);
  };
});
