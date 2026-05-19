'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useFavorites } from '@/context/FavoritesContext'
import { useShoppingList } from '@/context/ShoppingListContext'
import { MARKET_COLORS } from '@/lib/types'
import { DealHunterLogo } from './DealHunterLogo'

type Tab = 'favorieten' | 'alerts' | 'lijst'

export function ProfilePage() {
  const { data: session } = useSession()
  const { favorites, watchlist, toggleFavorite, toggleWatch } = useFavorites()
  const { items, removeFromCart, totalCost, totalSavings, itemCount, setIsCartOpen } = useShoppingList()
  const [activeTab, setActiveTab] = useState<Tab>('favorieten')

  const user = session?.user
  const firstName = user?.name?.split(' ')[0] ?? 'Gebruiker'

  const TABS: { id: Tab; label: string; count: number; icon: string }[] = [
    { id: 'favorieten', label: 'Favorieten', count: favorites.length, icon: 'favorite' },
    { id: 'alerts', label: 'Prijsalerts', count: watchlist.length, icon: 'notifications' },
    { id: 'lijst', label: 'Boodschappenlijst', count: itemCount, icon: 'shopping_basket' },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#FAF6F0' }}>
      {/* Top nav */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 h-14"
        style={{ background: '#1A1A1A', borderBottom: '1px solid #2A2A2A' }}
      >
        <Link href="/">
          <DealHunterLogo height={30} />
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium"
          style={{ color: '#8C8478' }}
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Terug naar deals
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Profile hero */}
        <div
          className="rounded-3xl p-6 mb-6 flex items-center gap-5"
          style={{ background: 'white', border: '1.5px solid #E0D8CE' }}
        >
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name ?? 'avatar'}
              width={64}
              height={64}
              className="rounded-full flex-none"
              style={{ border: '3px solid #F0EBE5' }}
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center flex-none text-2xl font-black"
              style={{ background: '#E33D26', color: 'white' }}
            >
              {firstName[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xl font-headline font-black truncate" style={{ color: '#1A1A1A' }}>
              {user?.name ?? 'Gebruiker'}
            </p>
            <p className="text-sm truncate mt-0.5" style={{ color: '#8C8478' }}>
              {user?.email}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex-none flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors hover:opacity-80"
            style={{ background: '#FAF6F0', color: '#8C8478', border: '1.5px solid #E0D8CE' }}
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Uitloggen
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="rounded-2xl p-4 flex flex-col items-center gap-1.5 transition-all"
              style={{
                background: activeTab === tab.id ? '#1A1A1A' : 'white',
                border: `1.5px solid ${activeTab === tab.id ? '#1A1A1A' : '#E0D8CE'}`,
                color: activeTab === tab.id ? 'white' : '#1A1A1A',
              }}
            >
              <span
                className="material-symbols-outlined text-xl"
                style={{ fontVariationSettings: '"FILL" 1', color: activeTab === tab.id ? 'white' : '#E33D26' }}
              >
                {tab.icon}
              </span>
              <span className="text-2xl font-headline font-black">{tab.count}</span>
              <span className="text-xs font-medium" style={{ color: activeTab === tab.id ? '#C9C1B6' : '#8C8478' }}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'favorieten' && (
          <Section
            title="Mijn favorieten"
            empty={favorites.length === 0}
            emptyIcon="favorite"
            emptyText="Je hebt nog geen favorieten bewaard. Tik op het hartje op een deal."
          >
            {favorites.map((p) => (
              <ProductRow
                key={p.id}
                name={p.name}
                market={p.market}
                discountedPrice={p.discountedPrice}
                originalPrice={p.originalPrice}
                imageUrl={p.imageUrl}
                actionIcon="favorite"
                actionColor="#E33D26"
                onAction={() => toggleFavorite(p)}
              />
            ))}
          </Section>
        )}

        {activeTab === 'alerts' && (
          <Section
            title="Mijn prijsalerts"
            empty={watchlist.length === 0}
            emptyIcon="notifications"
            emptyText="Nog geen prijsalerts ingesteld. Tik op het bel-icoon op een deal."
          >
            {watchlist.map((p) => (
              <ProductRow
                key={p.id}
                name={p.name}
                market={p.market}
                discountedPrice={p.discountedPrice}
                originalPrice={p.originalPrice}
                imageUrl={p.imageUrl}
                actionIcon="notifications_off"
                actionColor="#FF8C00"
                onAction={() => toggleWatch(p)}
              />
            ))}
          </Section>
        )}

        {activeTab === 'lijst' && (
          <Section
            title="Boodschappenlijst"
            empty={items.length === 0}
            emptyIcon="shopping_basket"
            emptyText="Je boodschappenlijst is leeg. Voeg deals toe via de 'Toevoegen' knop."
          >
            {items.map((item) => (
              <ProductRow
                key={item.id}
                name={item.name}
                market={item.market}
                discountedPrice={item.discountedPrice * item.quantity}
                originalPrice={item.originalPrice * item.quantity}
                imageUrl={item.imageUrl}
                badge={`${item.quantity}×`}
                actionIcon="delete"
                actionColor="#8C8478"
                onAction={() => removeFromCart(item.id)}
              />
            ))}
            {items.length > 0 && (
              <div
                className="mt-4 rounded-2xl p-4 flex items-center justify-between"
                style={{ background: '#1A1A1A', color: 'white' }}
              >
                <div>
                  <p className="text-xs font-medium" style={{ color: '#8C8478' }}>Totaal</p>
                  <p className="text-xl font-headline font-black">€{totalCost.toFixed(2)}</p>
                </div>
                {totalSavings > 0 && (
                  <div className="text-right">
                    <p className="text-xs font-medium" style={{ color: '#8C8478' }}>Bespaard</p>
                    <p className="text-lg font-headline font-bold" style={{ color: '#1B9E4B' }}>
                      €{totalSavings.toFixed(2)}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: '#E33D26', color: 'white' }}
                >
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  Openen
                </button>
              </div>
            )}
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({
  title,
  empty,
  emptyIcon,
  emptyText,
  children,
}: {
  title: string
  empty: boolean
  emptyIcon: string
  emptyText: string
  children?: React.ReactNode
}) {
  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ background: 'white', border: '1.5px solid #E0D8CE' }}
    >
      <div className="px-5 py-4" style={{ borderBottom: '1.5px solid #F0EBE5' }}>
        <h2 className="font-headline font-bold text-base" style={{ color: '#1A1A1A' }}>{title}</h2>
      </div>
      {empty ? (
        <div className="flex flex-col items-center gap-3 py-14 px-6 text-center">
          <span
            className="material-symbols-outlined text-4xl"
            style={{ color: '#E0D8CE', fontVariationSettings: '"FILL" 1' }}
          >
            {emptyIcon}
          </span>
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#B8AFA6' }}>{emptyText}</p>
          <Link
            href="/"
            className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: '#1A1A1A', color: 'white' }}
          >
            Deals bekijken
          </Link>
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: '#F0EBE5' }}>
          {children}
        </div>
      )}
    </div>
  )
}

function ProductRow({
  name,
  market,
  discountedPrice,
  originalPrice,
  imageUrl,
  badge,
  actionIcon,
  actionColor,
  onAction,
}: {
  name: string
  market: string
  discountedPrice: number
  originalPrice: number
  imageUrl: string | null
  badge?: string
  actionIcon: string
  actionColor: string
  onAction: () => void
}) {
  const hasDiscount = originalPrice > discountedPrice && originalPrice > 0
  const imgSrc = imageUrl
    ? imageUrl.startsWith('ah-product-id:')
      ? `/api/ah-image/${imageUrl.replace('ah-product-id:', '')}`
      : imageUrl
    : '/icon-192x192.png'

  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <div
        className="w-12 h-12 rounded-xl flex-none overflow-hidden"
        style={{ background: '#FAF6F0' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={name}
          className="w-full h-full object-contain p-1.5"
          onError={(e) => { e.currentTarget.src = '/icon-192x192.png' }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight truncate" style={{ color: '#1A1A1A' }}>
          {badge && <span className="text-xs font-bold mr-1.5" style={{ color: '#8C8478' }}>{badge}</span>}
          {name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="w-1.5 h-1.5 rounded-full flex-none"
            style={{ background: MARKET_COLORS[market] || '#8C8478' }}
          />
          <span className="text-xs" style={{ color: '#8C8478' }}>{market}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-none">
        <div className="text-right">
          {discountedPrice > 0 && (
            <p className="text-sm font-black font-headline" style={{ color: '#E33D26' }}>
              €{discountedPrice.toFixed(2)}
            </p>
          )}
          {hasDiscount && (
            <p className="text-xs line-through" style={{ color: '#C9C1B6' }}>
              €{originalPrice.toFixed(2)}
            </p>
          )}
        </div>
        <button
          onClick={onAction}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
          style={{ background: '#FAF6F0' }}
        >
          <span className="material-symbols-outlined text-base" style={{ color: actionColor, fontVariationSettings: '"FILL" 1' }}>
            {actionIcon}
          </span>
        </button>
      </div>
    </div>
  )
}
