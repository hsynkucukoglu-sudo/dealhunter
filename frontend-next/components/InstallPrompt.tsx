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
      position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      background: '#1A1A1A', color: 'white', borderRadius: 16,
      padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)', zIndex: 9999,
      maxWidth: 340, width: 'calc(100% - 32px)',
    }}>
      <span style={{ fontSize: 24 }}>📲</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>Voeg toe aan beginscherm</p>
        <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Altijd snel deals bekijken</p>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => setVisible(false)}
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}
        >
          Nee
        </button>
        <button
          onClick={handleInstall}
          style={{ background: '#E33D26', border: 'none', color: 'white', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}
        >
          Installeer
        </button>
      </div>
    </div>
  )
}
