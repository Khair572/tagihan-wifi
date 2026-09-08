const CACHE_NAME = 'tagihan-wifi-cache-v2'; // Ubah versinya setiap update
const urlsToCache = [
  '/', // Pastikan ini sesuai dengan URL utama Anda
  '/index.html',
  '/admin.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
  // Tambahkan file lain yang perlu di-cache, seperti CSS, JS, gambar, dll
];

// Install event - cache file yang diperlukan
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  // Pindahkan ke tahap aktif segera
  self.skipWaiting();
});

// Activate event - hapus cache lama jika ada
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Mengambil kontrol terhadap halaman yang sudah terbuka
  self.clients.claim();
});

// Fetch event - gunakan cache jika tersedia, jika tidak fetch dari jaringan
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Jika cache ada, pakai cache
      if (response) {
        return response;
      }
      // Jika tidak, fetch dari jaringan
      return fetch(event.request);
    })
  );
});
