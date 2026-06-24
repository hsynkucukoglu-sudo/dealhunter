'use client'
import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage, Lang } from '@/context/LanguageContext'

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: 'nl', flag: '🇳🇱', label: 'NL' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'tr', flag: '🇹🇷', label: 'TR' },
]

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const current = LANGS.find(l => l.code === lang)!

  return (
    <div ref={ref} className="relative">
      {/* Mobile: compact single button */}
      <div className="sm:hidden">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-black cursor-pointer"
          style={{ background: '#1A1A1A', color: '#FFFFFF', fontFamily: 'Space Grotesk' }}
        >
          <span style={{ fontSize: '14px' }}>{current.flag}</span>
          <span style={{ fontSize: '10px', letterSpacing: '0.05em' }}>{current.label}</span>
        </motion.button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-9 z-50 flex flex-col gap-1 p-1 rounded-2xl shadow-xl"
              style={{ background: '#1A1A1A', minWidth: '72px' }}
            >
              {LANGS.map(({ code, flag, label }) => (
                <button
                  key={code}
                  onClick={() => { setLang(code); setOpen(false) }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all"
                  style={{
                    background: lang === code ? '#E33D26' : 'transparent',
                    color: '#FFFFFF',
                    fontFamily: 'Space Grotesk',
                  }}
                >
                  <span style={{ fontSize: '14px' }}>{flag}</span>
                  <span>{label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop: full pill */}
      <div className="hidden sm:flex items-center gap-0.5 p-1 rounded-full" style={{ background: '#1A1A1A' }}>
        {LANGS.map(({ code, flag, label }) => (
          <motion.button
            key={code}
            onClick={() => setLang(code)}
            whileTap={{ scale: 0.88 }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black cursor-pointer transition-all"
            style={{
              background: lang === code ? '#E33D26' : 'transparent',
              color: '#FFFFFF',
              fontFamily: 'Space Grotesk',
              letterSpacing: '0.05em',
            }}
          >
            <span style={{ fontSize: '14px' }}>{flag}</span>
            <span>{label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
