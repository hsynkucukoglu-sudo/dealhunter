export interface UnitPrice {
  value: number
  unit: string
  display: string
}

export interface ProductMeta {
  brand: string | null
  unitSize: number | null
  unitType: string | null
  unitPrice: number | null
  fullSizeLabel: string | null
  unitPriceDisplay: UnitPrice | null
}

function parseNum(s: string): number {
  return parseFloat(s.replace(',', '.'))
}

function extractVolumeMl(name: string): { amount: number; label: string } | null {
  const match = name.match(/(\d+[,.]\d+|\d+)\s*(cl|dl|ml|l|liter|litre)\b/i)
  if (!match) return null
  const amount = parseNum(match[1])
  const unit = match[2].toLowerCase()
  const ml =
    unit === 'ml' ? amount :
    unit === 'cl' ? amount * 10 :
    unit === 'dl' ? amount * 100 :
    amount * 1000
  return { amount: ml, label: `${match[1]} ${match[2]}` }
}

function extractWeightG(name: string): { amount: number; label: string } | null {
  const match = name.match(/(\d+[,.]\d+|\d+)\s*(kg|kilo|kilogram|gram|g)\b/i)
  if (!match) return null
  const amount = parseNum(match[1])
  const unit = match[2].toLowerCase()
  const g =
    unit === 'g' || unit === 'gram' ? amount :
    amount * 1000
  return { amount: g, label: `${match[1]} ${match[2]}` }
}

function extractCount(name: string): { count: number; label: string } | null {
  const patterns: RegExp[] = [
    /(\d+)\s*[-]?\s*(?:pack|pak|pck|stuks?|stuk|pieces?)\b/i,
    /\b(\d+)\s*x\s*(?:\d)/i,
  ]
  for (const re of patterns) {
    const m = name.match(re)
    if (m) {
      const n = parseInt(m[1])
      if (n > 1 && n <= 200) return { count: n, label: m[0] }
    }
  }
  return null
}

// Extract likely brand: first capitalized word(s) before a common product noun
const KNOWN_BRANDS = new Set([
  'ariel', 'persil', 'bold', 'dash', 'dreft', 'fairy', 'glorix', 'dettol',
  'coca', 'pepsi', 'fanta', 'sprite', 'heineken', 'amstel', 'grolsch',
  'activia', 'danone', 'milka', 'kinder', 'ferrero', 'haribo',
  'lay\'s', 'lays', 'pringles', 'duyvis', 'remia', 'calvé', 'calve',
  'knorr', 'maggi', 'conimex', 'honig', 'unox', 'campina', 'friso',
  'becel', 'flora', 'benecol', 'lurpak', 'president', 'philadelphia',
  'bonduelle', 'iglo', 'mora', 'simba', 'dr.', 'sensodyne', 'colgate',
  'oral', 'gillette', 'dove', 'nivea', 'head', 'pantene', 'axe', 'rexona',
])

function extractBrand(name: string): string | null {
  const firstWord = name.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '')
  if (firstWord && KNOWN_BRANDS.has(firstWord)) {
    return name.split(/\s+/)[0]
  }
  // Heuristic: if first word is Title-Case and >= 3 chars, treat as brand
  const m = name.match(/^([A-Z][a-zA-Z]{2,})(?:\s|$)/)
  return m ? m[1] : null
}

export function parseProductMeta(name: string, price: number): ProductMeta {
  if (price <= 0) {
    return { brand: extractBrand(name), unitSize: null, unitType: null, unitPrice: null, fullSizeLabel: null, unitPriceDisplay: null }
  }

  const vol = extractVolumeMl(name)
  const weight = extractWeightG(name)
  const countInfo = extractCount(name)

  let unitSize: number | null = null
  let unitType: string | null = null
  let fullSizeLabel: string | null = null
  let unitPriceDisplay: UnitPrice | null = null

  if (vol !== null) {
    const totalMl = vol.amount * (countInfo?.count ?? 1)
    if (totalMl > 0) {
      unitSize = totalMl
      unitType = 'ml'
      fullSizeLabel = countInfo ? `${countInfo.label} ${vol.label}` : vol.label
      if (totalMl >= 1000) {
        const perL = price / (totalMl / 1000)
        unitPriceDisplay = { value: perL, unit: 'L', display: `€${perL.toFixed(2)} / L` }
      } else {
        const per100ml = price / (totalMl / 100)
        unitPriceDisplay = { value: per100ml, unit: '100ml', display: `€${per100ml.toFixed(2)} / 100ml` }
      }
    }
  } else if (weight !== null) {
    const totalG = weight.amount * (countInfo?.count ?? 1)
    if (totalG > 0) {
      unitSize = totalG
      unitType = 'g'
      fullSizeLabel = countInfo ? `${countInfo.label} ${weight.label}` : weight.label
      if (totalG >= 500) {
        const perKg = price / (totalG / 1000)
        unitPriceDisplay = { value: perKg, unit: 'kg', display: `€${perKg.toFixed(2)} / kg` }
      } else {
        const per100g = price / (totalG / 100)
        unitPriceDisplay = { value: per100g, unit: '100g', display: `€${per100g.toFixed(2)} / 100g` }
      }
    }
  } else if (countInfo !== null) {
    unitSize = countInfo.count
    unitType = 'stuks'
    fullSizeLabel = countInfo.label
    const perUnit = price / countInfo.count
    unitPriceDisplay = { value: perUnit, unit: 'stuk', display: `€${perUnit.toFixed(2)} / stuk` }
  }

  const unitPrice = unitPriceDisplay?.value ?? null

  return {
    brand: extractBrand(name),
    unitSize,
    unitType,
    unitPrice,
    fullSizeLabel,
    unitPriceDisplay,
  }
}

// Backward-compat wrapper (used in ProductCard)
export function calcUnitPrice(name: string, price: number): UnitPrice | null {
  return parseProductMeta(name, price).unitPriceDisplay
}
