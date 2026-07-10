'use client'
import React, { useEffect, useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://dealhunter-production-d900.up.railway.app'

interface PricePoint {
  price: number
  originalPrice: number
  week: string
}

function Sparkline({ data, currentPrice }: { data: PricePoint[]; currentPrice: number }) {
  if (data.length < 2) return null

  const W = 200
  const H = 60
  const pad = 8

  const prices = data.map(d => d.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1

  const x = (i: number) => pad + (i / (data.length - 1)) * (W - pad * 2)
  const y = (p: number) => H - pad - ((p - min) / range) * (H - pad * 2)

  const points = data.map((d, i) => `${x(i)},${y(d.price)}`).join(' ')
  const isLowest = currentPrice <= min + 0.01

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      {/* Area fill */}
      <defs>
        <linearGradient id="phGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isLowest ? '#1B9E4B' : '#E33D26'} stopOpacity="0.15" />
          <stop offset="100%" stopColor={isLowest ? '#1B9E4B' : '#E33D26'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`${x(0)},${H} ${points} ${x(data.length - 1)},${H}`}
        fill="url(#phGrad)"
      />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={isLowest ? '#1B9E4B' : '#E33D26'}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Dots */}
      {data.map((d, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(d.price)}
          r={i === data.length - 1 ? 3.5 : 2}
          fill={i === data.length - 1 ? (isLowest ? '#1B9E4B' : '#E33D26') : 'white'}
          stroke={isLowest ? '#1B9E4B' : '#E33D26'}
          strokeWidth="1.5"
        />
      ))}
    </svg>
  )
}

export function PriceHistoryChart({ name, market, currentPrice }: {
  name: string
  market: string
  currentPrice: number
}) {
  const [data, setData] = useState<PricePoint[] | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open || data !== null) return
    fetch(`${API_BASE}/api/price-history?name=${encodeURIComponent(name)}&market=${encodeURIComponent(market)}`)
      .then(r => r.json())
      .then((rows: PricePoint[]) => setData(rows))
      .catch(() => setData([]))
  }, [open, name, market, data])

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          fontSize: 11,
          color: '#9C9389',
          fontFamily: 'JetBrains Mono',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <span style={{ fontSize: 12 }}>📈</span> Prijsgeschiedenis
      </button>
    )
  }

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#1A1A1A', fontFamily: 'Space Grotesk' }}>
          Prijsgeschiedenis
        </span>
        <button
          onClick={() => setOpen(false)}
          style={{ fontSize: 11, color: '#9C9389', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          ✕
        </button>
      </div>

      {data === null && (
        <p style={{ fontSize: 11, color: '#9C9389', fontFamily: 'JetBrains Mono' }}>Laden…</p>
      )}

      {data !== null && data.length < 2 && (
        <p style={{ fontSize: 11, color: '#9C9389', fontFamily: 'JetBrains Mono' }}>
          Nog niet genoeg data
        </p>
      )}

      {data !== null && data.length >= 2 && (
        <>
          <Sparkline data={data} currentPrice={currentPrice} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <span style={{ fontSize: 10, color: '#9C9389', fontFamily: 'JetBrains Mono' }}>
              {new Date(data[0].week).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
            </span>
            <span style={{ fontSize: 10, color: '#9C9389', fontFamily: 'JetBrains Mono' }}>
              Nu
            </span>
          </div>
          <p style={{ fontSize: 10, color: '#9C9389', fontFamily: 'JetBrains Mono', marginTop: 4 }}>
            {data.length} weken data · laagste €{Math.min(...data.map(d => d.price)).toFixed(2).replace('.', ',')}
          </p>
        </>
      )}
    </div>
  )
}
