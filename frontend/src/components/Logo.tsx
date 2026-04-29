import React from 'react'

const GREEN = '#8DB88D'

export function Logo({ size = 40 }: { size?: number }) {
  const h = size
  const w = size * 2.8

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 280 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="DealHunter Logo"
    >
      {/* "Deal" text */}
      <text
        x="88"
        y="68"
        textAnchor="end"
        fontFamily="'Space Grotesk', 'Inter', sans-serif"
        fontWeight="700"
        fontSize="52"
        fill={GREEN}
        letterSpacing="-1"
      >
        Deal
      </text>

      {/* Center circle */}
      <circle cx="140" cy="50" r="44" fill={GREEN} />

      {/* Cart body */}
      <rect x="122" y="36" width="28" height="22" rx="3" fill="#F5EDE3" />
      {/* Cart handle */}
      <path d="M118 32 L122 36" stroke="#F5EDE3" strokeWidth="3" strokeLinecap="round" />
      {/* Cart wheels */}
      <circle cx="127" cy="62" r="4" fill="#F5EDE3" />
      <circle cx="145" cy="62" r="4" fill="#F5EDE3" />
      {/* Cart lines */}
      <line x1="126" y1="42" x2="146" y2="42" stroke={GREEN} strokeWidth="2" strokeLinecap="round" />
      <line x1="126" y1="47" x2="146" y2="47" stroke={GREEN} strokeWidth="2" strokeLinecap="round" />

      {/* Circular arrow beneath cart (refresh arc) */}
      <path
        d="M118 72 A22 22 0 0 0 162 72"
        stroke="#F5EDE3"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <polyline points="162,66 162,74 170,70" fill="#F5EDE3" stroke="#F5EDE3" strokeWidth="1" strokeLinejoin="round" />
      <polyline points="118,78 118,70 110,74" fill="#F5EDE3" stroke="#F5EDE3" strokeWidth="1" strokeLinejoin="round" />

      {/* "Hunter" text */}
      <text
        x="192"
        y="68"
        textAnchor="start"
        fontFamily="'Space Grotesk', 'Inter', sans-serif"
        fontWeight="700"
        fontSize="52"
        fill={GREEN}
        letterSpacing="-1"
      >
        Hunter
      </text>
    </svg>
  )
}
