import Anthropic from '@anthropic-ai/sdk'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://dealhunter-production-d900.up.railway.app'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const question: string = typeof body.question === 'string' ? body.question.trim().slice(0, 500) : ''

    if (!question) {
      return Response.json({ error: 'Vraag is vereist.' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'AI assistent tijdelijk niet beschikbaar.' }, { status: 503 })
    }

    let topProducts: unknown[] = []
    try {
      const res = await fetch(`${API_BASE}/api/products`, { next: { revalidate: 300 } })
      if (res.ok) {
        const all = await res.json()
        if (Array.isArray(all)) {
          topProducts = all
            .filter((p: { originalPrice: number; discountedPrice: number; discount: number }) =>
              p.originalPrice > p.discountedPrice && p.discount > 0 && p.discountedPrice > 0
            )
            .sort((a: { discount: number }, b: { discount: number }) => b.discount - a.discount)
            .slice(0, 80)
            .map((p: { name: string; market: string; discountedPrice: number; originalPrice: number; discount: number; category?: string; unitSize?: number; unitType?: string }) => ({
              naam: p.name,
              market: p.market,
              prijs: `€${p.discountedPrice.toFixed(2)}`,
              normaal: `€${p.originalPrice.toFixed(2)}`,
              korting: `${p.discount}%`,
              ...(p.category ? { categorie: p.category } : {}),
              ...(p.unitSize && p.unitType ? { eenheid: `${p.unitSize}${p.unitType}` } : {}),
            }))
        }
      }
    } catch {
      // Continue without product context if fetch fails
    }

    const productContext = topProducts.length > 0
      ? `\nActuele top-aanbiedingen (${topProducts.length} producten, gesorteerd op kortingspercentage):\n${JSON.stringify(topProducts)}\n`
      : '\nProduct data tijdelijk niet beschikbaar.\n'

    const client = new Anthropic({ apiKey })

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: `Je bent een vriendelijke Nederlandse boodschappen assistent voor DealHunter4U.nl — een gratis prijsvergelijkingssite voor 8 Nederlandse supermarkten: Albert Heijn, Jumbo, Lidl, Aldi, Dirk, Hoogvliet, Vomar en DekaMarkt.
${productContext}
Instructies:
- Antwoord ALTIJD in het Nederlands
- Geef concrete aanbevelingen met exacte productnamen en prijzen uit de lijst hierboven
- Vermeld altijd bij welke supermarkt het product te vinden is
- Gebruik opsommingstekens (•) voor lijsten
- Wees beknopt: maximaal 120 woorden
- Als een product niet in de lijst staat, zeg dat eerlijk
- Afronden met een vriendelijke tip of aanmoediging`,
      messages: [{ role: 'user', content: question }],
    })

    const text = message.content[0]?.type === 'text' ? message.content[0].text : 'Geen antwoord beschikbaar.'
    return Response.json({ answer: text })
  } catch (err) {
    console.error('[ai-assistent]', err)
    return Response.json({ error: 'Even geduld, probeer het opnieuw.' }, { status: 500 })
  }
}
