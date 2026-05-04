'use client'
import { useEffect } from 'react'

const CLIENT_ID = 'ca-pub-4113343151276849'

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
    if (localStorage.getItem('cookie_consent') === 'accepted') {
      loadAdSense()
    }

    const handler = () => loadAdSense()
    window.addEventListener('cookie_consent_accepted', handler)
    return () => window.removeEventListener('cookie_consent_accepted', handler)
  }, [])

  return null
}
