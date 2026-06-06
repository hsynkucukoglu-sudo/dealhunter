import { Product } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://dealhunter-production-d900.up.railway.app'

export async function getProducts(): Promise<Product[]> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 sn timeout

    const res = await fetch(`${API_BASE}/api/products`, {
      next: { revalidate: 900 }, // 15 dakikada bir yenile
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)

    if (!res.ok) {
      console.error(`API Error: ${res.status} ${res.statusText}`)
      return []
    }
    
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('API Request timed out')
    } else {
      console.error('Fetch error:', error)
    }
    return []
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const all = await getProducts()
  return all.filter(p => p.category === category)
}

export { API_BASE }
