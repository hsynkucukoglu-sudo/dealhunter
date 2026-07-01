'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Product } from '@/lib/types'
import { MARKET_COLORS } from '@/lib/types'
import { useLanguage } from '@/context/LanguageContext'
import { getAffiliateLink, getMarketDestination, isAllowedAffiliateUrl } from '@/lib/affiliate'
import { useFavorites } from '@/context/FavoritesContext'
import { calcUnitPrice } from '@/lib/productMeta'
import { detectCampaignType } from '@/lib/campaignType'
import { usePriceHistory } from '@/context/PriceHistoryContext'
import { trackDealClick, trackAddFavorite, trackAddWatchlist } from '@/lib/analytics'

export function ProductCard({ product }: { product: Product }) {
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

  const [imgError, setImgError] = useState(false)

  const CDN_PROXY = ['static.ah.nl', 'media.kruidvat.nl']
  const imgSrc = product.imageUrl
    ? product.imageUrl.startsWith('ah-product-id:')
      ? `/api/ah-image/${product.imageUrl.replace('ah-product-id:', '')}`
      : CDN_PROXY.some(h => product.imageUrl!.includes(h))
        ? `/api/img-proxy?u=${encodeURIComponent(product.imageUrl)}`
        : product.imageUrl
    : null

  return (
    <div className="card-product group">
      {hasValidDiscount && discountPercent > 0 && (
        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1">
          <span
            className="font-headline font-bold px-2.5 py-1 rounded-lg text-sm"
            style={{
              background: '#E33D26',
              color: 'white',
              fontFamily: 'Space Grotesk',
              boxShadow: '0 3px 10px rgba(227,61,38,0.3)',
            }}
          >
            -{discountPercent}%
          </span>
          {lowestEver && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap flex items-center gap-0.5"
              style={{ background: '#1B9E4B', color: 'white', fontFamily: 'JetBrains Mono' }}
            >
              ✓ Laagste prijs
            </span>
          )}
        </div>
      )}

      <div className="h-36 overflow-hidden relative" style={{ background: '#f5ede3' }}>
        {imgSrc && !imgError ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imgSrc}
            alt={product.name}
            loading="lazy"
            width={300}
            height={300}
            className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined" style={{ fontSize: 56, color: '#C9C1B6' }}>nutrition</span>
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(product); if (!isFavorite(product)) trackAddFavorite(product.name, product.market) }}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.9)' }}
            aria-label={isFavorite(product) ? `${product.name} uit favorieten verwijderen` : `${product.name} aan favorieten toevoegen`}
            aria-pressed={isFavorite(product)}
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true" style={{ color: isFavorite(product) ? '#E33D26' : '#8C8478', fontVariationSettings: isFavorite(product) ? '"FILL" 1' : '"FILL" 0' }}>
              favorite
            </span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); toggleWatch(product); if (!isWatching(product.id)) trackAddWatchlist(product.name, product.market) }}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.9)' }}
            aria-label={isWatching(product.id) ? `${product.name} melding uitschakelen` : `${product.name} prijs volgen`}
            aria-pressed={isWatching(product.id)}
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true" style={{ color: isWatching(product.id) ? '#FF8C00' : '#8C8478', fontVariationSettings: isWatching(product.id) ? '"FILL" 1' : '"FILL" 0' }}>
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
          <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: '#9C9389', fontFamily: 'JetBrains Mono' }}>
            {product.market}
          </p>
          {campaign.type && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-auto whitespace-nowrap"
              style={{ background: campaign.bg, color: campaign.color, fontFamily: 'JetBrains Mono' }}
            >
              {campaign.label}
            </span>
          )}
        </div>

        <h4 className="text-base font-headline font-semibold leading-tight mb-3 line-clamp-2" style={{ color: '#1A1A1A', fontFamily: 'Space Grotesk' }}>
          {product.name}
        </h4>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="font-bold" style={{ fontSize: '22px', lineHeight: '28px', color: '#E33D26', fontFamily: 'Space Grotesk' }}>
              €{product.discountedPrice.toFixed(2)}
            </span>
            {hasValidDiscount && (
              <span className="text-sm line-through" style={{ color: '#C9C1B6', fontFamily: 'Hanken Grotesk' }}>
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
            expiryStatus.expired ? (
              <p className="text-[11px] flex items-center gap-1 font-medium" style={{ color: '#C9C1B6', fontFamily: 'JetBrains Mono' }}>
                <span className="material-symbols-outlined text-sm" aria-hidden="true">schedule</span>
                <span suppressHydrationWarning>{expiryStatus.label}</span>
              </p>
            ) : expiryStatus.pulse ? (
              <span
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold animate-pulse"
                style={{ background: expiryStatus.color, color: 'white', fontFamily: 'JetBrains Mono' }}
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">alarm</span>
                <span suppressHydrationWarning>{expiryStatus.label}</span>
              </span>
            ) : (
              <p className="text-[11px] flex items-center gap-1 font-medium" style={{ color: expiryStatus.color, fontFamily: 'JetBrains Mono' }}>
                <span className="material-symbols-outlined text-sm" aria-hidden="true">schedule</span>
                <span suppressHydrationWarning>{expiryStatus.label}</span>
              </p>
            )
          ) : (
            <p className="text-[11px] flex items-center gap-1" style={{ color: '#9C9389', fontFamily: 'JetBrains Mono' }}>
              <span className="material-symbols-outlined text-sm" aria-hidden="true">schedule</span>
              {t.validUntil}
            </p>
          )}
        </div>
      </div>

      {affiliateLink && (
        <div className="px-4 pb-4">
          <a
            href={affiliateLink.url}
            target="_blank"
            rel={affiliateLink.rel}
            className="flex items-center justify-center gap-1.5 w-full py-2.5 px-3 rounded-xl text-sm font-bold transition-all duration-200"
            style={{
              color: 'white',
              background: MARKET_COLORS[product.market] || '#1A1A1A',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.88'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
            onClick={(e) => {
              e.stopPropagation()
              trackDealClick(product.name, product.market, discountPercent)
              const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
              if (cap?.isNativePlatform?.()) {
                e.preventDefault()
                const dest = (product.affiliateUrl && isAllowedAffiliateUrl(product.affiliateUrl))
                  ? product.affiliateUrl
                  : getMarketDestination(product.market)
                if (dest) {
                  import('@capacitor/browser')
                    .then(({ Browser }) => Browser.open({ url: dest }))
                    .catch(() => { window.location.href = dest })
                }
              }
            }}
            aria-label={`Bekijk ${product.name} aanbieding bij ${product.market}`}
          >
            Naar {product.market}
            <span className="material-symbols-outlined text-sm leading-none" aria-hidden="true">open_in_new</span>
          </a>
        </div>
      )}
    </div>
  )
}
