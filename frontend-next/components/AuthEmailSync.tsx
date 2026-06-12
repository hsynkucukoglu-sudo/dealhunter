'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function AuthEmailSync() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status !== 'authenticated') return
    const userId = session?.user?.id
    const email = session?.user?.email
    if (!userId || !email) return

    const storageKey = `email-synced-${userId}`
    if (sessionStorage.getItem(storageKey)) return

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dealhunter-market-production.up.railway.app'
    fetch(`${backendUrl}/api/user/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email }),
    })
      .then(() => sessionStorage.setItem(storageKey, '1'))
      .catch(() => {})
  }, [status, session])

  return null
}
