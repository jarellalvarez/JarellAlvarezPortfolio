const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [w,h] of [[1440,900],[1280,800],[1024,768]]){
 const p=await b.newPage({viewport:{width:w,height:h}});await p.goto('http://localhost:4329/');await p.waitForTimeout(2500);
 const hd=await p.evaluate(()=>{const r=e=>document.querySelector(e).getBoundingClientRect();return{work:[r('#fh-work').left|0,r('#work li .folder').left|0],more:[r('#fh-more').left|0,r('.fgroup:nth-child(2) .folder').left|0]}});
 console.log(w,'headings',JSON.stringify(hd));
 await p.keyboard.press('PageDown');await p.waitForTimeout(1800);
 await p.screenshot({path:`r4-${w}-mavi.png`});
 for(let i=0;i<3;i++){await p.mouse.wheel(0,10);await p.waitForTimeout(1900);}
 const g=await p.evaluate(()=>{const r=document.querySelector('.j-pvs').getBoundingClientRect();return {ratio:+(r.width*r.height/(innerWidth*innerHeight)).toFixed(2),p:+(scrollY/(document.documentElement.scrollHeight-innerHeight)).toFixed(2)}});
 console.log(w,'previews',JSON.stringify(g));
 await p.screenshot({path:`r4-${w}-pv.png`});await p.close();}
const p=await b.newPage({viewport:{width:1440,height:900}});await p.goto('http://localhost:4329/');await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(3500);await p.screenshot({path:'r4-tip.png'});
const m=await b.newPage({viewport:{width:320,height:568}});await m.goto('http://localhost:4329/');await m.waitForTimeout(1500);
console.log('320',await m.evaluate(()=>({sx:document.documentElement.scrollWidth>innerWidth,h3:[...document.querySelectorAll('.j-pv h3')].map(h=>[h.textContent,h.scrollWidth<=h.clientWidth+1])})));
await b.close()})()
