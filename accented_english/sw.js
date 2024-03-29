var CACHE_VERSION = 'accented_english_46e16e';
var CACHE_FILES = [
    '/accented_english/',
    '/accented_english/index.html',
    '/accented_english/index.js',
    '/accented_english/index.css'
];

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Installing');
    e.waitUntil(
        caches.open(CACHE_VERSION)
            .then(function (cache) {
                console.log('[Service Worker] Caching all content')
                return cache.addAll(CACHE_FILES)
            })
    );
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (key) {
                if (CACHE_FILES.indexOf(key) === -1) {
                    return caches.delete(key)
                }
            }));
        })
    );
});

self.addEventListener('fetch', function (e) {
    e.respondWith(
        caches.match(e.request).then(function (r) {
            console.log('[Service Worker] Fetching resource: ' + e.request.url);
            return r || fetch(e.request).then(function (response) {
                return caches.open(CACHE_FILES).then(function (cache) {
                    console.log('[Service Worker] Caching new resource: ' + e.request.url);
                    cache.put(e.request, response.clone())
                    return response
                })
            });
        })
    );
});