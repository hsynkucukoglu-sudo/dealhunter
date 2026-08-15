'use client'
import { useEffect } from 'react'

// 2026-08-15: 6266103134639533 hersteld naar 4113343151276849. Dat laatste is
// het echte, in behandeling zijnde AdSense-account (welkomstmail 1 mei, "bijna
// geactiveerd" 13 mei, "kleine correcties nodig" 26 mei — Gmail-geschiedenis).
// Het andere ID heeft geen enkel spoor in die geschiedenis. Commit b4a2fb4
// (27 mei, exact 1 dag na de "correcties nodig"-mail) verving het echte ID
// door dit spooknummer in AdSenseScript.tsx — vermoedelijk een eerdere
// agent-fout. Een ads.txt/site die een ander account claimt dan het account
// in beoordeling is een harde, mechanische blokkade voor goedkeuring, los van
// contentkwaliteit — dit verklaart mogelijk de aanhoudende afwijzing beter dan
// de content-theorieën die deze hele sessie zijn onderzocht.
const CLIENT_ID = 'ca-pub-4113343151276849'

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
