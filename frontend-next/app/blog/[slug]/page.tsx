import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPost, getAllPosts } from '@/lib/posts'
import { buildBreadcrumbSchema } from '@/lib/schema'
import { MARKETS } from '@/lib/types'

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} | DealHunter4U`,
    description: post.description,
    alternates: { canonical: `https://www.dealhunter4u.nl/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://www.dealhunter4u.nl/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      authors: ['DealHunter4U'],
      images: [
        {
          url: 'https://www.dealhunter4u.nl/icon-512x512.png',
          width: 512,
          height: 512,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: post.title,
      description: post.description,
      images: ['https://www.dealhunter4u.nl/icon-512x512.png'],
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${post.slug}` },
  ])

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: 'https://www.dealhunter4u.nl/icon-512x512.png',
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: 'DealHunter4U', url: 'https://www.dealhunter4u.nl' },
    publisher: {
      '@type': 'Organization',
      name: 'DealHunter4U',
      logo: { '@type': 'ImageObject', url: 'https://www.dealhunter4u.nl/icon-512x512.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://www.dealhunter4u.nl/blog/${post.slug}` },
  }

  return (
    <div style={{ background: '#F5EDE3', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      {/* NAV */}
      <nav style={{ background: '#1A1A1A', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 900, fontSize: 20, fontFamily: 'Space Grotesk, sans-serif' }}>
          <span style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>Deal</span>Hunter<span style={{ background: '#C41230', padding: '2px 7px', borderRadius: 5, fontSize: 13, marginLeft: 6 }}>4U</span>
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>—</span>
        <Link href="/blog" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14 }}>Blog</Link>
      </nav>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ background: '#E33D26', color: 'white', fontSize: 11, fontWeight: 900, padding: '3px 10px', borderRadius: 20, letterSpacing: 2, textTransform: 'uppercase' }}>
            {post.category}
          </span>
          <span style={{ color: '#9C9389', fontSize: 13 }}>
            {new Date(post.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <span style={{ color: '#9C9389', fontSize: 13 }}>· {post.readTime} min lezen</span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          fontWeight: 900, color: '#1A1A1A',
          lineHeight: 1.15, marginBottom: 24,
          fontFamily: 'Playfair Display, Georgia, serif',
          letterSpacing: '-0.02em',
        }}>
          {post.title}
        </h1>

        {/* Article body */}
        <div
          style={{ background: 'white', borderRadius: 20, padding: '36px 40px', boxShadow: '0 4px 0 #DDD0C4', border: '1px solid rgba(201,193,182,0.3)' }}
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Market CTAs */}
        {(post.relatedMarkets?.length ?? 0) > 0 ? (
          <div style={{ marginTop: 32 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A', marginBottom: 12 }}>
              Bekijk actuele aanbiedingen bij:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {post.relatedMarkets!.map(slug => {
                const market = MARKETS.find(m => m.slug === slug)
                if (!market) return null
                return (
                  <Link key={slug} href={`/supermarkt/${slug}`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 18px', borderRadius: 30, textDecoration: 'none',
                    fontWeight: 700, fontSize: 14, background: '#1A1A1A', color: 'white',
                    borderLeft: `4px solid ${market.color}`,
                  }}>
                    {market.name} aanbiedingen →
                  </Link>
                )
              })}
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 32, padding: '28px 32px', background: '#1A1A1A', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ color: 'white', fontWeight: 900, fontSize: 17, marginBottom: 4 }}>Klaar om te besparen?</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Bekijk de actuele aanbiedingen van alle supermarkten.</p>
            </div>
            <Link href="/" style={{
              background: '#E33D26', color: 'white',
              padding: '12px 24px', borderRadius: 30, textDecoration: 'none',
              fontWeight: 900, fontSize: 14, letterSpacing: 1, whiteSpace: 'nowrap',
            }}>
              Bekijk alle deals →
            </Link>
          </div>
        )}

        {/* Back */}
        <div style={{ marginTop: 24 }}>
          <Link href="/blog" style={{ color: '#6B6259', textDecoration: 'none', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Terug naar het blog
          </Link>
        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: '32px 24px', borderTop: '1px solid #F0E6DE', fontSize: 13, color: '#888' }}>
        <div style={{ marginBottom: 12 }}>
          <Link href="/privacy" style={{ color: '#E33D26', textDecoration: 'none', marginRight: 24 }}>Privacybeleid</Link>
          <Link href="/contact" style={{ color: '#E33D26', textDecoration: 'none', marginRight: 24 }}>Contact</Link>
          <Link href="/blog" style={{ color: '#E33D26', textDecoration: 'none' }}>Blog</Link>
        </div>
        <div>© {new Date().getFullYear()} DealHunter4U — Alle supermarkt aanbiedingen op één plek</div>
      </footer>
    </div>
  )
}
