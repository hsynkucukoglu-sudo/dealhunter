import sharp from 'sharp'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const ANDROID_RES = 'android/app/src/main/res'
const ICON_SRC = 'public/icon-512x512.png'
const BG_COLOR = { r: 26, g: 26, b: 26 } // #1A1A1A

const ICON_SIZES = [
  { dir: 'mipmap-mdpi',    size: 48,  foreground: 108 },
  { dir: 'mipmap-hdpi',    size: 72,  foreground: 162 },
  { dir: 'mipmap-xhdpi',   size: 96,  foreground: 216 },
  { dir: 'mipmap-xxhdpi',  size: 144, foreground: 324 },
  { dir: 'mipmap-xxxhdpi', size: 192, foreground: 432 },
]

const SPLASH_SIZES = [
  { dir: 'drawable-port-mdpi',    w: 320,  h: 480 },
  { dir: 'drawable-port-hdpi',    w: 480,  h: 800 },
  { dir: 'drawable-port-xhdpi',   w: 720,  h: 1280 },
  { dir: 'drawable-port-xxhdpi',  w: 960,  h: 1600 },
  { dir: 'drawable-port-xxxhdpi', w: 1280, h: 1920 },
  { dir: 'drawable-land-mdpi',    w: 480,  h: 320 },
  { dir: 'drawable-land-hdpi',    w: 800,  h: 480 },
  { dir: 'drawable-land-xhdpi',   w: 1280, h: 720 },
  { dir: 'drawable-land-xxhdpi',  w: 1600, h: 960 },
  { dir: 'drawable-land-xxxhdpi', w: 1920, h: 1280 },
]

async function generateIcons() {
  const iconBuf = readFileSync(ICON_SRC)

  for (const { dir, size, foreground } of ICON_SIZES) {
    const resDir = join(ANDROID_RES, dir)

    // ic_launcher.png — icon on dark background
    const launcherBg = await sharp({
      create: { width: size, height: size, channels: 4, background: { ...BG_COLOR, alpha: 255 } }
    }).png().toBuffer()

    const logoResized = await sharp(iconBuf).resize(Math.round(size * 0.8), Math.round(size * 0.8), { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()
    const offset = Math.round(size * 0.1)

    await sharp(launcherBg)
      .composite([{ input: logoResized, left: offset, top: offset }])
      .png()
      .toFile(join(resDir, 'ic_launcher.png'))

    // ic_launcher_round.png — circular icon
    const circle = Buffer.from(
      `<svg><circle cx="${size/2}" cy="${size/2}" r="${size/2}" /></svg>`
    )
    await sharp(launcherBg)
      .composite([
        { input: logoResized, left: offset, top: offset },
        { input: circle, blend: 'dest-in' },
      ])
      .png()
      .toFile(join(resDir, 'ic_launcher_round.png'))

    // ic_launcher_foreground.png — adaptive icon foreground (transparent bg)
    const fg = foreground
    const iconSize = Math.round(fg * 0.5) // 50% of canvas for safe zone
    const fgOffset = Math.round((fg - iconSize) / 2)
    const logoForFg = await sharp(iconBuf)
      .resize(iconSize, iconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png().toBuffer()

    await sharp({
      create: { width: fg, height: fg, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
    })
      .composite([{ input: logoForFg, left: fgOffset, top: fgOffset }])
      .png()
      .toFile(join(resDir, 'ic_launcher_foreground.png'))

    console.log(`✓ ${dir} (${size}px)`)
  }
}

async function generateSplash() {
  const iconBuf = readFileSync(ICON_SRC)

  for (const { dir, w, h } of SPLASH_SIZES) {
    const logoSize = Math.round(Math.min(w, h) * 0.35)
    const logoResized = await sharp(iconBuf)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png().toBuffer()

    const left = Math.round((w - logoSize) / 2)
    const top = Math.round((h - logoSize) / 2) - Math.round(h * 0.05) // slightly above center

    // Brand text SVG below logo
    const textY = logoSize + 20
    const textSvg = Buffer.from(`
      <svg width="${logoSize}" height="40">
        <text x="${logoSize/2}" y="28" text-anchor="middle"
          font-family="sans-serif" font-size="20" font-weight="800"
          fill="#F5EDE3" letter-spacing="2">DealHunter</text>
      </svg>
    `)
    const textLeft = left
    const textTop = top + logoSize + 12

    await sharp({
      create: { width: w, height: h, channels: 4, background: { ...BG_COLOR, alpha: 255 } }
    })
      .composite([
        { input: logoResized, left, top },
        { input: textSvg, left: textLeft, top: textTop },
      ])
      .png()
      .toFile(join(ANDROID_RES, dir, 'splash.png'))

    console.log(`✓ ${dir} (${w}×${h})`)
  }

  // Also update the default drawable splash
  const w = 512, h = 512
  const logoSize = 180
  const logoResized = await sharp(iconBuf)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer()

  await sharp({
    create: { width: w, height: h, channels: 4, background: { ...BG_COLOR, alpha: 255 } }
  })
    .composite([{ input: logoResized, left: Math.round((w-logoSize)/2), top: Math.round((h-logoSize)/2) - 20 }])
    .png()
    .toFile(join(ANDROID_RES, 'drawable', 'splash.png'))

  console.log('✓ drawable/splash.png')
}

async function main() {
  console.log('🎨 Generating Android icons...')
  await generateIcons()
  console.log('\n🖼  Generating splash screens...')
  await generateSplash()
  console.log('\n✅ Done!')
}

main().catch(console.error)
