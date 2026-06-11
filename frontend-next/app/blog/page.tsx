import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import BlogCard from './BlogCard'
import { buildBreadcrumbSchema } from '@/lib/schema'
import { currentWeekSlug } from '@/lib/weeklyDeals'
import { getISOWeek } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Bespaartips & Supermarkt Vergelijkingen — Bespaar €150/jaar | DealHunter4U Blog',
  description: 'Ontdek hoe je €150+ per jaar bespaart op boodschappen. AH vs Jumbo vs Lidl vergelijkingen, weekmenu tips en de beste supermarktdeals van Nederland.',
  keywords: 'bespaartips boodschappen, supermarkt vergelijken, goedkoop boodschappen doen, albert heijn jumbo lidl vergelijking, supermarkt aanbiedingen 2026',
  openGraph: {
    title: 'Blog — Bespaartips & Supermarkt Aanbiedingen',
    description: 'Tips om te besparen op boodschappen en supermarkt vergelijkingen.',
    url: 'https://dealhunter4u.nl/blog',
    type: 'website',
  },
}

export default function BlogPage() {
  const posts = getAllPosts()
  const weekSlug = currentWeekSlug()
  const weekNum = getISOWeek(new Date())
  const year = new Date().getFullYear()
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
  ])

  return (
    <div style={{ background: '#F5EDE3', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
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

        {/* Weekly deals featured card */}
        <Link href={`/blog/beste-deals/${weekSlug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 24 }}>
          <div style={{
            background: '#D00000', borderRadius: 20, padding: '24px 28px',
            boxShadow: '0 4px 0 #A00000', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          }}>
            <div>
              <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 11, fontWeight: 900, padding: '3px 10px', borderRadius: 20, letterSpacing: 2, textTransform: 'uppercase' }}>
                Automatisch · Week {weekNum}
              </span>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: 'white', marginTop: 10, marginBottom: 6, fontFamily: 'Playfair Display, Georgia, serif' }}>
                Beste Deals Week {weekNum} {year}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, margin: 0 }}>
                Top 15 aanbiedingen van alle supermarkten — automatisch bijgewerkt
              </p>
            </div>
            <div style={{ color: 'white', fontSize: 28, flexShrink: 0 }}>→</div>
          </div>
        </Link>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {posts.map(post => (
            <BlogCard
              key={post.slug}
              slug={post.slug}
              category={post.category}
              date={post.date}
              readTime={post.readTime}
              title={post.title}
              description={post.description}
            />
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
