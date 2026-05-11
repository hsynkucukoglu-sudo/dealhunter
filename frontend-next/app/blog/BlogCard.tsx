'use client'

import Link from 'next/link'

interface BlogCardProps {
  slug: string
  category: string
  date: string
  readTime: number
  title: string
  description: string
}

export default function BlogCard({ slug, category, date, readTime, title, description }: BlogCardProps) {
  return (
    <Link href={`/blog/${slug}`} style={{ textDecoration: 'none' }}>
      <article
        style={{
          background: 'white',
          borderRadius: 20,
          padding: '28px 32px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ background: '#F0EBE5', color: '#6B6259', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: 1 }}>
            {category}
          </span>
          <span style={{ color: '#C9C1B6', fontSize: 13 }}>
            {new Date(date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <span style={{ color: '#C9C1B6', fontSize: 13 }}>· {readTime} min lezen</span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1A1A1A', marginBottom: 10, lineHeight: 1.3, fontFamily: 'Playfair Display, Georgia, serif' }}>
          {title}
        </h2>
        <p style={{ color: '#6B6259', fontSize: 15, lineHeight: 1.65, margin: 0 }}>
          {description}
        </p>
        <div style={{ marginTop: 16, color: '#E33D26', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
          Lees meer →
        </div>
      </article>
    </Link>
  )
}
