import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createTransferToken } from '@/lib/auth-transfer'

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

  // Use plain Response — NextResponse.redirect rejects non-http(s) schemes
  return new Response(null, {
    status: 302,
    headers: {
      Location: `dealhunter://auth?t=${encodeURIComponent(token)}`,
    },
  })
}
