'use client'
import { useEffect } from 'react'

// 2026-08-15: kort teruggezet naar 4113343151276849 op basis van Gmail-historie
// alleen (geen spoor van 6266103134639533 in de mailbox) — DIRECT teruggedraaid
// nadat de eigenaar bevestigde dat AdSense onder 6266103134639533 al actief is.
// Les: e-mailgeschiedenis bewijst niet welk account actief is in het AdSense-
// dashboard; dat had eerst gevraagd moeten worden in plaats van uit afwezigheid
// van bewijs te concluderen. Blijf bij dit ID tenzij de accounteigenaar zelf
// een wijziging bevestigt.
const CLIENT_ID = 'ca-pub-6266103134639533'

function initConsentMode(hasConsent: boolean) {
  // Google Consent Mode v2 — always called before adsbygoogle loads
  const w = window as Window & { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] }
  w.dataLayer = w.dataLayer || []
  w.gtag = function (...args: unknown[]) { w.dataLayer!.push(args) }
  w.gtag('consent', 'default', {
    ad_storage: hasConsent ? 'granted' : 'denied',
    ad_user_data: hasConsent ? 'granted' : 'denied',
    ad_personalization: hasConsent ? 'granted' : 'denied',
    analytics_storage: hasConsent ? 'granted' : 'denied',
  })
}

function loadAdSense() {
  if (document.querySelector('script[src*="pagead2"]')) return
  const script = document.createElement('script')
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT_ID}`
  script.async = true
  script.crossOrigin = 'anonymous'
  document.head.appendChild(script)
}

export function AdSenseScript() {
  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    // Always load AdSense — consent mode controls personalization, not script loading
    // Without this, Google's review bots see no ads and review stalls indefinitely
    initConsentMode(consent === 'accepted')
    loadAdSense()

    const handler = () => {
      initConsentMode(true)
    }
    window.addEventListener('cookie_consent_accepted', handler)
    return () => window.removeEventListener('cookie_consent_accepted', handler)
  }, [])

  return null
}
