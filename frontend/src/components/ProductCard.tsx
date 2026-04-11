import React from 'react'
import { motion } from 'framer-motion'
import { Product, useShoppingList } from '@/context/ShoppingListContext'

const MARKET_COLORS: Record<string, string> = {
  'Albert Heijn': '#00A0E2',
  'Aldi': '#00205B',
  'Dirk': '#C8102E',
  'Jumbo': '#FFD700',
  'Lidl': '#0050AA',
  'Plus': '#00A651',
  'Hoogvliet': '#E30613',
}

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useShoppingList()

  const hasValidDiscount = product.originalPrice > product.discountedPrice && product.originalPrice > 0
  const discountPercent = hasValidDiscount ? (product.discount || Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100)) : 0

  return (
    <div className="card-product group">
      {/* Discount Badge */}
      {hasValidDiscount && discountPercent > 0 && (
        <div className="absolute top-3 right-3 z-10">
          <span
            className="badge-deal"
            style={{
              background: discountPercent >= 40 ? '#E33D26' : '#1A1A1A',
              color: 'white',
              boxShadow: discountPercent >= 40 ? '0 3px 10px rgba(227,61,38,0.3)' : '0 3px 10px rgba(0,0,0,0.15)'
            }}
          >
            -%{discountPercent}
          </span>
        </div>
      )}

      {/* Image */}
      <div className="aspect-square overflow-hidden relative" style={{ background: '#FAF6F0' }}>
        <img
          src={product.imageUrl || '/icon-192x192.png'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = '/icon-192x192.png'
          }}
        />
        {/* Slide-up basket button */}
        <button
          onClick={(e) => { e.stopPropagation(); addToCart(product) }}
          className="basket-slide"
        >
          <span className="material-symbols-outlined material-filled">shopping_basket</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Market label with dot */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <div
            className="w-2 h-2 rounded-full flex-none"
            style={{ background: MARKET_COLORS[product.market] || '#8C8478' }}
          />
          <p className="text-xs font-headline uppercase tracking-widest" style={{ color: '#8C8478' }}>
            {product.market}
          </p>
        </div>

        <h4 className="text-base font-headline font-bold leading-tight mb-3 line-clamp-2" style={{ color: '#1A1A1A' }}>
          {product.name}
        </h4>

        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-2xl font-headline font-black" style={{ color: '#E33D26' }}>
            €{product.discountedPrice.toFixed(2)}
          </span>
          {hasValidDiscount && (
            <span className="text-sm line-through" style={{ color: '#C9C1B6' }}>
              €{product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Expire date */}
        <p className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: '#9C9389' }}>
          <span className="material-symbols-outlined text-sm">schedule</span>
          {product.expiresAt} tarihine kadar
        </p>
      </div>

      {/* Full-width add button */}
      <div className="px-4 pb-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => addToCart(product)}
          className="btn-card"
        >
          Sepete Ekle
        </motion.button>
      </div>
    </div>
  )
}
