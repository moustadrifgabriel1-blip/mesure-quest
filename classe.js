/* ===================================================================
   CLASSE : progression partagée entre camarades, et intro au premier lancement.
   Serveur : Firebase (projet brevet-quest-classe, offre gratuite). Chacun se connecte
   anonymement et n'écrit que sa propre fiche ; tout membre d'une classe lit celles
   des autres. Le code de classe se partage de vive voix, il n'y a aucun compte à créer.
   Fichier commun aux deux jeux : la constante JEU les distingue.
   =================================================================== */
(()=>{
const CFG={apiKey:"AIzaSyDOSlu7D6T8lbQAXBxyqvqx5iSN-p4NBmQ",authDomain:"brevet-quest-classe.firebaseapp.com",projectId:"brevet-quest-classe",appId:"1:903865192589:web:47fb3b644dd42bbb93d2c4"};
const JEU=document.title.includes('Mesure')?'mesure':'brevet';
const NOM=JEU==='mesure'?'Mesure Quest':'Brevet Quest';
let fb=null,uid=null,pending=null,dernier=0;
// Chargement paresseux du SDK : rien n'est téléchargé tant qu'on n'a pas rejoint une classe.
const charger=()=>new Promise((ok,ko)=>{if(fb){ok(fb);return}
 const urls=['https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js','https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js'];
 let n=0;const next=()=>{if(n===urls.length){try{firebase.initializeApp(CFG);fb=firebase;ok(fb)}catch(e){ko(e)}return}const s=document.createElement('script');s.src=urls[n++];s.onload=next;s.onerror=()=>ko(new Error('réseau'));document.head.appendChild(s)};next()});
const connecter=async()=>{const f=await charger();if(!uid){const u=await f.auth().signInAnonymously();uid=u.user.uid}return f};
// La fiche envoyée : ce que le profil affiche déjà, rien de plus.
const fiche=()=>{const all=[];for(let li=1;li<=NCH;li++)L[li].q.forEach((q,k)=>{const r=S.sr[li+'.'+k];if(r)all.push(r)});
 return {pseudo:S.classe.pseudo,jeu:JEU,xp:S.xp,etoiles:Object.values(S.done).reduce((a,b)=>a+b.st,0),vues:all.length,maitrisees:all.filter(r=>r.iv>=21).length,total:TOTALQ,serie:S.streak.n,maj:Date.now()}};
const pousser=async()=>{if(!S.classe||!S.classe.code||!navigator.onLine)return;try{const f=await connecter();await f.firestore().collection('classes').doc(S.classe.code).collection('membres').doc(uid).set(fiche());dernier=Date.now()}catch(e){}};
// Une seule poussée par minute au plus, déclenchée par les sauvegardes du jeu.
const oldSave=window.save;window.save=function(){oldSave.apply(this,arguments);if(S.classe&&S.classe.code&&Date.now()-dernier>60000){clearTimeout(pending);pending=setTimeout(pousser,3000)}};
const code6=()=>{const a='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let c='';for(let i=0;i<6;i++)c+=a[Math.floor(Math.random()*a.length)];return c};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* ---------- vue Classe ---------- */
window.classe=async function(){tabs();
 if(!S.classe||!S.classe.code){app.innerHTML=hud()+`<div class="hero"><h1>👥 <b>Ma classe</b></h1><p>Partage un code avec tes camarades : chacun voit la progression des autres. Pas de compte, pas de mot de passe, juste un pseudo.</p></div>
 <div class="card"><label style="display:block;margin-bottom:10px">Ton pseudo<br><input id="cp" maxlength="24" placeholder="Gab" style="width:100%;margin-top:6px;padding:12px;border-radius:10px;border:1px solid var(--line);background:#0a0f1a;color:var(--fg);font-size:16px"></label>
 <label style="display:block;margin-bottom:10px">Code de la classe<br><input id="cc" maxlength="6" placeholder="6 lettres" style="width:100%;margin-top:6px;padding:12px;border-radius:10px;border:1px solid var(--line);background:#0a0f1a;color:var(--fg);font-size:16px;text-transform:uppercase;letter-spacing:3px;font-family:var(--fm)"></label>
 <button class="btn wide" id="join">Rejoindre cette classe</button><div style="height:8px"></div><button class="btn wide ghost" id="new">Créer une nouvelle classe</button><p id="msg" style="color:var(--muted);font-size:13.5px;margin:10px 0 0"></p></div>
 <div class="nav"><button class="btn ghost" id="back">← Profil</button></div>`;
 const go=async code=>{const p=$('#cp').value.trim();if(!p){$('#msg').textContent='Choisis un pseudo.';return}if(!/^[A-Z2-9]{6}$/.test(code)){$('#msg').textContent='Le code fait 6 lettres ou chiffres.';return}$('#msg').textContent='Connexion…';try{S.classe={code,pseudo:p};await connecter();await pousser();save();classe()}catch(e){S.classe=null;$('#msg').textContent='Pas de réseau pour le moment. Réessaie plus tard.'}};
 $('#join').onclick=()=>go($('#cc').value.trim().toUpperCase());$('#new').onclick=()=>go(code6());$('#back').onclick=profile;return}
 app.innerHTML=hud()+`<div class="hero"><h1>👥 <b>Ma classe</b></h1><p>Code <b class="mono" style="letter-spacing:3px">${S.classe.code}</b> · donne-le à tes camarades. Ils l'entrent dans Profil, puis Ma classe.</p></div><div class="card" id="liste"><p style="color:var(--muted)">Chargement…</p></div><div class="nav"><button class="btn ghost" id="back">← Profil</button><button class="btn ghost" id="quit" style="color:var(--bad)">Quitter la classe</button></div>`;
 $('#back').onclick=profile;$('#quit').onclick=()=>{if(confirm('Quitter la classe '+S.classe.code+' ? Ta fiche y reste jusqu\'à ce que tu la rejoignes à nouveau.')){S.classe=null;save();profile()}};
 try{const f=await connecter();await pousser();const snap=await f.firestore().collection('classes').doc(S.classe.code).collection('membres').get();
  const rows=[];snap.forEach(d=>{const x=d.data();if(x.jeu===JEU)rows.push(x)});rows.sort((a,b)=>b.xp-a.xp);
  const j=t=>{const d=Math.round((Date.now()-t)/864e5);return d<=0?'aujourd\'hui':d===1?'hier':'il y a '+d+' j'};
  $('#liste').innerHTML=`<div class="eyebrow">${NOM} · ${rows.length} camarade${rows.length>1?'s':''}</div>`+(rows.length?rows.map((x,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--line)"><div><b>${i===0?'🥇 ':i===1?'🥈 ':i===2?'🥉 ':''}${esc(x.pseudo)}</b>${x.pseudo===S.classe.pseudo?' <small style="color:var(--muted)">(toi)</small>':''}<br><small style="color:var(--muted)">${x.maitrisees} ancrées · ${x.vues} / ${x.total} vues · 🔥 ${x.serie} · ${j(x.maj)}</small></div><div class="mono" style="text-align:right">${x.xp} XP<br><small style="color:var(--amber)">${'★'.repeat(Math.min(5,Math.round(x.etoiles/Math.max(1,TOTETOILES)*5)))}</small></div></div>`).join(''):'<p style="color:var(--muted)">Personne d\'autre pour l\'instant. Partage le code.</p>')+`<p style="color:var(--muted);font-size:13px;margin:10px 0 0">Classement par XP. Le chiffre qui compte vraiment, c'est « ancrées » : les questions tenues plus de trois semaines.</p>`}
 catch(e){$('#liste').innerHTML='<p style="color:var(--muted)">Impossible de joindre le serveur. Vérifie le réseau.</p>'}};
/* ---------- intro au premier lancement ---------- */
window.intro=function(){const pages=JEU==='mesure'?[
 ['🔬','Mesure Quest','Le cours de technique de mesure du brevet, transformé en jeu. Cinq mondes, quatorze chapitres, un boss à la fin de chaque monde. Tout vient du support de cours, rien d\'autre.'],
 ['📖','Comment apprendre','Lis le briefing d\'un chapitre, joue avec le laboratoire, puis lance le combat sans relire. Te tromper puis lire l\'explication ancre mieux que relire dix fois.'],
 ['🧠','Réviser chaque jour','L\'onglet Réviser te ressort chaque question juste avant que tu l\'oublies. Dix minutes par jour suffisent. Le rappel libre te fait réciter à voix haute, comme à l\'oral.'],
 ['👥','Ta classe','Dans Profil, rejoins la classe de tes camarades avec un code. Vous voyez la progression des uns et des autres. Le meilleur, c\'est celui qui a le plus de questions ancrées.']]:[
 ['🗺️','Brevet Quest','Tout le brevet sauf la technique de mesure : quarante-deux chapitres, treize mondes, un boss par monde. Chaque question vient d\'un support de cours, avec sa source.'],
 ['📖','Comment apprendre','Lis le briefing, joue avec le laboratoire s\'il y en a un, puis lance le combat sans relire. Se tromper puis lire l\'explication, c\'est ça qui ancre.'],
 ['🧠','Réviser et réciter','L\'onglet Réviser ressort chaque question juste avant l\'oubli, propose des examens blancs par épreuve, et le rappel libre te fait réciter un briefing avant de le révéler.'],
 ['👥','Ta classe','Dans Profil, rejoins la classe de tes camarades avec un code à six lettres. Vous voyez la progression des uns et des autres, sans compte ni mot de passe.']];
 let i=0;const ov=document.createElement('div');ov.id='intro';ov.style.cssText='position:fixed;inset:0;z-index:50;background:var(--bg);overflow:auto;padding:max(24px,env(safe-area-inset-top)) 18px 24px';
 const draw=()=>{const p=pages[i];ov.innerHTML=`<div style="max-width:520px;margin:0 auto;min-height:calc(100vh - 60px);display:flex;flex-direction:column;justify-content:center;text-align:center"><div style="font-size:72px;margin-bottom:12px">${p[0]}</div><h1 style="font-size:28px;margin:0 0 12px">${p[1]}</h1><p style="font-size:17px;line-height:1.55;color:var(--muted);margin:0 0 28px">${p[2]}</p><div class="dots" style="justify-content:center;margin-bottom:22px">${pages.map((_,k)=>`<i class="${k===i?'on':''}"></i>`).join('')}</div><button class="btn wide" id="inx">${i<pages.length-1?'Suivant →':'C\'est parti'}</button>${i<pages.length-1?'<button class="btn ghost wide" id="iskip" style="margin-top:8px">Passer</button>':''}</div>`;
  ov.querySelector('#inx').onclick=()=>{i++;i<pages.length?draw():fin()};const sk=ov.querySelector('#iskip');if(sk)sk.onclick=fin};
 const fin=()=>{S.intro=true;save();ov.remove()};document.body.appendChild(ov);draw()};
if(!S.intro)setTimeout(intro,300);
})();
