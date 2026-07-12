'use client'
import React from 'react'
import { getAffiliateLink } from '@/lib/affiliate'

declare function gtag(...args: unknown[]): void

const FLINK_PINK = '#E31C79'

/**
 * Niyet-uyumlu affiliate kartı: market sayfası ziyaretçisi zaten boodschappen
 * niyetiyle geliyor — Flink (komisyonlu) bezorging tam eşleşme.
 * Bkz. docs/ctr-takip.md monetizasyon analizi (2026-07-12).
 */
export function FlinkDeliveryCard({ marketName }: { marketName: string }) {
  const flink = getAffiliateLink('Flink')
  if (!flink) return null

  return (
    <a
      href={flink.url}
      target="_blank"
      rel={flink.rel}
      onClick={() => {
        if (typeof gtag !== 'undefined') gtag('event', 'affiliate_click', { affiliate_name: 'Flink', affiliate_category: 'bezorging', source_page: marketName })
      }}
      className="flex items-center gap-3 mb-6 p-3 pr-4 rounded-2xl w-fit max-w-full transition-all hover:shadow-md"
      style={{ background: 'white', border: '1.5px solid #E0D8CE', textDecoration: 'none' }}
    >
      <span
        className="flex-none flex items-center justify-center w-9 h-9 rounded-xl text-lg"
        style={{ background: 'rgba(227,28,121,0.1)' }}
        aria-hidden
      >
        🛵
      </span>
      <span className="text-sm leading-snug" style={{ color: '#6B6259' }}>
        Geen tijd om naar {marketName} te gaan?{' '}
        <strong style={{ color: '#1A1A1A' }}>Boodschappen in minuten thuisbezorgd</strong>
      </span>
      <span className="flex-none text-sm font-bold whitespace-nowrap" style={{ color: FLINK_PINK }}>
        Bekijk Flink →
      </span>
    </a>
  )
}
