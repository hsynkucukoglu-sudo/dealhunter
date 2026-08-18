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

type TcData = {
  eventStatus?: string
  gdprApplies?: boolean
  purpose?: { consents?: Record<number, boolean> }
}

type ConsentWindow = Window & {
  gtag?: (...args: unknown[]) => void
  dataLayer?: unknown[]
  clarity?: (...args: unknown[]) => void
  __tcfapi?: (cmd: string, ver: number, cb: (tc: TcData, ok: boolean) => void) => void
}

// Funding Choices (Google's eigen CMP, cmpId 300) draait op deze site als
// TCF v2-CMP, maar gaf zijn toestemming NIET door aan Consent Mode: gemeten
// 2026-08-18 bleef dataLayer na "Alles accepteren" op ad_storage=denied staan.
// Bezoekers moesten daarna ook nog de eigen cookiebanner accepteren, anders
// bleven advertenties niet-gepersonaliseerd. Deze brug lost dat op.
function mapTcfToConsent(tc: TcData) {
  const ok = (n: number) => !!tc.purpose?.consents?.[n]
  return {
    ad_storage: ok(1) ? 'granted' : 'denied',
    ad_user_data: ok(1) ? 'granted' : 'denied',
    ad_personalization: ok(3) && ok(4) ? 'granted' : 'denied',
    analytics_storage: ok(1) && ok(8) ? 'granted' : 'denied',
  } as const
}

function setupTcfBridge() {
  const w = window as ConsentWindow
  let tries = 0

  const attach = () => {
    if (typeof w.__tcfapi !== 'function') return false
    w.__tcfapi('addEventListener', 2, (tc, ok) => {
      if (!ok || !tc) return
      // Bij gdprApplies === false toont Funding Choices niets; dan blijft de
      // eigen banner de enige toestemmingsvraag — daarom hier niets doen.
      if (tc.gdprApplies !== true) return

      // Zodra vaststaat dát er een CMP is, moet de eigen banner zich niet meer
      // laten zien — ook niet in de seconden dat de CMP-dialoog nog openstaat.
      window.dispatchEvent(new Event('cmp_active'))

      if (tc.eventStatus !== 'tcloaded' && tc.eventStatus !== 'useractioncomplete') return

      const consent = mapTcfToConsent(tc)
      w.gtag?.('consent', 'update', consent)

      // Clarity zet zijn _clck/_clsk-cookie pas na een expliciete consent-call.
      // Zonder deze regel is elke sessie een nieuwe bezoeker: 30 dagen lang
      // 619 sessies / 619 unieke gebruikers / 0 terugkerend (docs/clarity-takip.md).
      if (consent.analytics_storage === 'granted') {
        try { w.clarity?.('consent') } catch {}
      }

      // Hergebruik de bestaande plumbing zodat CookieBanner zich verbergt en de
      // WhatsApp-widget (ProductsPage) blijft werken zoals hij deed.
      try {
        localStorage.setItem('cookie_consent', consent.ad_storage === 'granted' ? 'accepted' : 'declined')
      } catch {}
      window.dispatchEvent(new Event('cookie_consent_resolved'))
    })
    return true
  }

  if (attach()) return
  const iv = setInterval(() => {
    if (attach() || ++tries > 40) clearInterval(iv)
  }, 250)
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
    if (consent === 'accepted') {
      try { (window as ConsentWindow).clarity?.('consent') } catch {}
    }
    loadAdSense()
    setupTcfBridge()

    const handler = () => {
      // 'update', niet nog een keer 'default': Consent Mode negeert een tweede
      // default-call, dus de toestemming uit de eigen banner kwam mogelijk
      // helemaal niet aan (gemeten 2026-08-18 in dataLayer).
      const w = window as ConsentWindow
      w.gtag?.('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted',
      })
      try { w.clarity?.('consent') } catch {}
    }
    window.addEventListener('cookie_consent_accepted', handler)
    return () => window.removeEventListener('cookie_consent_accepted', handler)
  }, [])

  return null
}
