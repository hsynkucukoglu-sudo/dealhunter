// YouTube Shorts uploader — zet de wekelijkse top-5 video op het eigen kanaal.
//
// Geen googleapis-dependency: de Data API v3 resumable upload is twee HTTP-calls,
// en fetch zit in Node. Scheelt een zware dependency in de CI-run.
//
// Benodigde secrets (GitHub → Settings → Secrets → Actions):
//   YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN
// Token aanmaken: `node get-youtube-token.mjs` (eenmalig, lokaal).
//
// LET OP — privacy staat bewust op 'private'. Een cron die wekelijks ongezien
// publiek plaatst is lastig terug te draaien; zet YOUTUBE_PRIVACY=public pas
// nadat je een paar afleveringen hebt bekeken.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(DIR, 'out')

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET
const REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN
const PRIVACY = process.env.YOUTUBE_PRIVACY || 'private'

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.error('YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET / YOUTUBE_REFRESH_TOKEN ontbreken')
  process.exit(1)
}
if (!['private', 'unlisted', 'public'].includes(PRIVACY)) {
  console.error(`Ongeldige YOUTUBE_PRIVACY: ${PRIVACY}`)
  process.exit(1)
}

function isoWeek(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7))
  const start = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  return Math.ceil(((t - start) / 86400000 + 1) / 7)
}

async function accessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })
  const json = await res.json()
  if (!res.ok) {
    // invalid_grant = token ingetrokken of verlopen. Gebeurt structureel wanneer de
    // OAuth-app op "Testing" staat: die refresh tokens vervallen na 7 dagen, wat een
    // wekelijkse cron altijd net te laat maakt. Zet de app op "In production".
    throw new Error(`Token vernieuwen mislukt: ${JSON.stringify(json)}`)
  }
  return json.access_token
}

async function main() {
  const week = isoWeek()
  const file = path.join(OUT, `dealhunter-top5-week${week}.mp4`)
  if (!fs.existsSync(file)) {
    throw new Error(`Video niet gevonden: ${file} — draait make-video.mjs wel eerst?`)
  }
  const bytes = fs.readFileSync(file)
  console.log(`Video: ${path.basename(file)} (${(bytes.length / 1048576).toFixed(1)} MB)`)

  const token = await accessToken()

  const metadata = {
    snippet: {
      title: `Top 5 Supermarkt Deals — Week ${week} 🛒 #Shorts`,
      description: [
        `De 5 scherpste supermarktaanbiedingen van week ${week}, uit de actuele folders van Albert Heijn, Jumbo, Lidl, Aldi, Dirk en meer.`,
        '',
        'Alle actuele aanbiedingen op één plek: https://www.dealhunter4u.nl',
        '',
        '#aanbiedingen #besparen #boodschappen #supermarkt #shorts',
      ].join('\n'),
      tags: ['aanbiedingen', 'besparen', 'boodschappen', 'supermarkt', 'albert heijn', 'jumbo', 'lidl', 'aldi'],
      categoryId: '26', // Howto & Style
      defaultLanguage: 'nl',
    },
    status: {
      privacyStatus: PRIVACY,
      selfDeclaredMadeForKids: false,
    },
  }

  // Stap 1: resumable sessie openen
  const init = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': 'video/mp4',
        'X-Upload-Content-Length': String(bytes.length),
      },
      body: JSON.stringify(metadata),
    }
  )
  if (!init.ok) throw new Error(`Sessie openen mislukt (${init.status}): ${await init.text()}`)
  const uploadUrl = init.headers.get('location')
  if (!uploadUrl) throw new Error('Geen upload-URL in Location-header')

  // Stap 2: bytes uploaden. 3,2 MB gaat in één PUT; chunking is hier overbodig.
  const put = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(bytes.length) },
    body: bytes,
  })
  if (!put.ok) throw new Error(`Upload mislukt (${put.status}): ${await put.text()}`)

  const video = await put.json()
  console.log(`✅ Geplaatst als "${PRIVACY}": https://youtube.com/watch?v=${video.id}`)
  if (PRIVACY === 'private') {
    console.log('   (privacy staat op private — zet YOUTUBE_PRIVACY=public zodra je het vertrouwt)')
  }
}

main().catch(e => {
  console.error('HATA:', e.message)
  process.exit(1)
})
