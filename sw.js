// Service Worker - PWA 설치를 위한 필수 파일
const CACHE_NAME = 'metamong-v77';
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

// Fetch - Network First 전략 (HTML은 항상 최신 버전 가져오기)
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // HTML 파일은 네트워크 우선
  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 네트워크 성공 시 캐시 업데이트
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // 네트워크 실패 시에만 캐시 사용
          return caches.match(event.request);
        })
    );
  } else {
    // 이미지, CSS 등은 캐시 우선
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request).catch(error => {
            console.log('Fetch failed for:', event.request.url);
            return new Response('', { status: 404, statusText: 'Not Found' });
          });
        })
    );
  }
});
