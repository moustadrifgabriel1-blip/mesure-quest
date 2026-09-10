/* ===================================================================
   ACCES : le contenu (data.enc) est chiffre avec un code partage dans la classe.
   La cle est derivee du code sur l'appareil (PBKDF2) ; elle est gardee localement
   pour ne pas redemander le code a chaque ouverture. Sans code valide, l'app
   n'affiche rien d'autre que cet ecran. Le serveur n'intervient pas.
   Ce fichier porte aussi l'ecran de panne : sans lui, une erreur de chargement
   donnerait un fond noir muet, impossible a diagnostiquer a distance.
   =================================================================== */
const panne=(msg,retry)=>{if(document.getElementById('panne'))return;const d=document.createElement('div');d.id='panne';
 d.style.cssText='position:fixed;inset:0;z-index:80;background:var(--bg,#F2F2F7);color:var(--ink,#111114);overflow:auto;padding:max(24px,env(safe-area-inset-top)) 18px 24px;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif';
 d.innerHTML='<div style="max-width:480px;margin:40px auto 0;text-align:center"><div class="ihero" style="color:var(--bad)"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg></div><h1 style="font-size:22px;margin:8px 0">'+document.title+' ne peut pas démarrer</h1><p id="pmsg" style="color:var(--ink2,#6E6E78);line-height:1.5"></p><button id="pre" class="btn wide" style="margin-top:12px">'+(retry||'Recharger')+'</button><p style="color:var(--ink2,#6E6E78);font-size:13px;margin-top:18px">Si ça continue, envoie ce message à Gab : il saura quoi faire.</p></div>';
 document.body.appendChild(d);d.querySelector('#pmsg').textContent=msg;d.querySelector('#pre').onclick=()=>location.reload()};
window.addEventListener('error',e=>{if(e.message&&!/ResizeObserver|Script error/.test(e.message))panne('Erreur : '+e.message+(e.lineno?' (ligne '+e.lineno+')':''))});
/* Le site ne sert plus qu'aux apps : l'app iOS charge ses fichiers par son propre schéma d'URL,
   l'app Android (TWA) ouvre le site en mode autonome. Dans un navigateur ou une PWA iPhone, on
   renvoie vers les apps, qui ont les rappels natifs. Sur localhost, tout reste ouvert pour les tests. */
const natif=(()=>{const ua=navigator.userAgent,ios=/iPhone|iPad|iPod/.test(ua);if(/quest:$/.test(location.protocol))return true;if(location.hostname==='localhost')return true;
 if(ios)return false;return matchMedia('(display-mode: standalone)').matches||document.referrer.startsWith('android-app://')})();
if(!natif){const bq=document.title.includes('Brevet');const d=document.createElement('div');d.id='acces';
 d.style.cssText='position:fixed;inset:0;z-index:60;background:var(--bg,#F2F2F7);color:var(--ink,#111114);overflow:auto;padding:max(24px,env(safe-area-inset-top)) 18px 24px;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif';
 d.innerHTML='<div style="max-width:480px;margin:40px auto 0;text-align:center"><div class="ihero"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/></svg></div><h1 style="font-size:26px;margin:8px 0">'+document.title+'</h1><p style="color:var(--ink2,#6E6E78);line-height:1.5">Le jeu se joue dans l\'app iPhone ou Android, avec les rappels de révision. La version web n\'est plus proposée.</p>'
 +'<a href="'+(bq?'https://testflight.apple.com/join/QRUTBHtZ':'https://testflight.apple.com/join/5vN3cDmD')+'" class="btn wide" style="margin-top:16px;text-decoration:none">iPhone : installer via TestFlight</a>'
 +'<a href="'+(bq?'https://play.google.com/apps/internaltest/4701358771211620104':'https://play.google.com/apps/internaltest/4701203046729725515')+'" class="btn wide ghost" style="margin-top:10px;text-decoration:none">Android : rejoindre le test Play</a>'
 +'<p style="color:var(--ink2,#6E6E78);font-size:13px;margin-top:18px">Le code de la classe reste le même dans l\'app.</p></div>';
 document.body.appendChild(d)}
else (async()=>{
const KEYNAME='acces.cle';
const b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
let enc;try{enc=await fetch('data.enc',{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()})}
catch(e){panne('Contenu indisponible. Vérifie ta connexion, puis réessaie. ('+e.message+')','Réessayer');return}
const deriver=async code=>{const raw=await crypto.subtle.importKey('raw',new TextEncoder().encode(code.trim().toUpperCase().replace(/\s+/g,'')),'PBKDF2',false,['deriveBits']);
 return new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:b64(enc.salt),iterations:enc.it,hash:'SHA-256'},raw,256))};
const dechiffrer=async keyBytes=>{const k=await crypto.subtle.importKey('raw',keyBytes,'AES-GCM',false,['decrypt']);
 const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64(enc.iv)},k,b64(enc.ct));return new TextDecoder().decode(pt)};
/* Le contenu est controle avant de lancer le moteur : si data.js a une erreur, on
   l'affiche au lieu de laisser le moteur planter sur « L is not defined ». */
const demarrer=code=>{const s1=document.createElement('script');s1.text=code;document.head.appendChild(s1);
 if(typeof L!=='object'||!L||L.length<2||typeof W==='undefined'){panne('Contenu illisible (data.js). Version du contenu : '+(enc.ver||'inconnue')+'.');return false}
 const s2=document.createElement('script');s2.text=document.getElementById('moteur').textContent;document.body.appendChild(s2);
 const s3=document.createElement('script');s3.src='classe.js?v='+(enc.ver||'');document.body.appendChild(s3);const g=document.getElementById('acces');if(g)g.remove();return true};
let stored=null;try{stored=localStorage.getItem(KEYNAME)}catch(e){}
if(stored){let txt=null;try{txt=await dechiffrer(b64(stored))}catch(e){try{localStorage.removeItem(KEYNAME)}catch(_){}}
 if(txt!==null){demarrer(txt);return}}
const ov=document.createElement('div');ov.id='acces';ov.style.cssText='position:fixed;inset:0;z-index:60;background:var(--bg,#F2F2F7);color:var(--ink,#111114);overflow:auto;padding:max(24px,env(safe-area-inset-top)) 18px 24px;font-family:inherit';
ov.innerHTML=`<div style="max-width:480px;margin:0 auto;min-height:calc(100vh - 60px);display:flex;flex-direction:column;justify-content:center"><div style="text-align:center"><div class="ihero"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></div></div><h1 style="font-size:26px;text-align:center;margin:0 0 8px">${document.title}</h1><p style="text-align:center;color:var(--ink2,#6E6E78);font-size:16px;line-height:1.5;margin:0 0 24px">Cette app est réservée à la classe. Entre le code d'accès qu'on t'a donné. Il n'est demandé qu'une fois.</p>
<input id="acode" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="CODE-D-ACCÈS" class="field mono" style="padding:16px;font-size:20px;text-align:center;letter-spacing:2px"><button id="aok" class="btn wide" style="margin-top:12px">Ouvrir</button><p id="amsg" style="text-align:center;color:var(--bad,#E0464C);min-height:22px;margin:12px 0 0"></p><p style="text-align:center;color:var(--ink2,#6E6E78);font-size:13px;margin-top:18px">Le contenu est chiffré sur l'appareil. Aucun serveur ne connaît le code.</p></div>`;
document.body.appendChild(ov);
const essayer=async()=>{const code=document.getElementById('acode').value;if(!code){return}const m=document.getElementById('amsg');m.style.color='var(--ink2,#6E6E78)';m.textContent='Vérification…';document.getElementById('aok').disabled=true;
 try{const kb=await deriver(code);const txt=await dechiffrer(kb);try{localStorage.setItem(KEYNAME,btoa(String.fromCharCode(...kb)))}catch(e){}demarrer(txt)}
 catch(e){m.style.color='var(--bad,#E0464C)';m.textContent='Code incorrect.';document.getElementById('aok').disabled=false}};
document.getElementById('aok').onclick=essayer;document.getElementById('acode').onkeydown=e=>{if(e.key==='Enter')essayer()};setTimeout(()=>document.getElementById('acode').focus(),200);
})();
