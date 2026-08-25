// 🔥 MATRIX OS SERVICE WORKER - CACHE STRATEGY
const CACHE_NAME = 'matrix-os-v4';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/rain.js',
    '/script.js',
    '/nave.html',
    '/premium.html',
    '/manifest.json'
];

// Instalação e cache dos assets estáticos
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) return caches.delete(cache);
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Estratégia de Cache (Stale-While-Revalidate)
self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);

    // 🔥 APIS e Dados Dinâmicos (Network First)
    if (url.pathname.startsWith('/api/') || url.hostname.includes('api.n2yo.com') || url.hostname.includes('openweathermap')) {
        e.respondWith(
            fetch(e.request).catch(() => caches.match(e.request))
        );
        return;
    }

    // 🔥 Arquivos Estáticos (Cache First)
    e.respondWith(
        caches.match(e.request)
            .then(cachedResponse => {
                if (cachedResponse) return cachedResponse;
                return fetch(e.request).then(response => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(e.request, response.clone());
                        return response;
                    });
                });
            })
    );
});
