'use client'
import { useState, useMemo } from 'react'
import BlogCard from './BlogCard'

interface Post {
  slug: string
  title: string
  description: string
  date: string
  readTime: number
  category: string
}

const CATEGORY_LABELS: Record<string, string> = {
  'Vergelijking':       '⚖️ Vergelijking',
  'Aanbiedingen':       '🎯 Aanbiedingen',
  'Supermarkt gids':    '🏪 Supermarkt gids',
  'Bespaartips':        '💰 Bespaartips',
  'Besparen':           '💰 Bespaartips',
  'Tips & Tricks':      '💰 Bespaartips',
  'Categorie gids':     '🏪 Supermarkt gids',
  'Seizoensaanbiedingen': '🎯 Aanbiedingen',
}

const FILTER_TABS = [
  { id: 'all',             label: 'Alles' },
  { id: 'Vergelijking',    label: '⚖️ Vergelijking' },
  { id: 'Aanbiedingen',   label: '🎯 Aanbiedingen' },
  { id: 'Supermarkt gids', label: '🏪 Supermarkt gids' },
  { id: 'Bespaartips',    label: '💰 Bespaartips' },
]

function normalizeCategory(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat
}

function filterTabFor(cat: string): string {
  const norm = normalizeCategory(cat)
  if (norm.includes('Vergelijking'))    return 'Vergelijking'
  if (norm.includes('Aanbiedingen'))   return 'Aanbiedingen'
  if (norm.includes('Supermarkt gids')) return 'Supermarkt gids'
  if (norm.includes('Bespaartips'))    return 'Bespaartips'
  return 'all'
}

export default function BlogListClient({ posts }: { posts: Post[] }) {
  const [activeTab, setActiveTab] = useState('all')

  const filtered = useMemo(() =>
    activeTab === 'all' ? posts : posts.filter(p => filterTabFor(p.category) === activeTab),
    [posts, activeTab]
  )

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: posts.length }
    for (const tab of FILTER_TABS.slice(1)) {
      map[tab.id] = posts.filter(p => filterTabFor(p.category) === tab.id).length
    }
    return map
  }, [posts])

  return (
    <>
      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer"
            style={
              activeTab === tab.id
                ? { background: '#1A1A1A', color: 'white', fontFamily: 'Space Grotesk' }
                : { background: 'white', color: '#6B6259', border: '1.5px solid #E0D8CE', fontFamily: 'Space Grotesk' }
            }
          >
            {tab.label}
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{
                background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'rgba(201,193,182,0.3)',
                color: activeTab === tab.id ? 'white' : '#9C9389',
              }}
            >
              {counts[tab.id] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
        {filtered.map(post => (
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

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9C9389' }}>
          Geen artikelen in deze categorie.
        </div>
      )}
    </>
  )
}
