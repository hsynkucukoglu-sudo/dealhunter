export interface UnitPrice {
  value: number
  unit: string
  display: string
}

function parseNum(s: string): number {
  return parseFloat(s.replace(',', '.'))
}

// Ürün adından hacim bilgisini çıkar → ml cinsinden döner
function extractVolumeMl(name: string): number | null {
  // "1.5L", "1,5 liter", "330ml", "33cl", "1dl"
  const match = name.match(/(\d+[,.]\d+|\d+)\s*(cl|dl|ml|l|liter|litre)\b/i)
  if (!match) return null
  const amount = parseNum(match[1])
  const unit = match[2].toLowerCase()
  if (unit === 'ml') return amount
  if (unit === 'cl') return amount * 10
  if (unit === 'dl') return amount * 100
  if (unit === 'l' || unit === 'liter' || unit === 'litre') return amount * 1000
  return null
}

// Ürün adından ağırlık bilgisini çıkar → gram cinsinden döner
function extractWeightG(name: string): number | null {
  // "500g", "500 gram", "1kg", "1.5 kilo", "250gram"
  const match = name.match(/(\d+[,.]\d+|\d+)\s*(kg|kilo|kilogram|gram|g)\b/i)
  if (!match) return null
  const amount = parseNum(match[1])
  const unit = match[2].toLowerCase()
  if (unit === 'g' || unit === 'gram') return amount
  if (unit === 'kg' || unit === 'kilo' || unit === 'kilogram') return amount * 1000
  return null
}

// Ürün adından adet/paket sayısını çıkar
function extractCount(name: string): number | null {
  // "4-pack", "4 pak", "6-stuks", "4pck", "4x", "2x500g" → sadece 4
  const patterns = [
    /(\d+)\s*[-]?\s*(?:pack|pak|pck|stuks?|stuk|pieces?|x)\b/i,
    /\b(\d+)\s*x\s*(?:\d)/i, // "4x500" → 4 (voorafgaand)
  ]
  for (const re of patterns) {
    const m = name.match(re)
    if (m) {
      const n = parseInt(m[1])
      if (n > 1 && n <= 100) return n
    }
  }
  return null
}

export function calcUnitPrice(name: string, price: number): UnitPrice | null {
  if (price <= 0) return null

  const volMl = extractVolumeMl(name)
  const weightG = extractWeightG(name)
  const count = extractCount(name)

  // Hacim bazlı hesap
  if (volMl !== null) {
    const totalMl = volMl * (count ?? 1)
    if (totalMl <= 0) return null

    if (totalMl >= 1000) {
      const perL = price / (totalMl / 1000)
      return { value: perL, unit: 'L', display: `€${perL.toFixed(2)} / L` }
    } else {
      const per100ml = price / (totalMl / 100)
      return { value: per100ml, unit: '100ml', display: `€${per100ml.toFixed(2)} / 100ml` }
    }
  }

  // Ağırlık bazlı hesap
  if (weightG !== null) {
    const totalG = weightG * (count ?? 1)
    if (totalG <= 0) return null

    if (totalG >= 500) {
      const perKg = price / (totalG / 1000)
      return { value: perKg, unit: 'kg', display: `€${perKg.toFixed(2)} / kg` }
    } else {
      const per100g = price / (totalG / 100)
      return { value: per100g, unit: '100g', display: `€${per100g.toFixed(2)} / 100g` }
    }
  }

  // Sadece adet
  if (count !== null && count > 1) {
    const perUnit = price / count
    return { value: perUnit, unit: 'stuk', display: `€${perUnit.toFixed(2)} / stuk` }
  }

  return null
}
