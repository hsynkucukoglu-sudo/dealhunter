/**
 * Railway DB'deki tüm ürünlerin category alanını günceller.
 * Kullanım: node fix-categories.js
 */

import { categorize } from './categorize.js'

const RAILWAY_API = 'https://dealhunter-production-d900.up.railway.app'

async function main() {
  console.log('Railway ürünleri çekiliyor...')
  const res = await fetch(`${RAILWAY_API}/api/products`)
  const products = await res.json()
  console.log(`${products.length} ürün bulundu`)

  let updated = 0
  for (const p of products) {
    const category = categorize(p.name)
    if ((p.category || 'overig') !== category) {
      await fetch(`${RAILWAY_API}/api/products/${p.id}/category`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      })
      updated++
    }
  }
  console.log(`✅ ${updated} ürün güncellendi`)
}

main().catch(console.error)
