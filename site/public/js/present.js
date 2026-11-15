/* Presentation mode: the case study as full-screen slides, one per section. Uses only what is on the page,
   so locked sections join in once unlocked. Arrow keys, space, or click to move; Escape to leave. */
(()=>{const btn=document.getElementById('present');if(!btn)return;
let d,i=0,slides=[];
function build(){
  const h1=document.querySelector('.lede h1'),facts=document.querySelector('.facts');
  slides=[`<h1>${h1.innerHTML}</h1>${facts?facts.outerHTML:''}`];
  document.querySelectorAll('main .story').forEach(st=>{if(!st.offsetParent&&!st.closest('.unlocked'))return;let cur=null;
    [...st.children].forEach(el=>{if(/^H2$/.test(el.tagName)||!cur){cur=document.createElement('div');slides.push(cur)}cur.append(el.cloneNode(true))})});
  slides=slides.map(s=>typeof s==='string'?s:s.innerHTML).filter(s=>s.trim());
}
function go(n){i=Math.max(0,Math.min(slides.length-1,n));d.querySelector('.slide').innerHTML=slides[i];d.querySelector('.slide').scrollTop=0;
  d.querySelector('.count').textContent=(i+1)+' / '+slides.length;d.querySelector('.prev').disabled=i===0;d.querySelector('.nextb').disabled=i===slides.length-1}
btn.onclick=()=>{build();
  if(!d){d=document.createElement('dialog');d.className='deck';d.setAttribute('aria-label','Presentation');
    d.innerHTML='<div class="slide" tabindex="0"></div><div class="deck-bar"><button class="btn prev" type="button" aria-label="Previous slide">Back</button><span class="count" aria-live="polite"></span><button class="btn nextb" type="button" aria-label="Next slide">Next</button><button class="btn" type="button" data-x>Exit</button></div>';
    document.body.append(d);d.querySelector('.prev').onclick=()=>go(i-1);d.querySelector('.nextb').onclick=()=>go(i+1);d.querySelector('[data-x]').onclick=()=>d.close();
    d.addEventListener('keydown',e=>{if(['ArrowRight','PageDown'].includes(e.key)||(e.key===' '&&e.target.tagName!=='BUTTON')){e.preventDefault();go(i+1)}if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(i-1)}});
    d.addEventListener('close',()=>{document.fullscreenElement&&document.exitFullscreen().catch(()=>{});btn.focus()})}
  d.showModal();go(0);d.querySelector('.slide').focus();d.requestFullscreen?.().catch(()=>{})};
})();
