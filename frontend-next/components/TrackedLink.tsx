'use client'
import React from 'react'
import { trackClick, type TrackChannel } from '@/lib/track'

interface Props {
  href: string
  channel: TrackChannel
  target: string // 'bol.com', 'albert-heijn', 'flink'...
  dealId?: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

/** Basit çıkış linkleri için hazır sarmalayıcı — trackClick() + doğru rel etiketi. */
export function TrackedLink({ href, channel, target, dealId, className, style, children }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow sponsored noopener"
      className={className}
      style={style}
      onClick={() => trackClick(channel, target, dealId)}
    >
      {children}
    </a>
  )
}
