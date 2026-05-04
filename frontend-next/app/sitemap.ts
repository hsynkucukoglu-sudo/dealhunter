import { MetadataRoute } from 'next'
import { MARKETS, CATEGORIES } from '@/lib/types'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.dealhunter4u.nl'
  const now = new Date()

  const marketPages = MARKETS.map(m => ({
    url: `${base}/supermarkt/${m.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  const categoryPages = CATEGORIES.map(c => ({
    url: `${base}/categorie/${c.id}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...marketPages,
    ...categoryPages,
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.3 },
  ]
}
