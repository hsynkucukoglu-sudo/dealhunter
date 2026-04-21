/**
 * Bu script local'de çalıştırılır.
 * Railway DB'deki AH ürünleri için görsel URL'lerini local'den çekip Railway'e yazar.
 * Kullanım: node fetch-ah-images.js
 */

const RAILWAY_API = 'https://dealhunter-production-d900.up.railway.app'
const BATCH = 5

async function fetchImage(ahId) {
  try {
    const r = await fetch(`https://www.ah.nl/producten/product/wi${ahId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'nl-NL,nl;q=0.9',
      },
      signal: AbortSignal.timeout(6000),
    })
    if (!r.ok) return null
    const html = await r.text()
    const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
    if (!jsonLd) return null
    const jd = JSON.parse(jsonLd[1])
    return jd.image || null
  } catch {
    return null
  }
}

async function main() {
  console.log('Railway ürünleri çekiliyor...')
  const res = await fetch(`${RAILWAY_API}/api/products`)
  const products = await res.json()

  const ahProducts = products.filter(p =>
    p.market === 'Albert Heijn' && p.imageUrl?.startsWith('ah-product-id:')
  )
  console.log(`${ahProducts.length} AH ürünü bulundu`)

  let updated = 0
  for (let i = 0; i < ahProducts.length; i += BATCH) {
    const batch = ahProducts.slice(i, i + BATCH)
    await Promise.all(batch.map(async p => {
      const ahId = p.imageUrl.replace('ah-product-id:', '')
      const imageUrl = await fetchImage(ahId)
      if (imageUrl) {
        // Railway API üzerinden güncelle
        await fetch(`${RAILWAY_API}/api/products/${p.id}/image`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl }),
        })
        updated++
        if (updated % 20 === 0) console.log(`  ${updated} görsel güncellendi...`)
      }
    }))
    if (i + BATCH < ahProducts.length) await new Promise(r => setTimeout(r, 800))
  }
  console.log(`✅ Tamamlandı: ${updated} görsel güncellendi`)
}

main().catch(console.error)
