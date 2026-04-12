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
    <div className="flex items-center gap-1 p-1 rounded-full" style={{ background: 'rgba(0,0,0,0.04)' }}>
      {LANGS.map(({ code, flag, label }) => (
        <motion.button
          key={code}
          onClick={() => setLang(code)}
          whileTap={{ scale: 0.9 }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-headline font-bold transition-all cursor-pointer"
          style={{
            background: lang === code ? '#1A1A1A' : 'transparent',
            color: lang === code ? 'white' : '#6B6259',
          }}
        >
          <span>{flag}</span>
          <span>{label}</span>
        </motion.button>
      ))}
    </div>
  )
}
