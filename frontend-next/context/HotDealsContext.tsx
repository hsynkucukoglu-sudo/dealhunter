'use client'
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface HotDealsContextType {
  hotIds: Set<string>
  isHot: (id: string) => boolean
  toggleHot: (id: string) => void
  hotCount: number
}

const HotDealsContext = createContext<HotDealsContextType>({
  hotIds: new Set(),
  isHot: () => false,
  toggleHot: () => {},
  hotCount: 0,
})

export function HotDealsProvider({ children }: { children: React.ReactNode }) {
  const [hotIds, setHotIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const stored = localStorage.getItem('dh_hot')
    if (stored) {
      try { setHotIds(new Set(JSON.parse(stored))) } catch { /* ignore corrupt data */ }
    }
  }, [])

  const isHot = useCallback((id: string) => hotIds.has(id), [hotIds])

  const toggleHot = useCallback((id: string) => {
    setHotIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem('dh_hot', JSON.stringify([...next]))
      return next
    })
  }, [])

  return (
    <HotDealsContext.Provider value={{ hotIds, isHot, toggleHot, hotCount: hotIds.size }}>
      {children}
    </HotDealsContext.Provider>
  )
}

export function useHotDeals() {
  return useContext(HotDealsContext)
}
