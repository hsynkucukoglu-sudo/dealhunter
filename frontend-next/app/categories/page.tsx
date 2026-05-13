import type { Metadata } from 'next'
import Link from 'next/link'
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/types'
import { getProducts } from '@/lib/api'

export const metadata: Metadata = {
  title: 'Alle Categorieën — DealHunter',
    description: 'Bekijk alle supermarkt aanbiedingen per categorie.',
      alternates: { canonical: 'https://www.dealhunter4u.nl/categories' },
      }

      export default async function CategoriesPage() {
        const products = await getProducts()
          return (
              <div className="min-h-screen" style={{ background: '#F5EDE3' }}>
                    <main className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-32">
                            <h1 className="text-4xl font-bold mb-10" style={{ color: '#1A1A1A' }}>
                                      Alle Categorieën
                                              </h1>
                                                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                                                {CATEGORIES.map(cat => {
                                                                            const count = products.filter(p => p.category === cat.id).length
                                                                                        return (
                                                                                                      <Link key={cat.id} href={`/categorie/${cat.id}`}
                                                                                                                      className="flex flex-col items-start p-6 rounded-2xl"
                                                                                                                                      style={{ background: 'rgba(255,255,255,0.8)' }}>
                                                                                                                                                      <span className="text-3xl mb-3">{cat.emoji}</span>
                                                                                                                                                                      <span className="font-semibold" style={{ color: '#1A1A1A' }}>
                                                                                                                                                                                        {CATEGORY_LABELS[cat.id]?.nl ?? cat.label}
                                                                                                                                                                                                        </span>
                                                                                                                                                                                                                        <span className="text-sm" style={{ color: '#8C8478' }}>{count} aanbiedingen</span>
                                                                                                                                                                                                                                      </Link>
                                                                                                                                                                                                                                                  )
                                                                                                                                                                                                                                                            })}
                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                          </main>
                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                                )
                                                                                                                                                                                                                                                                                }
