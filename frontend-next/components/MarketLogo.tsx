'use client'

interface Props {
  market: string
  size?: number
  className?: string
}

// Kare logolar — fill (cover)
const FILL_LOGOS: Record<string, string> = {
  'Albert Heijn': '/logo-ah.png',
  'Aldi':         '/logo-aldi.png',
  'Kruidvat':     '/logo-kruidvat.png',
  'Plus':         '/logo-plus.png',
}

// Yatay / geniş logolar — beyaz arka plan + contain + padding
const CONTAIN_LOGOS: Record<string, string> = {
  'Lidl':      '/logo-lidl.png',
  'Dirk':      '/logo-dirk.png',
  'Jumbo':     '/logo-jumbo.png',
  'DekaMarkt': '/logo-deka.png',
  'Hoogvliet': '/Hoogvliet_logo.png',
  'Vomar':     '/logo-vomar.png',
}

// Logo dosyası olmayan marketler için marka rengi
const FALLBACK_COLOR: Record<string, string> = {
  'Coop': '#003FA5',
}

export function MarketLogo({ market, size = 56, className = '' }: Props) {
  const r = Math.round(size * 0.22)

  const fillSrc    = market ? FILL_LOGOS[market]    : null
  const containSrc = market ? CONTAIN_LOGOS[market] : null

  // ── Kare logo: kırpılmadan fill ──────────────────────────────────────
  if (fillSrc) {
    return (
      <div
        className={className}
        style={{
          width: size, height: size,
          borderRadius: r,
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fillSrc}
          alt={market}
          width={size}
          height={size}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    )
  }

  // ── Yatay logo: beyaz kart + padding + contain ────────────────────────────
  if (containSrc) {
    const pad = Math.round(size * 0.12)
    return (
      <div
        className={className}
        style={{
          width: size, height: size,
          borderRadius: r,
          overflow: 'hidden',
          background: 'white',
          border: '1px solid rgba(0,0,0,0.07)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: pad,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={containSrc}
          alt={market}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        />
      </div>
    )
  }

  // ── Fallback: renkli kare + baş harfler ───────────────────────────────────
  const bg    = (market && FALLBACK_COLOR[market]) || '#6B6259'
  const label = market ? market.slice(0, 2).toUpperCase() : '?'
  return (
    <div
      className={className}
      style={{
        width: size, height: size,
        borderRadius: r,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <span style={{ color: 'white', fontWeight: 900, fontSize: Math.round(size * 0.35), lineHeight: 1 }}>
        {label}
      </span>
    </div>
  )
}
