const $=s=>document.querySelector(s), root=document.documentElement, mobile=()=>matchMedia('(max-width:720px)').matches;

document.querySelectorAll('.folder>svg:not(.obj)').forEach(v=>{v.querySelector('.front').insertAdjacentHTML('beforebegin','<rect class="paper" x="10" y="6" width="36" height="24" rx="2"/>');v.insertAdjacentHTML('beforeend','<g class="clock"><circle cx="28" cy="28" r="7.5"/><path d="M28 24v4.5l3 2"/></g>')});

/* dock magnification: scale by pointer distance, transform only */
const dock=$('.dock'), items=[...dock.querySelectorAll('a')], calm=matchMedia('(prefers-reduced-motion:reduce)').matches;
if(!calm){dock.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;items.forEach(a=>{const r=a.getBoundingClientRect(),d=Math.abs(e.clientX-(r.left+r.width/2));a.style.transform=`scale(${1+.45*Math.max(0,1-d/110)})`;a.style.transition='transform 60ms linear'})});
dock.addEventListener('pointerleave',()=>items.forEach(a=>{a.style.transition='transform .3s cubic-bezier(.2,.8,.2,1)';a.style.transform=''}))}

/* shapes play every few seconds, and when clicked */
const toys=$('.toys'); function play(){const m=['hop','tumble','pop'][Math.floor(Math.random()*3)];toys.className='toys';void toys.offsetWidth;toys.classList.add(m)}
toys.onclick=play; if(!calm)(function loop(){setTimeout(()=>{play();loop()},6000+Math.random()*2000)})();
/* QA D-03: copy the email, then show the address itself so it can be read and selected */
const copyStatus=$('#copy-status');
// the live region and a small toast sit outside the dock, which is hidden on desktop
document.body.appendChild(copyStatus);const toast=document.createElement('div');toast.className='copy-toast';toast.hidden=true;toast.setAttribute('aria-hidden','true');document.body.appendChild(toast);
document.querySelectorAll('[data-copy]').forEach(a=>a.addEventListener('click',async e=>{e.preventDefault();const t=document.querySelector('[data-tip]'),email='jarellalvarez@gmail.com';let ok=true;
  try{await navigator.clipboard.writeText(email)}catch{ok=false}
  const msg=(ok?'Copied: ':'')+email;copyStatus.textContent=ok?'Email address copied: '+email:email;
  if(t&&t.offsetParent){t.textContent=msg;t.classList.add('copied')}else{toast.textContent=msg;toast.hidden=false}
  clearTimeout(t._h);t._h=setTimeout(()=>{t.textContent='Contact, copy email';t.classList.remove('copied');copyStatus.textContent='';toast.hidden=true},3000)}));

/* Folders that leave the site ask first */
const leave=$('#leave');
document.querySelectorAll('.folder[target="_blank"]').forEach(a=>a.addEventListener('click',e=>{
  e.preventDefault();$('#leave-p').textContent=`This opens ${a.querySelector('span').textContent.trim()} (${new URL(a.href).host}) in a new tab.`;
  leave.returnValue='';leave.showModal();leave.onclose=()=>{if(leave.returnValue==='go')window.open(a.href,'_blank','noopener')}}));

/* QA H-03: folders can be dragged like desktop icons. Under 5px it's a click, past it a move. Off on touch and phones */
document.querySelectorAll('.folder').forEach(f=>{
  let st=null,moved=false;
  f.addEventListener('pointercancel',()=>{st=null;moved=false;f.classList.remove('dragging')});
  f.addEventListener('pointerdown',e=>{moved=false;if(e.pointerType!=='mouse'||e.button!==0||mobile()||document.body.classList.contains('j-on')||document.body.classList.contains('j-scrolled'))return;const m=new DOMMatrix(getComputedStyle(f).transform);st={x:e.clientX,y:e.clientY,tx:m.e,ty:m.f,r:f.getBoundingClientRect()};moved=false});
  f.addEventListener('pointermove',e=>{if(!st)return;const dx=e.clientX-st.x,dy=e.clientY-st.y;
    if(!moved&&Math.hypot(dx,dy)<5)return;
    if(!moved){moved=true;f.setPointerCapture(e.pointerId);f.classList.add('dragging')}
    const cx=Math.max(-st.r.left,Math.min(dx,innerWidth-st.r.right)),cy=Math.max(-st.r.top,Math.min(dy,innerHeight-st.r.bottom));
    f.style.transform=`translate(${st.tx+cx}px,${st.ty+cy}px)`});
  f.addEventListener('pointerup',()=>{st=null;f.classList.remove('dragging');if(moved)document.dispatchEvent(new Event('folderdragged'))});
  f.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopImmediatePropagation();moved=false}},true);
  f.addEventListener('dragstart',e=>e.preventDefault());
});

/* QA H-04: folders ease into the row, once per load */
if(!calm){const fs=[...document.querySelectorAll('.folder')];
  // one simple move: each folder eases up into place and fades in, one after another
  fs.forEach((f,i)=>f.animate([{transform:'translateY(14px)',opacity:0},{transform:'none',opacity:1}],
    {duration:mobile()?380:450,delay:650+i*45,easing:'cubic-bezier(.2,1,.3,1)',fill:'backwards'}))}

/* Windows work like browser windows with tabs. A folder opens as a tab in the front window.
   Drag a tab out of the strip and it becomes its own window. Click the desktop and windows tuck away. */
const tpl=$('#win-tpl'), ptpl=$('#pane-tpl'), panes=new Map(); let zTop=20, uid=0;
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const keyOf=a=>{const k=a.dataset.open;return k==='kind'||k==='about'||k==='ask'?k:a.getAttribute('href')};
const nameOf=a=>a.dataset.name||a.querySelector('span').textContent.trim();
const shown=w=>w.isConnected&&!w._min&&!w._closing;
const wins=()=>[...document.querySelectorAll('.win')].filter(shown);
const topWin=()=>wins().sort((a,b)=>b.style.zIndex-a.style.zIndex)[0];
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const BM=0; // px kept free at the bottom right for a host badge (same as --badge-h in tokens.css, currently none)
function focusWin(w){w.style.zIndex=++zTop;document.querySelectorAll('.win.focused').forEach(x=>x.classList.remove('focused'));w.classList.add('focused')}
function place(w){w.style.transform=`translate(${w._x}px,${w._y}px)`}
function setMax(w,on){const r=w._active.querySelector('.read'),ratio=r.scrollTop/Math.max(1,r.scrollHeight-r.clientHeight);w.classList.toggle('max',on);
  const b=w.querySelector('.max-btn');b.setAttribute('aria-label',on?'Exit full size':'Expand window');b.title=on?'Exit full size':'Expand';
  requestAnimationFrame(()=>r.scrollTop=ratio*(r.scrollHeight-r.clientHeight))}
// about a quarter narrower than before, so two windows fit side by side
function size(){const row=document.querySelector('.folders').getBoundingClientRect().top;return{w:Math.min(675,innerWidth*.465),h:Math.max(320,Math.min(620,row-96))}}

function newWin(b,x,y){
  const w=tpl.content.firstElementChild.cloneNode(true);document.body.append(w);w.classList.add('open');
  if(!mobile()){w.style.width=b.w+'px';w.style.height=b.h+'px'}
  w._x=clamp(x,8,innerWidth-w.offsetWidth-8);w._y=clamp(y,8,innerHeight-w.offsetHeight-(mobile()?8:BM));place(w);wire(w);focusWin(w);return w}

function label(p,short,full){p._short=short;p._full=full;p._tab.querySelector('.tl').textContent=short;p._tab.title=full;p._tab.querySelector('.tx').setAttribute('aria-label','Close '+short)}
function attach(w,p,before){p._win=w;w.querySelector('.tabs').insertBefore(p._tab,before||null);w.append(p);activate(p)}
function activate(p){const w=p._win;w._active=p;
  w.querySelectorAll(':scope>.body').forEach(b=>b.hidden=b!==p);
  const tabs=[...w.querySelectorAll('.tab')];
  tabs.forEach(t=>{const on=t===p._tab;t.classList.toggle('on',on);t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1});
  w.classList.toggle('solo',tabs.length<2);w.classList.toggle('plain',!!p._plain);w.classList.remove('contents');
  w.setAttribute('aria-label',p._full||p._short);w.classList.toggle('chatting',p._key==='ask');w.querySelector('.open-page').href=p._page;
  p._tab.scrollIntoView({block:'nearest',inline:'nearest'})}
function closePane(p){const w=p._win,tabs=[...w.querySelectorAll('.tab')];
  if(tabs.length===1)return closeWin(w);
  const i=tabs.indexOf(p._tab);panes.delete(p._key);p._tab.remove();p.remove();
  if(w._active===p){const n=(tabs[i+1]||tabs[i-1])._pane;activate(n);n._tab.focus()}else activate(w._active);
  renderTray()}
function closeWin(w){if(w._closing)return;w._closing=true;const op=w._active?._opener;
  w.querySelectorAll(':scope>.body').forEach(p=>panes.delete(p._key));
  grow(w,op,true).then(()=>w.remove());renderTray();op?.focus();
  setTimeout(()=>{const t=topWin();if(t)focusWin(t)},0)}

function makeTab(p){
  const t=document.createElement('div');t.className='tab';t.setAttribute('role','tab');t.id='tab-'+(++uid);t._pane=p;p._tab=t;
  t.setAttribute('aria-controls',p.id);p.setAttribute('aria-labelledby',t.id);
  t.innerHTML='<span class="tl"></span><button class="tx" type="button" tabindex="-1"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 3.5l5 5M8.5 3.5l-5 5"/></svg></button>';
  t.addEventListener('click',e=>{if(t._dragged)return;if(e.target.closest('.tx'))closePane(p);else{activate(p);focusWin(p._win)}});
  t.addEventListener('auxclick',e=>{if(e.button===1){e.preventDefault();closePane(p)}});
  t.addEventListener('keydown',e=>{const tabs=[...p._win.querySelectorAll('.tab')],i=tabs.indexOf(t);
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const n=tabs[(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];activate(n._pane);n.focus()}
    else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();closePane(p)}});
  t.addEventListener('pointerdown',e=>dragTab(t,e));
  return t}

/* Move a window with the pointer, only after it travels 4px, so a near-miss on a button never moves it */
function dragWin(w,e,el){
  if(w.classList.contains('max')||mobile())return;
  const sx=e.clientX,sy=e.clientY,gx=sx-w._x,gy=sy-w._y;let on=false;el.setPointerCapture(e.pointerId);
  const mv=ev=>{if(!on&&Math.hypot(ev.clientX-sx,ev.clientY-sy)<4)return;on=true;el._dragged=true;w.classList.add('moving');
    w._x=clamp(ev.clientX-gx,80-w.offsetWidth,innerWidth-80);w._y=clamp(ev.clientY-gy,0,innerHeight-60);place(w)};
  const up=()=>{el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);w.classList.remove('moving');setTimeout(()=>el._dragged=false)};
  el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)}

/* Tabs: drag along the strip to reorder, drag out to tear off into a new window. A lone tab moves its window */
function dragTab(t,e){
  if(e.button!==0||e.target.closest('.tx')||mobile())return;
  const p=t._pane,w=p._win,strip=w.querySelector('.tabs');activate(p);focusWin(w);
  if(w.querySelectorAll('.tab').length<2)return dragWin(w,e,t);
  e.preventDefault();const sx=e.clientX,sy=e.clientY;let on=false,ghost=null;t.setPointerCapture(e.pointerId);
  const mv=ev=>{
    if(!on&&Math.hypot(ev.clientX-sx,ev.clientY-sy)<5)return;
    if(!on){on=true;t._dragged=true;t.classList.add('dragging');document.body.classList.add('nosel');getSelection()?.removeAllRanges()}
    const r=strip.getBoundingClientRect(),inside=ev.clientY>r.top-28&&ev.clientY<r.bottom+28&&ev.clientX>r.left-48&&ev.clientX<r.right+48;
    if(inside){
      if(ghost){ghost.remove();ghost=null;t.classList.remove('torn')}
      const sib=[...strip.children].find(o=>{if(o===t)return false;const b=o.getBoundingClientRect();return ev.clientX>b.left&&ev.clientX<b.right});
      if(sib){const b=sib.getBoundingClientRect();strip.insertBefore(t,ev.clientX<b.left+b.width/2?sib:sib.nextSibling)}
    }else{
      if(!ghost){ghost=mini(p);t.classList.add('torn');snapPanel.show(ev.clientX)}
      ghost.style.transform=`translate(${ev.clientX-24}px,${ev.clientY-14}px)`;snapPanel.hover(ev.clientX,ev.clientY)}
    if(inside&&!ghost)snapPanel.hide()};
  const up=ev=>{t.removeEventListener('pointermove',mv);t.removeEventListener('pointerup',up);t.removeEventListener('pointercancel',up);
    t.classList.remove('dragging','torn');document.body.classList.remove('nosel');setTimeout(()=>t._dragged=false);
    const lay=snapPanel.pick(ev.clientX,ev.clientY);snapPanel.hide();
    if(ghost){const g=ghost.getBoundingClientRect();ghost.remove();if(ev.type==='pointerup')tearOff(p,ev.clientX,ev.clientY,g,lay)}};
  t.addEventListener('pointermove',mv);t.addEventListener('pointerup',up);t.addEventListener('pointercancel',up)}

// a very small live copy of the window that follows the pointer
function mini(p){
  const g=document.createElement('div');g.className='ghost';g.setAttribute('aria-hidden','true');
  g.innerHTML='<div class="gbar"><i></i><span></span></div><div class="gbody"></div>';g.querySelector('span').textContent=p._short;
  const art=p.querySelector('.art').cloneNode(true);art.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));g.querySelector('.gbody').append(art);
  document.body.append(g);if(!calm)g.animate([{scale:.3,opacity:0},{scale:1,opacity:1}],{duration:200,easing:'cubic-bezier(.2,1.4,.4,1)'});return g}

function tearOff(p,x,y,g,lay){
  const old=p._win,tabs=[...old.querySelectorAll('.tab')],i=tabs.indexOf(p._tab),b={w:old.offsetWidth,h:old.offsetHeight};
  p._tab.remove();p.remove();activate((tabs[i+1]||tabs[i-1])._pane);
  const w=newWin(b,x-48,y-20);attach(w,p);focusWin(w);
  if(lay){snap(w,lay,old);p.querySelector('.read').focus({preventScroll:true});renderTray();return}
  if(!calm){const r=w.getBoundingClientRect();
    w.animate([{transform:`translate(${g.left+g.width/2-r.width/2}px,${g.top+g.height/2-r.height/2}px) scale(${g.width/r.width},${g.height/r.height})`,opacity:.7},{transform:w.style.transform,opacity:1}],{duration:260,easing:'cubic-bezier(.2,1.2,.4,1)'})}
  p.querySelector('.read').focus({preventScroll:true});renderTray()}

async function fill(p,key,url){
  const art=p.querySelector('.art'), tocList=p.querySelector('.toc ol');
  if(key==='ask'){p._plain=true;p.classList.add('chat');await window.buddyChat(art);return 'Ask Jarell'}
  if(key==='kind'){
    const list=await (await fetch('/testimonials.json')).json();
    art.innerHTML='<h2 class="title">Kind words</h2><p class="sub">23 recommendations from managers, product managers, engineers, designers, client teams and people I\'ve mentored, across Convertus, Copperleaf, MAVI and Vancouver Design Community. What comes up most: grounding work in research and design principles, making complex things clear, mentoring and running groups well, and being positive and easy to work with.</p><p class="sub" style="font-size:.875rem">Taken from LinkedIn, unedited.</p>'+list.map(x=>`<figure class="kw"><blockquote class="${x.quote.length>320?'clamp':''}"><p>${esc(x.quote)}</p></blockquote>${x.quote.length>320?'<button class="rm" aria-expanded="false">Read more</button>':''}<figcaption><strong>${esc(x.name)}</strong>${esc(x.title)}</figcaption></figure>`).join('');
    p._plain=true; return 'Kind words';
  }
  const doc=new DOMParser().parseFromString(await (await fetch(url)).text(),'text/html');
  if(key==='about'){
    const photo=doc.querySelector('.hero-photo');
    // one testimonial from the About page, then a way into the rest
    const said=doc.querySelector('.saids figure.said'),q=said?.querySelector('blockquote')?.textContent.trim()||'',who=said?.querySelector('figcaption strong')?.textContent.trim()||'',role=said?(said.querySelector('figcaption')?.textContent.trim()||'').slice(who.length).trim():'';
    const kind=q?`<h2 class="h-sec">Kind words</h2><figure class="kw"><blockquote class="${q.length>240?'clamp':''}"><p>${esc(q)}</p></blockquote>${q.length>240?'<button class="rm" aria-expanded="false">Read more</button>':''}<figcaption><strong>${esc(who)}</strong>${esc(role)}</figcaption></figure><button type="button" class="btn kw-more">View more kind words</button>`:'';
    art.innerHTML=(photo?photo.outerHTML:'')+'<div class="story about">'+doc.querySelector('.story.about').innerHTML+'</div>'+kind+'<div class="next"><a class="btn solid" href="/about/">Open as a page</a></div>';
    window.Illustrations?.about(art);
    const kf=document.querySelector('.folder[data-open="kind"]'),more=art.querySelector('.kw-more');if(more&&kf)more.onclick=()=>openWin(kf);
    p._plain=true; return 'About Jarell';
  }
  const title=doc.querySelector('.lede h1').textContent;
  art.innerHTML='<h2 class="title">'+esc(title)+'</h2>'+doc.querySelector('.facts').outerHTML+'<div class="story">'+doc.querySelector('.story').innerHTML+'</div>'+
    (doc.querySelector('.gate')
      ?'<div class="next"><p>The rest of this case study is password protected.</p><a class="btn solid" href="'+url+'">Open as a page to unlock</a></div>'
      :'<div class="next"><a class="btn solid" href="'+url+'">Open as a page</a></div>');
  const heads=[...art.querySelectorAll('.story h2,.story h3')]; heads.forEach((h,i)=>h.id=p.id+'-s'+i);
  tocList.innerHTML=heads.map(h=>`<li class="${h.tagName==='H3'?'sub':''}"><a href="#${h.id}">${esc(h.textContent)}</a></li>`).join('');
  const links=[...tocList.querySelectorAll('a')];
  links.forEach(a=>a.onclick=e=>{e.preventDefault();p._win.classList.remove('contents');art.querySelector(a.hash).scrollIntoView()});
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;links.forEach(a=>a.removeAttribute('aria-current'));
    const a=links.find(a=>a.hash==='#'+e.target.id);a?.setAttribute('aria-current','true');if(p._win.classList.contains('max'))a?.scrollIntoView({block:'nearest'})}),{root:p.querySelector('.read'),rootMargin:'0px 0px -75% 0px'});
  heads.forEach(h=>io.observe(h));
  return title;
}

async function openWin(a){
  const key=keyOf(a),name=nameOf(a);
  if(panes.has(key)){const p=panes.get(key),w=p._win;activate(p);if(w._min)restore(w);else{focusWin(w);p.querySelector('.read').focus({preventScroll:true})}renderTray();return}
  const p=ptpl.content.firstElementChild.cloneNode(true);p.id='pane-'+(++uid);p._key=key;p._opener=a;p._page=key==='kind'?'/kind-words/':key==='ask'?'#':a.getAttribute('href');panes.set(key,p);
  makeTab(p);label(p,name,name);
  let w=topWin();const fresh=!w;
  // Ask Jarell opens as a smaller chat window near the helper; everything else opens centered
  if(fresh){if(key==='ask'){const b={w:440,h:Math.min(580,innerHeight-130-BM+8)};w=newWin(b,24,innerHeight-b.h-112)}else{const b=size();w=newWin(b,(innerWidth-b.w)/2,72)}}
  attach(w,p);focusWin(w);
  if(fresh)grow(w,a,false);else if(!calm)p._tab.animate([{transform:'translateY(6px) scale(.85)',opacity:0},{transform:'none',opacity:1}],{duration:180,easing:'cubic-bezier(.2,1.3,.4,1)'});
  renderTray();
  try{label(p,name,await fill(p,key,a.getAttribute('href')))}catch{p.querySelector('.art').innerHTML='<p>This did not load. <a href="'+p._page+'">Open it as a page</a>.</p>'}
  if(p._win._active===p)activate(p);
  p.querySelectorAll('.rm').forEach(b=>b.onclick=()=>{const o=b.previousElementSibling.classList.toggle('open');b.textContent=o?'Show less':'Read more';b.setAttribute('aria-expanded',o)});
  if(p._win._active===p)(p.querySelector('.bform input')||p.querySelector('.read')).focus({preventScroll:true});
}
window.openWin=openWin;
// the helper toggles its chat: up front, it tucks away like the yellow button; otherwise it comes up
window.toggleWin=a=>{const p=panes.get(keyOf(a));if(p&&shown(p._win)&&p._win._active===p)minimize(p._win);else openWin(a)};

function wire(w){
  w.addEventListener('pointerdown',()=>focusWin(w),true);
  w.querySelector('.close-btn').onclick=()=>closeWin(w);
  w.querySelector('.max-btn').onclick=()=>setMax(w,!w.classList.contains('max'));
  w.querySelector('.min-btn').onclick=()=>minimize(w);
  w.querySelector('.toc-btn').onclick=()=>w.classList.toggle('contents');moreMenu(w);greenMenu(w);
  const bar=w.querySelector('.bar');
  bar.addEventListener('pointerdown',e=>{if(!e.target.closest('button,a,.lights,.tab'))dragWin(w,e,bar)});
  bar.addEventListener('dblclick',e=>{if(!e.target.closest('button,a,.lights,.tab'))setMax(w,!w.classList.contains('max'))});
  w.querySelectorAll('.grip').forEach(g=>g.addEventListener('dblclick',()=>setMax(w,true)));
  w.querySelectorAll('.grip').forEach(g=>g.addEventListener('pointerdown',e=>{
    if(e.detail>1||mobile())return;
    if(w.classList.contains('max')){const m=w.getBoundingClientRect();setMax(w,false);w.style.width=m.width+'px';w.style.height=m.height+'px';w._x=m.left;w._y=m.top;place(w)}e.preventDefault();e.stopPropagation();g.setPointerCapture(e.pointerId);g.classList.add('active');w.classList.add('resizing');
    const r=w.getBoundingClientRect(),sx=e.clientX,sy=e.clientY,left=g.dataset.edge==='left';
    const move=ev=>{const dx=ev.clientX-sx,dy=ev.clientY-sy;
      let nw=left?r.width-dx:r.width+dx;nw=Math.max(420,Math.min(nw,left?r.right:innerWidth-r.left));
      const nh=Math.max(320,Math.min(r.height+dy,innerHeight-BM-r.top));
      w.style.width=nw+'px';w.style.height=nh+'px';if(left){w._x=r.right-nw;place(w)}};
    const up=()=>{g.classList.remove('active');w.classList.remove('resizing');g.removeEventListener('pointermove',move);g.removeEventListener('pointerup',up)};
    g.addEventListener('pointermove',move);g.addEventListener('pointerup',up)}));
}

document.querySelectorAll('.folder[data-open]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();openWin(a)}));
addEventListener('keydown',e=>{if(e.key!=='Escape'||document.querySelector('dialog[open],.style-panel.on'))return;const top=topWin();if(top)closeWin(top)});
// clicking empty desktop tucks open windows away
const AWAY='a,button,input,select,textarea,label,dialog,nav,.win,.coach,.buddy,.style-panel,.ghost,[role=dialog]';
document.addEventListener('pointerdown',e=>{if(mobile()||e.button!==0||e.target.closest(AWAY))return;wins().forEach(w=>minimize(w,true));cue.classList.remove('on')});
// a small label follows the mouse over that empty desktop while a window is up
const cue=document.createElement('div');cue.className='away-cue';cue.setAttribute('aria-hidden','true');cue.textContent='Click to minimize';document.body.append(cue);
let cq=0;addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||cq)return;cq=requestAnimationFrame(()=>{cq=0;
  const on=!mobile()&&!!wins().length&&!e.target.closest(AWAY);cue.classList.toggle('on',on);if(on)cue.style.transform=`translate(${Math.min(e.clientX+14,innerWidth-cue.offsetWidth-8)}px,${Math.min(e.clientY+18,innerHeight-cue.offsetHeight-8)}px)`})});
document.addEventListener('pointerleave',()=>cue.classList.remove('on'));
// phones: windows float over a dimmed backdrop; tapping it tucks them back into their folders
const scrim=document.createElement('div');scrim.className='scrim';scrim.setAttribute('aria-hidden','true');document.body.append(scrim);
scrim.addEventListener('click',()=>wins().forEach(w=>minimize(w)));

/* A folder whose window is tucked away looks occupied: outlined, tinted, darker paper inside */
function renderTray(){document.querySelectorAll('.folder[data-open]').forEach(f=>{const p=panes.get(keyOf(f));f.classList.toggle('was-open',!!p&&!!p._win._min)});scrim.classList.toggle('on',!!wins().length)}

/* Too many tabs to fit: a "…" button lists them all; picking one brings it into view */
function overflow(w){const strip=w.querySelector('.tabs'),btn=w.querySelector('.more-btn');btn.hidden=strip.scrollWidth<=strip.clientWidth+1}
function moreMenu(w){const btn=w.querySelector('.more-btn'),menu=w.querySelector('.more-menu');
  const close=()=>{menu.hidden=true;btn.setAttribute('aria-expanded','false')};
  btn.onclick=()=>{if(!menu.hidden)return close();
    menu.replaceChildren(...[...w.querySelectorAll('.tab')].map(t=>{const i=document.createElement('button');i.type='button';i.setAttribute('role','menuitemradio');i.setAttribute('aria-checked',t.classList.contains('on'));i.textContent=t._pane._short;i.title=t._pane._full;
      i.onclick=()=>{close();activate(t._pane);t.focus()};return i}));
    menu.hidden=false;btn.setAttribute('aria-expanded','true');menu.querySelector('[aria-checked=true]')?.focus()};
  menu.addEventListener('keydown',e=>{const it=[...menu.children],i=it.indexOf(document.activeElement);
    if(e.key==='Escape'){e.stopPropagation();close();btn.focus()}
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();it[(i+(e.key==='ArrowDown'?1:-1)+it.length)%it.length].focus()}});
  document.addEventListener('pointerdown',e=>{if(!menu.hidden&&!e.target.closest('.more'))close()});
  new ResizeObserver(()=>overflow(w)).observe(w.querySelector('.tabs'));
  new MutationObserver(()=>overflow(w)).observe(w.querySelector('.tabs'),{childList:true})}

/* Yellow: expanded goes back to floating; floating tucks back into its folder. Clicking the desktop tucks it away too */
function minimize(w,away){
  if(w._min||w._closing)return;
  if(w.classList.contains('max')){if(!away)return setMax(w,false);setMax(w,false)}
  w._min=true;w.classList.remove('focused');renderTray();
  const item=w._active._opener;
  const done=()=>{if(!w._min)return;w.classList.add('minimized');if(!away)item?.focus({preventScroll:true})};
  if(calm||!item)return done();
  if(mobile())return void w.animate([{translate:'0 0',scale:1,opacity:1},{translate:'0 36px',scale:.94,opacity:0}],{duration:200,easing:'cubic-bezier(.4,0,.6,1)'}).finished.then(done,done);
  const r=w.getBoundingClientRect(),t=item.getBoundingClientRect();
  w.animate([{transform:w.style.transform,opacity:1},{transform:`translate(${t.left+t.width/2-r.width/2}px,${t.top+t.height/2-r.height/2}px) scale(.06)`,opacity:0}],{duration:220,easing:'cubic-bezier(.4,0,.6,1)'}).onfinish=done;
}
function restore(w){
  const t=w._active._opener?.getBoundingClientRect();
  w._min=false;w.classList.remove('minimized');focusWin(w);
  if(!calm&&mobile())w.animate([{translate:'0 48px',scale:.94,opacity:0},{translate:'0 0',scale:1,opacity:1}],{duration:300,easing:'cubic-bezier(.2,1,.3,1)'});
  else if(!calm&&t){const r=w.getBoundingClientRect();
    w.animate([{transform:`translate(${t.left+t.width/2-r.width/2}px,${t.top+t.height/2-r.height/2}px) scale(.06)`,opacity:0},{transform:w.style.transform,opacity:1}],{duration:240,easing:'cubic-bezier(.2,1.2,.4,1)'})}
  renderTray();w._active.querySelector('.read').focus({preventScroll:true});
}

/* Windows grow out of the folder that opened them and shrink back into it on close */
function grow(w,from,back){
  if(calm||!from||w.classList.contains('max'))return Promise.resolve();
  if(mobile())return w.animate(back?[{translate:'0 0',scale:1,opacity:1},{translate:'0 40px',scale:.94,opacity:0}]:[{translate:'0 56px',scale:.94,opacity:0},{translate:'0 0',scale:1,opacity:1}],{duration:back?200:320,easing:back?'cubic-bezier(.4,0,.6,1)':'cubic-bezier(.2,1,.3,1)'}).finished.catch(()=>{});
  const f=from.getBoundingClientRect(),r=w.getBoundingClientRect();
  const start=`translate(${f.left+f.width/2-r.width/2}px,${f.top+f.height/2-r.height/2}px) scale(.12)`, end=w.style.transform||'none';
  const a=w.animate(back?[{transform:end,opacity:1},{transform:start,opacity:0}]:[{transform:start,opacity:0},{transform:end,opacity:1}],
    {duration:back?220:360,easing:back?'cubic-bezier(.5,0,.8,.3)':'cubic-bezier(.18,1.3,.35,1)'});
  return a.finished.catch(()=>{});
}

/* Folder preview text types itself in on hover or focus */
document.querySelectorAll('.folder .peek > span').forEach(t=>{
  const full=t.textContent, f=t.closest('.folder');let timer;
  const type=()=>{if(calm)return;clearInterval(timer);let i=0;t.textContent='';timer=setInterval(()=>{t.textContent=full.slice(0,i+=5);if(i>=full.length){t.textContent=full;clearInterval(timer)}},13)};
  f.addEventListener('pointerenter',type);f.addEventListener('focus',type);
  f.addEventListener('pointerleave',()=>{clearInterval(timer);t.textContent=full});
});

/* The background grid lights up softly around the pointer */
if(!calm){const desk=$('.desk');let q=0;
  addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||q)return;q=requestAnimationFrame(()=>{q=0;desk.style.setProperty('--mx',e.clientX+'px');desk.style.setProperty('--my',e.clientY+'px');desk.classList.add('lit')})});
  document.addEventListener('pointerleave',()=>desk.classList.remove('lit'))}

/* Folder preview images load only when a folder is first hovered or focused */
document.querySelectorAll('.folder').forEach(f=>{const img=f.querySelector('.peek img[data-src]');if(!img)return;
  const load=()=>{if(!img.src)img.src=img.dataset.src};f.addEventListener('pointerenter',load,{once:true});f.addEventListener('focus',load,{once:true})});


/* Snap layouts, like Chrome and macOS: drop a dragged tab on a target, or hover the green button */
const LAYS=[['left','Tile left'],['right','Tile right'],['top','Top half'],['bottom','Bottom half'],['full','Full screen']];
const ICON={left:'<rect x="1" y="1" width="9" height="14" rx="1.5" class="on"/><rect x="11" y="1" width="9" height="14" rx="1.5"/>',right:'<rect x="1" y="1" width="9" height="14" rx="1.5"/><rect x="11" y="1" width="9" height="14" rx="1.5" class="on"/>',
  top:'<rect x="1" y="1" width="19" height="6.5" rx="1.5" class="on"/><rect x="1" y="8.5" width="19" height="6.5" rx="1.5"/>',bottom:'<rect x="1" y="1" width="19" height="6.5" rx="1.5"/><rect x="1" y="8.5" width="19" height="6.5" rx="1.5" class="on"/>',full:'<rect x="1" y="1" width="19" height="14" rx="1.5" class="on"/>'};
const snapBtns=()=>LAYS.map(([k,n])=>`<button type="button" data-l="${k}" aria-label="${n}" title="${n}"><svg viewBox="0 0 21 16" aria-hidden="true">${ICON[k]}</svg><span>${n}</span></button>`).join('');
function snap(w,l,other){
  if(l==='full'){setMax(w,true);return}
  if(w.classList.contains('max'))setMax(w,false);
  const m=8,top=8,W=innerWidth-m*2,H=innerHeight-top-BM,half={left:[m,top,W/2-4,H],right:[m+W/2+4,top,W/2-4,H],top:[m,top,W,H/2-4],bottom:[m,top+H/2+4,W,H/2-4]};
  const go=(x,k)=>{const [l2,t2,w2,h2]=half[k];x.style.width=w2+'px';x.style.height=h2+'px';x._x=l2;x._y=t2;place(x)};
  go(w,l);
  const mate=other&&shown(other)?other:wins().filter(x=>x!==w).length===1?wins().find(x=>x!==w):null;
  if(mate&&!mate.classList.contains('max'))go(mate,{left:'right',right:'left',top:'bottom',bottom:'top'}[l]);
}
const snapPanel=(()=>{const el=document.createElement('div');el.className='snap';el.setAttribute('aria-hidden','true');el.inert=true;el.innerHTML='<p>Drop to place</p>'+snapBtns();document.body.append(el);
  return{show(x){el.classList.toggle('left',x>innerWidth/2);el.classList.add('on')},hide(){el.classList.remove('on');el.querySelectorAll('.hot').forEach(b=>b.classList.remove('hot'))},
    hover(x,y){el.querySelectorAll('button').forEach(b=>{const r=b.getBoundingClientRect();b.classList.toggle('hot',x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom)})},
    pick(x,y){if(!el.classList.contains('on'))return null;const b=[...el.querySelectorAll('button')].find(b=>{const r=b.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom});return b?.dataset.l||null}}})();
// green button: hover (half a second) or keyboard focus shows the same layouts
function greenMenu(w){
  const g=w.querySelector('.max-btn'),box=document.createElement('div');box.className='snap-menu';box.setAttribute('role','group');box.setAttribute('aria-label','Window layout');box.innerHTML=snapBtns();box.hidden=true;w.querySelector('.lights').append(box);
  let t;const show=()=>{if(mobile())return;box.hidden=false},hide=()=>{clearTimeout(t);box.hidden=true};
  g.addEventListener('pointerenter',()=>{t=setTimeout(show,500)});g.addEventListener('pointerleave',e=>{clearTimeout(t);if(!box.contains(e.relatedTarget))hide()});
  box.addEventListener('pointerleave',e=>{if(e.relatedTarget!==g)hide()});
  g.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();show();box.querySelector('button').focus()}});
  box.addEventListener('keydown',e=>{const b=[...box.children],i=b.indexOf(document.activeElement);if(e.key==='Escape'){e.stopPropagation();hide();g.focus()}
    if(['ArrowDown','ArrowRight','ArrowUp','ArrowLeft'].includes(e.key)){e.preventDefault();b[(i+(/Down|Right/.test(e.key)?1:-1)+b.length)%b.length].focus()}});
  box.addEventListener('focusout',e=>{if(!w.querySelector('.lights').contains(e.relatedTarget))hide()});
  box.querySelectorAll('button').forEach(b=>b.onclick=()=>{hide();snap(w,b.dataset.l)});
}

/* First visit: one folder sits out of place and a two-step tip teaches dragging. Mouse users only; skippable; remembered */
(()=>{let seen;try{seen=localStorage.getItem('tip-drag-2')}catch{seen='1'}
  // a refresh shows it again (browsers can't tell a normal refresh from a hard one)
  if(performance.getEntriesByType('navigation')[0]?.type==='reload')seen=null;
  if(seen||mobile()||!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
  const done=()=>{try{localStorage.setItem('tip-drag-2','1')}catch{}tip.remove();f.classList.remove('stray');document.body.classList.remove('coach-on')};
  const f=[...document.querySelectorAll('.folders .folder')].find(x=>/MAVI/.test(x.textContent));if(!f)return;
  const tip=document.createElement('div');tip.className='coach';tip.setAttribute('role','status');
  const step=n=>{tip.innerHTML=`<p><b>${n} of 2</b> ${n===1?'Folders move. Try dragging MAVI Client Portal.':'Nice. Now click it to open the case study.'}</p><button type="button">Skip</button>`;tip.querySelector('button').onclick=done;put()};
  const put=()=>{const r=f.getBoundingClientRect();tip.style.left=Math.max(8,Math.min(innerWidth-tip.offsetWidth-8,r.left+r.width/2-tip.offsetWidth/2))+'px';tip.classList.remove('below');tip.style.top=Math.max(8,r.top-tip.offsetHeight-14)+'px'};
  setTimeout(()=>{f.classList.add('stray');f.style.transform='translate(0,-10px)';document.body.classList.add('coach-on');document.body.append(tip);step(1);setTimeout(put,calm?0:560);
    f.addEventListener('pointerdown',()=>f.classList.remove('stray'),{once:true});f.addEventListener('click',()=>f.classList.remove('stray'),{once:true}); // the ground shadow goes as soon as the folder is touched
    document.addEventListener('folderdragged',()=>{f.classList.remove('stray');step(2);setTimeout(put,50)},{once:true});
    f.addEventListener('click',()=>{if(tip.isConnected&&tip.textContent.startsWith('2'))done()});
    addEventListener('resize',()=>{if(!tip.isConnected)return;if(mobile())done();else put()})},calm?0:900);
})();
