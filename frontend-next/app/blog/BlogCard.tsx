'use client'

import Link from 'next/link'
import { getCategoryStyle } from '@/lib/postImages'

interface BlogCardProps {
  slug: string
  category: string
  date: string
  readTime: number
  title: string
  description: string
}

export default function BlogCard({ slug, category, date, readTime, title, description }: BlogCardProps) {
  const style = getCategoryStyle(category)

  return (
    <Link href={`/blog/${slug}`} style={{ textDecoration: 'none' }}>
      <article
        style={{
          background: 'white',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 4px 0 #DDD0C4',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          cursor: 'pointer',
          border: '1px solid rgba(201,193,182,0.3)',
        }}
        onMouseEnter={e => {
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 0 #DDD0C4'
        }}
        onMouseLeave={e => {
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 0 #DDD0C4'
        }}
      >
        {/* Thumbnail */}
        <div style={{
          height: 140,
          background: style.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decoratieve cirkel achtergrond */}
          <div style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: style.accent,
            opacity: 0.08,
          }} />
          <div style={{
            position: 'absolute',
            bottom: -30,
            left: -20,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: style.accent,
            opacity: 0.06,
          }} />
          {/* Accent streep */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background: style.accent,
          }} />
          {/* Emoji */}
          <span style={{ fontSize: 52, lineHeight: 1, position: 'relative', zIndex: 1 }}>
            {style.emoji}
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{
              background: style.accent,
              color: 'white',
              fontSize: 10,
              fontWeight: 900,
              padding: '3px 10px',
              borderRadius: 20,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
              {category}
            </span>
            <span style={{ color: '#C9C1B6', fontSize: 12 }}>
              {new Date(date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span style={{ color: '#C9C1B6', fontSize: 12 }}>· {readTime} min</span>
          </div>
          <h2 style={{
            fontSize: 20,
            fontWeight: 900,
            color: '#1A1A1A',
            marginBottom: 8,
            lineHeight: 1.3,
            fontFamily: 'Playfair Display, Georgia, serif',
          }}>
            {title}
          </h2>
          <p style={{ color: '#6B6259', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            {description.slice(0, 100)}{description.length > 100 ? '…' : ''}
          </p>
          <div style={{ marginTop: 14, color: style.accent, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            Lees meer →
          </div>
        </div>
      </article>
    </Link>
  )
}
