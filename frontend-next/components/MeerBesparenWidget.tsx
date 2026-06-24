'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AW = (mid: number, dest: string) =>
  `https://www.awin1.com/cread.php?awinmid=${mid}&awinaffid=2932569&ued=${encodeURIComponent(dest)}`

const DEALS = [
  {
    id: 'energie',
    category: '⚡ Energie',
    items: [
      { name: 'ENGIE',       tagline: 'Gas & stroom vergelijken', cta: 'Bekijk tarief', color: '#0064A8', url: 'https://ds1.nl/c/?si=365&li=20757&wi=420902' },
      { name: 'Vattenfall',  tagline: 'Groen & betrouwbaar',      cta: 'Bekijk tarief', color: '#1B6B3A', url: 'https://lt45.net/c/?si=2036&li=119986&wi=420902' },
      { name: 'Oxxio',       tagline: 'Vaste lage tarieven',      cta: 'Bekijk tarief', color: '#E4002B', url: 'https://ds1.nl/c/?si=2028&li=119834&wi=420902' },
      { name: 'Pure Energie', tagline: 'Goedkoop & transparant',  cta: 'Bekijk tarief', color: '#F7941D', url: 'https://jdt8.net/c/?si=9321&li=1420973&wi=420902' },
    ],
  },
  {
    id: 'verzekering',
    category: '🏥 Verzekering',
    items: [
      { name: 'ONVZ',                  tagline: 'Zorgverzekering vergelijken', cta: 'Bekijk premie',  color: '#E4002B', url: 'https://ds1.nl/c/?si=7185&li=1332385&wi=420902' },
      { name: 'Nationale-Nederlanden', tagline: 'Zorg & aanvullend pakket',    cta: 'Bekijk premie',  color: '#FF6200', url: 'https://ds1.nl/c/?si=2340&li=1362622&wi=420902' },
      { name: 'DELA',                  tagline: 'Uitvaartverzekering',         cta: 'Bekijk aanbod',  color: '#003087', url: 'https://lt45.net/c/?si=9087&li=1414707&wi=420902' },
      { name: 'Monuta',                tagline: 'Uitvaartzorg geregeld',       cta: 'Bekijk aanbod',  color: '#2C5F8A', url: 'https://jdt8.net/c/?si=9073&li=1414357&wi=420902' },
    ],
  },
  {
    id: 'reizen',
    category: '✈️ Reizen',
    items: [
      { name: 'CheapTickets',       tagline: 'Goedkope vluchten',     cta: 'Zoek vlucht',  color: '#D9251D', url: 'https://ds1.nl/c/?si=1096&li=70202&wi=420902' },
      { name: 'Vakantiediscounter', tagline: 'Last minute vakanties',  cta: 'Bekijk deals', color: '#006FB9', url: 'https://ds1.nl/c/?si=7805&li=1362777&wi=420902' },
      { name: 'Prijsvrij',          tagline: 'Vluchten & hotels',      cta: 'Bekijk deals', color: '#FF6B00', url: 'https://ds1.nl/c/?si=2916&li=168050&wi=420902' },
      { name: 'Oad',                tagline: 'Georganiseerde reizen',  cta: 'Bekijk reizen', color: '#003B7A', url: 'https://ds1.nl/c/?si=7562&li=1352504&wi=420902' },
    ],
  },
  {
    id: 'wonen',
    category: '🏠 Thuis & Wonen',
    items: [
      { name: 'Bol.com',          tagline: 'Miljoen producten, snel thuis', cta: 'Bekijk aanbod',    color: '#0000A4', url: `https://partner.bol.com/click/click?p=2&t=url&s=1527078&url=${encodeURIComponent('https://www.bol.com/')}` },
      { name: 'Kwantum',         tagline: 'Gordijnen, vloeren & meer',    cta: 'Bekijk aanbod',    color: '#E2001A', url: 'https://ds1.nl/c/?si=7762&li=1360074&wi=420902' },
      { name: 'Witgoedhuis',     tagline: 'Witgoed & huishoudapparaten',  cta: 'Bekijk aanbod',    color: '#005BAC', url: 'https://ds1.nl/c/?si=6570&li=1307850&wi=420902' },
      { name: 'Tuinmeubelwereld', tagline: 'Tuinmeubelen & accessoires',  cta: 'Bekijk aanbod',    color: '#2E7D32', url: `https://ds1.nl/c/?si=16070&li=19167&wi=420902&dl=${encodeURIComponent('https://www.tuinmeubelwereld.nl/')}` },
      { name: 'Dille&Kamille',   tagline: 'Wonen, koken & tuin',          cta: 'Bekijk collectie', color: '#5C8A3C', url: 'https://lt45.net/c/?si=7059&li=1325903&wi=420902' },
      { name: 'Miss Towels',     tagline: 'Handdoeken & badtextiel NL',   cta: 'Bekijk aanbod',    color: '#E91E8C', url: `https://ds1.nl/c/?si=16070&li=21226&wi=420902&dl=${encodeURIComponent('https://www.misstowels.nl/')}` },
    ],
  },
  {
    id: 'mode',
    category: '👟 Schoenen & Sport',
    items: [
      { name: 'Holland & Barrett', tagline: 'Vitamines, sport & health',  cta: 'Bekijk aanbod',    color: '#007A3D', url: AW(8108,   'https://www.hollandandbarrett.nl/') },
      { name: 'Direct Running',   tagline: 'Hardloopschoenen & kleding', cta: 'Bekijk aanbod',    color: '#E63329', url: AW(71531,  'https://www.direct-running.nl/') },
      { name: 'Direct Volley',    tagline: 'Volleybal gear & kleding',   cta: 'Bekijk aanbod',    color: '#F4A300', url: AW(103041, 'https://www.direct-volley.nl/') },
      { name: 'Sinner',           tagline: 'Sport & outdoorkleding',     cta: 'Bekijk collectie', color: '#D40000', url: 'https://lt45.net/c/?si=1281&li=79935&wi=420902' },
      { name: 'Vitaminstore',     tagline: 'Vitamines & supplementen',   cta: 'Bekijk aanbod',    color: '#00A651', url: 'https://ds1.nl/c/?si=5676&li=1266442&wi=420902' },
    ],
  },
]

const FEATURED_BRANDS = [
  { name: 'Holland & Barrett', category: 'mode',        color: '#007A3D' },
  { name: 'Bol.com',           category: 'wonen',       color: '#0000A4' },
  { name: 'ENGIE',             category: 'energie',     color: '#0064A8' },
  { name: 'CheapTickets',      category: 'reizen',      color: '#D9251D' },
  { name: 'Kwantum',           category: 'wonen',       color: '#E2001A' },
  { name: 'Nationale-N.',      category: 'verzekering', color: '#FF6200' },
]

interface Props {
  open: boolean
  onClose: () => void
  onOpen: (category: string) => void
  activeCategory?: string
}

export function MeerBesparenWidget({ open, onClose, onOpen, activeCategory }: Props) {
  const [tab, setTab] = useState(activeCategory ?? 'energie')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && activeCategory) setTab(activeCategory)
  }, [open, activeCategory])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const activeGroup = DEALS.find(d => d.id === tab) ?? DEALS[0]

  return (
    <>
      {/* BRAND CHIPS — altways visible, direct click to open drawer */}
      <section id="meer-besparen" className="mb-6">
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(201,193,182,0.4)',
            boxShadow: '0 2px 0 #DDD0C4',
          }}
        >
          <span
            className="text-[11px] font-black uppercase tracking-wider whitespace-nowrap flex-none"
            style={{ color: '#8C8478', fontFamily: 'Space Grotesk, sans-serif' }}
          >
            💡 Meer besparen
          </span>
          <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
            {FEATURED_BRANDS.map(b => (
              <button
                key={b.name}
                onClick={() => onOpen(b.category)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all hover:scale-105 active:scale-95 flex-none"
                style={{
                  background: `${b.color}12`,
                  border: `1px solid ${b.color}35`,
                  color: b.color,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-none" style={{ background: b.color }} />
                {b.name}
              </button>
            ))}
          </div>
          <span
            className="text-[10px] font-medium whitespace-nowrap flex-none"
            style={{ color: '#C9C1B6' }}
          >
            Gesponsord
          </span>
        </div>
      </section>

      {/* DRAWER */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 z-[200]"
              style={{ background: 'rgba(26,26,26,0.45)', backdropFilter: 'blur(3px)' }}
            />

            {/* Bottom sheet */}
            <motion.div
              key="drawer"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 340 }}
              className="fixed bottom-0 left-0 right-0 z-[201] flex flex-col"
              style={{
                maxHeight: '82vh',
                background: '#F5EDE3',
                borderRadius: '24px 24px 0 0',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
              }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1 flex-none">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(201,193,182,0.7)' }} />
              </div>

              {/* Header */}
              <div
                className="flex items-center justify-between px-5 pb-3 pt-1 flex-none"
                style={{ borderBottom: '1px solid rgba(201,193,182,0.35)' }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 18 }}>💡</span>
                  <h2
                    className="text-base font-black uppercase tracking-wide"
                    style={{ color: '#1A1A1A', fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    Meer besparen
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
                  style={{ background: 'rgba(201,193,182,0.3)', color: '#6B6259' }}
                  aria-label="Sluiten"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              {/* Category tabs */}
              <div
                className="flex gap-1 px-4 py-3 overflow-x-auto no-scrollbar flex-none"
                style={{ borderBottom: '1px solid rgba(201,193,182,0.3)' }}
              >
                {DEALS.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setTab(d.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex-none"
                    style={
                      tab === d.id
                        ? { background: '#1A1A1A', color: 'white' }
                        : { background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(201,193,182,0.4)', color: '#6B6259' }
                    }
                  >
                    {d.category}
                  </button>
                ))}
              </div>

              {/* Cards */}
              <div ref={contentRef} className="overflow-y-auto flex-1 p-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.15 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                  >
                    {activeGroup.items.map(item => (
                      <a
                        key={item.name}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="flex flex-col gap-2 px-4 py-4 rounded-2xl transition-transform hover:scale-[1.02] active:scale-[0.97]"
                        style={{
                          background: 'rgba(255,255,255,0.85)',
                          border: '1px solid rgba(201,193,182,0.4)',
                          boxShadow: '0 2px 0 #DDD0C4',
                          textDecoration: 'none',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-none"
                            style={{ background: item.color }}
                          />
                          <span className="text-sm font-black truncate" style={{ color: '#1A1A1A' }}>
                            {item.name}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed" style={{ color: '#9C9389' }}>
                          {item.tagline}
                        </p>
                        <span
                          className="text-[11px] font-bold mt-auto"
                          style={{ color: item.color }}
                        >
                          {item.cta} →
                        </span>
                      </a>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
