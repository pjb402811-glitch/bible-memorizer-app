// 서비스 워커 버전 - 캐시를 업데이트해야 할 때 이 버전을 변경하세요.
const CACHE_VERSION = 1;
const CACHE_NAME = `bible-memorization-cache-v${CACHE_VERSION}`;

// 캐시할 핵심 파일 목록
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png'
];

// 1. 서비스 워커 설치 (Install)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(error => {
        console.error('Failed to cache app shell:', error);
      })
  );
});

// 2. 서비스 워커 활성화 (Activate)
self.addEventListener('activate', (event) => {
  // 이전 버전의 캐시가 있다면 삭제합니다.
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 즉시 서비스 워커를 활성화합니다.
  return self.clients.claim();
});

// 3. 요청 가로채기 (Fetch)
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // CDN 리소스(esm.sh, Google Fonts 등)와 같은 외부 출처 요청은
  // 네트워크가 처리하도록 합니다.
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  // 동일 출처 요청에 대해서는 Cache-First 전략을 사용합니다.
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 리소스가 캐시에 있으면 그것을 반환합니다.
        if (response) {
          return response;
        }
        // 그렇지 않으면 네트워크에서 가져옵니다.
        return fetch(event.request);
      })
  );
});