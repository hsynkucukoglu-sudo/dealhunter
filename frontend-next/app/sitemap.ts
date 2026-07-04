import { MetadataRoute } from 'next'
import { VISIBLE_MARKETS as MARKETS, CATEGORIES } from '@/lib/types'
import { getAllPosts } from '@/lib/posts'
import { currentWeekSlug } from '@/lib/weeklyDeals'

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

  const blogPages = getAllPosts().map(post => ({
        url: `${base}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'weekly' as const,
        priority: 0.75,
  }))

  return [
    {
            url: base,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 1.0,
    },
    { url: `${base}/deals`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.95 },
    { url: `${base}/categories`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.85 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${base}/blog/beste-deals/${currentWeekSlug()}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.85 },
        ...blogPages,
        ...marketPages,
        ...categoryPages,
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.3 },
      ]
}
