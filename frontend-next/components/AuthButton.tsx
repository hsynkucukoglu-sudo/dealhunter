'use client'

import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useFavorites } from '@/context/FavoritesContext'

export function AuthButton() {
  const { data: session, status } = useSession()
  const { favorites, watchlist } = useFavorites()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  // Prevent body scroll when bottom sheet open on mobile
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  if (status === 'loading') return null

  if (!session) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-full transition-all hover:opacity-80 active:scale-95"
        style={{
          background: '#1A1A1A',
          color: 'white',
        }}
      >
        <span className="material-symbols-outlined text-base leading-none">person</span>
        <span className="hidden sm:inline">Inloggen</span>
      </Link>
    )
  }

  const totalBadge = favorites.length + watchlist.length
  const firstName = session.user?.name?.split(' ')[0] ?? 'Profiel'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(v => !v)}
        className="flex items-center gap-2 pl-2 pr-2 py-1 rounded-full transition-all hover:opacity-80 active:scale-95"
        style={{ background: '#1A1A1A' }}
      >
        <span className="text-sm font-semibold hidden sm:inline" style={{ color: 'white', paddingLeft: 4 }}>
          {firstName}
        </span>
        <div className="relative">
          {session.user?.image ? (
            <Image
              src={session.user.image}
              alt="avatar"
              width={28}
              height={28}
              className="rounded-full"
            />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
              style={{ background: '#E33D26', color: 'white' }}
            >
              {firstName[0].toUpperCase()}
            </div>
          )}
          {totalBadge > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black"
              style={{ background: '#E33D26', color: 'white', border: '1.5px solid #1A1A1A' }}
            >
              {totalBadge > 9 ? '9+' : totalBadge}
            </span>
          )}
        </div>
      </button>

      {/* Desktop dropdown */}
      {menuOpen && (
        <>
          {/* Mobile bottom sheet backdrop */}
          <div
            className="fixed inset-0 sm:hidden z-[998]"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={() => setMenuOpen(false)}
          />

          {/* Desktop dropdown */}
          <div
            className="absolute right-0 top-11 rounded-2xl overflow-hidden z-[999] hidden sm:block"
            style={{
              background: 'white',
              border: '1.5px solid #E0D8CE',
              boxShadow: '0 12px 40px rgba(0,0,0,0.14)',
              minWidth: '220px',
            }}
          >
            <MenuContent
              session={session}
              favorites={favorites.length}
              watchlist={watchlist.length}
              onClose={() => setMenuOpen(false)}
            />
          </div>

          {/* Mobile bottom sheet */}
          <div
            className="fixed bottom-0 left-0 right-0 sm:hidden z-[999] rounded-t-3xl overflow-hidden"
            style={{
              background: 'white',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
            }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: '#E0D8CE' }} />
            </div>
            <MenuContent
              session={session}
              favorites={favorites.length}
              watchlist={watchlist.length}
              onClose={() => setMenuOpen(false)}
            />
            {/* Safe area padding */}
            <div className="h-6" />
          </div>
        </>
      )}
    </div>
  )
}

function MenuContent({
  session,
  favorites,
  watchlist,
  onClose,
}: {
  session: NonNullable<ReturnType<typeof useSession>['data']>
  favorites: number
  watchlist: number
  onClose: () => void
}) {
  return (
    <>
      <div className="px-4 py-3.5" style={{ borderBottom: '1.5px solid #F0EBE5' }}>
        <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>{session.user?.name}</p>
        <p className="text-xs mt-0.5 truncate" style={{ color: '#8C8478' }}>{session.user?.email}</p>
      </div>

      <div
        className="grid grid-cols-3 divide-x text-center"
        style={{ borderBottom: '1.5px solid #F0EBE5' }}
      >
        {[
          { label: 'Favorieten', count: favorites },
          { label: 'Alerts', count: watchlist },
        ].map((s) => (
          <div key={s.label} className="py-3 px-2 col-span-1" style={{ borderColor: '#F0EBE5' }}>
            <p className="text-base font-headline font-black" style={{ color: '#1A1A1A' }}>{s.count}</p>
            <p className="text-[10px] font-medium" style={{ color: '#8C8478' }}>{s.label}</p>
          </div>
        ))}
        <div className="py-3 px-2 col-span-1">
          <span className="material-symbols-outlined text-lg" style={{ color: '#E33D26', fontVariationSettings: '"FILL" 1' }}>
            verified
          </span>
          <p className="text-[10px] font-medium" style={{ color: '#8C8478' }}>Actief</p>
        </div>
      </div>

      <div className="p-2">
        <Link
          href="/profiel"
          onClick={onClose}
          className="flex items-center gap-2.5 w-full px-3 py-3 rounded-xl text-sm font-semibold transition-colors hover:opacity-80"
          style={{ color: '#1A1A1A', background: '#FAF6F0' }}
        >
          <span className="material-symbols-outlined text-base" style={{ color: '#E33D26' }}>person</span>
          Mijn profiel
        </Link>
        <button
          onClick={() => { onClose(); signOut({ callbackUrl: '/' }) }}
          className="flex items-center gap-2.5 w-full px-3 py-3 rounded-xl text-sm font-semibold mt-1 transition-colors hover:opacity-80"
          style={{ color: '#8C8478' }}
        >
          <span className="material-symbols-outlined text-base">logout</span>
          Uitloggen
        </button>
      </div>
    </>
  )
}
