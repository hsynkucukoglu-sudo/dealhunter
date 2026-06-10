import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''

  // Production ortamında www.dealhunter4u.nl dışındaki tüm domainleri yönlendir
  // Railway healthcheck ve Railway internal domainlerini hariç tut
  if (
    process.env.NODE_ENV === 'production' &&
    host !== 'www.dealhunter4u.nl' &&
    !host.includes('localhost') &&
    !host.includes('healthcheck.railway.app') &&
    !host.includes('.railway.app')
  ) {
    return NextResponse.redirect(`https://www.dealhunter4u.nl${request.nextUrl.pathname}${request.nextUrl.search}`, 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
