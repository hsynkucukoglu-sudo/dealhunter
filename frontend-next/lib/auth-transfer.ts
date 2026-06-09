import { createHmac } from 'crypto'

function hmac(data: string): string {
  return createHmac('sha256', process.env.AUTH_SECRET ?? 'dev-secret').update(data).digest('hex')
}

export function createTransferToken(user: {
  id: string
  email: string
  name?: string | null
  image?: string | null
}): string {
  const payload = JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    image: user.image ?? null,
    exp: Date.now() + 120_000, // 2 dakika
  })
  const sig = hmac(payload)
  return Buffer.from(`${payload}.${sig}`).toString('base64url')
}

export function verifyTransferToken(token: string): {
  id: string
  email: string
  name: string | null
  image: string | null
} | null {
  try {
    const raw = Buffer.from(token, 'base64url').toString()
    const lastDot = raw.lastIndexOf('.')
    if (lastDot === -1) return null

    const payload = raw.slice(0, lastDot)
    const sig = raw.slice(lastDot + 1)

    if (!payload || hmac(payload) !== sig) return null

    const data = JSON.parse(payload) as {
      id: string
      email: string
      name: string | null
      image: string | null
      exp: number
    }

    if (Date.now() > data.exp) return null

    return { id: data.id, email: data.email, name: data.name, image: data.image }
  } catch {
    return null
  }
}
