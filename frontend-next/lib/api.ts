import { Product } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://dealhunter-production-d900.up.railway.app'

export async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/api/products`, {
      next: { revalidate: 3600 }, // 1 saatte bir yenile
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const all = await getProducts()
  return all.filter(p => p.category === category)
}

export { API_BASE }
