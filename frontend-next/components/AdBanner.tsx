'use client'
import { useEffect, useRef } from 'react'

type AdFormat = 'auto' | 'fluid' | 'rectangle' | 'horizontal'

interface AdBannerProps {
  slot: string
  format?: AdFormat
  className?: string
  minHeight?: number
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export function AdBanner({ slot, format = 'auto', className = '', minHeight = 280 }: AdBannerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const adRef = useRef<HTMLModElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const push = () => {
      if (initialized.current) return
      initialized.current = true
      try {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch {}
    }

    // adsbygoogle okur push() anında ins'in üst konteynerinin render genişliğini;
    // o an 0 ise (kapalı drawer/tab, henüz layout oturmamış flex/grid atası) "No
    // slot size for availableWidth=0" hatası atıyor ve slot bir daha kurtulmuyor
    // (Clarity'de 2026-08-26 tespit edildi). Gerçek bir genişlik oluşana kadar bekle.
    if (wrapper.offsetWidth > 0) {
      push()
      return
    }
    const observer = new ResizeObserver((entries) => {
      if (entries[0]?.contentRect.width > 0) {
        observer.disconnect()
        push()
      }
    })
    observer.observe(wrapper)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={wrapperRef}
      className={`adsense-wrapper text-center ${className}`}
      style={{ minHeight }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-6266103134639533"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
