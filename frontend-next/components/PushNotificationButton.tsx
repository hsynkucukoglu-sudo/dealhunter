'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://dealhunter-production-d900.up.railway.app'

const MARKETS = [
  { value: 'Albert Heijn', label: 'Albert Heijn' },
  { value: 'Jumbo', label: 'Jumbo' },
  { value: 'Lidl', label: 'Lidl' },
  { value: 'Aldi', label: 'Aldi' },
  { value: 'Dirk', label: 'Dirk' },
  { value: 'Hoogvliet', label: 'Hoogvliet' },
  { value: 'Vomar', label: 'Vomar' },
  { value: 'DekaMarkt', label: 'DekaMarkt' },
]

const CATEGORIES = [
  { value: 'groente-fruit', label: 'Groente & Fruit' },
  { value: 'zuivel', label: 'Zuivel' },
  { value: 'vlees-vis', label: 'Vlees & Vis' },
  { value: 'dranken', label: 'Dranken' },
  { value: 'bakkerij', label: 'Bakkerij' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'maaltijden', label: 'Maaltijden' },
  { value: 'verzorging', label: 'Verzorging' },
  { value: 'huishouden', label: 'Huishouden' },
]

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

export function PushNotificationButton() {
  const { data: session } = useSession()
  const userId = (session?.user as { id?: string })?.id ?? null

  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPrefs, setShowPrefs] = useState(false)
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    setSupported(true)

    navigator.serviceWorker.register('/sw.js').then(async reg => {
      const existing = await reg.pushManager.getSubscription()
      if (existing) {
        setSubscribed(true)
        setCurrentEndpoint(existing.endpoint)
      }
    })
  }, [])

  // Close panel on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowPrefs(false)
      }
    }
    if (showPrefs) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showPrefs])

  async function subscribe() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const keyRes = await fetch(`${API_BASE}/api/push/vapid-public-key`)
      const { publicKey } = await keyRes.json()

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      const json = sub.toJSON()
      await fetch(`${API_BASE}/api/push/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys, userId }),
      })
      setSubscribed(true)
      setCurrentEndpoint(json.endpoint ?? null)
      setShowPrefs(true)
    } catch (e) {
      console.error('Subscribe hatası:', e)
    } finally {
      setLoading(false)
    }
  }

  async function unsubscribe() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch(`${API_BASE}/api/push/unsubscribe`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setSubscribed(false)
      setCurrentEndpoint(null)
      setShowPrefs(false)
      setSelectedMarkets([])
      setSelectedCategories([])
    } catch (e) {
      console.error('Unsubscribe hatası:', e)
    } finally {
      setLoading(false)
    }
  }

  async function savePreferences() {
    if (!currentEndpoint) return
    setSavingPrefs(true)
    try {
      await fetch(`${API_BASE}/api/push/preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: currentEndpoint,
          markets: selectedMarkets,
          categories: selectedCategories,
        }),
      })
      setShowPrefs(false)
    } catch (e) {
      console.error('Preferences kaydetme hatası:', e)
    } finally {
      setSavingPrefs(false)
    }
  }

  function toggleMarket(value: string) {
    setSelectedMarkets(prev =>
      prev.includes(value) ? prev.filter(m => m !== value) : [...prev, value]
    )
  }

  function toggleCategory(value: string) {
    setSelectedCategories(prev =>
      prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]
    )
  }

  if (!supported) return null

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      <button
        onClick={() => {
          if (!subscribed) subscribe()
          else setShowPrefs(p => !p)
        }}
        disabled={loading}
        title={subscribed ? 'Meldingsinstellingen' : 'Ontvang meldingen bij nieuwe deals'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          borderRadius: '20px',
          border: subscribed ? '1.5px solid #C41230' : '1.5px solid rgba(255,255,255,0.25)',
          background: subscribed ? 'rgba(196,18,48,0.12)' : 'transparent',
          color: subscribed ? '#C41230' : 'inherit',
          cursor: loading ? 'wait' : 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          transition: 'all 0.2s',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ fontSize: '16px' }}>{subscribed ? '🔔' : '🔕'}</span>
        {loading ? '...' : subscribed ? 'Meldingen aan' : 'Meldingen'}
      </button>

      {showPrefs && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 'calc(100% + 8px)',
          width: 280,
          background: 'white',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          border: '1px solid #E0D8CE',
          padding: '16px',
          zIndex: 100,
        }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>
            Meldingsvoorkeuren
          </p>
          <p style={{ fontSize: 11, color: '#9C9389', margin: '0 0 12px' }}>
            Leeg = alles ontvangen
          </p>

          {/* Markets */}
          <p style={{ fontSize: 11, fontWeight: 700, color: '#8C8478', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
            Supermarkten
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {MARKETS.map(m => (
              <button
                key={m.value}
                onClick={() => toggleMarket(m.value)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: selectedMarkets.includes(m.value) ? '1.5px solid #E33D26' : '1.5px solid #E0D8CE',
                  background: selectedMarkets.includes(m.value) ? '#FFF0ED' : 'white',
                  color: selectedMarkets.includes(m.value) ? '#E33D26' : '#5C5248',
                  transition: 'all 0.15s',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Categories */}
          <p style={{ fontSize: 11, fontWeight: 700, color: '#8C8478', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
            Categorieën
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                onClick={() => toggleCategory(c.value)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: selectedCategories.includes(c.value) ? '1.5px solid #1B5E3B' : '1.5px solid #E0D8CE',
                  background: selectedCategories.includes(c.value) ? '#E8F5E9' : 'white',
                  color: selectedCategories.includes(c.value) ? '#1B5E3B' : '#5C5248',
                  transition: 'all 0.15s',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={savePreferences}
              disabled={savingPrefs}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 10,
                background: '#1A1A1A',
                color: 'white',
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: savingPrefs ? 'wait' : 'pointer',
              }}
            >
              {savingPrefs ? 'Opslaan...' : 'Opslaan'}
            </button>
            <button
              onClick={unsubscribe}
              disabled={loading}
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                background: 'white',
                color: '#C41230',
                fontSize: 13,
                fontWeight: 600,
                border: '1.5px solid #C41230',
                cursor: 'pointer',
              }}
            >
              Uitschakelen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
