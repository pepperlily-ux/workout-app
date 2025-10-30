// Service Worker - PWA 설치를 위한 필수 파일
const CACHE_NAME = 'metamong-v59';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// 설치
self.addEventListener('install', event => {
  // 새 Service Worker를 즉시 활성화 (대기하지 않음)
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 활성화
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // 모든 클라이언트를 즉시 제어
      self.clients.claim(),
      // 오래된 캐시 정리
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// Fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(error => {
          // 네트워크 요청 실패 시 (이미지 등) 조용히 실패
          console.log('Fetch failed for:', event.request.url);
          return new Response('', { status: 404, statusText: 'Not Found' });
        });
      })
  );
});
