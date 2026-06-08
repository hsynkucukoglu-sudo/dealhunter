'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
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

  if (status === 'loading') return null

  if (!session) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-full transition-opacity hover:opacity-80"
        style={{
          border: '1.5px solid rgba(255,255,255,0.2)',
          color: 'rgba(255,255,255,0.85)',
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
        className="flex items-center gap-2 pl-3 pr-1 py-1 rounded-full transition-opacity hover:opacity-80"
        style={{ border: '1.5px solid rgba(255,255,255,0.2)' }}
      >
        <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
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

      {menuOpen && (
        <div
          className="absolute right-0 top-11 rounded-2xl overflow-hidden"
          style={{
            background: 'white',
            border: '1.5px solid #E0D8CE',
            boxShadow: '0 12px 40px rgba(0,0,0,0.14)',
            minWidth: '220px',
            zIndex: 1000,
          }}
        >
          {/* User info */}
          <div className="px-4 py-3.5" style={{ borderBottom: '1.5px solid #F0EBE5' }}>
            <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>{session.user?.name}</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: '#8C8478' }}>{session.user?.email}</p>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-3 divide-x text-center"
            style={{ borderBottom: '1.5px solid #F0EBE5', borderColor: '#F0EBE5' }}
          >
            {[
              { label: 'Favorieten', count: favorites.length, icon: 'favorite' },
              { label: 'Alerts', count: watchlist.length, icon: 'notifications' },
            ].map((s) => (
              <div key={s.label} className="py-3 px-2 col-span-1" style={{ borderColor: '#F0EBE5' }}>
                <p className="text-base font-headline font-black" style={{ color: '#1A1A1A' }}>{s.count}</p>
                <p className="text-[10px] font-medium" style={{ color: '#8C8478' }}>{s.label}</p>
              </div>
            ))}
            <div className="py-3 px-2 col-span-1">
              <span
                className="material-symbols-outlined text-lg"
                style={{ color: '#E33D26', fontVariationSettings: '"FILL" 1' }}
              >
                verified
              </span>
              <p className="text-[10px] font-medium" style={{ color: '#8C8478' }}>Actief</p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-2">
            <Link
              href="/profiel"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-80"
              style={{ color: '#1A1A1A', background: '#FAF6F0' }}
            >
              <span className="material-symbols-outlined text-base" style={{ color: '#E33D26' }}>person</span>
              Mijn profiel
            </Link>
            <button
              onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }) }}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-semibold mt-1 transition-colors hover:opacity-80"
              style={{ color: '#8C8478' }}
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Uitloggen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
