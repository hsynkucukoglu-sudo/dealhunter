import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''

  // Redirect non-www to www
  if (host === 'dealhunter4u.nl') {
    const url = request.nextUrl.clone()
    url.host = 'www.dealhunter4u.nl'
    return NextResponse.redirect(url, 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
