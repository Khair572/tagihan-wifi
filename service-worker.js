const CACHE_NAME = "tagihan-wifi-cache-v1";
const urlsToCache = [
  "./",
  "index.html",
  "manifest.json",
  "icon-192.png",
  "icon-512.png",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// ===== TERIMA PUSH NOTIFICATION DARI SERVER (BEKERJA WALAU APP DITUTUP) =====
self.addEventListener("push", event => {
  let data = { title: "📢 Tagihan WiFi", body: "Ada notifikasi baru" };
  try {
    if (event.data) data = event.data.json();
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: "icon-192.png",
    badge: "icon-192.png",
    vibrate: [200, 100, 200],
    tag: "tagihan-wifi",
    data: { url: "./" }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// ===== SAAT NOTIFIKASI DI-TAP, BUKA/FOKUS APLIKASI =====
self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("./");
    })
  );
});
