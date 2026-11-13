// Builds the About page from content/about.md, reusing the case-study page styles.
import { readFileSync, writeFileSync } from 'node:fs';
import { marked } from 'marked';
const raw = readFileSync(new URL('../content/about.md', import.meta.url), 'utf8');
const [, fm, md] = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
const photo = fm.match(/photo: (.*)/)[1];
const html = marked.parse(md.replace(/^\[JARELL\].*$/gm, ''));
const tpl = readFileSync(new URL('./os/study.template.html', import.meta.url), 'utf8');
const style = tpl.match(/<style>[\s\S]*?<\/style>/)[0];
const people = readFileSync(new URL('../content/testimonials.md', import.meta.url), 'utf8').split(/^## /m).slice(1).map(b => {
  const [name, pl, title, , , ...q] = b.trim().split('\n');
  return { name, place: pl.replace('place: ', ''), title, quote: q.join(' ').replace(/^> /, '') };
}).filter(p => p.place === 'about');
const said = people.map(p => `<figure class="said"><blockquote class="${p.quote.length > 240 ? 'clamp' : ''}"><p>${p.quote}</p></blockquote>${p.quote.length > 240 ? '<button class="rm" aria-expanded="false">Read more</button>' : ''}<figcaption><strong>${p.name}</strong>${p.title}</figcaption></figure>`).join('');
writeFileSync(new URL('./os/about.html', import.meta.url), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>About Jarell Alvarez</title><link rel="icon" href="../../img/jarell_alvarez_Favicon.svg">
${style}
<style>
.hero{display:block;width:100%;max-height:22rem;object-fit:cover;border-radius:14px;border:1px solid var(--line)}
.about>p:first-child{font-family:var(--display);font-size:clamp(var(--t-2),3.2vw,var(--t-4));line-height:1.2;max-width:28ch;margin:2.5rem 0 1.5rem;text-wrap:balance}
.links{display:flex;flex-wrap:wrap;gap:.6rem;margin:0 0 2.5rem}
.about h2{font-family:var(--sans);font-size:var(--t-1);font-weight:600;letter-spacing:0;line-height:1.25;margin:2.5rem 0 .5rem}
.about>p:nth-child(2){font-weight:600;margin-top:3rem}
.saids{display:grid;gap:1rem;margin-top:4rem}.saids .said{margin:0}
</style></head><body>
<header class="top"><a href="index.html">Jarell Alvarez</a><span class="sp"></span><a class="btn" href="index.html">Back to work</a></header>
<main>
<img class="hero" src="${photo}" alt="Jarell Alvarez">
<div class="story about">${html.replace('</p>', `</p><div class="links"><a class="btn solid" href="../../Jarell%20Alvarez%20-%20Resume.pdf">Resume</a><button class="btn" id="copy" type="button">Copy my email</button><a class="btn" href="https://ca.linkedin.com/in/jarellalvarez">LinkedIn</a></div>`)}</div>
<h2 style="font-family:var(--display);font-weight:400;font-size:var(--t-4);margin-top:5rem">Kind words</h2>
<div class="saids">${said}</div>
<div class="mark" aria-hidden="true"><i></i><i></i><i></i></div>
</main>
<script>
document.querySelectorAll('.rm').forEach(b=>b.onclick=()=>{const o=b.previousElementSibling.classList.toggle('open');b.textContent=o?'Show less':'Read more';b.setAttribute('aria-expanded',o)});
document.querySelector('#copy').onclick=async e=>{const b=e.target,t=b.textContent;try{await navigator.clipboard.writeText('jarellalvarez@gmail.com');b.textContent='Email copied'}catch{b.textContent='jarellalvarez@gmail.com'}setTimeout(()=>b.textContent=t,1800)};
</script></body></html>`);
console.log('built os/about.html with', people.length, 'quotes');
