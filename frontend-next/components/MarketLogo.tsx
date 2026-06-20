'use client'
import Image from 'next/image'

interface Props {
  market: string
  size?: number
  className?: string
}

// Tam dolu (kare/kareye yakın) logolar — beyaz kenarlık olmadan fill edilir
const FILL_LOGOS: Record<string, string> = {
  'Albert Heijn': '/logo-ah.png',
  'Aldi':         '/logo-aldi.png',
  'Lidl':         '/logo-lidl.png',
  'Dirk':         '/logo-dirk.png',
  'Plus':         '/logo-plus.png',
  'Kruidvat':     '/logo-kruidvat.png',
}

// Yatay / geniş logolar — beyaz arka plan + object-contain + padding
const CONTAIN_LOGOS: Record<string, string> = {
  'Jumbo':     '/logo-jumbo.png',
  'DekaMarkt': '/logo-deka.png',
  'Hoogvliet': '/Hoogvliet_logo.png',
}

// Logo dosyası olmayan marketler için marka rengi
const FALLBACK_COLOR: Record<string, string> = {
  'Vomar': '#00843D',
  'Coop':  '#003FA5',
}

export function MarketLogo({ market, size = 56, className = '' }: Props) {
  const r = Math.round(size * 0.22)

  const fillSrc    = market ? FILL_LOGOS[market]    : null
  const containSrc = market ? CONTAIN_LOGOS[market] : null

  // ── Tam kare logo: kırpılmadan fill ──────────────────────────────────────
  if (fillSrc) {
    return (
      <div
        className={className}
        style={{
          width: size, height: size,
          borderRadius: r,
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <Image
          src={fillSrc}
          alt={market}
          fill
          sizes={`${size}px`}
          style={{ objectFit: 'cover' }}
          priority={size >= 40}
        />
      </div>
    )
  }

  // ── Yatay logo: beyaz kart + padding + contain ────────────────────────────
  if (containSrc) {
    const pad = Math.round(size * 0.1)
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
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <Image
            src={containSrc}
            alt={market}
            fill
            sizes={`${size}px`}
            style={{ objectFit: 'contain' }}
            priority={size >= 40}
          />
        </div>
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
