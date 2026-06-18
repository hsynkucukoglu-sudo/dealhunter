import puppeteer from 'puppeteer'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import Ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

Ffmpeg.setFfmpegPath(ffmpegInstaller.path)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const HTML_FILE  = path.join(__dirname, 'frontend-next', 'public', 'ig-animated.html')
const FRAMES_DIR = path.join(__dirname, 'ig-frames')
const OUTPUT     = path.join(__dirname, 'dealhunter-post.mp4')

const FPS         = 25
const DURATION    = 6   // saniye
const FRAME_COUNT = FPS * DURATION  // 150 frame

fs.mkdirSync(FRAMES_DIR, { recursive: true })

console.log('🎬 Tarayıcı açılıyor...')
const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-web-security',
    '--allow-file-access-from-files',
    '--disable-features=VizDisplayCompositor',
  ],
  defaultViewport: { width: 1080, height: 1080, deviceScaleFactor: 1 },
})

const page = await browser.newPage()

// Resimlerin yüklenmesi için izin ver
await page.setRequestInterception(false)

await page.goto(`file:///${HTML_FILE.replace(/\\/g, '/')}`, {
  waitUntil: 'networkidle0',
  timeout: 15000,
})

// Görsellerin yüklenmesini bekle
await page.waitForFunction(() => {
  const imgs = document.querySelectorAll('img')
  return [...imgs].every(img => img.complete)
}, { timeout: 10000 }).catch(() => {})

// Animasyonların başlaması için kısa bekle
await new Promise(r => setTimeout(r, 200))

console.log(`📸 ${FRAME_COUNT} frame çekiliyor (${FPS}fps × ${DURATION}s)...`)

const interval = 1000 / FPS

for (let i = 0; i < FRAME_COUNT; i++) {
  const framePath = path.join(FRAMES_DIR, `frame-${String(i).padStart(4, '0')}.png`)
  await page.screenshot({ path: framePath, type: 'png' })
  if (i % 25 === 0) process.stdout.write(`\r  ${i}/${FRAME_COUNT} frame`)
  await new Promise(r => setTimeout(r, interval))
}

await browser.close()
console.log(`\n✅ ${FRAME_COUNT} frame tamam`)

console.log('🎞️  MP4 encode ediliyor...')

await new Promise((resolve, reject) => {
  Ffmpeg()
    .input(path.join(FRAMES_DIR, 'frame-%04d.png'))
    .inputFPS(FPS)
    .videoCodec('libx264')
    .outputOptions([
      '-pix_fmt yuv420p',
      '-crf 18',
      '-preset fast',
      '-movflags +faststart',
    ])
    .size('1080x1080')
    .save(OUTPUT)
    .on('progress', p => process.stdout.write(`\r  Encode: ${Math.round(p.percent || 0)}%`))
    .on('end', resolve)
    .on('error', reject)
})

fs.rmSync(FRAMES_DIR, { recursive: true })
console.log(`\n🎉 Hazır! → ${OUTPUT}`)
