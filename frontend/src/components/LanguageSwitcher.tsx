import React from 'react'
import { motion } from 'framer-motion'
import { useLanguage, Lang } from '@/context/LanguageContext'

const LANGS: { code: Lang; flag: string }[] = [
  { code: 'nl', flag: '🇳🇱' },
  { code: 'en', flag: '🇬🇧' },
  { code: 'tr', flag: '🇹🇷' },
]

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()

  return (
    <div
      className="flex items-center gap-0.5 p-1 rounded-full"
      style={{ background: '#1A1A1A' }}
    >
      {LANGS.map(({ code, flag }) => (
        <motion.button
          key={code}
          onClick={() => setLang(code)}
          whileTap={{ scale: 0.88 }}
          className="w-8 h-8 flex items-center justify-center rounded-full text-base transition-all cursor-pointer"
          style={{
            background: lang === code ? '#E33D26' : 'transparent',
            boxShadow: lang === code ? '0 2px 8px rgba(227,61,38,0.4)' : 'none',
          }}
          title={code.toUpperCase()}
        >
          {flag}
        </motion.button>
      ))}
    </div>
  )
}
