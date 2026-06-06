import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'

  // Production ortamında www.dealhunter4u.nl dışındaki tüm domainleri yönlendir
  if (process.env.NODE_ENV === 'production' && host !== 'www.dealhunter4u.nl' && !host.includes('localhost')) {
    return NextResponse.redirect(`https://www.dealhunter4u.nl${request.nextUrl.pathname}${request.nextUrl.search}`, 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
