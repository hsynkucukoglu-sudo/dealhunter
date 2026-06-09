'use client'

import { useState, useEffect, useRef } from 'react'
import { googleSignIn } from './actions'

const APP_BRIDGE_URL =
  'https://www.dealhunter4u.nl/api/auth/signin/google?callbackUrl=%2Fapi%2Fapp-bridge'

function isNativeApp(): boolean {
  try {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
    return !!(cap?.isNativePlatform?.())
  } catch {
    return false
  }
}

export function GoogleLoginButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const tokenHandled = useRef(false)

  useEffect(() => {
    if (!isNativeApp()) return

    let appHandle: { remove: () => void } | undefined

    async function setup() {
      try {
        const { App } = await import('@capacitor/app')
        const handle = await App.addListener('appUrlOpen', async (event) => {
          if (!event.url.startsWith('dealhunter://auth')) return

          tokenHandled.current = true
          setLoading(true)
          setError(null)

          try {
            const url = new URL(event.url)
            const transferToken = url.searchParams.get('t')
            if (!transferToken) throw new Error('Geen token ontvangen')

            const { signIn: clientSignIn } = await import('next-auth/react')
            const result = await clientSignIn('app-transfer', {
              transferToken,
              redirect: false,
            })

            if (result?.ok) {
              window.location.href = '/'
            } else {
              throw new Error('Inloggen mislukt, probeer opnieuw')
            }
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Er is iets misgegaan')
            setLoading(false)
          }
        })
        appHandle = handle
      } catch {
        // @capacitor/app not available in this environment
      }
    }

    setup()
    return () => appHandle?.remove()
  }, [])

  async function handleClick() {
    setLoading(true)
    setError(null)
    tokenHandled.current = false

    try {
      if (isNativeApp()) {
        const { Browser } = await import('@capacitor/browser')

        const browserHandle = await Browser.addListener('browserFinished', () => {
          browserHandle.remove()
          if (!tokenHandled.current) {
            setLoading(false)
          }
        })

        await Browser.open({
          url: APP_BRIDGE_URL,
          presentationStyle: 'popover',
        })
      } else {
        await googleSignIn()
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Er is iets misgegaan')
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl font-semibold text-sm transition-all duration-200 hover:shadow-md active:scale-95 disabled:opacity-60"
        style={{
          background: 'white',
          border: '1.5px solid #E0D8CE',
          color: '#1A1A1A',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
        )}
        {loading ? 'Bezig...' : 'Doorgaan met Google'}
      </button>
      {error && (
        <p className="mt-2 text-xs text-center" style={{ color: '#E53E3E' }}>
          {error}
        </p>
      )}
    </>
  )
}
