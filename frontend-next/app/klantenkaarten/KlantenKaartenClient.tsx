'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'

const CARDS = [
  {
    id: 'ah',
    name: 'Albert Heijn Bonuskaart',
    color: '#00AED6',
    format: 'EAN13',
    placeholder: '8712345678901',
    hint: '13 cijfers — staat op je Bonuskaart of in de AH-app',
  },
  {
    id: 'jumbo',
    name: "Jumbo Extra's",
    color: '#FFC60B',
    textColor: '#1A1A1A',
    format: 'EAN13',
    placeholder: '8712345678901',
    hint: '13 cijfers — staat op je Jumbo Extra\'s kaart',
  },
  {
    id: 'lidl',
    name: 'Lidl Plus',
    color: '#0050AA',
    format: 'EAN13',
    placeholder: '1234567890123',
    hint: 'Kaartnummer uit de Lidl Plus app',
  },
  {
    id: 'aldi',
    name: 'Aldi',
    color: '#1B3F6E',
    format: 'CODE128',
    placeholder: 'ALDI1234567890',
    hint: 'Klantnummer van je Aldi-account',
  },
  {
    id: 'dirk',
    name: 'Dirk',
    color: '#E30613',
    format: 'EAN13',
    placeholder: '8712345678901',
    hint: '13 cijfers — staat op je Dirk klantenkaart',
  },
  {
    id: 'hoogvliet',
    name: 'Hoogvliet',
    color: '#164194',
    format: 'EAN13',
    placeholder: '8712345678901',
    hint: 'Kaartnummer van je Hoogvliet spaarkaart',
  },
]

type CardId = (typeof CARDS)[number]['id']

function BarcodeCanvas({ value, format }: { value: string; format: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!canvasRef.current || !value) return
    setError(false)

    import('jsbarcode').then(({ default: JsBarcode }) => {
      try {
        JsBarcode(canvasRef.current!, value, {
          format,
          width: 2.5,
          height: 80,
          displayValue: true,
          fontSize: 14,
          margin: 12,
          background: '#ffffff',
          lineColor: '#000000',
        })
      } catch {
        setError(true)
      }
    }).catch(() => setError(true))
  }, [value, format])

  if (error) {
    return (
      <div className="flex items-center justify-center py-6 rounded-xl" style={{ background: '#FFF0ED', border: '1.5px solid #FCCBB5' }}>
        <p className="text-sm" style={{ color: '#E33D26' }}>Ongeldig kaartnummer — controleer het formaat.</p>
      </div>
    )
  }

  return <canvas ref={canvasRef} className="w-full max-w-sm mx-auto block" style={{ borderRadius: 8 }} />
}

function CardItem({
  card,
  value,
  onChange,
  onDelete,
}: {
  card: (typeof CARDS)[number]
  value: string | null
  onChange: (id: CardId, v: string) => void
  onDelete: (id: CardId) => void
}) {
  const [editing, setEditing] = useState(!value)
  const [input, setInput] = useState(value ?? '')
  const [fullscreen, setFullscreen] = useState(false)

  const handleSave = () => {
    if (!input.trim()) return
    onChange(card.id as CardId, input.trim())
    setEditing(false)
  }

  return (
    <>
      {/* Fullscreen modal */}
      {fullscreen && value && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: 'white' }}
          onClick={() => setFullscreen(false)}
        >
          <div className="w-full max-w-md px-6">
            <p className="text-center font-bold mb-6 text-lg" style={{ color: '#1A1A1A', fontFamily: 'Space Grotesk' }}>
              {card.name}
            </p>
            <BarcodeCanvas value={value} format={card.format} />
            <p className="text-center text-sm mt-4" style={{ color: '#9C9389' }}>Tik om te sluiten</p>
          </div>
        </div>
      )}

      <div
        className="rounded-3xl overflow-hidden"
        style={{ border: '1.5px solid #E0D8CE', background: 'white' }}
      >
        {/* Card header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ background: card.color }}
        >
          <p className="font-bold text-base" style={{ color: (card as { textColor?: string }).textColor ?? 'white', fontFamily: 'Space Grotesk' }}>
            {card.name}
          </p>
          {value && (
            <button
              onClick={() => setFullscreen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(0,0,0,0.2)', color: (card as { textColor?: string }).textColor ?? 'white' }}
            >
              <span className="material-symbols-outlined text-sm">fullscreen</span>
              Toon
            </button>
          )}
        </div>

        {/* Card body */}
        <div className="p-5">
          {value && !editing ? (
            <>
              <BarcodeCanvas value={value} format={card.format} />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => { setInput(value); setEditing(true) }}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold"
                  style={{ border: '1.5px solid #E0D8CE', color: '#5A534B' }}
                >
                  Bewerken
                </button>
                <button
                  onClick={() => onDelete(card.id as CardId)}
                  className="py-2 px-4 rounded-xl text-sm font-semibold"
                  style={{ border: '1.5px solid #FCCBB5', color: '#E33D26' }}
                >
                  Verwijderen
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs mb-2" style={{ color: '#9C9389', fontFamily: 'JetBrains Mono' }}>{card.hint}</p>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={card.placeholder}
                className="w-full px-4 py-3 rounded-2xl text-sm border outline-none mb-3"
                style={{ borderColor: '#E0D8CE', background: '#FAFAF8', fontFamily: 'JetBrains Mono', color: '#1A1A1A', letterSpacing: '0.08em' }}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={!input.trim()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
                  style={{ background: '#1A1A1A', color: 'white' }}
                >
                  Opslaan
                </button>
                {value && (
                  <button
                    onClick={() => setEditing(false)}
                    className="py-2.5 px-4 rounded-xl text-sm font-semibold"
                    style={{ border: '1.5px solid #E0D8CE', color: '#5A534B' }}
                  >
                    Annuleren
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export function KlantenKaartenClient() {
  const [cards, setCards] = useState<Partial<Record<CardId, string>>>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('dh_klantenkaarten')
    if (stored) {
      try { setCards(JSON.parse(stored)) } catch { /* ignore */ }
    }
    setLoaded(true)
  }, [])

  const handleChange = useCallback((id: CardId, value: string) => {
    setCards(prev => {
      const next = { ...prev, [id]: value }
      localStorage.setItem('dh_klantenkaarten', JSON.stringify(next))
      return next
    })
  }, [])

  const handleDelete = useCallback((id: CardId) => {
    setCards(prev => {
      const next = { ...prev }
      delete next[id]
      localStorage.setItem('dh_klantenkaarten', JSON.stringify(next))
      return next
    })
  }, [])

  if (!loaded) return null

  return (
    <div className="space-y-4">
      {CARDS.map(card => (
        <CardItem
          key={card.id}
          card={card}
          value={cards[card.id as CardId] ?? null}
          onChange={handleChange}
          onDelete={handleDelete}
        />
      ))}

      <div className="mt-8 p-4 rounded-2xl flex items-start gap-3" style={{ background: 'rgba(201,193,182,0.2)', border: '1px solid rgba(201,193,182,0.4)' }}>
        <span className="material-symbols-outlined text-xl flex-none" style={{ color: '#8C8478' }}>lock</span>
        <p className="text-xs leading-relaxed" style={{ color: '#6B6259', fontFamily: 'Hanken Grotesk' }}>
          Je kaartnummers worden alleen opgeslagen op jouw apparaat (localStorage).
          DealHunter4U heeft geen toegang tot deze gegevens.
        </p>
      </div>
    </div>
  )
}
