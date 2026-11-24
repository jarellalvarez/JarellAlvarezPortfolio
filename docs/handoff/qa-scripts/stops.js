const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();await p.addInitScript(()=>localStorage.setItem('tip-drag-2','1'));await p.goto('http://localhost:4329/');await p.waitForTimeout(4600);
await p.screenshot({path:'st-0.png'});
for(let i=1;i<=5;i++){await p.mouse.move(700,450);await p.mouse.wheel(0,120);await p.waitForTimeout(2300);await p.screenshot({path:`st-${i}.png`})}
await b.close()})()
