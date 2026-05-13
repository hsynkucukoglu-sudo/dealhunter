import webpush from 'web-push'
import { getAllSubscriptions, deleteSubscription } from './db.js'

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL || 'info@dealhunter4u.nl'}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
)

async function sendToSubscription(sub, payload) {
  return webpush.sendNotification(sub, JSON.stringify(payload)).catch(async err => {
    if (err.statusCode === 410 || err.statusCode === 404) {
      await deleteSubscription(sub.endpoint)
    }
    throw err
  })
}

export async function sendPushToAll(payload, excludeEndpoints = new Set()) {
  const subscriptions = await getAllSubscriptions()
  const targets = excludeEndpoints.size
    ? subscriptions.filter(s => !excludeEndpoints.has(s.endpoint))
    : subscriptions
  if (!targets.length) return

  const results = await Promise.allSettled(targets.map(sub => sendToSubscription(sub, payload)))
  const sent = results.filter(r => r.status === 'fulfilled').length
  console.log(`🔔 Genel push: ${sent}/${targets.length}`)
}

export async function sendPushToSubscriptions(subscriptions, payload) {
  if (!subscriptions.length) return
  const results = await Promise.allSettled(subscriptions.map(sub => sendToSubscription(sub, payload)))
  const sent = results.filter(r => r.status === 'fulfilled').length
  console.log(`🎯 Hedefli push: ${sent}/${subscriptions.length}`)
}
