const {chromium}=require('playwright');const axe=require('fs').readFileSync('../node_modules/axe-core/axe.min.js','utf8');(async()=>{const b=await chromium.launch();
for(const [w,h] of [[390,844],[320,568]]){for(const th of ['light','dark']){const c=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true});const p=await c.newPage();await p.addInitScript(()=>localStorage.setItem('tip-drag-2','1'));await p.goto('http://localhost:4329/');await p.waitForTimeout(2200);await p.evaluate(t=>document.documentElement.dataset.theme=t,th);await p.addScriptTag({content:axe});
 const v=await p.evaluate(async()=>(await axe.run({runOnly:['wcag2a','wcag2aa','wcag21aa','wcag22aa']})).violations.map(v=>v.id+': '+v.nodes.map(n=>n.target).join(' ')));
 const names=await p.evaluate(()=>[...document.querySelectorAll('.dock a')].map(a=>a.innerText.trim()));
 console.log(w,th,JSON.stringify(v),JSON.stringify(names));await c.close()}}await b.close()})()
