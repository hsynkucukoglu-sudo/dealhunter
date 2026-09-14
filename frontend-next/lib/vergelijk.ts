import { getProductsByMarket } from './api'
import { VISIBLE_MARKETS } from './types'
import type { Product } from './types'
import { detectCampaignType } from './campaignType'

/** Vergaarbakcategorie -- zie de toelichting bij topCategory hieronder. */
const CATCH_ALL_CATEGORY = 'overig'

export type MarketInfo = (typeof VISIBLE_MARKETS)[number]

export interface MarketPair {
  slug: string
  a: MarketInfo
  b: MarketInfo
}

const PAIR_SEPARATOR = '-vs-'

// Google'a açık ikililer: gerçek arama talebi olan (GSC sorguları + karşılaştırma
// blog yazılarıyla örtüşen) çiftler. Kalan ~36 otomatik kombinasyon ("hoogvliet-vs-vomar"
// gibi) kullanıcı için erişilebilir kalır ama noindex + sitemap dışıdır — 46 ince
// şablon sayfası AdSense "düşük değerli içerik" reddinin ana yüzeyiydi (2026-07-13).
//
// 2026-07-25: 8 çift daha çıkarıldı. Bunların her birinin bir karşılaştırma BLOG
// yazısı var (ör. albert-heijn-vs-lidl ↔ /blog/is-lidl-goedkoper-dan-albert-heijn) ve
// blog o sorguda konum 3-6'da net kazanıyordu; /vergelijk/ eşi indexli olmasına rağmen
// GSC'de 0 tık alıyor, sadece sinyal bölüyordu (blog-vs-blog kannibalizasyonunun
// /vergelijk × blog ölçeği — bkz. is-jumbo-goedkoper-dan-albert-heijn birleştirmesi).
// Blog karşılığı OLMAYAN 2 çift indexli kaldı.
export const INDEXED_PAIR_SLUGS = new Set([
  'albert-heijn-vs-aldi', // blog karşılığı yok (is-aldi-goedkoper-dan-albert-heijn mevcut değil)
  // Clarity'de kanıtlanmış Google talebi (13-07-2026): 1:45dk + 3 tıklama ile
  // gerçek okuma, aynı gün 2 ayrı organik oturum. Blog karşılığı yok.
  'albert-heijn-vs-dekamarkt',
  // 2026-08-06: GSC 3 ay verisinde gerçek talep gösteren + blog karşılığı OLMAYAN
  // 5 çift eklendi (albert-heijn-vs-lidl gibi blog'u zaten kazanan çiftler bilerek
  // dışarıda tutuldu — 07-25 kannibalizasyon dersi). Şu an TO %0 çünkü noindex'ti;
  // bu iyi pozisyonlar Google'ın hiç görmediği sayfalardan geliyor.
  'aldi-vs-dekamarkt', // poz 4,0, 28 gösterim — blog karşılığı yok
  'lidl-vs-kruidvat', // poz 6,0, 46 gösterim — blog karşılığı yok
  'lidl-vs-plus', // poz 6,3, 25 gösterim — blog karşılığı yok
  'vomar-vs-plus', // poz 6,4, 20 gösterim — blog karşılığı yok
  'albert-heijn-vs-hoogvliet', // poz 8,3, 51 gösterim — blog karşılığı yok
])

export function isIndexedPair(slug: string): boolean {
  return INDEXED_PAIR_SLUGS.has(slug)
}

export function getAllPairs(): MarketPair[] {
  const pairs: MarketPair[] = []
  for (let i = 0; i < VISIBLE_MARKETS.length; i++) {
    for (let j = i + 1; j < VISIBLE_MARKETS.length; j++) {
      const a = VISIBLE_MARKETS[i]
      const b = VISIBLE_MARKETS[j]
      pairs.push({ slug: `${a.slug}${PAIR_SEPARATOR}${b.slug}`, a, b })
    }
  }
  return pairs
}

export function parsePairSlug(slug: string): { a: MarketInfo; b: MarketInfo } | null {
  const sepIndex = slug.indexOf(PAIR_SEPARATOR)
  if (sepIndex === -1) return null
  const aSlug = slug.slice(0, sepIndex)
  const bSlug = slug.slice(sepIndex + PAIR_SEPARATOR.length)
  const a = VISIBLE_MARKETS.find(m => m.slug === aSlug)
  const b = VISIBLE_MARKETS.find(m => m.slug === bSlug)
  return a && b ? { a, b } : null
}

export interface MarketStats {
  dealCount: number
  /**
   * Aantal producten dat we van deze keten volgen, afgeprijsd of niet.
   * `dealCount / assortmentCount` is de dekkingsgraad, en die is nodig om te
   * bepalen of twee gemiddelden uberhaupt naast elkaar mogen (zie isComparable).
   */
  assortmentCount: number
  avgDiscount: number
  maxDiscount: number
  topDeal: Product | null
  topCategory: string
  onePlusOneCount: number
}

export async function getMarketStats(market: MarketInfo): Promise<MarketStats> {
  const products = await getProductsByMarket(market.name)
  const withDiscount = products.filter(p => p.discount > 0)

  if (withDiscount.length === 0) {
    return { dealCount: 0, assortmentCount: products.length, avgDiscount: 0, maxDiscount: 0, topDeal: null, topCategory: '-', onePlusOneCount: 0 }
  }

  const avgDiscount = Math.round(
    withDiscount.reduce((sum, p) => sum + p.discount, 0) / withDiscount.length
  )
  const topDeal = [...withDiscount].sort((a, b) => b.discount - a.discount)[0]

  // 'overig' is de vergaarbak en wint daardoor bijna altijd: gemeten 2026-09-14
  // was het bij 8 van de 9 ketens de grootste categorie (35-56% van alle deals),
  // waardoor de tabelrij "Sterkste categorie" op BEIDE kolommen "Overig" zette --
  // een niet-antwoord op precies de vraag waarvoor de bezoeker komt. Uitsluiten
  // levert overal een echte categorie op (AH zuivel 77, Jumbo dranken 22,
  // Kruidvat verzorging 9, ...). Blijft er niets over, dan '-' en verbergt de
  // pagina de rij liever dan een vergaarbak te tonen.
  const catCount = new Map<string, number>()
  withDiscount.forEach(p => {
    if (p.category === CATCH_ALL_CATEGORY) return
    catCount.set(p.category, (catCount.get(p.category) ?? 0) + 1)
  })
  const topCategory = [...catCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-'

  const onePlusOneCount = withDiscount.filter(
    p => detectCampaignType(p.name, p.discount, p.campaignType).type === '1+1'
  ).length

  return {
    dealCount: withDiscount.length,
    assortmentCount: products.length,
    avgDiscount,
    maxDiscount: topDeal.discount,
    topDeal,
    topCategory,
    onePlusOneCount,
  }
}

export interface Winner {
  market: MarketInfo
  stats: MarketStats
  loser: MarketInfo
  loserStats: MarketStats
}

/**
 * Mogen de twee gemiddelde kortingen naast elkaar?
 *
 * `avgDiscount` gaat alleen over producten MET korting. Hoe kleiner het deel van
 * het assortiment dat wij afgeprijsd zien, hoe selectiever dat gemiddelde is --
 * het meet dan vooral wat wij ophalen, niet wat de winkel doet. /kortingsindex
 * zegt dit al met zoveel woorden ("de gemiddelde korting is niet tussen
 * supermarkten te vergelijken ... wij presenteren geen ranglijst") en sorteert
 * daarom alfabetisch. Deze pagina deed precies wel wat daar verboden wordt, en
 * riep bovendien een winnaar uit.
 *
 * Wat dat kostte, gemeten op de live data van 2026-09-14:
 *   Albert Heijn 370/370 afgeprijsd (100%) -> gem. 15%
 *   Aldi          44/205 afgeprijsd ( 21%) -> gem. 21%
 * De pagina kroonde Aldi. Over het volledige assortiment staat het 15% tegen 4%
 * en wint Albert Heijn -- de winnaar was dus omgedraaid, op het paar met veruit
 * de meeste zoekvraag. En die zin stond niet alleen in beeld maar ook in het
 * FAQ-schema, dus Google kon hem als rich result tonen.
 *
 * Vandaar deze poort. Verschillen de dekkingsgraden te veel, dan is er geen
 * winnaar -- niet "gelijkspel", maar "niet te vergelijken". Bij gelijke vorm mag
 * het wel: Lidl (22%) tegen Kruidvat (17%) vergelijkt appels met appels, ook al
 * liggen beide gemiddelden hoog.
 *
 * 0,6 is gekozen omdat die grens op de 7 bestaande paren precies de scheefste
 * eruit haalt (AH/Aldi 0,21 - Aldi/DekaMarkt 0,25 - Lidl/Plus 0,26) en de
 * gelijkvormige laat staan (AH/DekaMarkt 0,85 - Lidl/Kruidvat 0,77 -
 * Vomar/Plus 0,64).
 *
 * Dit is geen nieuw beleid maar het inhalen van de rest van de site: zowel
 * lib/kortingsindex.ts (alfabetisch, met een waarschuwing in beeld) als
 * components/MarketIndexWidget.tsx (sorteert op maxDiscount juist omdat het
 * gemiddelde de goed uitgelezen ketens straft) trok deze conclusie al.
 * /vergelijk was de enige plek die hem nog niet volgde.
 */
export const MIN_COVERAGE_RATIO = 0.6

export function discountCoverage(s: MarketStats): number {
  return s.assortmentCount > 0 ? s.dealCount / s.assortmentCount : 0
}

export function isComparable(sa: MarketStats, sb: MarketStats): boolean {
  const ca = discountCoverage(sa)
  const cb = discountCoverage(sb)
  if (ca === 0 || cb === 0) return false
  return Math.min(ca, cb) / Math.max(ca, cb) >= MIN_COVERAGE_RATIO
}

export function getWinner(a: MarketInfo, sa: MarketStats, b: MarketInfo, sb: MarketStats): Winner | null {
  if (sa.dealCount === 0 || sb.dealCount === 0 || sa.avgDiscount === sb.avgDiscount) return null
  if (!isComparable(sa, sb)) return null
  return sa.avgDiscount > sb.avgDiscount
    ? { market: a, stats: sa, loser: b, loserStats: sb }
    : { market: b, stats: sb, loser: a, loserStats: sa }
}
