'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'

export function CookieBanner() {
  const [show, setShow] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) setShow(true)
  }, [])

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted')
    setShow(false)
    window.dispatchEvent(new Event('cookie_consent_accepted'))
  }

  const decline = () => {
    localStorage.setItem('cookie_consent', 'declined')
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-20 md:bottom-4 left-4 right-4 z-[200]"
        >
          <div
            className="max-w-3xl mx-auto rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            style={{
              background: '#1A1A1A',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white mb-0.5">🍪 {t.cookieTitle}</p>
              <p className="text-xs leading-relaxed" style={{ color: '#9C9389' }}>
                {t.cookieDesc}{' '}
                <a href="/privacy" className="underline" style={{ color: '#C9C1B6' }}>
                  Privacybeleid
                </a>
              </p>
            </div>
            <div className="flex gap-2 flex-none">
              <button
                onClick={decline}
                className="px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all hover:bg-white/20"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#C9C1B6' }}
              >
                {t.cookieDecline}
              </button>
              <button
                onClick={accept}
                className="px-4 py-2 rounded-full text-sm font-bold cursor-pointer transition-all hover:opacity-90"
                style={{ background: '#E33D26', color: 'white' }}
              >
                {t.cookieAccept}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
