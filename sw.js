/* Version incrementee par classe-backend/publier.sh a chaque publication. */
const V='mq-v20';const FILES=['./','./index.html','./data.enc','./acces.js','./classe.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
/* Tous les fichiers d'une version sont mis en cache d'un bloc, en contournant le cache HTTP :
   jamais un index.html d'une version avec le data.enc d'une autre. */
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
/* Reseau d'abord, cache de la version installee en secours. Le cache n'est plus alimente au fil de l'eau. */
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||!e.request.url.startsWith(self.location.origin))return;
 e.respondWith(fetch(e.request).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||(e.request.mode==='navigate'?caches.match('./index.html'):Response.error()))))});
