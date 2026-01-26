// Service Worker for Push Notifications
self.addEventListener('push', function (event) {
    if (!event.data) return

    const data = event.data.json()
    const options = {
        body: data.body,
        icon: data.icon || '/icon-192.png',
        badge: data.badge || '/badge-72.png',
        vibrate: [200, 100, 200],
        data: data.data,
        actions: [
            { action: 'open', title: 'Open' },
            { action: 'close', title: 'Close' }
        ]
    }

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    )
})

self.addEventListener('notificationclick', function (event) {
    event.notification.close()

    if (event.action === 'open' || !event.action) {
        const urlToOpen = event.notification.data?.screen
            ? `/${event.notification.data.screen}`
            : '/'

        event.waitUntil(
            clients.openWindow(urlToOpen)
        )
    }
})
