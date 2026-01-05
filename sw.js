const CACHE="vida-bluegreen-v4-6";
const ASSETS=["./","./index.html","./styles.css","./app.js","./manifest.json"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener("fetch",e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
self.addEventListener("message",e=>{const m=e.data||{};if(m.type==="notify"){self.registration.showNotification(m.title||"Recordatorio",{body:m.body||""})}});
