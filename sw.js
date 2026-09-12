/* Mesure Quest est fusionné dans Brevet Quest. Ce service worker ne sert plus qu'à se retirer
   lui même : il vide les caches de l'ancien jeu, se désinscrit, et laisse le réseau reprendre
   la main pour que les appareils qui avaient installé la PWA voient la page d'explication. */
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
 const noms=await caches.keys();
 await Promise.all(noms.map(n=>caches.delete(n)));
 await self.registration.unregister();
 const cl=await self.clients.matchAll({type:'window'});
 cl.forEach(c=>c.navigate(c.url));
})())});
