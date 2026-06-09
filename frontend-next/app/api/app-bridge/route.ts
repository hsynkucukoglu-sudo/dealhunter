import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createTransferToken } from '@/lib/auth-transfer'

// Called after Google OAuth in Chrome Custom Tabs.
// Reads the session set by NextAuth, creates a signed transfer token,
// and redirects to the app via deep link.
export async function GET() {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.redirect(new URL('/login', 'https://www.dealhunter4u.nl'))
  }

  const token = createTransferToken({
    id: (session.user as { id?: string }).id ?? session.user.email,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  })

  return NextResponse.redirect(`dealhunter://auth?t=${encodeURIComponent(token)}`)
}
