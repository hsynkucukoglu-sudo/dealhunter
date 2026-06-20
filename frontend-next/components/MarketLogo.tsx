import React from 'react'

interface Props {
  market: string
  size?: number
  className?: string
}

export function MarketLogo({ market, size = 56, className = '' }: Props) {
  const r = Math.round(size * 0.22)

  const logo = market ? LOGOS[market] : null
  if (!logo) {
    const label = market ? market.slice(0, 2).toUpperCase() : '?'
    return (
      <div
        className={className}
        style={{
          width: size, height: size, borderRadius: r,
          background: '#6B6259',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span style={{ color: 'white', fontWeight: 900, fontSize: size * 0.35 }}>
          {label}
        </span>
      </div>
    )
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ borderRadius: r, flexShrink: 0 }}
      aria-label={market}
      role="img"
    >
      {logo}
    </svg>
  )
}

/** SVG defs — her market için 56×56 viewBox */
const LOGOS: Record<string, React.ReactNode> = {

  // ── Albert Heijn ──────────────────────────────────────────────────────────
  'Albert Heijn': (
    <>
      <rect width="56" height="56" rx="12" fill="#00A0E2" />
      {/* AH blue star / shield shape */}
      <text x="28" y="38" textAnchor="middle"
        style={{ fontFamily: 'Arial, sans-serif', fontWeight: 900, fontSize: 26, fill: 'white', letterSpacing: -1 }}>
        ah
      </text>
    </>
  ),

  // ── Jumbo ──────────────────────────────────────────────────────────────────
  'Jumbo': (
    <>
      <rect width="56" height="56" rx="12" fill="#FFC60B" />
      <text x="28" y="35" textAnchor="middle"
        style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontWeight: 900, fontSize: 14, fill: '#1A1A1A', letterSpacing: 0.5 }}>
        JUMBO
      </text>
      {/* J accent */}
      <rect x="22" y="38" width="12" height="3" rx="1.5" fill="#1A1A1A" />
    </>
  ),

  // ── Lidl ───────────────────────────────────────────────────────────────────
  'Lidl': (
    <>
      <rect width="56" height="56" rx="12" fill="#0050AA" />
      {/* Outer yellow ring */}
      <circle cx="28" cy="28" r="22" fill="#F9E205" />
      {/* Inner red circle */}
      <circle cx="28" cy="28" r="16" fill="#E3001B" />
      {/* Inner blue circle */}
      <circle cx="28" cy="28" r="11" fill="#0050AA" />
      <text x="28" y="32.5" textAnchor="middle"
        style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontWeight: 900, fontSize: 9, fill: 'white', letterSpacing: 0.8 }}>
        LIDL
      </text>
    </>
  ),

  // ── Aldi ───────────────────────────────────────────────────────────────────
  'Aldi': (
    <>
      <rect width="56" height="56" rx="12" fill="#003A78" />
      <text x="28" y="35" textAnchor="middle"
        style={{ fontFamily: 'Arial, sans-serif', fontWeight: 900, fontSize: 20, fill: 'white', fontStyle: 'italic' }}>
        aldi
      </text>
      <rect x="10" y="38" width="36" height="2.5" rx="1.25" fill="#FF6B00" />
    </>
  ),

  // ── Dirk ───────────────────────────────────────────────────────────────────
  'Dirk': (
    <>
      <rect width="56" height="56" rx="12" fill="#E2001A" />
      <text x="28" y="36" textAnchor="middle"
        style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontWeight: 900, fontSize: 18, fill: 'white' }}>
        Dirk
      </text>
    </>
  ),

  // ── Hoogvliet ──────────────────────────────────────────────────────────────
  'Hoogvliet': (
    <>
      <rect width="56" height="56" rx="12" fill="#164194" />
      {/* Stylized H */}
      <rect x="14" y="15" width="5" height="26" rx="2" fill="white" />
      <rect x="23.5" y="24" width="9" height="5" rx="1.5" fill="white" />
      <rect x="37" y="15" width="5" height="26" rx="2" fill="white" />
      {/* Yellow accent dot */}
      <circle cx="42" cy="14" r="4" fill="#FFD700" />
    </>
  ),

  // ── Vomar ──────────────────────────────────────────────────────────────────
  'Vomar': (
    <>
      <rect width="56" height="56" rx="12" fill="#00843D" />
      <text x="28" y="35" textAnchor="middle"
        style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontWeight: 900, fontSize: 14, fill: 'white', letterSpacing: 1 }}>
        VOMAR
      </text>
      <rect x="14" y="38" width="28" height="2.5" rx="1.25" fill="rgba(255,255,255,0.4)" />
    </>
  ),

  // ── DekaMarkt ──────────────────────────────────────────────────────────────
  'DekaMarkt': (
    <>
      <rect width="56" height="56" rx="12" fill="#FF5A00" />
      <text x="28" y="30" textAnchor="middle"
        style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontWeight: 900, fontSize: 15, fill: 'white', letterSpacing: 0.5 }}>
        deka
      </text>
      <text x="28" y="44" textAnchor="middle"
        style={{ fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 9, fill: 'rgba(255,255,255,0.85)', letterSpacing: 1 }}>
        MARKT
      </text>
    </>
  ),

  // ── Coop ───────────────────────────────────────────────────────────────────
  'Coop': (
    <>
      <rect width="56" height="56" rx="12" fill="#003FA5" />
      {/* C shape */}
      <circle cx="28" cy="28" r="16" stroke="white" strokeWidth="5" fill="none" strokeDasharray="68 32" strokeDashoffset="-8" />
      <text x="28" y="33" textAnchor="middle"
        style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontWeight: 900, fontSize: 11, fill: 'white', letterSpacing: 1.5 }}>
        COOP
      </text>
    </>
  ),

  // ── Plus ───────────────────────────────────────────────────────────────────
  'Plus': (
    <>
      <rect width="56" height="56" rx="12" fill="#2D8B35" />
      {/* Plus cross */}
      <rect x="24" y="10" width="8" height="36" rx="3" fill="white" opacity="0.25" />
      <rect x="10" y="24" width="36" height="8" rx="3" fill="white" opacity="0.25" />
      <text x="28" y="35" textAnchor="middle"
        style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontWeight: 900, fontSize: 18, fill: 'white', letterSpacing: 0.5 }}>
        PLUS
      </text>
    </>
  ),

  // ── Kruidvat ───────────────────────────────────────────────────────────────
  'Kruidvat': (
    <>
      <rect width="56" height="56" rx="12" fill="#D50032" />
      {/* Leaf/plant motif */}
      <ellipse cx="28" cy="22" rx="10" ry="13" fill="rgba(255,255,255,0.15)" transform="rotate(-15 28 22)" />
      <ellipse cx="28" cy="22" rx="10" ry="13" fill="rgba(255,255,255,0.15)" transform="rotate(15 28 22)" />
      <text x="28" y="44" textAnchor="middle"
        style={{ fontFamily: 'Arial, sans-serif', fontWeight: 900, fontSize: 10, fill: 'white', letterSpacing: 0.5 }}>
        kruidvat
      </text>
    </>
  ),
}
