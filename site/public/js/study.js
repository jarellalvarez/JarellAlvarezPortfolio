const P=JSON.parse(document.getElementById('payload')?.textContent||'null'), $=s=>document.querySelector(s), dec=b=>Uint8Array.from(atob(b),c=>c.charCodeAt(0));
async function open(pw){
  const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']);
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:dec(P.s),iterations:200000,hash:'SHA-256'},k,{name:'AES-GCM',length:256},false,['decrypt']);
  return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:dec(P.i)},key,dec(P.c)));
}
function show(html){
  const s=$('#story'); s.innerHTML=html;
  document.body.classList.add('unlocked');
}
if($('#unlock'))$('#unlock').onsubmit=async e=>{e.preventDefault();$('#err').textContent='';
  try{const h=await open($('#pw').value);try{sessionStorage.setItem('k',$('#pw').value)}catch{}show(h)}
  catch{$('#err').textContent='That password did not work. Check it and try again.';$('#pw').select()}};
if(P)(async()=>{let k;try{k=sessionStorage.getItem('k')}catch{} if(k)try{show(await open(k))}catch{}})();
