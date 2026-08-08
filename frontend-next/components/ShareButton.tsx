'use client'
import React, { useState } from 'react'
import { trackClick } from '@/lib/track'

interface ShareButtonProps {
  /** Titel die in het native deelvenster verschijnt */
  title: string
  /** Begeleidende tekst — het OS plakt dit voor de URL */
  text: string
  /** Absolute URL; een relatief pad werkt niet in het deelvenster */
  url: string
  /** Label voor first-party klikregistratie (backend /api/track) */
  target: string
  variant?: 'icon' | 'full'
  label?: string
}

/**
 * Deelknop. 69% van het verkeer is mobiel, dus de primaire route is het native
 * deelvenster (navigator.share) — daar zit WhatsApp al in, en dat is het enige
 * sociale kanaal dat bij ons echt loopt. Desktop-browsers zonder deelvenster
 * vallen terug op "link kopiëren"; bewust geen eigen popover-menu, dat zou in
 * de productkaart (overflow-hidden) afgeknipt worden.
 */
export function ShareButton({ title, text, url, target, variant = 'icon', label = 'Delen' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    trackClick('share', target)

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url })
        return
      } catch {
        // Gebruiker annuleerde (AbortError) of het OS weigerde — val terug op kopiëren
      }
    }

    try {
      await navigator.clipboard.writeText(`${text} ${url}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard kan geblokkeerd zijn (onveilige context) — stil laten, geen kapotte UI
    }
  }

  if (variant === 'full') {
    return (
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer hover:bg-black/5"
        style={{ background: 'white', border: '1.5px solid #E0D8CE', color: '#6B6259' }}
        aria-label={`${title} delen`}
      >
        <span className="material-symbols-outlined text-base" aria-hidden="true">
          {copied ? 'check' : 'ios_share'}
        </span>
        {copied ? 'Link gekopieerd' : label}
      </button>
    )
  }

  return (
    <button
      onClick={handleShare}
      className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
      style={{ background: 'rgba(255,255,255,0.9)' }}
      aria-label={copied ? 'Link gekopieerd' : `${title} delen`}
    >
      <span
        className="material-symbols-outlined text-base"
        aria-hidden="true"
        style={{ color: copied ? '#1B9E4B' : '#8C8478' }}
      >
        {copied ? 'check' : 'ios_share'}
      </span>
    </button>
  )
}
