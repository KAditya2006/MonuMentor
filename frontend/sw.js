const CACHE_NAME = 'roots-wings-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/explore.html',
  '/monument.html',
  '/quiz.html',
  '/chatbot.html',
  '/dashboard.html',
  '/css/style.css',
  '/js/main.js',
  '/js/explore.js',
  '/js/three-viewer.js',
  '/js/quiz.js',
  '/js/chatbot.js',
  '/js/dashboard.js',
  '/manifest.json'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache)
      })
  )
})

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  // Ignore API requests for caching to avoid stale data
  if (event.request.url.includes('/api/')) return

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request)
      })
  )
})
