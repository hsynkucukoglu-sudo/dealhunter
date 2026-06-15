'use client'
import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getMarketDestination, isAllowedAffiliateUrl } from '@/lib/affiliate'

const MARKET_COLORS: Record<string, string> = {
  'Albert Heijn': '#00A0E2',
  'Jumbo':        '#FFD700',
  'Lidl':         '#0050AA',
  'Dirk':         '#C8102E',
  'Aldi':         '#00205B',
  'Hoogvliet':    '#E30613',
  'Vomar':        '#FF6600',
  'DekaMarkt':    '#006633',
  'Coop':         '#007B5E',
}

function GoInner() {
  const params = useSearchParams()
  const market = params.get('m') ?? ''
  const product = params.get('p') ?? ''
  const customUrl = params.get('u')

  // Özel affiliate URL'i yalnızca onaylı host listesindeyse kullan (open-redirect koruması),
  // yoksa market'in merkezi (gerekirse tracking'e sarılmış) linkine düş.
  const destination = (customUrl && isAllowedAffiliateUrl(customUrl))
    ? customUrl
    : getMarketDestination(market)

  const [countdown, setCountdown] = useState(3)
  const redirected = useRef(false)

  useEffect(() => {
    if (!destination) return

    // GA4 event
    try {
      // @ts-ignore
      if (typeof gtag !== 'undefined') gtag('event', 'deal_redirect', { market, product })
    } catch {}

    // Capacitor uygulaması: harici market sitesi WebView içinde açılamaz (allowNavigation'da yok).
    // Sistem tarayıcısında (Chrome Custom Tab) aç, sonra WebView'ı ana sayfaya geri al.
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
    if (cap?.isNativePlatform?.()) {
      redirected.current = true
      ;(async () => {
        try {
          const { Browser } = await import('@capacitor/browser')
          await Browser.open({ url: destination })
        } catch {
          window.location.href = destination
          return
        }
        window.location.replace('/')
      })()
      return
    }

    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timer)
          if (!redirected.current) {
            redirected.current = true
            window.location.href = destination
          }
          return 0
        }
        return c - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [destination, market, product])

  if (!destination) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5EDE3' }}>
        <div style={{ textAlign: 'center', padding: 32 }}>
          <p style={{ color: '#E33D26', fontWeight: 700, fontSize: 18 }}>Ongeldige link</p>
          <a href="/" style={{ color: '#1A1A1A', textDecoration: 'underline', fontSize: 14 }}>Terug naar DealHunter4U</a>
        </div>
      </div>
    )
  }

  const color = MARKET_COLORS[market] ?? '#E33D26'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5EDE3' }}>
      <div style={{ textAlign: 'center', padding: '48px 32px', maxWidth: 420 }}>
        {/* Spinner */}
        <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 28px' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            border: `4px solid rgba(0,0,0,0.08)`,
            borderTopColor: color,
            animation: 'spin 0.9s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>

        <p style={{ fontSize: 13, fontWeight: 700, color: '#9C9389', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
          Even geduld
        </p>

        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#1A1A1A', marginBottom: 8, fontFamily: 'Space Grotesk, sans-serif' }}>
          We sturen je door naar <span style={{ color }}>{market}</span>
        </h1>

        {product && (
          <p style={{ fontSize: 14, color: '#6B6259', marginBottom: 20 }}>
            {product}
          </p>
        )}

        <p style={{ fontSize: 13, color: '#C9C1B6', marginBottom: 28 }}>
          Automatisch doorgestuurd over {countdown} seconde{countdown !== 1 ? 'n' : ''}…
        </p>

        {/* FOMO */}
        <div style={{
          background: '#FFF8F0', border: '1px solid #FFD580',
          borderRadius: 12, padding: '12px 20px', marginBottom: 24,
          fontSize: 13, color: '#7A5400', fontWeight: 600,
        }}>
          🔥 Deze aanbieding verloopt binnenkort — sla je slag!
        </div>

        <a
          href={destination}
          style={{ fontSize: 13, color: color, fontWeight: 700, textDecoration: 'underline' }}
        >
          Klik hier als je niet automatisch wordt doorgestuurd →
        </a>
      </div>
    </div>
  )
}

export function GoContent() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5EDE3' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '4px solid rgba(0,0,0,0.08)', borderTopColor: '#E33D26', animation: 'spin 0.9s linear infinite' }} />
      </div>
    }>
      <GoInner />
    </Suspense>
  )
}
