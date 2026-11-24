const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const e=[];
const c=await b.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();p.on('pageerror',x=>e.push(x.message));await p.addInitScript(()=>localStorage.setItem('tip-drag-2','1'));await p.goto('http://localhost:4329/');await p.waitForTimeout(3000);
const pr=()=>p.evaluate(()=>{const m=document.documentElement.scrollHeight-innerHeight;return +(scrollY/m).toFixed(3)});
console.log('start',await pr());
for(let i=1;i<=6;i++){await p.mouse.move(700,450);await p.mouse.wheel(0,120);await p.waitForTimeout(2200);console.log('down',i,await pr(),await p.evaluate(()=>[...document.querySelectorAll('.j-prog li.on')].map(l=>l.textContent.trim()).join()))}
for(let i=1;i<=2;i++){await p.mouse.wheel(0,-120);await p.waitForTimeout(2200);console.log('up',i,await pr())}
// inertia burst: 10 wheel events 20ms apart should be one step
await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(500);for(let i=0;i<10;i++){await p.mouse.wheel(0,40);await p.waitForTimeout(20)}await p.waitForTimeout(2500);console.log('burst',await pr());
await p.keyboard.press('PageDown');await p.waitForTimeout(2200);console.log('pagedown',await pr());await p.keyboard.press('End');await p.waitForTimeout(2500);console.log('end',await pr());await p.keyboard.press('Home');await p.waitForTimeout(2500);console.log('home',await pr());
console.log(e);await b.close()})()
