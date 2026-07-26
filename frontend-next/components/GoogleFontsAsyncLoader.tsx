'use client'
import { useEffect } from 'react'

// Both Google Fonts stylesheets used to be plain <link rel="stylesheet"> in
// layout.tsx — render-blocking, and on Slow 4G (PSI mobile, 2026-07-26) that
// chain (fonts.googleapis.com CSS -> fonts.gstatic.com font files) measured
// as the likely cause of a 9.5s FCP / 13.7s LCP, unrelated to product images.
// layout.tsx keeps <link rel="preload" as="style"> hints (non-blocking, starts
// the fetch early); this component applies the actual stylesheet after mount
// so the browser paints with fallback fonts first instead of waiting on it.
const FONT_STYLESHEETS = [
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700;800&family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=block',
]

export function GoogleFontsAsyncLoader() {
  useEffect(() => {
    for (const href of FONT_STYLESHEETS) {
      if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) continue
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      document.head.appendChild(link)
    }
  }, [])

  return null
}
