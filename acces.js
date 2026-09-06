/* ===================================================================
   ACCES : le contenu (data.enc) est chiffre avec un code partage dans la classe.
   La cle est derivee du code sur l'appareil (PBKDF2) ; elle est gardee localement
   pour ne pas redemander le code a chaque ouverture. Sans code valide, l'app
   n'affiche rien d'autre que cet ecran. Le serveur n'intervient pas.
   =================================================================== */
(async()=>{
const KEYNAME='acces.cle';
const b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const enc=await fetch('data.enc').then(r=>r.json());
const deriver=async code=>{const raw=await crypto.subtle.importKey('raw',new TextEncoder().encode(code.trim().toUpperCase().replace(/\s+/g,'')),'PBKDF2',false,['deriveBits']);
 return new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:b64(enc.salt),iterations:enc.it,hash:'SHA-256'},raw,256))};
const dechiffrer=async keyBytes=>{const k=await crypto.subtle.importKey('raw',keyBytes,'AES-GCM',false,['decrypt']);
 const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64(enc.iv)},k,b64(enc.ct));return new TextDecoder().decode(pt)};
const demarrer=code=>{const s1=document.createElement('script');s1.text=code;document.head.appendChild(s1);
 const s2=document.createElement('script');s2.text=document.getElementById('moteur').textContent;document.body.appendChild(s2);
 const s3=document.createElement('script');s3.src='classe.js';document.body.appendChild(s3);const g=document.getElementById('acces');if(g)g.remove()};
let stored=null;try{stored=localStorage.getItem(KEYNAME)}catch(e){}
if(stored){try{demarrer(await dechiffrer(b64(stored)));return}catch(e){try{localStorage.removeItem(KEYNAME)}catch(_){}}}
const ov=document.createElement('div');ov.id='acces';ov.style.cssText='position:fixed;inset:0;z-index:60;background:var(--bg,#0B1220);color:var(--fg,#E6EDF7);overflow:auto;padding:max(24px,env(safe-area-inset-top)) 18px 24px;font-family:inherit';
ov.innerHTML=`<div style="max-width:480px;margin:0 auto;min-height:calc(100vh - 60px);display:flex;flex-direction:column;justify-content:center"><div style="font-size:64px;text-align:center;margin-bottom:10px">🔐</div><h1 style="font-size:26px;text-align:center;margin:0 0 8px">${document.title}</h1><p style="text-align:center;color:var(--muted,#8A98B4);font-size:16px;line-height:1.5;margin:0 0 24px">Cette app est réservée à la classe. Entre le code d'accès qu'on t'a donné. Il n'est demandé qu'une fois.</p>
<input id="acode" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="CODE-D-ACCÈS" style="width:100%;box-sizing:border-box;padding:16px;font-size:20px;text-align:center;letter-spacing:2px;border-radius:12px;border:1px solid #2a3550;background:#0a0f1a;color:inherit;font-family:ui-monospace,Menlo,monospace"><button id="aok" style="width:100%;margin-top:12px;padding:16px;font-size:17px;font-weight:700;border:0;border-radius:12px;background:#FFB347;color:#1a1200">Ouvrir</button><p id="amsg" style="text-align:center;color:#FF6B6B;min-height:22px;margin:12px 0 0"></p><p style="text-align:center;color:var(--muted,#8A98B4);font-size:13px;margin-top:18px">Le contenu est chiffré sur l'appareil. Aucun serveur ne connaît le code.</p></div>`;
document.body.appendChild(ov);
const essayer=async()=>{const code=document.getElementById('acode').value;if(!code){return}const m=document.getElementById('amsg');m.style.color='var(--muted,#8A98B4)';m.textContent='Vérification…';document.getElementById('aok').disabled=true;
 try{const kb=await deriver(code);const txt=await dechiffrer(kb);try{localStorage.setItem(KEYNAME,btoa(String.fromCharCode(...kb)))}catch(e){}demarrer(txt)}
 catch(e){m.style.color='#FF6B6B';m.textContent='Code incorrect.';document.getElementById('aok').disabled=false}};
document.getElementById('aok').onclick=essayer;document.getElementById('acode').onkeydown=e=>{if(e.key==='Enter')essayer()};setTimeout(()=>document.getElementById('acode').focus(),200);
})();
