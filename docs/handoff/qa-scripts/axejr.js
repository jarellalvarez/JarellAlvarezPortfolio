const {chromium}=require('playwright');const axe=require('fs').readFileSync('../node_modules/axe-core/axe.min.js','utf8');(async()=>{const b=await chromium.launch();
for(const th of ['light','dark']){const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();await p.addInitScript(()=>localStorage.setItem('tip-drag-2','1'));await p.goto('http://localhost:4329/');await p.waitForTimeout(2500);await p.evaluate(t=>document.documentElement.dataset.theme=t,th);await p.addScriptTag({content:axe});
 const max=await p.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
 for(const f of [0,.1,.3,.5,.7,1]){await p.evaluate(y=>scrollTo(0,y),max*f);await p.waitForTimeout(1800);
  const v=await p.evaluate(async()=>(await axe.run({runOnly:['wcag2a','wcag2aa','wcag21aa','wcag22aa']})).violations.map(v=>v.id+': '+v.nodes.slice(0,3).map(n=>n.target).join(' | ')));
  const tab=await p.evaluate(()=>{const f=[...document.querySelectorAll('a,button')].filter(e=>!e.closest('[inert]')&&e.offsetParent!==null&&getComputedStyle(e).visibility!=='hidden');return f.length});
  console.log(th,f,JSON.stringify(v),'focusable',tab)}
 await c.close()}await b.close()})()
