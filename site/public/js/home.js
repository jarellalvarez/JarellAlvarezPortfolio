const $=s=>document.querySelector(s), root=document.documentElement, win=$('#win'), mobile=()=>matchMedia('(max-width:720px)').matches;

document.querySelectorAll('.folder svg').forEach(v=>v.querySelector('.front').insertAdjacentHTML('beforebegin','<rect class="paper" x="10" y="6" width="36" height="24" rx="2"/>'));

/* dock magnification: scale by pointer distance, transform only */
const dock=$('.dock'), items=[...dock.querySelectorAll('a')], calm=matchMedia('(prefers-reduced-motion:reduce)').matches;
if(!calm){dock.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;items.forEach(a=>{const r=a.getBoundingClientRect(),d=Math.abs(e.clientX-(r.left+r.width/2));a.style.transform=`scale(${1+.45*Math.max(0,1-d/110)})`;a.style.transition='transform 60ms linear'})});
dock.addEventListener('pointerleave',()=>items.forEach(a=>{a.style.transition='transform .3s cubic-bezier(.2,.8,.2,1)';a.style.transform=''}))}

/* shapes play every few seconds, and when clicked */
const toys=$('.toys'); function play(){const m=['hop','tumble','pop'][Math.floor(Math.random()*3)];toys.className='toys';void toys.offsetWidth;toys.classList.add(m)}
toys.onclick=play; if(!calm)(function loop(){setTimeout(()=>{play();loop()},6000+Math.random()*2000)})();
/* copy email with visible confirmation; mailto stays as fallback in the real build */
document.querySelectorAll('[data-copy]').forEach(a=>a.addEventListener('click',async e=>{e.preventDefault();const t=document.querySelector('[data-tip]');
  try{await navigator.clipboard.writeText('jarellalvarez@gmail.com');t.textContent='Email copied'}catch{t.textContent='jarellalvarez@gmail.com'}
  t.style.opacity=1;setTimeout(()=>{t.textContent='Contact, copy email';t.style.opacity=''},1800)}));


/* case study: read the real page so the window and the page share one source */
let loaded=null, opener=null;
async function kind(){
  const list=await (await fetch('/testimonials.json')).json(), art=$('#art');
  art.innerHTML='<h2 class="title">Kind words</h2><p class="sub">From people I\'ve worked with, managed, mentored and learned from. Taken from LinkedIn, unedited.</p>'+list.map(p=>`<figure class="kw"><blockquote class="${p.quote.length>320?'clamp':''}"><p>${p.quote}</p></blockquote>${p.quote.length>320?'<button class="rm" aria-expanded="false">Read more</button>':''}<figcaption><strong>${p.name}</strong>${p.title}</figcaption></figure>`).join('');
  art.querySelectorAll('.rm').forEach(b=>b.onclick=()=>{const o=b.previousElementSibling.classList.toggle('open');b.textContent=o?'Show less':'Read more';b.setAttribute('aria-expanded',o)});
  $('#toc').innerHTML=''; $('#win-title').textContent='Kind words'; loaded='kind';
}
async function load(url){
  // the window shows the same built page a direct link opens
  const doc=new DOMParser().parseFromString(await (await fetch(url)).text(),'text/html'), art=$('#art');
  art.innerHTML='<h2 class="title">'+doc.querySelector('.lede h1').textContent+'</h2>'+doc.querySelector('.facts').outerHTML+'<div class="story">'+doc.querySelector('.story').innerHTML+'</div>';
  art.insertAdjacentHTML('beforeend','<div class="next"><a class="btn solid" href="/work/mavi/">Next: MAVI Client Portal</a><a class="btn" href="'+url+'">Open as a page</a></div>');
  const heads=[...art.querySelectorAll('.story h2,.story h3')]; heads.forEach((h,i)=>h.id='s'+i);
  const toc=$('#toc'); toc.innerHTML=heads.map(h=>`<li class="${h.tagName==='H3'?'sub':''}"><a href="#${h.id}">${h.textContent}</a></li>`).join('');
  const links=[...toc.querySelectorAll('a')];
  links.forEach(a=>a.onclick=e=>{e.preventDefault();win.classList.remove('contents');document.getElementById(a.hash.slice(1)).scrollIntoView()});
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;links.forEach(a=>a.removeAttribute('aria-current'));
    const a=links.find(a=>a.hash==='#'+e.target.id);a.setAttribute('aria-current','true');if(win.classList.contains('max'))a.scrollIntoView({block:'nearest'})}),{root:$('#read'),rootMargin:'0px 0px -75% 0px'});
  heads.forEach(h=>io.observe(h));
  $('#win-title').textContent=doc.querySelector('.facts dd')?.textContent||doc.title; loaded=url;
}
let pos={x:0,y:0};
function place(){win.style.setProperty('--x',pos.x+'px');win.style.setProperty('--y',pos.y+'px')}
async function openWin(a){opener=a;const k=a.dataset.open==='kind',want=k?'kind':a.getAttribute('href');if(loaded!==want){k?await kind():await load(want);$('#read').scrollTop=0}
  win.classList.toggle('plain',k);
  if(!win.classList.contains('open')){pos={x:Math.round((innerWidth-win.offsetWidth)/2+40),y:Math.round((innerHeight-win.offsetHeight)/2-10)};place()}
  win.classList.add('open'); if(mobile())win.classList.add('max'); $('#read').focus({preventScroll:true})}
function closeWin(){win.classList.remove('open','max','contents');setMax(false);opener&&opener.focus()}
function setMax(on){const r=$('#read'),ratio=r.scrollTop/Math.max(1,r.scrollHeight-r.clientHeight);win.classList.toggle('max',on);$('#max').textContent=on?'Restore':'Expand';
  requestAnimationFrame(()=>r.scrollTop=ratio*(r.scrollHeight-r.clientHeight))}
document.querySelectorAll('[data-open]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();openWin(a)}));
$('#close').onclick=closeWin; $('#max').onclick=()=>setMax(!win.classList.contains('max')); $('#toc-btn').onclick=()=>win.classList.toggle('contents');
addEventListener('keydown',e=>{if(e.key==='Escape'&&win.classList.contains('open'))closeWin()});

/* drag: 1:1 with the pointer, keeps the grab offset, stays on screen */
const bar=$('#bar'); let grab=null;
bar.addEventListener('pointerdown',e=>{if(e.target.closest('button')||win.classList.contains('max')||mobile())return;bar.setPointerCapture(e.pointerId);grab={dx:e.clientX-pos.x,dy:e.clientY-pos.y}});
bar.addEventListener('pointermove',e=>{if(!grab)return;pos.x=Math.min(innerWidth-80,Math.max(80-win.offsetWidth,e.clientX-grab.dx));pos.y=Math.min(innerHeight-60,Math.max(0,e.clientY-grab.dy));place()});
bar.addEventListener('pointerup',()=>grab=null); bar.addEventListener('dblclick',()=>setMax(!win.classList.contains('max')));
