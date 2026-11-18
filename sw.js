/* ============================================================
   Byte playground service worker — freshness guarantee.
   - HTML (navigations): network-first; cached copy only when
     offline, so visitors always get the current page.
   - Everything else: straight pass-through (never cached here),
     assets are versioned with ?v= links by the pages themselves.
   - Safe by design: nothing but documents is ever stored, so a
     stale SW cannot pin old CSS/JS. Cache name is version-stamped
     and pruned on activate.
   ============================================================ */
var CACHE = "byte-html-v9";

self.addEventListener("install", function (e) {
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  /* only HTML navigations; everything else passes through untouched */
  if (req.method !== "GET" || req.mode !== "navigate") return;
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        return hit || caches.match("/") || Response.error();
      });
    })
  );
});
