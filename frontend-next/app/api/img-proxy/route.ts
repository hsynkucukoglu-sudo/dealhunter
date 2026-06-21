import { NextRequest, NextResponse } from 'next/server'

const ALLOWED: Record<string, string> = {
  'static.ah.nl':    'https://www.ah.nl/',
  'api.ah.nl':       'https://www.ah.nl/',
  'media.kruidvat.nl': 'https://www.kruidvat.nl/',
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('u')
  if (!url) return new NextResponse(null, { status: 400 })

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return new NextResponse(null, { status: 400 })
  }

  const referer = ALLOWED[parsed.hostname]
  if (!referer) return new NextResponse(null, { status: 403 })

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': referer,
        'Accept': 'image/webp,image/avif,image/*,*/*;q=0.8',
        'Accept-Language': 'nl-NL,nl;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) return new NextResponse(null, { status: 404 })

    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const body = await res.arrayBuffer()

    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return new NextResponse(null, { status: 502 })
  }
}
