import webpush from 'web-push'
import { getAllSubscriptions, deleteSubscription } from './db.js'

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL || 'info@dealhunter4u.nl'}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
)

export async function sendPushToAll(payload) {
  const subscriptions = await getAllSubscriptions()
  if (!subscriptions.length) return

  const results = await Promise.allSettled(
    subscriptions.map(sub =>
      webpush.sendNotification(sub, JSON.stringify(payload)).catch(async err => {
        // 410 Gone = abonelik iptal edilmiş, sil
        if (err.statusCode === 410 || err.statusCode === 404) {
          await deleteSubscription(sub.endpoint)
        }
        throw err
      })
    )
  )

  const sent = results.filter(r => r.status === 'fulfilled').length
  console.log(`🔔 Push gönderildi: ${sent}/${subscriptions.length}`)
}
