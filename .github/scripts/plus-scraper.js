/**
 * Plus.nl scraper — GitHub Actions'ta çalışır (Imperva'yı bypass eder)
 * Sonuçları Railway backend'e POST eder.
 */

const BACKEND_URL = process.env.BACKEND_URL || 'https://dealhunter-production-d900.up.railway.app'
const ADMIN_TOKEN = process.env.ADMIN_TOKEN

if (!ADMIN_TOKEN) {
  console.error('❌ ADMIN_TOKEN eksik')
  process.exit(1)
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
const BASE = {
  'User-Agent': UA,
  'Accept-Language': 'nl-NL,nl;q=0.9',
  'Origin': 'https://www.plus.nl',
  'Referer': 'https://www.plus.nl/aanbiedingen',
  'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
  'upgrade-insecure-requests': '1',
}

function toCampaignType(text) {
  if (!text) return null
  const s = text.toLowerCase()
  if (/1\s*\+\s*1|\bgratis\b.*\bex(tra)?\b/.test(s)) return '1+1'
  if (/2e\s*(halve|helft|50%)|tweede.*(halve|gratis)/.test(s)) return '2e-halve-prijs'
  if (/3\s*(halen|voor)\s*2|3\s*halen.*2\s*betalen/.test(s)) return '3-halen-2-betalen'
  if (/combi(natie)?|samen\s*goedkoper/.test(s)) return 'combinatie'
  if (/tijdelijk|op\s*=\s*op/.test(s)) return 'tijdelijk'
  return null
}

const jar = {}

function getCookieHeaders(res) {
  if (typeof res.headers.getSetCookie === 'function') return res.headers.getSetCookie()
  const raw = res.headers.get('set-cookie')
  return raw ? raw.split(/,(?=[^ ])/) : []
}

function parseCookies(hdrs) {
  for (const hdr of hdrs) {
    const [kv] = hdr.split(';')
    const eq = kv.indexOf('=')
    if (eq === -1) continue
    jar[kv.slice(0, eq).trim()] = kv.slice(eq + 1).trim()
  }
}

function cookieStr() {
  return Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ')
}

function extractCsrf() {
  const m = decodeURIComponent(jar['nr2Users'] || '').match(/crf=([^;]+)/)
  return m ? m[1] : ''
}

async function scrapePlus() {
  console.log('🏪 Plus.nl scraper başlıyor...')

  // Step 1: GetCSS → Imperva bypass
  const r1css = await fetch(
    'https://www.plus.nl/ECOP_HotCache_Eng/rest/ResourceManagement/GetCSS',
    { headers: { ...BASE, 'Accept': 'text/plain,*/*' } }
  ).catch(() => null)
  if (r1css) parseCookies(getCookieHeaders(r1css))
  console.log(`  GetCSS: ${r1css?.status ?? 'fail'}, cookies: ${Object.keys(jar).length}`)

  // Step 2: Preload → more Imperva cookies
  const r1 = await fetch(
    'https://www.plus.nl/ECOP_HotCache_Eng/rest/ResourceManagement/Preload?url=https%3A%2F%2Fwww.plus.nl%2Faanbiedingen',
    { headers: { ...BASE, 'Accept': 'text/html,application/xhtml+xml,*/*', 'Cookie': cookieStr() } }
  )
  parseCookies(getCookieHeaders(r1))
  console.log(`  Preload: ${r1.status}, cookies: ${Object.keys(jar).length}`)
  if (!r1.ok) throw new Error(`Preload ${r1.status}`)

  // Step 3: AppReady → CSRF token
  const r2 = await fetch(
    'https://www.plus.nl/screenservices/ECOP/ActionOnApplicationReady_Server',
    {
      method: 'POST',
      headers: { ...BASE, 'Content-Type': 'application/json; charset=UTF-8', 'OutSystems-locale': 'nl-NL', 'Accept': 'application/json', 'Cookie': cookieStr() },
      body: JSON.stringify({ versionInfo: { moduleVersion: 'R7vDI3CkqI68dsNzB22EmQ', apiVersion: 'bN+60jDM7pDC4My+lkJRIQ' }, viewName: 'MainFlow.Promotions', screenData: { variables: {} } }),
    }
  )
  parseCookies(getCookieHeaders(r2))
  const csrf = extractCsrf()
  console.log(`  AppReady: ${r2.status}, CSRF: ${csrf ? 'OK' : 'EKSIK'}`)
  if (!csrf) throw new Error(`CSRF alınamadı (AppReady: ${r2.status})`)

  // Step 4: Promotions API
  const r3 = await fetch(
    'https://www.plus.nl/screenservices/ECP_Composition_CW/Promotions/Promotion_LP_Content_TF_Optimization/DataActionGetPromotionList_Optimization',
    {
      method: 'POST',
      headers: { ...BASE, 'Content-Type': 'application/json; charset=UTF-8', 'OutSystems-locale': 'nl-NL', 'Accept': 'application/json', 'Cookie': cookieStr(), 'X-CSRFToken': csrf },
      body: JSON.stringify({
        versionInfo: { moduleVersion: 'R7vDI3CkqI68dsNzB22EmQ', apiVersion: 'bN+60jDM7pDC4My+lkJRIQ' },
        viewName: 'MainFlow.Promotions',
        screenData: { variables: { IsShowData: false, IsPreloadedHTMLActive: false, StoreNumber: 0, StoreChannel: '', PromotionPeriodId: 1, LocalPromotionList: { List: [], EmptyListItem: {} }, IsUnderAge: false, ClickDelayValue: 0, ProductCategories: '', PromotionCategories: '', Priority: 0, IsAppendingRecords: false, StartIndex: 0, MaxRecords: 500, IsDesktop: true, IsNextWeekPromotions: false } },
      }),
    }
  )
  if (!r3.ok) throw new Error(`Promotions API ${r3.status}`)

  const json = await r3.json()
  if (json.versionInfo?.hasModuleVersionChanged) {
    console.warn('  ⚠️  versionInfo değişti — plus-scraper.js güncellenmeli')
  }

  const list = json.data?.PromotionOfferList?.List || []
  const results = []
  const seen = new Set()

  for (const item of list) {
    const cat = item.Category
    if (!cat?.Offers?.List) continue
    const catLabel = cat.CategoryLabel || ''

    for (const offer of cat.Offers.List) {
      if (offer.IsFreeDeliveryOffer) continue
      const name = (offer.Name?.trim() || offer.Brand?.split(',')[0]?.trim() || '').trim()
      if (!name) continue
      const newPrice = parseFloat(offer.NewPrice) || 0
      if (newPrice === 0) continue
      const key = `${offer.PromotionID}-${offer.Offer_Id}`
      if (seen.has(key)) continue
      seen.add(key)

      const origPrice = parseFloat(offer.PriceOriginal_Highest) || parseFloat(offer.PriceOriginal_Lowest) || 0
      const label = offer.DisplayInfo_Label || ''
      let imgUrl = offer.ImageURL || ''
      if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl
      const slug = offer.Slug || `${offer.PromotionID}-${offer.Offer_Id}`

      results.push({
        name,
        brand: offer.Brand?.split(',')[0]?.trim() || undefined,
        discountedPrice: newPrice,
        originalPrice: origPrice > newPrice ? origPrice : newPrice,
        imageUrl: imgUrl || null,
        url: `https://www.plus.nl/aanbiedingen/${slug}`,
        expiresAt: offer.EndDate || null,
        category: catLabel,
        campaignType: toCampaignType(label),
        isCampaign: true,
        source: 'plus.nl/aanbiedingen',
      })
    }
  }

  console.log(`  ✅ ${results.length} ürün toplandı`)
  return results
}

async function postToBackend(products) {
  console.log(`\n📤 ${products.length} ürün Railway'e gönderiliyor...`)
  const res = await fetch(`${BACKEND_URL}/api/products/bulk-replace`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify({ market: 'Plus', products }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`Backend hata: ${JSON.stringify(json)}`)
  console.log(`✅ Backend: ${json.count} ürün eklendi`)
}

const MAX_ATTEMPTS = 3
const RETRY_DELAY_MS = 10000

;(async () => {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const products = await scrapePlus()
      if (products.length === 0) throw new Error('Hiç ürün bulunamadı')
      await postToBackend(products)
      return
    } catch (e) {
      console.error(`❌ Deneme ${attempt}/${MAX_ATTEMPTS} başarısız:`, e.message)
      if (attempt === MAX_ATTEMPTS) process.exit(1)
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
    }
  }
})()
