/* SIX — service worker : réseau d'abord, cache en secours (hors ligne à la salle). */
const VERSION = 'six-2026-11-09.1';
const SHELL = ['/', '/index.html', '/app.css', '/app.js', '/content.js', '/audio.js', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.pathname.startsWith('/api/')) return; // jamais de cache pour la synchro
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    try {
      const fresh = await fetch(req);
      if (fresh && fresh.ok && (url.origin === location.origin || url.hostname.endsWith('gstatic.com') || url.hostname.endsWith('googleapis.com'))) cache.put(req, fresh.clone());
      return fresh;
    } catch (_) {
      const hit = await cache.match(req, { ignoreSearch: url.origin === location.origin });
      if (hit) return hit;
      if (req.mode === 'navigate') { const idx = await cache.match('/index.html'); if (idx) return idx; }
      return new Response('Hors ligne', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } });
    }
  })());
});
