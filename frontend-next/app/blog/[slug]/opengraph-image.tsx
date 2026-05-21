import { ImageResponse } from 'next/og'
import { getPost, getAllPosts } from '@/lib/posts'

export const runtime = 'edge'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }))
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)

  const title = post?.title ?? 'DealHunter4U Blog'
  const category = post?.category ?? 'Tips'

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#F5EDE3',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px 100px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Achtergrond accenten */}
        <div style={{
          position: 'absolute',
          top: -100,
          right: -60,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'rgba(227,61,38,0.07)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -80,
          left: -40,
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'rgba(212,168,85,0.09)',
          display: 'flex',
        }} />

        {/* Brand header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 40,
        }}>
          <div style={{
            fontSize: 22,
            fontWeight: 900,
            color: '#1A1A1A',
            display: 'flex',
          }}>
            DealHunter<span style={{
              background: '#C41230',
              color: 'white',
              padding: '2px 8px',
              borderRadius: 6,
              fontSize: 16,
              marginLeft: 4,
            }}>4U</span>
          </div>
          <span style={{ color: 'rgba(0,0,0,0.2)', fontSize: 20, display: 'flex' }}>—</span>
          <div style={{
            background: '#E33D26',
            color: 'white',
            fontSize: 13,
            fontWeight: 900,
            padding: '5px 14px',
            borderRadius: 20,
            letterSpacing: 2,
            textTransform: 'uppercase',
            display: 'flex',
          }}>
            {category}
          </div>
        </div>

        {/* Artikel titel */}
        <div style={{
          fontSize: title.length > 60 ? 52 : title.length > 40 ? 62 : 72,
          fontWeight: 900,
          color: '#1A1A1A',
          lineHeight: 1.1,
          maxWidth: 900,
          display: 'flex',
          flexWrap: 'wrap',
        }}>
          {title}
        </div>

        {/* Footer bar */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 8,
          background: '#E33D26',
          display: 'flex',
        }} />

        {/* URL badge */}
        <div style={{
          position: 'absolute',
          bottom: 40,
          right: 100,
          background: '#1A1A1A',
          color: 'white',
          fontSize: 18,
          fontWeight: 700,
          padding: '10px 24px',
          borderRadius: 30,
          display: 'flex',
        }}>
          dealhunter4u.nl/blog
        </div>
      </div>
    ),
    { ...size }
  )
}
