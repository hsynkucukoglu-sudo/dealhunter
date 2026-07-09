import type { Metadata } from 'next'
import { getProducts } from '@/lib/api'
import { buildHomePageSchema, buildFaqSchema, buildHomeDealsSchema } from '@/lib/schema'
import { ProductsPage } from '@/components/ProductsPage'

export const revalidate = 3600
export const dynamic = 'force-dynamic'

const HOME_FAQS_TR = [
  {
    question: 'DealHunter4U kullanımı ücretsiz mi?',
    answer: 'Evet, DealHunter4U tamamen ücretsizdir. Hesap oluşturmadan tüm fırsatları görüntüleyebilir, karşılaştırabilir ve filtreleyebilirsiniz. Ücretsiz bir hesap favoriler ve fiyat uyarılarına erişim sağlar.',
  },
  {
    question: "DealHunter4U'da hangi süpermarketler ve mağazalar var?",
    answer: 'Şu anda on mağazanın fırsatlarını karşılaştırıyoruz: Albert Heijn, Jumbo, Lidl, Aldi, Dirk van den Broek, Hoogvliet, Vomar, DekaMarkt, Plus ve Kruidvat. Kapsamımızı düzenli olarak genişletiyoruz.',
  },
  {
    question: 'Fırsatlar ne sıklıkla güncelleniyor?',
    answer: 'Fırsatlar her gün otomatik olarak yenilenir. Yeni haftalık kampanyalar genellikle pazartesi (Lidl, Aldi) ve çarşamba (Albert Heijn, Jumbo ve diğer çoğu süpermarket) günleri yayınlanır.',
  },
  {
    question: 'Ne kadar tasarruf ettiğimi görebilir miyim?',
    answer: "Evet. Her üründe indirim yüzdesini ve normal fiyata göre tasarrufu görürsünüz. \"En düşük fiyat\" etiketi, o an hangi süpermarketin benzer bir ürün için en ucuz olduğunu gösterir.",
  },
  {
    question: 'DealHunter4U’daki fırsatlar her zaman güncel mi?',
    answer: 'Evet. Süresi dolan fırsatlar otomatik olarak kaybolur — yalnızca şu anda geçerli olan fırsatları gösteririz. Verilerimiz doğrudan resmi kataloglardan gelir ve her gün yenilenir.',
  },
  {
    question: "DealHunter4U'yu diğer fırsat sitelerinden farklı kılan nedir?",
    answer: "DealHunter4U, Hollanda'da Hollandaca, İngilizce ve Türkçe olarak kullanılabilen tek fırsat sitesidir. Ayrıca süpermarket, drogisterij ve enerji fırsatlarını tek bir yerde birleştiriyoruz.",
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Hollanda Süpermarket İndirimleri — Haftalık Fırsatlar | DealHunter4U'
  const description = '✓ Hollanda\'daki tüm süpermarketlerin (Albert Heijn, Jumbo, Lidl, Aldi ve daha fazlası) güncel indirimlerini tek yerde karşılaştırın. Her gün güncellenir, tamamen ücretsiz.'
  const nlUrl = 'https://www.dealhunter4u.nl'
  const trUrl = 'https://www.dealhunter4u.nl/tr'

  return {
    title,
    description,
    alternates: {
      canonical: trUrl,
      languages: {
        'nl-NL': nlUrl,
        'tr-TR': trUrl,
        'x-default': nlUrl,
      },
    },
    openGraph: {
      title,
      description,
      url: trUrl,
      siteName: 'DealHunter4U',
      locale: 'tr_TR',
      type: 'website',
    },
  }
}

export default async function TrHome() {
  const allProducts = await getProducts()
  const markets = [...new Set(allProducts.map(p => p.market))].join(', ')
  const schema = buildHomePageSchema(markets)
  const faqSchema = buildFaqSchema(HOME_FAQS_TR)

  const initialProducts = allProducts
    .filter(p => p.originalPrice > p.discountedPrice && p.originalPrice > 0)
    .sort((a, b) => ((b.originalPrice - b.discountedPrice) / b.originalPrice) - ((a.originalPrice - a.discountedPrice) / a.originalPrice))
    .slice(0, 60)

  const homeDealsSchema = buildHomeDealsSchema(initialProducts)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeDealsSchema) }}
      />
      <ProductsPage initialProducts={initialProducts} initialSearch="" />
    </>
  )
}
