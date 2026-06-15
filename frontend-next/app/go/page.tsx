import type { Metadata } from 'next'
import { GoContent } from './GoContent'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function GoPage() {
  return <GoContent />
}
