'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Pas tonen nadat iemand echt aan het lezen is. Deze balk is 113px hoog en stond
// bovenaan het allereerste scherm, terwijl daaronder ook nog een vaste anchor-advertentie
// van 258px staat: op mobiel (69% van het verkeer) was daardoor op scherm één geen
// enkele aanbieding zichtbaar. Clarity 2026-08-02: 100% nieuwe bezoekers, 1 pagina per
// sessie, 26,4% scrolldiepte — je vraagt om een installatie aan iemand die nog niks
// van de site heeft gezien. Twee schermen scrollen is het signaal dat er wél interesse is.
const SCROLL_GATE_VIEWPORTS = 2

export function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return
    const dismissed = localStorage.getItem('dh_install_dismissed')
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) return

    let engaged = window.scrollY > window.innerHeight * SCROLL_GATE_VIEWPORTS
    let captured: BeforeInstallPromptEvent | null = null

    const show = () => {
      if (engaged && captured) setVisible(true)
    }

    const onScroll = () => {
      if (engaged) return
      if (window.scrollY > window.innerHeight * SCROLL_GATE_VIEWPORTS) {
        engaged = true
        window.removeEventListener('scroll', onScroll)
        show()
      }
    }

    // beforeinstallprompt moet direct worden afgevangen, anders toont de browser zijn
    // eigen mini-infobar. Het event bewaren we; alleen het tónen wachten we af.
    const handler = (e: Event) => {
      e.preventDefault()
      captured = e as BeforeInstallPromptEvent
      setPrompt(captured)
      show()
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('scroll', onScroll)
    }
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
