import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'

export const metadata: Metadata = {
  title: 'Blog — Bespaartips & Supermarkt Aanbiedingen | DealHunter4U',
  description: 'Tips om te besparen op boodschappen, supermarkt vergelijkingen en het laatste nieuws over aanbiedingen in Nederland.',
  keywords: 'bespaartips boodschappen, supermarkt aanbiedingen vergelijken, goedkoop boodschappen doen, albert heijn jumbo lidl',
  openGraph: {
    title: 'Blog — Bespaartips & Supermarkt Aanbiedingen',
    description: 'Tips om te besparen op boodschappen en supermarkt vergelijkingen.',
    url: 'https://dealhunter4u.nl/blog',
    type: 'website',
  },
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div style={{ background: '#F5EDE3', minHeight: '100vh' }}>
      {/* NAV */}
      <nav style={{ background: '#1A1A1A', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 900, fontSize: 20, fontFamily: 'Space Grotesk, sans-serif' }}>
          <span style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>Deal</span>Hunter<span style={{ background: '#C41230', padding: '2px 7px', borderRadius: 5, fontSize: 13, marginLeft: 6 }}>4U</span>
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>—</span>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Blog</span>
      </nav>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 48 }}>
          <span style={{ background: '#E33D26', color: 'white', fontSize: 11, fontWeight: 900, padding: '4px 12px', borderRadius: 20, letterSpacing: 3, textTransform: 'uppercase' }}>
            Blog
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: '#1A1A1A', marginTop: 16, lineHeight: 1.1, fontFamily: 'Playfair Display, Georgia, serif', letterSpacing: '-0.02em' }}>
            Bespaartips &amp;<br /><span style={{ color: '#E33D26' }}>Supermarkt Nieuws</span>
          </h1>
          <p style={{ color: '#6B6259', marginTop: 12, fontSize: 17, lineHeight: 1.6 }}>
            Alles over slim boodschappen doen, aanbiedingen vergelijken en geld besparen op je dagelijkse boodschappen.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {posts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
              <article style={{
                background: 'white',
                borderRadius: 20,
                padding: '28px 32px',
                boxShadow: '0 4px 0 #DDD0C4',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                cursor: 'pointer',
                border: '1px solid rgba(201,193,182,0.3)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 0 #DDD0C4'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 0 #DDD0C4'
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ background: '#F0EBE5', color: '#6B6259', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: 1 }}>
                    {post.category}
                  </span>
                  <span style={{ color: '#C9C1B6', fontSize: 13 }}>
                    {new Date(post.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <span style={{ color: '#C9C1B6', fontSize: 13 }}>· {post.readTime} min lezen</span>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1A1A1A', marginBottom: 10, lineHeight: 1.3, fontFamily: 'Playfair Display, Georgia, serif' }}>
                  {post.title}
                </h2>
                <p style={{ color: '#6B6259', fontSize: 15, lineHeight: 1.65, margin: 0 }}>
                  {post.description}
                </p>
                <div style={{ marginTop: 16, color: '#E33D26', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  Lees meer →
                </div>
              </article>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 48, padding: '28px 32px', background: '#1A1A1A', borderRadius: 20, textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, marginBottom: 16 }}>
            Bekijk alle actuele supermarktaanbiedingen
          </p>
          <Link href="/" style={{
            display: 'inline-block', background: '#E33D26', color: 'white',
            padding: '12px 28px', borderRadius: 30, textDecoration: 'none',
            fontWeight: 900, fontSize: 14, letterSpacing: 1,
          }}>
            Naar alle deals →
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
