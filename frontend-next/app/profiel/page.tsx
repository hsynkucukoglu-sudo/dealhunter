import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { ProfilePage } from '@/components/ProfilePage'

export const metadata = {
  title: 'Mijn Profiel | DealHunter',
  description: 'Beheer je favorieten, prijsalerts en boodschappenlijst.',
}

export default async function ProfielPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return <ProfilePage />
}
