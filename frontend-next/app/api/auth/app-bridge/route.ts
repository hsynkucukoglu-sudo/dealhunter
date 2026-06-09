import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createTransferToken } from '@/lib/auth-transfer'

// Chrome Custom Tabs OAuth tamamlandıktan sonra buraya yönlendirilir.
// Session (Chrome cookie'de) okunur, imzalı transfer token oluşturulur,
// dealhunter:// deep link ile uygulamaya geri dönülür.
export async function GET() {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL ?? 'https://www.dealhunter4u.nl'))
  }

  const token = createTransferToken({
    id: (session.user as { id?: string }).id ?? session.user.email,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  })

  return NextResponse.redirect(`dealhunter://auth?t=${encodeURIComponent(token)}`)
}
