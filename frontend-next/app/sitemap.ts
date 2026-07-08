import { MetadataRoute } from 'next'
import { VISIBLE_MARKETS as MARKETS, CATEGORIES } from '@/lib/types'
import { getAllPosts } from '@/lib/posts'
import { currentWeekSlug } from '@/lib/weeklyDeals'
import { getAllPairs } from '@/lib/vergelijk'
import { getBrandList } from '@/lib/brands'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  const vergelijkPages = getAllPairs().map(p => ({
        url: `${base}/vergelijk/${p.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
  }))

  const brands = await getBrandList()
  const brandPages = brands.map(b => ({
        url: `${base}/merk/${b.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.65,
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
    { url: `${base}/zomeracties`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.7 },
    { url: `${base}/energie`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${base}/vergelijk`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${base}/merk`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.75 },
    { url: `${base}/kortingsindex`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${base}/pers`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.5 },
        ...blogPages,
        ...marketPages,
        ...categoryPages,
        ...vergelijkPages,
        ...brandPages,
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.3 },
      ]
}
