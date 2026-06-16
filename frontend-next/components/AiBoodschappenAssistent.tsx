'use client'
import React, { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface Message {
  role: 'user' | 'ai'
  text: string
}

const SUGGESTIONS = [
  '€30 boodschappenlijst deze week?',
  'Goedkoopste eiwitten vandaag?',
  'Beste vleesaanbieding welke supermarkt?',
]

export function AiBoodschappenAssistent() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      // Scroll into view only when first opening
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open, messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text: string) {
    const q = text.trim()
    if (!q || loading) return

    setMessages(prev => [...prev, { role: 'user', text: q }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai-assistent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'ai', text: data.answer ?? data.error ?? 'Er ging iets mis.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Verbindingsfout — probeer het opnieuw.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const isEmpty = messages.length === 0

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="AI Boodschappen Assistent openen"
        className="fixed z-50 bottom-40 right-4 md:bottom-8 md:right-8 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #3D3D3D 100%)', color: 'white' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              className="material-symbols-outlined"
              initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ fontSize: 24 }}
            >
              close
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ fontSize: 28, lineHeight: 1 }}
            >
              ✨
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed z-50 bottom-[14.5rem] right-4 md:bottom-28 md:right-8 w-[calc(100vw-2rem)] max-w-sm rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ background: '#FDFAF7', border: '1.5px solid #EAE4DE', maxHeight: '70vh' }}
            role="dialog"
            aria-label="AI Boodschappen Assistent"
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 shrink-0" style={{ background: '#1A1A1A', color: 'white' }}>
              <span style={{ fontSize: 20 }}>✨</span>
              <div>
                <p className="text-sm font-bold leading-tight">AI Boodschappen Assistent</p>
                <p className="text-[11px] opacity-60">Powered by Claude · DealHunter4U</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="ml-auto opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Sluiten"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
              {isEmpty && (
                <div className="flex flex-col items-center text-center gap-4 py-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
                    style={{ background: '#EAE4DE' }}
                  >
                    🛒
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#1A1A1A' }}>Hoe kan ik je helpen?</p>
                    <p className="text-xs mt-1" style={{ color: '#8C8478' }}>Stel een vraag over de aanbiedingen van vandaag</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {SUGGESTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="text-xs px-3 py-1.5 rounded-full transition-colors font-medium"
                        style={{ background: '#EAE4DE', color: '#1A1A1A' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#DDD6CE' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#EAE4DE' }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 mr-2"
                      style={{ background: '#1A1A1A' }}
                    >
                      ✨
                    </div>
                  )}
                  <div
                    className="text-sm leading-relaxed rounded-2xl px-3.5 py-2.5 max-w-[85%] whitespace-pre-wrap"
                    style={
                      msg.role === 'user'
                        ? { background: '#1A1A1A', color: 'white', borderBottomRightRadius: 4 }
                        : { background: '#EAE4DE', color: '#1A1A1A', borderBottomLeftRadius: 4 }
                    }
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0"
                    style={{ background: '#1A1A1A' }}
                  >
                    ✨
                  </div>
                  <div className="flex gap-1 px-3.5 py-3 rounded-2xl" style={{ background: '#EAE4DE', borderBottomLeftRadius: 4 }}>
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: '#8C8478', animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 shrink-0" style={{ borderTop: '1px solid #EAE4DE' }}>
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Stel een vraag..."
                  rows={1}
                  className="flex-1 resize-none rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 transition-shadow"
                  style={{
                    background: '#EAE4DE',
                    color: '#1A1A1A',
                    border: 'none',
                    maxHeight: 100,
                    lineHeight: 1.5,
                  }}
                  onInput={e => {
                    const t = e.currentTarget
                    t.style.height = 'auto'
                    t.style.height = `${Math.min(t.scrollHeight, 100)}px`
                  }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-opacity disabled:opacity-40"
                  style={{ background: '#1A1A1A', color: 'white' }}
                  aria-label="Verstuur"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
                </button>
              </div>
              <p className="text-[10px] text-center mt-2" style={{ color: '#C9C1B6' }}>
                AI kan fouten maken · Controleer prijzen op de site
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
