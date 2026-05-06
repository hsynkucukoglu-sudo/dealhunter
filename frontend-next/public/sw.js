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
