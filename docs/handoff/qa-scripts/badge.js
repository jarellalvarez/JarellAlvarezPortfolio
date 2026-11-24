const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const e=[];
const BADGE=`<div id="nfbadge" style="position:fixed;right:16px;bottom:16px;width:176px;height:40px;background:#0e1e25;color:#fff;border-radius:20px;z-index:2147483647;opacity:.9">badge</div>`;
for(const [w,h] of [[1920,1080],[1440,900],[1280,720],[1024,768],[768,1024],[430,932],[390,844],[360,640],[320,568]]){
 const c=await b.newContext({viewport:{width:w,height:h}});const p=await c.newPage();p.on('pageerror',x=>e.push(x.message));
 await p.addInitScript(()=>localStorage.setItem('tip-drag-2','1'));
 await p.goto('http://localhost:4329/');await p.evaluate(h=>document.body.insertAdjacentHTML('beforeend',h),BADGE);await p.waitForTimeout(2600);
 const r=await p.evaluate(()=>{const bd=document.getElementById('nfbadge').getBoundingClientRect();const hit=s=>[...document.querySelectorAll(s)].filter(el=>{const r=el.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(el).display!=='none'&&r.left<bd.right&&r.right>bd.left&&r.top<bd.bottom&&r.bottom>bd.top}).map(el=>s);
  return [...hit('.toys'),...hit('.dock'),...hit('.buddy'),...hit('.folder'),...hit('.hero h1'),...hit('.hero .role'),...hit('.hero .tag'),...hit('.hero-art .dd'),...hit('nav.top')]});
 await p.screenshot({path:`bd-${w}.png`});
 // ask window
 await p.click('.bbtn');await p.waitForTimeout(900);
 const a=await p.evaluate(()=>{const bd=document.getElementById('nfbadge').getBoundingClientRect();const w=[...document.querySelectorAll('.win')].find(x=>x.getBoundingClientRect().width>50&&!x._min);if(!w)return 'no window';const r=w.getBoundingClientRect();const inp=w.querySelector('input,textarea,.grip');const ir=(w.querySelector('input')||w).getBoundingClientRect();return {win:[Math.round(r.right),Math.round(r.bottom)],overlapsBadge:r.left<bd.right&&r.right>bd.left&&r.top<bd.bottom&&r.bottom>bd.top,inputBottom:Math.round(ir.bottom),badgeTop:Math.round(bd.top)}});
 await p.screenshot({path:`bd-${w}-ask.png`});
 console.log(w+'x'+h,'overlaps:',JSON.stringify(r),'| ask',JSON.stringify(a));await c.close()}
console.log(e);await b.close()})()
