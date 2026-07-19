import { MetadataRoute } from 'next'
import { VISIBLE_MARKETS as MARKETS, CATEGORIES } from '@/lib/types'
import { getAllPosts } from '@/lib/posts'
import { currentWeekSlug } from '@/lib/weeklyDeals'
import { getAllPairs, isIndexedPair } from '@/lib/vergelijk'
import { getBrandList } from '@/lib/brands'
import { PRODUCT_KEYWORDS } from '@/lib/productKeywords'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const base = 'https://www.dealhunter4u.nl'
    // Güne yuvarlanmış: build/deploy anına değil gerçek güncelleme sıklığına (günlük scraper)
    // bağlı bir freshness sinyali. Ham `new Date()` her build'de saniye hassasiyetinde değişip
    // Google'a güvenilmez bir sinyal veriyordu (bkz. sitemap blog lastModified fix, commit f014479 —
    // o zaman sadece blog sayfaları düzeltilmişti, aşağıdaki sayfa tipleri gözden kaçmıştı).
    const today = new Date(new Date().toISOString().slice(0, 10))

  const marketPages = MARKETS.map(m => ({
        url: `${base}/supermarkt/${m.slug}`,
        lastModified: today,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
  }))

  const categoryPages = CATEGORIES.map(c => ({
        url: `${base}/categorie/${c.id}`,
        lastModified: today,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
  }))

  // Sadece indexlenen ikililer sitemap'e girer — kalan ~36 otomatik kombinasyon
  // noindex (bkz. lib/vergelijk.ts INDEXED_PAIR_SLUGS).
  const vergelijkPages = getAllPairs().filter(p => isIndexedPair(p.slug)).map(p => ({
        url: `${base}/vergelijk/${p.slug}`,
        lastModified: today,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
  }))

  const brands = await getBrandList()
  const brandPages = brands.map(b => ({
        url: `${base}/merk/${b.slug}`,
        lastModified: today,
        changeFrequency: 'weekly' as const,
        priority: 0.65,
  }))

  const blogPages = getAllPosts().map(post => ({
        url: `${base}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'weekly' as const,
        priority: 0.75,
  }))

  const productPages = PRODUCT_KEYWORDS.map(k => ({
        url: `${base}/product/${k.slug}`,
        lastModified: today,
        changeFrequency: 'weekly' as const,
        priority: 0.65,
  }))

  return [
    {
            url: base,
            lastModified: today,
            changeFrequency: 'daily',
            priority: 1.0,
    },
    { url: `${base}/deals`, lastModified: today, changeFrequency: 'daily' as const, priority: 0.95 },
    { url: `${base}/categories`, lastModified: today, changeFrequency: 'weekly' as const, priority: 0.85 },
    { url: `${base}/blog`, lastModified: today, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${base}/blog/beste-deals/${currentWeekSlug()}`, lastModified: today, changeFrequency: 'weekly' as const, priority: 0.85 },
    { url: `${base}/zomeracties`, lastModified: today, changeFrequency: 'daily' as const, priority: 0.7 },
    { url: `${base}/volgende-week`, lastModified: today, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${base}/klantenkaarten`, lastModified: today, changeFrequency: 'monthly' as const, priority: 0.65 },
    { url: `${base}/energie`, lastModified: today, changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${base}/vergelijk`, lastModified: today, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${base}/merk`, lastModified: today, changeFrequency: 'weekly' as const, priority: 0.75 },
    { url: `${base}/product`, lastModified: today, changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${base}/kortingsindex`, lastModified: today, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${base}/pers`, lastModified: today, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${base}/tr`, lastModified: today, changeFrequency: 'daily' as const, priority: 0.9 },
        ...blogPages,
        ...marketPages,
        ...categoryPages,
        ...vergelijkPages,
        ...brandPages,
        ...productPages,
    { url: `${base}/privacy`, lastModified: today, changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${base}/contact`, lastModified: today, changeFrequency: 'monthly' as const, priority: 0.3 },
      ]
}
