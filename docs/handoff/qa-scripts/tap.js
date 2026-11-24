const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
for(const w of [320,390,430]){const p=await b.newPage({viewport:{width:w,height:844},isMobile:true,hasTouch:true});await p.goto('http://localhost:4329/');await p.waitForTimeout(2200);
console.log(w,await p.evaluate(()=>{const a=document.querySelectorAll('.dock a')[2].getBoundingClientRect();return document.elementFromPoint(a.left+a.width/2,a.top+a.height/2).closest('a,.buddy')?.className||'?'}));}
await b.close()})()
