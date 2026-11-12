/* Tiene in memoria l'ultima versione della pagina: se la rete cade proprio mentre la pagina si ricarica, si apre lo stesso.
   Con la rete presente si usa sempre la versione online. */
const CACHE = 'trascrizione-pagina-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || req.mode !== 'navigate') return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try{
      const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 5000);
      const res = await fetch(req, {signal: ctl.signal, cache: 'no-store'});
      clearTimeout(t);
      if (res && res.ok) cache.put('page', res.clone());
      return res;
    }catch(err){
      const hit = await cache.match('page');
      if (hit) return hit;
      throw err;
    }
  })());
});
