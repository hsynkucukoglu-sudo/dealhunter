const CACHE = 'dh-v1'
const OFFLINE_URLS = ['/', '/deals', '/offline.html']

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(c => c.addAll(OFFLINE_URLS).catch(() => {}))
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)
  // Sadece same-origin istekler ve API dışı
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return

  event.respondWith(
    fetch(event.request)
      .then(res => {
        if (res.ok && res.type === 'basic') {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(event.request, clone))
        }
        return res
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match('/')))
  )
})

self.addEventListener('push', event => {
  const data = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'DealHunter', {
      body: data.body || 'Nieuwe aanbiedingen beschikbaar!',
      icon: data.icon || '/icon-512x512.png',
      badge: '/icon-192x192.png',
      tag: 'dealhunter-deals',
      renotify: true,
      data: { url: data.url || 'https://www.dealhunter4u.nl' },
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url || 'https://www.dealhunter4u.nl'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url === url && 'focus' in client) return client.focus()
      }
      return clients.openWindow(url)
    })
  )
})
