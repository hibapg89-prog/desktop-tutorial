const CACHE = 'luxebeauty-v1';
const SHELL = ['/', '/manifest.json', '/favicon.ico'];

// ─── Install — cache app shell ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

// ─── Activate — purge old caches ────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ─── Fetch — network-first navigation, cache fallback ───────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/').then((r) => r ?? Response.error()))
    );
  }
});

// ─── Push — show branded notification ───────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data?.json() ?? {}; } catch { data = { body: event.data?.text() }; }

  const title   = data.title  ?? 'LuxeBeauty ✦';
  const body    = data.body   ?? 'Votre Muse du Jour vous attend.';
  const url     = data.url    ?? '/';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:    '/icons/icon.svg',
      badge:   '/icons/icon.svg',
      vibrate: [80, 40, 80],
      tag:     'luxebeauty-push',
      renotify: true,
      data:    { url },
      actions: [
        { action: 'open',    title: 'Découvrir ✦' },
        { action: 'dismiss', title: 'Plus tard'    },
      ],
    })
  );
});

// ─── Notification click ──────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const target = event.notification.data?.url ?? '/';
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((list) => {
        const existing = list.find((c) => 'focus' in c);
        if (existing) {
          existing.navigate(target);
          return existing.focus();
        }
        return clients.openWindow(target);
      })
  );
});
