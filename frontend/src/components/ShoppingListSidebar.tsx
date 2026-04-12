import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useShoppingList } from '@/context/ShoppingListContext'
import { useLanguage } from '@/context/LanguageContext'

export function ShoppingListSidebar() {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, clearCart, totalCost, totalSavings } = useShoppingList()
  const { t } = useLanguage()

  const handleWhatsAppShare = () => {
    if (items.length === 0) return

    let message = t.whatsappHeader

    const groupedItems = items.reduce((acc, item) => {
      if (!acc[item.market]) acc[item.market] = []
      acc[item.market].push(item)
      return acc
    }, {} as Record<string, typeof items>)

    Object.entries(groupedItems).forEach(([market, marketItems]) => {
      message += `🏪 *${market}*\n`
      marketItems.forEach(item => {
        message += `• ${item.quantity}x ${item.name} - €${(item.discountedPrice * item.quantity).toFixed(2)}\n`
      })
      message += '\n'
    })

    message += `${t.whatsappTotal} €${totalCost.toFixed(2)}\n`
    message += `${t.whatsappSavings} €${totalSavings.toFixed(2)}\n`

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(26, 26, 26, 0.3)', backdropFilter: 'blur(8px)' }}
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 h-full w-full max-w-md z-[70] flex flex-col"
            style={{
              background: '#FAF6F0',
              boxShadow: '-8px 0 30px rgba(0,0,0,0.08)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid #E0D8CE' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: '#E33D26' }}>
                  <span className="material-symbols-outlined text-white text-xl">shopping_bag</span>
                </div>
                <div>
                  <h2 className="text-lg font-headline font-bold" style={{ color: '#1A1A1A' }}>{t.myCart}</h2>
                  <p className="text-xs" style={{ color: '#8C8478' }}>{items.length} {items.length === 1 ? t.item : t.items}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl transition-colors cursor-pointer hover:bg-black/5"
                style={{ color: '#6B6259' }}
              >
                <span className="material-symbols-outlined">close</span>
              </motion.button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: '#EDE5DA' }}>
                    <span className="material-symbols-outlined text-4xl" style={{ color: '#C9C1B6' }}>shopping_bag</span>
                  </div>
                  <p className="font-headline font-bold text-sm uppercase tracking-widest" style={{ color: '#8C8478' }}>{t.cartEmpty}</p>
                  <p className="text-xs text-center max-w-[220px]" style={{ color: '#9C9389' }}>
                    {t.cartEmptyDesc}
                  </p>
                </div>
              ) : (
                items.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex gap-3 p-3 rounded-2xl"
                    style={{ background: 'white', border: '1px solid #E0D8CE' }}
                  >
                    <img
                      src={item.imageUrl || undefined}
                      alt={item.name}
                      className="w-16 h-16 object-contain rounded-xl p-1"
                      style={{ background: '#FAF6F0' }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-headline font-bold line-clamp-1 text-sm" style={{ color: '#1A1A1A' }}>{item.name}</h4>
                      <p className="text-[11px] font-headline uppercase tracking-widest mt-0.5" style={{ color: '#8C8478' }}>{item.market}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-headline font-black text-sm" style={{ color: '#E33D26' }}>
                          €{(item.discountedPrice * item.quantity).toFixed(2)}
                        </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: '#EDE5DA' }}>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md transition-colors font-bold text-sm cursor-pointer hover:bg-white"
                            style={{ color: '#6B6259' }}
                          >−</motion.button>
                          <span className="text-xs font-bold w-5 text-center" style={{ color: '#1A1A1A' }}>{item.quantity}</span>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md transition-colors font-bold text-sm cursor-pointer hover:bg-white"
                            style={{ color: '#6B6259' }}
                          >+</motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 space-y-3" style={{ borderTop: '1px solid #E0D8CE' }}>
                {/* Savings */}
                {totalSavings > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(27, 158, 75, 0.08)' }}>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg" style={{ color: '#1B9E4B' }}>savings</span>
                      <span className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{t.totalSavings}</span>
                    </div>
                    <span className="text-lg font-headline font-black" style={{ color: '#1B9E4B' }}>€{totalSavings.toFixed(2)}</span>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-end">
                  <span className="font-medium" style={{ color: '#8C8478' }}>{t.totalCost}</span>
                  <span className="text-3xl font-headline font-black" style={{ color: '#1A1A1A' }}>€{totalCost.toFixed(2)}</span>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-1">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={clearCart}
                    className="px-4 py-3 rounded-full font-headline font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
                    style={{ background: '#EDE5DA', color: '#6B6259' }}
                  >
                    {t.clear}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleWhatsAppShare}
                    className="flex-1 py-3 rounded-full font-headline font-bold text-xs uppercase tracking-widest text-white flex items-center justify-center gap-2 cursor-pointer transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #25D366, #128C7E)',
                      boxShadow: '0 4px 14px -3px rgba(37, 211, 102, 0.4)'
                    }}
                  >
                    <span className="material-symbols-outlined text-lg">share</span>
                    {t.shareWhatsApp}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
