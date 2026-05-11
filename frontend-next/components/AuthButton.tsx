'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import Image from 'next/image'
import { useState } from 'react'

export function AuthButton() {
  const { data: session, status } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  if (status === 'loading') return null

  if (!session) {
    return (
      <button
        onClick={() => signIn('google')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          borderRadius: '20px',
          border: '1.5px solid rgba(255,255,255,0.25)',
          background: 'transparent',
          color: 'inherit',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ fontSize: '16px' }}>👤</span>
        Inloggen
      </button>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setMenuOpen(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 4px 4px 12px',
          borderRadius: '20px',
          border: '1.5px solid rgba(255,255,255,0.25)',
          background: 'transparent',
          color: 'inherit',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        <span>{session.user?.name?.split(' ')[0]}</span>
        {session.user?.image && (
          <Image
            src={session.user.image}
            alt="avatar"
            width={28}
            height={28}
            style={{ borderRadius: '50%' }}
          />
        )}
      </button>

      {menuOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '44px',
            background: '#fff',
            color: '#1a1a1a',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
            minWidth: '180px',
            overflow: 'hidden',
            zIndex: 1000,
          }}
        >
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', fontSize: '13px', color: '#888' }}>
            {session.user?.email}
          </div>
          <button
            onClick={() => { setMenuOpen(false); signOut() }}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              color: '#C41230',
            }}
          >
            Uitloggen
          </button>
        </div>
      )}
    </div>
  )
}
