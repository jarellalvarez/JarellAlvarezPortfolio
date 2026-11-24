const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
for(const [w,h] of [[430,932],[390,844],[375,667],[360,640],[320,568]]){
 const c=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,hasTouch:true,isMobile:true});const p=await c.newPage();
 await p.goto('http://localhost:4329/');await p.waitForTimeout(2600);
 const r=await p.evaluate(()=>{const g=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {t:Math.round(r.top),b:Math.round(r.bottom),l:Math.round(r.left),r:Math.round(r.right),cy:Math.round((r.top+r.bottom)/2)}};
  return {nav:g('nav.top'),h1:g('.hero h1'),folders:g('.folders'),dock:g('.dock'),buddy:g('.bbtn'),scroll:document.documentElement.scrollHeight-innerHeight,vis:[...document.querySelectorAll('.folder')].filter(f=>f.offsetParent).length}});
 console.log(w+'x'+h,JSON.stringify(r));await p.screenshot({path:`ph-${w}.png`});await c.close()}
await b.close()})()
