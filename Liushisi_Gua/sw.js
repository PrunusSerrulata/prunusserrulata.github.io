var CACHE_VERSION = 'liushisigua_v1';
var CACHE_FILES = [
    '/Liushisi_Gua/',
    '/Liushisi_Gua/index.html',
    '/Liushisi_Gua/index.js',
    '/Liushisi_Gua/index.css'
];

self.addEventListener('install', function (event) {
    console.log('[Service Worker] Installing');
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then(function (cache) {
                console.log('[Service Worker] Caching all content')
                return cache.addAll(CACHE_FILES)
            })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (key) {
                if (CACHE_FILES.indexOf(key) === -1) {
                    return caches.delete(key)
                }
            }));
        })
    );
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (r) {
            console.log('[Service Worker] Fetching resource: ' + e.request.url);
            return r || fetch(event.request).then(function (response) {
                return caches.open(CACHE_FILES).then(function (cache) {
                    console.log('[Service Worker] Caching new resource: ' + e.request.url);
                    cache.put(e.request, response.clone())
                    return response
                })
            });
        })
    );
});