const $=s=>document.querySelector(s), root=document.documentElement, mobile=()=>matchMedia('(max-width:720px)').matches;

document.querySelectorAll('.folder svg').forEach(v=>v.querySelector('.front').insertAdjacentHTML('beforebegin','<rect class="paper" x="10" y="6" width="36" height="24" rx="2"/>'));

/* dock magnification: scale by pointer distance, transform only */
const dock=$('.dock'), items=[...dock.querySelectorAll('a')], calm=matchMedia('(prefers-reduced-motion:reduce)').matches;
if(!calm){dock.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;items.forEach(a=>{const r=a.getBoundingClientRect(),d=Math.abs(e.clientX-(r.left+r.width/2));a.style.transform=`scale(${1+.45*Math.max(0,1-d/110)})`;a.style.transition='transform 60ms linear'})});
dock.addEventListener('pointerleave',()=>items.forEach(a=>{a.style.transition='transform .3s cubic-bezier(.2,.8,.2,1)';a.style.transform=''}))}

/* shapes play every few seconds, and when clicked */
const toys=$('.toys'); function play(){const m=['hop','tumble','pop'][Math.floor(Math.random()*3)];toys.className='toys';void toys.offsetWidth;toys.classList.add(m)}
toys.onclick=play; if(!calm)(function loop(){setTimeout(()=>{play();loop()},6000+Math.random()*2000)})();
/* QA D-03: copy the email, then show the address itself so it can be read and selected */
const copyStatus=$('#copy-status');
document.querySelectorAll('[data-copy]').forEach(a=>a.addEventListener('click',async e=>{e.preventDefault();const t=document.querySelector('[data-tip]'),email='jarellalvarez@gmail.com';let ok=true;
  try{await navigator.clipboard.writeText(email)}catch{ok=false}
  t.textContent=(ok?'Copied: ':'')+email;t.classList.add('copied');copyStatus.textContent=ok?'Email address copied: '+email:email;
  clearTimeout(t._h);t._h=setTimeout(()=>{t.textContent='Contact, copy email';t.classList.remove('copied');copyStatus.textContent=''},3000)}));

/* Windows: one per folder, several can be open at once. Click a window to bring it to the front. */
const tpl=$('#win-tpl'), wins=new Map(); let zTop=20, opened=0;
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function focusWin(w){w.style.zIndex=++zTop;document.querySelectorAll('.win.focused').forEach(x=>x.classList.remove('focused'));w.classList.add('focused')}
function place(w){w.style.transform=`translate(${w._x}px,${w._y}px)`}
function setMax(w,on){const r=w.querySelector('.read'),ratio=r.scrollTop/Math.max(1,r.scrollHeight-r.clientHeight);w.classList.toggle('max',on);
  const b=w.querySelector('.max-btn');b.textContent=on?'Minimize':'Expand';b.setAttribute('aria-label',on?'Minimize window':'Expand window');
  requestAnimationFrame(()=>r.scrollTop=ratio*(r.scrollHeight-r.clientHeight))}
function closeWin(w){wins.delete(w._key);w.remove();w._opener?.focus();const top=[...document.querySelectorAll('.win')].sort((a,b)=>b.style.zIndex-a.style.zIndex)[0];if(top)focusWin(top)}

async function fill(w,key,url){
  const art=w.querySelector('.art'), tocList=w.querySelector('.toc ol'), uid=key.replace(/\W/g,'');
  if(key==='kind'){
    const list=await (await fetch('/testimonials.json')).json();
    art.innerHTML='<h2 class="title">Kind words</h2><p class="sub">From people I\'ve worked with, managed, mentored and learned from. Taken from LinkedIn, unedited.</p>'+list.map(p=>`<figure class="kw"><blockquote class="${p.quote.length>320?'clamp':''}"><p>${esc(p.quote)}</p></blockquote>${p.quote.length>320?'<button class="rm" aria-expanded="false">Read more</button>':''}<figcaption><strong>${esc(p.name)}</strong>${esc(p.title)}</figcaption></figure>`).join('');
    w.classList.add('plain'); return 'Kind words';
  }
  const doc=new DOMParser().parseFromString(await (await fetch(url)).text(),'text/html');
  if(key==='about'){
    const photo=doc.querySelector('.hero-photo');
    art.innerHTML=(photo?photo.outerHTML:'')+'<div class="story about">'+doc.querySelector('.story.about').innerHTML+'</div><div class="next"><a class="btn solid" href="/about/">Open as a page</a></div>';
    w.classList.add('plain'); return 'About';
  }
  art.innerHTML='<h2 class="title">'+doc.querySelector('.lede h1').textContent+'</h2>'+doc.querySelector('.facts').outerHTML+'<div class="story">'+doc.querySelector('.story').innerHTML+'</div>'+
    (doc.querySelector('.gate')
      ?'<div class="next"><p>The rest of this case study is password protected.</p><a class="btn solid" href="'+url+'">Open as a page to unlock</a></div>'
      :'<div class="next"><a class="btn solid" href="'+url+'">Open as a page</a></div>');
  const heads=[...art.querySelectorAll('.story h2,.story h3')]; heads.forEach((h,i)=>h.id=uid+'-s'+i);
  tocList.innerHTML=heads.map(h=>`<li class="${h.tagName==='H3'?'sub':''}"><a href="#${h.id}">${esc(h.textContent)}</a></li>`).join('');
  const links=[...tocList.querySelectorAll('a')];
  links.forEach(a=>a.onclick=e=>{e.preventDefault();w.classList.remove('contents');art.querySelector(a.hash).scrollIntoView()});
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;links.forEach(a=>a.removeAttribute('aria-current'));
    const a=links.find(a=>a.hash==='#'+e.target.id);a?.setAttribute('aria-current','true');if(w.classList.contains('max'))a?.scrollIntoView({block:'nearest'})}),{root:w.querySelector('.read'),rootMargin:'0px 0px -75% 0px'});
  heads.forEach(h=>io.observe(h));
  return doc.querySelector('.facts dd')?.textContent||doc.title;
}

async function openWin(a){
  const kind=a.dataset.open, url=a.getAttribute('href'), key=kind==='kind'||kind==='about'?kind:url;
  if(wins.has(key)){const w=wins.get(key);focusWin(w);w.querySelector('.read').focus({preventScroll:true});return}
  const w=tpl.content.firstElementChild.cloneNode(true);w._key=key;w._opener=a;wins.set(key,w);
  const t=w.querySelector('.wtitle');t.id='wt-'+(++opened);w.setAttribute('aria-labelledby',t.id);t.textContent='Loading';
  document.body.append(w);w.classList.add('open');focusWin(w);
  // open above the folder row so the other folders stay clickable, cascading so several can sit side by side
  const step=(opened-1)%6, row=document.querySelector('.folders').getBoundingClientRect().top;
  if(!mobile()){w.style.width=Math.min(900,innerWidth*.62)+'px';w.style.height=Math.max(320,Math.min(620,row-96-step*28))+'px'}
  const W=w.offsetWidth,H=w.offsetHeight;
  w._x=Math.max(8,Math.min(innerWidth-W-8,(innerWidth-W)/2-150+step*60));w._y=Math.max(8,Math.min(innerHeight-H-8,72+step*28));place(w);
  if(mobile())w.classList.add('max');
  wire(w);
  try{t.textContent=await fill(w,key,url)}catch{t.textContent='Could not load';w.querySelector('.art').innerHTML='<p>This did not load. <a href="'+url+'">Open it as a page</a>.</p>'}
  w.querySelectorAll('.rm').forEach(b=>b.onclick=()=>{const o=b.previousElementSibling.classList.toggle('open');b.textContent=o?'Show less':'Read more';b.setAttribute('aria-expanded',o)});
  w.querySelector('.read').focus({preventScroll:true});
}

function wire(w){
  w.addEventListener('pointerdown',()=>focusWin(w),true);
  w.querySelector('.close-btn').onclick=()=>closeWin(w);
  w.querySelector('.max-btn').onclick=()=>setMax(w,!w.classList.contains('max'));
  w.querySelector('.toc-btn').onclick=()=>w.classList.toggle('contents');
  const bar=w.querySelector('.bar');let grab=null;
  bar.addEventListener('pointerdown',e=>{if(e.target.closest('button')||w.classList.contains('max')||mobile())return;bar.setPointerCapture(e.pointerId);grab={dx:e.clientX-w._x,dy:e.clientY-w._y}});
  bar.addEventListener('pointermove',e=>{if(!grab)return;w._x=Math.min(innerWidth-80,Math.max(80-w.offsetWidth,e.clientX-grab.dx));w._y=Math.min(innerHeight-60,Math.max(0,e.clientY-grab.dy));place(w)});
  bar.addEventListener('pointerup',()=>grab=null);bar.addEventListener('dblclick',e=>{if(!e.target.closest('button'))setMax(w,!w.classList.contains('max'))});
  w.querySelectorAll('.grip').forEach(g=>g.addEventListener('pointerdown',e=>{
    if(w.classList.contains('max')||mobile())return;e.preventDefault();e.stopPropagation();g.setPointerCapture(e.pointerId);g.classList.add('active');w.classList.add('resizing');
    const r=w.getBoundingClientRect(),sx=e.clientX,sy=e.clientY,left=g.dataset.edge==='left';
    const move=ev=>{const dx=ev.clientX-sx,dy=ev.clientY-sy;
      let nw=left?r.width-dx:r.width+dx;nw=Math.max(420,Math.min(nw,left?r.right:innerWidth-r.left));
      const nh=Math.max(320,Math.min(r.height+dy,innerHeight-r.top));
      w.style.width=nw+'px';w.style.height=nh+'px';if(left){w._x=r.right-nw;place(w)}};
    const up=()=>{g.classList.remove('active');w.classList.remove('resizing');g.removeEventListener('pointermove',move);g.removeEventListener('pointerup',up)};
    g.addEventListener('pointermove',move);g.addEventListener('pointerup',up)}));
}

document.querySelectorAll('.folder[data-open]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();openWin(a)}));
addEventListener('keydown',e=>{if(e.key!=='Escape'||document.querySelector('dialog[open]'))return;const top=[...document.querySelectorAll('.win')].sort((a,b)=>b.style.zIndex-a.style.zIndex)[0];if(top)closeWin(top)});

/* Folders that leave the site ask first */
const leave=$('#leave');
document.querySelectorAll('.folder[target="_blank"]').forEach(a=>a.addEventListener('click',e=>{
  e.preventDefault();$('#leave-p').textContent=`This opens ${a.querySelector('span').textContent.trim()} (${new URL(a.href).host}) in a new tab.`;
  leave.returnValue='';leave.showModal();leave.onclose=()=>{if(leave.returnValue==='go')window.open(a.href,'_blank','noopener')}}));

/* QA H-03: folders can be dragged like desktop icons. Under 5px it's a click, past it a move. Off on touch and phones */
document.querySelectorAll('.folder').forEach(f=>{
  let st=null,moved=false;
  f.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||mobile())return;const m=new DOMMatrix(getComputedStyle(f).transform);st={x:e.clientX,y:e.clientY,tx:m.e,ty:m.f,r:f.getBoundingClientRect()};moved=false});
  f.addEventListener('pointermove',e=>{if(!st)return;const dx=e.clientX-st.x,dy=e.clientY-st.y;
    if(!moved&&Math.hypot(dx,dy)<5)return;
    if(!moved){moved=true;f.setPointerCapture(e.pointerId);f.classList.add('dragging')}
    const cx=Math.max(-st.r.left,Math.min(dx,innerWidth-st.r.right)),cy=Math.max(-st.r.top,Math.min(dy,innerHeight-st.r.bottom));
    f.style.transform=`translate(${st.tx+cx}px,${st.ty+cy}px)`});
  f.addEventListener('pointerup',()=>{st=null;f.classList.remove('dragging')});
  f.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopImmediatePropagation();moved=false}},true);
  f.addEventListener('dragstart',e=>e.preventDefault());
});

/* QA H-04: folders start scattered and snap into the row, once per load */
if(!calm){const fs=[...document.querySelectorAll('.folder')];
  fs.forEach((f,i)=>f.animate([{transform:`translate(${(Math.random()-.5)*innerWidth*.7}px,${(Math.random()-.5)*innerHeight*.6}px) rotate(${(Math.random()-.5)*40}deg)`,opacity:0},{opacity:1,offset:.25},{transform:'none',opacity:1}],
    {duration:620,delay:i*40,easing:'cubic-bezier(.2,1.25,.4,1)',fill:'backwards'}))}
