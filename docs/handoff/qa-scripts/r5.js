const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [w,h] of [[1440,900],[1280,720]]){
 const p=await b.newPage({viewport:{width:w,height:h}});await p.goto('http://localhost:4329/');await p.waitForTimeout(2500);
 await p.keyboard.press('PageDown');await p.waitForTimeout(2000);
 const bub=async()=>p.evaluate(()=>{const s=document.querySelector('.bsay');return [s.classList.contains('on'),s.textContent.slice(0,30)]});
 console.log(w,'stop1',await bub());await p.screenshot({path:`r5-${w}-mavi.png`});
 await p.keyboard.press('PageDown');await p.waitForTimeout(2000);console.log('stop2',await bub());
 await p.keyboard.press('PageUp');await p.waitForTimeout(2000);console.log('back1',await bub());
 await p.keyboard.press('Home');await p.waitForTimeout(2200);console.log('home',await bub());
 await p.close();}
const m=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await m.goto('http://localhost:4329/');await m.waitForTimeout(2500);
await m.screenshot({path:'r5-m-top.png'});await m.evaluate(()=>scrollTo(0,500));await m.waitForTimeout(900);await m.screenshot({path:'r5-m-bar.png'});
await m.evaluate(()=>document.querySelector('.j-pvs').scrollIntoView());await m.waitForTimeout(600);await m.screenshot({path:'r5-m-pv.png'});
await m.goto('http://localhost:4329/about/');await m.waitForTimeout(1200);await m.screenshot({path:'r5-m-about.png'});await m.evaluate(()=>scrollTo(0,900));await m.waitForTimeout(900);await m.screenshot({path:'r5-m-about2.png'});
const d=await b.newPage({viewport:{width:1280,height:800}});await d.goto('http://localhost:4329/about/');await d.waitForTimeout(800);await d.screenshot({path:'r5-d-about.png',clip:{x:0,y:0,width:1280,height:200}});
await b.close()})()
