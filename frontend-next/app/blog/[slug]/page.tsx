import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPost, getAllPosts, getRelatedPosts } from '@/lib/posts'
import { EmbeddedDeals } from '@/components/EmbeddedDeals'
import { getCategoryStyle } from '@/lib/postImages'
import { buildBreadcrumbSchema, buildFaqSchema } from '@/lib/schema'
import { MARKETS } from '@/lib/types'
import { AdBanner } from '@/components/AdBanner'

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

  const relatedPosts = getRelatedPosts(post)
  const catStyle = getCategoryStyle(post.category)

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${post.slug}` },
  ])

  const faqSchema = post.faqs?.length ? buildFaqSchema(post.faqs) : null

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
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      {/* NAV */}
      <nav style={{ background: '#1A1A1A', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 900, fontSize: 20, fontFamily: 'Space Grotesk, sans-serif' }}>
          <span style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>Deal</span>Hunter<span style={{ background: '#C41230', padding: '2px 7px', borderRadius: 5, fontSize: 13, marginLeft: 6 }}>4U</span>
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>—</span>
        <Link href="/blog" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14 }}>Blog</Link>
      </nav>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Hero banner */}
        <div style={{
          borderRadius: 24,
          overflow: 'hidden',
          marginBottom: 32,
          height: 200,
          background: catStyle.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: -60, right: -60,
            width: 280, height: 280, borderRadius: '50%',
            background: catStyle.accent, opacity: 0.08,
          }} />
          <div style={{
            position: 'absolute', bottom: -40, left: -30,
            width: 180, height: 180, borderRadius: '50%',
            background: catStyle.accent, opacity: 0.06,
          }} />
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: 6, background: catStyle.accent,
          }} />
          <span style={{ fontSize: 72, lineHeight: 1, position: 'relative', zIndex: 1 }}>
            {catStyle.emoji}
          </span>
        </div>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ background: catStyle.accent, color: 'white', fontSize: 11, fontWeight: 900, padding: '3px 10px', borderRadius: 20, letterSpacing: 2, textTransform: 'uppercase' }}>
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

        {/* Reklam — başlık altı, okuyucu henüz engaged */}
        <AdBanner slot="7882410354" format="auto" className="mb-6" minHeight={280} />

        {/* Article body */}
        <div
          style={{ background: 'white', borderRadius: 20, padding: '36px 40px', boxShadow: '0 4px 0 #DDD0C4', border: '1px solid rgba(201,193,182,0.3)' }}
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Canlı deal embed (post'ta dealEmbed config varsa) */}
        {post.dealEmbed && <EmbeddedDeals config={post.dealEmbed} />}

        {/* Reklam — yazı gövdesinden sonra, in-content yerleşim */}
        <AdBanner slot="6629568666" format="auto" className="mt-8" minHeight={280} />

        {/* Market CTAs */}
        {(post.relatedMarkets?.length ?? 0) > 0 ? (
          <div style={{ marginTop: 32 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A', marginBottom: 12 }}>
              Bekijk actuele aanbiedingen bij:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {post.relatedMarkets!.map(slug => {
                const market = MARKETS.find(m => m.slug === slug)
                if (!market || (market as { hidden?: boolean }).hidden) return null
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

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A', marginBottom: 16 }}>
              Lees ook
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {relatedPosts.map(related => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  style={{
                    display: 'block', borderRadius: 16, padding: '16px 20px',
                    background: 'white', border: '1.5px solid #E0D8CE', textDecoration: 'none',
                  }}
                >
                  <span style={{
                    display: 'inline-block', fontSize: 10, fontWeight: 900,
                    padding: '3px 10px', borderRadius: 20, marginBottom: 8,
                    background: '#E33D26', color: 'white', letterSpacing: 1, textTransform: 'uppercase',
                  }}>
                    {related.category}
                  </span>
                  <p style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.4, color: '#1A1A1A', marginBottom: 6 }}>
                    {related.title}
                  </p>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#E33D26' }}>Lees meer →</span>
                </Link>
              ))}
            </div>
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
