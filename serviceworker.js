'use strict';
// Static Files as version
var staticCache = 'v0.01';
// Files to cache
var files = [
    './',
    './index.html',
    './img/favicon-32x32.png',
    './img/72x72.png',
    './img/96x96.png',
    './img/144x144.png',
    './img/192x192.png',
    './img/favicon.ico',
    './img/banner.png',
    './css/style.min.css',
    './js/jquery.min.js',
    './js/cross.min.js',
    './audio/click.wav',
    './audio/winner.wav',
];
// Install for service worker
self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(staticCache).then(cache => {
            return cache
                .addAll(files)
                .then(() => console.log('App Version: ' + staticCache))
                .catch(err => console.error('Error adding files to cache',
                    err));
        }),
    );
});
// Activate for Delete old cache & store new cache
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== staticCache) {
                        console.info('Deleting Old Cache', cache);
                        return caches.delete(cache);
                    }
                }),
            );
        }),
    );
    return self.clients.claim();
});
// Fetch network cache first asynchronization
self.addEventListener('fetch', e => {
    const req = e.request;
    const url = new URL(req.url);
    if (url.origin === location.origin) return e.respondWith(cacheFirst(req));
else return e.respondWith(networkFirst(req));
});
async function cacheFirst(req) {
    let cacheRes = await caches.match(req);
    return cacheRes || fetch(req);
}
async function networkFirst(req) {
    const dynamicCache = await caches.open('dynamic');
    try {
        const networkResponse = await fetch(req);
        if (req.method !== 'POST') dynamicCache.put(req, networkResponse.clone());
        return networkResponse;
    } catch (err) {
        const cacheResponse = await caches.match(req);
        return cacheResponse;
    }
}
