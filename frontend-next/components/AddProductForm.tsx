'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://dealhunter-production-d900.up.railway.app'
const MARKETS = ['Albert Heijn', 'Jumbo', 'Aldi', 'Lidl', 'Dirk', 'Plus', 'Hoogvliet']

interface AddProductFormProps {
  onAdded: () => void
}

const EMPTY_FORM = {
  name: '',
  market: 'Albert Heijn',
  originalPrice: '',
  discountedPrice: '',
  imageUrl: '',
  expiresAt: '',
  isCampaign: false,
}

export function AddProductForm({ onAdded }: AddProductFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ ...EMPTY_FORM })
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          originalPrice: parseFloat(formData.originalPrice),
          discountedPrice: parseFloat(formData.discountedPrice),
        }),
      })
      if (res.ok) {
        setFormData({ ...EMPTY_FORM })
        setIsOpen(false)
        onAdded()
      } else {
        const err = await res.json()
        alert(`Hata: ${err.error || 'Ürün eklenemedi'}`)
      }
    } catch {
      alert('Ürün eklenirken bir sorun oluştu.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = 'w-full px-4 py-3 rounded-xl text-sm font-medium placeholder:text-[#9C9389] focus:outline-none focus:ring-2 focus:ring-[#E33D26]/30 focus:border-[#E33D26] transition-all'
  const labelClass = 'block text-xs font-headline font-bold uppercase tracking-widest mb-1.5'

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-[60] p-4"
            style={{ background: 'rgba(26,26,26,0.3)', backdropFilter: 'blur(8px)' }}
            onClick={() => !isLoading && setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-3xl max-w-md w-full overflow-hidden"
              style={{ background: '#FAF6F0', boxShadow: '0 25px 60px rgba(0,0,0,0.12)' }}
            >
              <div className="p-5 flex items-center gap-3" style={{ background: '#1A1A1A' }}>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: '#E33D26' }}>
                  <span className="material-symbols-outlined text-white">add_shopping_cart</span>
                </div>
                <div>
                  <h2 className="text-lg font-headline font-bold text-white">{t.addProduct}</h2>
                  <p className="text-xs" style={{ color: '#9C9389' }}>{t.addProductDesc}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className={labelClass} style={{ color: '#8C8478' }}>{t.productName}</label>
                  <input
                    type="text" required value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputClass} placeholder={t.productNamePlaceholder}
                    style={{ background: 'white', border: '1.5px solid #E0D8CE', color: '#1A1A1A' }}
                  />
                </div>

                <div>
                  <label className={labelClass} style={{ color: '#8C8478' }}>{t.market}</label>
                  <select
                    value={formData.market}
                    onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                    className={inputClass}
                    style={{ background: 'white', border: '1.5px solid #E0D8CE', color: '#1A1A1A' }}
                  >
                    {MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass} style={{ color: '#8C8478' }}>{t.originalPrice}</label>
                    <input
                      type="number" step="0.01" required value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className={inputClass} placeholder="€5.99"
                      style={{ background: 'white', border: '1.5px solid #E0D8CE', color: '#1A1A1A' }}
                    />
                  </div>
                  <div>
                    <label className={labelClass} style={{ color: '#8C8478' }}>{t.discountedPrice}</label>
                    <input
                      type="number" step="0.01" required value={formData.discountedPrice}
                      onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                      className={inputClass} placeholder="€3.49"
                      style={{ background: 'white', border: '1.5px solid #E0D8CE', color: '#1A1A1A' }}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass} style={{ color: '#8C8478' }}>
                    {t.imageUrl} <span className="font-normal normal-case tracking-normal" style={{ color: '#9C9389' }}>{t.imageUrlOptional}</span>
                  </label>
                  <input
                    type="url" value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className={inputClass} placeholder="https://example.com/image.jpg"
                    style={{ background: 'white', border: '1.5px solid #E0D8CE', color: '#1A1A1A' }}
                  />
                </div>

                <div>
                  <label className={labelClass} style={{ color: '#8C8478' }}>{t.validUntilLabel}</label>
                  <input
                    type="date" required value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className={inputClass}
                    style={{ background: 'white', border: '1.5px solid #E0D8CE', color: '#1A1A1A' }}
                  />
                </div>

                <label
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors hover:bg-white"
                  style={{ background: 'rgba(227,61,38,0.04)', border: '1.5px solid rgba(227,61,38,0.15)' }}
                >
                  <input
                    type="checkbox" checked={formData.isCampaign}
                    onChange={(e) => setFormData({ ...formData, isCampaign: e.target.checked })}
                    className="w-4 h-4"
                    style={{ accentColor: '#E33D26' }}
                  />
                  <div>
                    <span className="text-sm font-headline font-bold" style={{ color: '#1A1A1A' }}>{t.campaignProduct}</span>
                    <p className="text-xs" style={{ color: '#8C8478' }}>{t.campaignProductDesc}</p>
                  </div>
                </label>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="button" whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(false)} disabled={isLoading}
                    className="flex-1 py-3 rounded-full font-headline font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
                    style={{ background: '#EDE5DA', color: '#6B6259' }}
                  >
                    {t.cancel}
                  </motion.button>
                  <motion.button
                    type="submit" disabled={isLoading}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 rounded-full font-headline font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all text-white"
                    style={{ background: '#E33D26', boxShadow: '0 4px 14px rgba(227,61,38,0.3)' }}
                  >
                    {isLoading
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <span className="material-symbols-outlined text-lg">check</span>}
                    {isLoading ? t.adding : t.add}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 p-5 rounded-full z-40 flex items-center gap-2 cursor-pointer text-white"
        style={{ background: '#E33D26', boxShadow: '0 8px 24px rgba(227,61,38,0.35)' }}
      >
        <span className="material-symbols-outlined">add</span>
      </motion.button>
    </>
  )
}
