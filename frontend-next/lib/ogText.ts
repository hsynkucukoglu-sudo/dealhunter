/**
 * Tekst klaarmaken voor een og:image (Satori).
 *
 * Satori tekent alleen glyphs die in het meegegeven font zitten; al het andere
 * probeert het als "dynamic font" op te halen en dat faalt hier. Bij elke build
 * kwam voorbij:
 *
 *   Failed to load dynamic font for ✓ . Status: 400
 *
 * Dat was geen ruis. Het vinkje landde als leeg blokje midden in de titel, dus
 * het deelplaatje van /blog/is-aldi-goedkoper-dan-lidl las letterlijk
 * "Is Aldi Goedkoper dan Lidl? ☐ Vergelijking 2026" — en juist die tien
 * vergelijkingsposts zijn de best presterende pagina's van de site (~68% van
 * alle zoekklikken) en daarmee het vaakst gedeeld.
 *
 * Het vinkje blijft wél in de <title> staan: daar is het een bewust CTR-middel
 * in de SERP en rendert het gewoon. Alleen op het plaatje moet het weg. Vandaar
 * een aparte functie in plaats van de titels zelf aanpassen.
 */
// Let op de `u`-vlag. Zonder die vlag is \u1F525 geen codepoint maar \u1F52
// gevolgd door een letterlijke 5 -- dan verdwijnt elke 5 uit de titel en wordt
// "Top 5 deals" stilletjes "Top  deals". Met `u` mag (en moet) het als \u{...}.
const NON_RENDERABLE = /[\u{2713}\u{2714}\u{2705}\u{274C}\u{2B50}\u{1F525}]/gu

export function ogSafeText(text: string): string {
  return text
    .replace(NON_RENDERABLE, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([?!.,:;])/g, '$1')
    .trim()
}
