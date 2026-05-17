'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Product } from '@/lib/types'
import { MARKET_COLORS } from '@/lib/types'
import { useShoppingList } from '@/context/ShoppingListContext'
import { useLanguage } from '@/context/LanguageContext'
import { getAffiliateLink } from '@/lib/affiliate'
import { useFavorites } from '@/context/FavoritesContext'
import { calcUnitPrice } from '@/lib/productMeta'
import { detectCampaignType } from '@/lib/campaignType'
import { usePriceHistory } from '@/context/PriceHistoryContext'

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useShoppingList()
  const { t } = useLanguage()

  const affiliateLink = getAffiliateLink(product.market)
  const { isFavorite, isWatching, toggleFavorite, toggleWatch } = useFavorites()
  const { isLowestPrice } = usePriceHistory()
  const hasValidDiscount = product.originalPrice > product.discountedPrice && product.originalPrice > 0
  const lowestEver = isLowestPrice(product.name, product.market, product.discountedPrice, product.unitSize, product.unitType)

  const expiryStatus = (() => {
    if (!product.expiresAt) return null
    const expiry = new Date(product.expiresAt)
    expiry.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / 86400000)
    if (diff < 0) return { label: 'Aanbieding verlopen', color: '#C9C1B6', pulse: false, expired: true }
    if (diff === 0) return { label: 'Vandaag verloopt!', color: '#E33D26', pulse: true, expired: false }
    if (diff === 1) return { label: 'Morgen verloopt', color: '#FF8C00', pulse: true, expired: false }
    if (diff <= 3) return { label: `Nog ${diff} dagen`, color: '#FF8C00', pulse: false, expired: false }
    if (diff <= 7) return { label: `Nog ${diff} dagen`, color: '#1A1A1A', pulse: false, expired: false }
    return {
      label: `Geldig t/m ${expiry.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}`,
      color: '#9C9389',
      pulse: false,
      expired: false,
    }
  })()
  const discountPercent = hasValidDiscount
    ? (product.discount || Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100))
    : 0

  const unitPrice = calcUnitPrice(product.name, product.discountedPrice)
  const campaign = detectCampaignType(product.name, discountPercent, product.campaignType)

  const imgSrc = product.imageUrl
    ? product.imageUrl.startsWith('ah-product-id:')
      ? `/api/ah-image/${product.imageUrl.replace('ah-product-id:', '')}`
      : product.imageUrl
    : '/icon-192x192.png'

  const schemaImage = imgSrc.startsWith('http') ? imgSrc : `https://www.dealhunter4u.nl${imgSrc}`
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: schemaImage,
    offers: {
      '@type': 'Offer',
      price: product.discountedPrice.toFixed(2),
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: product.market },
      ...(product.expiresAt ? { validThrough: product.expiresAt } : {}),
      ...(affiliateLink ? { url: affiliateLink.url } : {}),
    },
  }

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
    />
    <div className="card-product group">
      {hasValidDiscount && discountPercent > 0 && (
        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1">
          <span
            className="badge-deal"
            style={{
              background: discountPercent >= 40 ? '#E33D26' : '#1A1A1A',
              color: 'white',
              boxShadow: discountPercent >= 40 ? '0 3px 10px rgba(227,61,38,0.3)' : '0 3px 10px rgba(0,0,0,0.15)',
            }}
          >
            -{discountPercent}%
          </span>
          {lowestEver && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap"
              style={{ background: '#1B9E4B', color: 'white', boxShadow: '0 2px 6px rgba(27,158,75,0.3)' }}
            >
              🏆 Laagste prijs!
            </span>
          )}
        </div>
      )}

      <div className="aspect-square overflow-hidden relative" style={{ background: '#FAF6F0' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.currentTarget.src = '/icon-192x192.png' }}
        />
        <button
          onClick={(e) => { e.stopPropagation(); addToCart(product) }}
          className="basket-slide"
        >
          <span className="material-symbols-outlined material-filled">shopping_basket</span>
        </button>
        <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(product) }}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.9)' }}
            title="Favorilere ekle"
          >
            <span className="material-symbols-outlined text-base" style={{ color: isFavorite(product.id) ? '#E33D26' : '#8C8478', fontVariationSettings: isFavorite(product.id) ? '"FILL" 1' : '"FILL" 0' }}>
              favorite
            </span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); toggleWatch(product) }}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.9)' }}
            title="Haber ver"
          >
            <span className="material-symbols-outlined text-base" style={{ color: isWatching(product.id) ? '#FF8C00' : '#8C8478', fontVariationSettings: isWatching(product.id) ? '"FILL" 1' : '"FILL" 0' }}>
              notifications
            </span>
          </button>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div
            className="w-2 h-2 rounded-full flex-none"
            style={{ background: MARKET_COLORS[product.market] || '#8C8478' }}
          />
          <p className="text-xs font-headline uppercase tracking-widest" style={{ color: '#8C8478' }}>
            {product.market}
          </p>
          {campaign.type && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-auto whitespace-nowrap"
              style={{ background: campaign.bg, color: campaign.color }}
            >
              {campaign.label}
            </span>
          )}
        </div>

        <h4 className="text-base font-headline font-bold leading-tight mb-3 line-clamp-2" style={{ color: '#1A1A1A' }}>
          {product.name}
        </h4>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-headline font-black" style={{ color: '#E33D26' }}>
              €{product.discountedPrice.toFixed(2)}
            </span>
            {hasValidDiscount && (
              <span className="text-sm line-through" style={{ color: '#C9C1B6' }}>
                €{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
            {(product.fullSizeLabel || (product.unitSize != null && product.unitType)) && (
              <span
                className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
                style={{ background: '#EAE4DE', color: '#6B6259' }}
              >
                {product.fullSizeLabel ?? `${product.unitSize} ${product.unitType}`}
              </span>
            )}
            {unitPrice && (
              <span
                className="text-[11px] font-medium px-1.5 py-0.5 rounded"
                style={{ background: '#F0EBE5', color: '#6B6259' }}
              >
                {unitPrice.display}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-1.5">
          {expiryStatus ? (
            <p
              className={`text-[11px] flex items-center gap-1 font-medium${expiryStatus.pulse ? ' animate-pulse' : ''}`}
              style={{ color: expiryStatus.color }}
            >
              <span className="material-symbols-outlined text-sm">schedule</span>
              {expiryStatus.label}
            </p>
          ) : (
            <p className="text-[11px] flex items-center gap-1" style={{ color: '#9C9389' }}>
              <span className="material-symbols-outlined text-sm">schedule</span>
              {t.validUntil}
            </p>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 flex flex-col gap-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => addToCart(product)}
          className="btn-card"
        >
          {t.addToCart}
        </motion.button>
        {affiliateLink && (
          <a
            href={affiliateLink.url}
            target="_blank"
            rel={affiliateLink.rel}
            className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors duration-200"
            style={{
              color: MARKET_COLORS[product.market] || '#1A1A1A',
              background: 'transparent',
              border: `1.5px solid ${MARKET_COLORS[product.market] || '#C9C1B6'}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {t.viewDeal}
            <span className="material-symbols-outlined text-sm leading-none">open_in_new</span>
          </a>
        )}
      </div>
    </div>
    </>
  )
}
