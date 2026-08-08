const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://dealhunter-production-d900.up.railway.app'

export type TrackChannel = 'sponsor' | 'market' | 'flink' | 'blog' | 'share' | 'whatsapp'

/**
 * First-party tıklama takibi — GA4'e ek olarak (reklam engelleyicilerden
 * etkilenmez, EPC hesabı için doğrudan sorgulanabilir bkz. backend /api/track/stats).
 * navigator.sendBeacon kullanır: sayfa kapanırken (çıkış linki tıklaması) bile
 * garanti gönderilir — normal fetch() bu anda iptal olur.
 */
export function trackClick(channel: TrackChannel, target: string, dealId?: string): void {
  if (typeof window === 'undefined') return

  const payload = JSON.stringify({
    channel,
    target,
    dealId,
    page: window.location.pathname,
  })

  if (navigator.sendBeacon) {
    navigator.sendBeacon(`${API_BASE}/api/track`, payload)
  } else {
    fetch(`${API_BASE}/api/track`, { method: 'POST', body: payload, keepalive: true }).catch(() => {})
  }
}
