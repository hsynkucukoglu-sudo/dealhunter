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
      { name: 'ENGIE',           tagline: 'Gas & stroom vergelijken',  cta: 'Bekijk tarief',        color: '#0064A8', url: 'https://ds1.nl/c/?si=365&li=20757&wi=420902' },
      { name: 'Vattenfall',      tagline: 'Duurzame energie',           cta: 'Bekijk tarief',        color: '#009B3A', url: 'https://lt45.net/c/?si=2036&li=119986&wi=420902' },
      { name: 'energiedirect',   tagline: 'Goedkoop energie',           cta: 'Bekijk tarief',        color: '#E85800', url: 'https://lt45.net/c/?si=924&li=55221&wi=420902' },
      { name: 'UnitedConsumers', tagline: 'Energie coöperatie',         cta: 'Bekijk tarief',        color: '#FF6600', url: AW(8311, 'https://www.unitedconsumers.com/energie') },
    ],
  },
  {
    id: 'reizen',
    category: '✈️ Reizen',
    items: [
      { name: 'CheapTickets',       tagline: 'Goedkope vluchten',       cta: 'Zoek vlucht',          color: '#D9251D', url: 'https://ds1.nl/c/?si=1096&li=70202&wi=420902' },
      { name: 'Tjingo',             tagline: 'Vakantiedeals',            cta: 'Bekijk deals',         color: '#FF6B00', url: 'https://ds1.nl/c/?si=2554&li=148518&wi=420902' },
      { name: 'Vakantiediscounter', tagline: 'Last minute vakanties',    cta: 'Bekijk deals',         color: '#006FB9', url: 'https://ds1.nl/c/?si=7805&li=1362777&wi=420902' },
      { name: 'Youfone',            tagline: 'Goedkoop sim only',        cta: 'Bekijk abonnementen',  color: '#E4002B', url: 'https://lt45.net/c/?si=1174&li=73446&wi=420902' },
    ],
  },
  {
    id: 'wonen',
    category: '🏠 Thuis & Wonen',
    items: [
      { name: 'Lampen24',       tagline: 'Verlichting & interieur',     cta: 'Bekijk aanbod',    color: '#F5861B', url: AW(8151,   'https://www.lampen24.nl/') },
      { name: 'Diamond Smile',  tagline: 'Tandverzorging',              cta: 'Bekijk producten', color: '#00B4CC', url: AW(28859,  'https://www.diamondsmile.nl/') },
      { name: 'Medpets',        tagline: 'Dierenbenodigdheden',         cta: 'Bekijk aanbod',    color: '#27AE60', url: AW(81519,  'https://www.medpets.nl/') },
      { name: 'Refurbished.nl', tagline: 'Refurbished elektronica',     cta: 'Bekijk deals',     color: '#3B82F6', url: AW(112024, 'https://www.refurbished.nl/') },
    ],
  },
  {
    id: 'mode',
    category: '🛍️ Mode & Lifestyle',
    items: [
      { name: 'Street-One', tagline: 'Damesmode',             cta: 'Bekijk collectie', color: '#C4956A', url: AW(16112,  'https://www.street-one.nl/') },
      { name: 'Finbike',    tagline: 'E-bikes & fietsen',     cta: 'Bekijk fietsen',   color: '#007AC2', url: AW(120301, 'https://www.finbike.com/nl/') },
      { name: 'Babubas',    tagline: 'Babykleding & -spullen',cta: 'Bekijk aanbod',    color: '#E879A0', url: AW(119167, 'https://www.babubas.nl/') },
      { name: 'Bazta',      tagline: 'Schoenen & accessoires',cta: 'Bekijk aanbod',    color: '#8B5CF6', url: AW(38874,  'https://www.bazta.nl/') },
    ],
  },
]

interface Props {
  open: boolean
  onClose: () => void
  activeCategory?: string
}

export function MeerBesparenWidget({ open, onClose, activeCategory }: Props) {
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
      {/* COMPACT TRIGGER ROW */}
      <section id="meer-besparen" className="mb-6">
        <button
          onClick={() => { /* open handled from parent via props */ }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left"
          style={{
            background: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(201,193,182,0.4)',
            boxShadow: '0 2px 0 #DDD0C4',
            cursor: 'default',
          }}
        >
          <span style={{ fontSize: 16 }}>💡</span>
          <span
            className="text-sm font-black uppercase tracking-wide"
            style={{ color: '#1A1A1A', fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Meer besparen
          </span>
          <div className="flex gap-1.5 ml-1 overflow-hidden">
            {DEALS.map(d => (
              <span
                key={d.id}
                className="text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{ background: 'rgba(201,193,182,0.25)', color: '#8C8478' }}
              >
                {d.category.split(' ').slice(0, 2).join(' ')}
              </span>
            ))}
          </div>
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full ml-auto"
            style={{ background: 'rgba(201,193,182,0.4)', color: '#9C9389' }}
          >
            Gesponsord
          </span>
        </button>
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
