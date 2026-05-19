'use client'
import React, { useState } from 'react'
import { FAQ } from '@/lib/marketFaqs'

export function MarketFAQ({ faqs, marketName }: { faqs: FAQ[]; marketName: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!faqs.length) return null

  return (
    <section className="mt-20" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-2xl font-headline font-bold mb-2" style={{ color: '#1A1A1A' }}>
        Veelgestelde vragen over {marketName} aanbiedingen
      </h2>
      <p className="text-sm mb-8" style={{ color: '#8C8478' }}>
        Alles wat je wil weten over besparen, kortingen en weekdeals bij {marketName}.
      </p>

      <div className="flex flex-col gap-3">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i
          return (
            <div
              key={i}
              className="rounded-2xl overflow-hidden"
              style={{ background: 'white', border: '1.5px solid #E0D8CE' }}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-sm pr-4 leading-snug" style={{ color: '#1A1A1A' }}>
                  {faq.question}
                </span>
                <span
                  className="material-symbols-outlined flex-none text-xl transition-transform duration-200"
                  style={{
                    color: '#8C8478',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  expand_more
                </span>
              </button>

              {isOpen && (
                <div className="px-6 pb-5">
                  <p className="text-sm leading-relaxed" style={{ color: '#6B6259' }}>
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
