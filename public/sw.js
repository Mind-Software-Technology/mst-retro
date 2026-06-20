// File ini dibuat untuk mencegah error 404 karena browser mencoba mencari Service Worker
// dari project sebelumnya yang pernah berjalan di localhost:3000.
// Script ini akan menonaktifkan Service Worker yang lama jika ada.

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    self.registration.unregister().then(() => {
      console.log('Service Worker lama berhasil di-unregister.');
    })
  );
});
