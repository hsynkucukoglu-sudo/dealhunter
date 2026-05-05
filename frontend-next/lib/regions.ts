// Dutch postal code → available supermarkets mapping
// National chains are everywhere; regional chains have limited coverage.

export interface RegionInfo {
  city: string
  markets: string[]
}

export function getRegionByPostalCode(code: string): RegionInfo {
  const num = parseInt(code.replace(/\D/g, ''), 10)
  if (isNaN(num)) return DEFAULT_REGION

  // Amsterdam + Noord-Holland
  if (num >= 1000 && num <= 1299) return { city: 'Amsterdam', markets: ['Albert Heijn', 'Jumbo', 'Lidl', 'Dirk', 'Aldi', 'Plus', 'Vomar'] }
  if (num >= 1300 && num <= 1999) return { city: 'Noord-Holland', markets: ['Albert Heijn', 'Jumbo', 'Lidl', 'Aldi', 'Plus', 'Vomar'] }

  // Den Haag / Zuid-Holland
  if (num >= 2000 && num <= 2799) return { city: 'Den Haag', markets: ['Albert Heijn', 'Jumbo', 'Lidl', 'Dirk', 'Aldi', 'Plus', 'Hoogvliet'] }
  if (num >= 2800 && num <= 2999) return { city: 'Gouda', markets: ['Albert Heijn', 'Jumbo', 'Lidl', 'Aldi', 'Plus', 'Hoogvliet'] }

  // Rotterdam
  if (num >= 3000 && num <= 3299) return { city: 'Rotterdam', markets: ['Albert Heijn', 'Jumbo', 'Lidl', 'Dirk', 'Aldi', 'Plus', 'Hoogvliet'] }

  // Utrecht
  if (num >= 3300 && num <= 3999) return { city: 'Utrecht', markets: ['Albert Heijn', 'Jumbo', 'Lidl', 'Dirk', 'Aldi', 'Plus'] }

  // Noord-Brabant
  if (num >= 4000 && num <= 5999) return { city: 'Noord-Brabant', markets: ['Albert Heijn', 'Jumbo', 'Lidl', 'Aldi', 'Plus'] }

  // Limburg
  if (num >= 6000 && num <= 6999) return { city: 'Limburg', markets: ['Albert Heijn', 'Jumbo', 'Lidl', 'Aldi', 'Plus'] }

  // Gelderland / Overijssel
  if (num >= 7000 && num <= 7999) return { city: 'Oost-Nederland', markets: ['Albert Heijn', 'Jumbo', 'Lidl', 'Aldi', 'Plus'] }

  // Flevoland / Friesland / Groningen / Drenthe
  if (num >= 8000 && num <= 9999) return { city: 'Noord-Nederland', markets: ['Albert Heijn', 'Jumbo', 'Lidl', 'Aldi'] }

  return DEFAULT_REGION
}

const DEFAULT_REGION: RegionInfo = {
  city: 'Nederland',
  markets: ['Albert Heijn', 'Jumbo', 'Lidl', 'Dirk', 'Aldi', 'Plus', 'Hoogvliet', 'Vomar'],
}
