import React from 'react'

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="DealhunterMarket Logo"
    >
      {/* Background circle with gradient */}
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF7A14" />
          <stop offset="100%" stopColor="#7B4FFF" />
        </linearGradient>
        <linearGradient id="tag-grad" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF9643" />
          <stop offset="100%" stopColor="#E86400" />
        </linearGradient>
      </defs>

      {/* Outer rounded square */}
      <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#logo-grad)" />

      {/* Shopping bag body */}
      <path
        d="M14 18h20l-2 18H16L14 18z"
        fill="white"
        fillOpacity="0.95"
      />

      {/* Bag handle */}
      <path
        d="M19 18v-3a5 5 0 0 1 10 0v3"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Price tag */}
      <circle cx="35" cy="13" r="7" fill="url(#tag-grad)" stroke="white" strokeWidth="1.5" />
      <text x="35" y="16.5" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="Outfit, sans-serif">%</text>

      {/* Star accent */}
      <path
        d="M10 12l1.2 2.4 2.8.4-2 2 .5 2.6L10 18.2 7.5 19.4l.5-2.6-2-2 2.8-.4L10 12z"
        fill="#FFD700"
        fillOpacity="0.9"
      />
    </svg>
  )
}
