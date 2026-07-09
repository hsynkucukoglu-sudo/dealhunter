'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return
    const dismissed = localStorage.getItem('dh_install_dismissed')
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) return

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!visible || !prompt) return null

  const handleInstall = async () => {
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setVisible(false)
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      background: '#1A1A1A', color: 'white',
      padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10,
      zIndex: 9999, borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>📲</span>
      <p style={{ margin: 0, fontSize: 13, flex: 1 }}>
        <strong>Voeg DealHunter toe aan je beginscherm</strong>
        <span style={{ color: 'rgba(255,255,255,0.55)', marginLeft: 8 }}>Altijd snel deals bekijken</span>
      </p>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={() => { localStorage.setItem('dh_install_dismissed', String(Date.now())); setVisible(false) }}
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12 }}
        >
          Nee
        </button>
        <button
          onClick={handleInstall}
          style={{ background: '#E33D26', border: 'none', color: 'white', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}
        >
          Installeer
        </button>
      </div>
    </div>
  )
}
