const V='mess-ledger-v1.0.0';
const CORE=['./','./index.html','./manifest.json'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>Promise.allSettled(CORE.map(u=>c.add(u)))));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET') return;               // never cache API POSTs
  const url=new URL(req.url);
  if(url.origin===location.origin){
    if(req.mode==='navigate'){
      e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(V).then(c=>c.put('./index.html',cp));return r;}).catch(()=>caches.match('./index.html')));
      return;
    }
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req)));
  } else if(url.hostname.endsWith('fonts.googleapis.com')||url.hostname.endsWith('fonts.gstatic.com')){
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{const cp=r.clone();caches.open(V).then(c=>c.put(req,cp));return r;}).catch(()=>hit)));
  }
});
self.addEventListener('message',m=>{ if(m.data&&m.data.type==='SKIP_WAITING') self.skipWaiting(); });