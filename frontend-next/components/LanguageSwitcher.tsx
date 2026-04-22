'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { useLanguage, Lang } from '@/context/LanguageContext'

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: 'nl', flag: '🇳🇱', label: 'NL' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'tr', flag: '🇹🇷', label: 'TR' },
]

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="flex items-center gap-0.5 p-1 rounded-full" style={{ background: '#1A1A1A' }}>
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
  )
}
