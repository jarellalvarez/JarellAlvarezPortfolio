const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [w,h,n] of [[1440,900,'d'],[1280,720,'d2'],[390,844,'p'],[320,568,'s']]){
 const p=await b.newPage({viewport:{width:w,height:h}});await p.goto('http://localhost:4329/');await p.waitForTimeout(2500);
 if(w>700){await p.hover('.folder >> nth=0');await p.waitForTimeout(900);}
 await p.screenshot({path:`grp-${n}.png`});
 console.log(n,await p.evaluate(()=>({sx:document.documentElement.scrollWidth>innerWidth,rows:[...document.querySelectorAll('.fgroup')].map(g=>{const r=g.getBoundingClientRect();return[r.top|0,r.bottom|0,r.left|0,r.right|0]}),dock:(()=>{const r=document.querySelector('.dock').getBoundingClientRect();return r.top|0})()})));}
await b.close()})()
