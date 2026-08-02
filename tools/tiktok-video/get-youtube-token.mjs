// Eenmalige helper: haalt een YouTube refresh token op via de loopback OAuth-flow.
// Draai dit lokaal (niet in CI — er komt een browserstap aan te pas).
//
//   YOUTUBE_CLIENT_ID=... YOUTUBE_CLIENT_SECRET=... node get-youtube-token.mjs
//
// De client-id/secret komen uit Google Cloud Console → APIs & Services →
// Credentials → OAuth client ID van het type "Desktop app". Zorg dat de
// YouTube Data API v3 in datzelfde project is ingeschakeld.

import http from 'node:http'
import { randomBytes } from 'node:crypto'

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Zet YOUTUBE_CLIENT_ID en YOUTUBE_CLIENT_SECRET als env var.')
  process.exit(1)
}

const PORT = 8731
const REDIRECT = `http://localhost:${PORT}`
const SCOPE = 'https://www.googleapis.com/auth/youtube.upload'
const state = randomBytes(16).toString('hex')

const authUrl =
  'https://accounts.google.com/o/oauth2/v2/auth?' +
  new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT,
    response_type: 'code',
    scope: SCOPE,
    // Zonder deze twee krijg je alleen een access token en geen refresh token.
    access_type: 'offline',
    prompt: 'consent',
    state,
  })

console.log('\nOpen deze URL in je browser en geef toestemming:\n')
console.log(authUrl)
console.log('\nWacht op de redirect...\n')

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT)
  const code = url.searchParams.get('code')
  const gotState = url.searchParams.get('state')

  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Geen code ontvangen.')
    return
  }
  if (gotState !== state) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('State komt niet overeen — afgebroken.')
    server.close()
    process.exit(1)
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT,
        grant_type: 'authorization_code',
      }),
    })
    const json = await tokenRes.json()
    if (!tokenRes.ok || !json.refresh_token) {
      throw new Error(JSON.stringify(json))
    }

    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Gelukt — je kunt dit tabblad sluiten. Het token staat in je terminal.')

    console.log('REFRESH TOKEN (zet als GitHub secret YOUTUBE_REFRESH_TOKEN):\n')
    console.log(json.refresh_token)
    console.log('\nDeel dit niet en commit het niet.\n')
    console.log('Staat je OAuth-app nog op "Testing"? Dan vervalt dit token na 7 dagen en')
    console.log('faalt de wekelijkse cron. Zet de publishing status op "In production".\n')
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Mislukt, zie terminal.')
    console.error('Token ophalen mislukt:', e.message)
  } finally {
    server.close()
  }
})

server.listen(PORT, () => {
  console.log(`Luistert op ${REDIRECT} — voeg deze URI toe als "Authorized redirect URI" bij je OAuth client.`)
})
