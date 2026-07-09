const BREVO_API = 'https://api.brevo.com/v3'

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function getISOWeek() {
  const d = new Date()
  const jan4 = new Date(d.getFullYear(), 0, 4)
  const startOfWeek1 = new Date(jan4)
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7))
  return Math.floor((d - startOfWeek1) / (7 * 24 * 60 * 60 * 1000)) + 1
}

async function brevoRequest(method, path, body) {
  const res = await fetch(`${BREVO_API}${path}`, {
    method,
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(`Brevo ${method} ${path} → ${res.status}: ${JSON.stringify(data)}`)
  }
  return res.status === 204 ? null : res.json()
}

async function getBrevoContacts() {
  const listId = process.env.BREVO_LIST_ID
  if (!listId) return []
  try {
    const data = await brevoRequest('GET', `/contacts/lists/${listId}/contacts?limit=500&offset=0`)
    return data?.contacts ?? []
  } catch (e) {
    console.error('[Email] Brevo contact listesi alınamadı:', e.message)
    return []
  }
}

async function sendTransactionalEmail(to, subject, htmlContent) {
  const sender = process.env.BREVO_SENDER_EMAIL || 'info@dealhunter4u.nl'
  await brevoRequest('POST', '/smtp/email', {
    sender: { name: 'DealHunter4U', email: sender },
    to: [{ email: to }],
    subject,
    htmlContent,
  })
}

function buildNewsletterHtml(topDeals, unsubEmail) {
  const year = new Date().getFullYear()
  const week = getISOWeek()

  const dealsHtml = topDeals.slice(0, 10).map((p, i) => `
    <tr>
      <td style="padding:14px 20px;border-bottom:1px solid #F0E6DE;vertical-align:middle">
        <span style="display:inline-block;background:#E33D26;color:white;font-size:11px;font-weight:900;padding:2px 7px;border-radius:10px;margin-right:8px;vertical-align:middle">${i + 1}</span>
        <strong style="color:#1A1A1A;font-size:14px">${escapeHtml(p.name)}</strong><br>
        <span style="color:#9C9389;font-size:12px;padding-left:30px">${escapeHtml(p.market)}</span>
      </td>
      <td style="padding:14px 20px;border-bottom:1px solid #F0E6DE;text-align:right;white-space:nowrap;vertical-align:middle">
        <span style="color:#E33D26;font-weight:900;font-size:17px">€${p.discountedPrice.toFixed(2)}</span><br>
        <span style="color:#9C9389;font-size:12px;text-decoration:line-through">€${p.originalPrice.toFixed(2)}</span>
        <span style="background:#E33D26;color:white;font-size:10px;font-weight:900;padding:1px 5px;border-radius:8px;margin-left:4px">-${p.discount}%</span>
      </td>
    </tr>
  `).join('')

  const unsubUrl = unsubEmail
    ? `https://www.dealhunter4u.nl/api/newsletter/unsubscribe?email=${encodeURIComponent(unsubEmail)}`
    : 'https://www.dealhunter4u.nl'

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Top 10 Deals Week ${week} ${year}</title>
</head>
<body style="margin:0;padding:0;background:#F5EDE3;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px">
    <!-- Header -->
    <div style="background:#1A1A1A;border-radius:16px 16px 0 0;padding:24px 28px;text-align:center">
      <div style="color:white;font-size:24px;font-weight:900;letter-spacing:-0.5px">
        <span style="font-style:italic;font-family:Georgia,Times,serif">Deal</span>Hunter<span style="background:#C41230;padding:2px 8px;border-radius:5px;font-size:15px;margin-left:4px">4U</span>
      </div>
      <p style="color:rgba(255,255,255,0.6);margin:8px 0 0;font-size:13px">Week ${week} · ${year}</p>
    </div>

    <!-- Body -->
    <div style="background:white;border-radius:0 0 16px 16px;overflow:hidden;box-shadow:0 4px 0 #DDD0C4">
      <div style="padding:24px 28px 16px">
        <h2 style="color:#1A1A1A;margin:0 0 6px;font-size:20px;font-weight:900">🛒 Top 10 Deals van de Week</h2>
        <p style="color:#6B6259;margin:0;font-size:13px;line-height:1.6">
          De beste kortingen van Albert Heijn, Jumbo, Lidl, Aldi en meer — elke week vers voor je geselecteerd.
        </p>
      </div>

      <table style="width:100%;border-collapse:collapse">
        ${dealsHtml}
      </table>

      <div style="padding:24px 28px;text-align:center">
        <a href="https://www.dealhunter4u.nl" style="background:#E33D26;color:white;padding:14px 32px;border-radius:30px;text-decoration:none;font-weight:900;font-size:15px;display:inline-block;letter-spacing:0.3px">
          Bekijk alle deals →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:20px 16px;color:#9C9389;font-size:12px;line-height:1.8">
      Je ontvangt deze e-mail omdat je je hebt aangemeld bij DealHunter4U.<br>
      <a href="${unsubUrl}" style="color:#E33D26;text-decoration:none">Uitschrijven</a>
       ·
      <a href="https://www.dealhunter4u.nl/privacy" style="color:#E33D26;text-decoration:none">Privacybeleid</a>
    </div>
  </div>
</body>
</html>`
}

function buildWatchlistHtml(products) {
  const count = products.length
  const itemsHtml = products.map(p => `
    <tr>
      <td style="padding:14px 20px;border-bottom:1px solid #F0E6DE;vertical-align:middle">
        <strong style="color:#1A1A1A;font-size:14px">${escapeHtml(p.name)}</strong><br>
        <span style="color:#9C9389;font-size:12px">${escapeHtml(p.market)}</span>
      </td>
      <td style="padding:14px 20px;border-bottom:1px solid #F0E6DE;text-align:right;white-space:nowrap;vertical-align:middle">
        <span style="color:#E33D26;font-weight:900;font-size:17px">€${p.discountedPrice.toFixed(2)}</span><br>
        <span style="color:#9C9389;font-size:12px;text-decoration:line-through">€${p.originalPrice.toFixed(2)}</span>
      </td>
    </tr>
  `).join('')

  const intro = count === 1
    ? `<strong>${escapeHtml(products[0].name)}</strong> is deze week in de aanbieding!`
    : `${count} van jouw favorieten zijn deze week in de aanbieding!`

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Jouw favorieten zijn in de aanbieding!</title>
</head>
<body style="margin:0;padding:0;background:#F5EDE3;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px">
    <!-- Header -->
    <div style="background:#1A1A1A;border-radius:16px 16px 0 0;padding:24px 28px;text-align:center">
      <div style="color:white;font-size:24px;font-weight:900;letter-spacing:-0.5px">
        <span style="font-style:italic;font-family:Georgia,Times,serif">Deal</span>Hunter<span style="background:#C41230;padding:2px 8px;border-radius:5px;font-size:15px;margin-left:4px">4U</span>
      </div>
    </div>

    <!-- Body -->
    <div style="background:white;border-radius:0 0 16px 16px;overflow:hidden;box-shadow:0 4px 0 #DDD0C4">
      <div style="padding:24px 28px 16px">
        <h2 style="color:#1A1A1A;margin:0 0 6px;font-size:20px;font-weight:900">⭐ Jouw favorieten zijn in de aanbieding!</h2>
        <p style="color:#6B6259;margin:0;font-size:13px;line-height:1.6">${intro}</p>
      </div>

      <table style="width:100%;border-collapse:collapse">
        ${itemsHtml}
      </table>

      <div style="padding:24px 28px;text-align:center">
        <a href="https://www.dealhunter4u.nl" style="background:#E33D26;color:white;padding:14px 32px;border-radius:30px;text-decoration:none;font-weight:900;font-size:15px;display:inline-block">
          Bekijk nu →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:20px 16px;color:#9C9389;font-size:12px;line-height:1.8">
      Je ontvangt dit bericht omdat je favorieten hebt opgeslagen bij DealHunter4U.<br>
      <a href="https://www.dealhunter4u.nl" style="color:#E33D26;text-decoration:none">DealHunter4U</a>
       ·
      <a href="https://www.dealhunter4u.nl/privacy" style="color:#E33D26;text-decoration:none">Privacybeleid</a>
    </div>
  </div>
</body>
</html>`
}

export async function sendWeeklyNewsletter(topDeals) {
  if (!process.env.BREVO_API_KEY) {
    console.log('[Email] BREVO_API_KEY eksik, haftalık bülten atlandı')
    return
  }
  if (!topDeals?.length) {
    console.log('[Email] Ürün yok, haftalık bülten atlandı')
    return
  }

  const contacts = await getBrevoContacts()
  if (!contacts.length) {
    console.log('[Email] Brevo abonesi yok, bülten atlandı')
    return
  }

  const week = getISOWeek()
  const year = new Date().getFullYear()
  const subject = `🛒 Top 10 deals van week ${week} ${year} — DealHunter4U`

  let sent = 0
  let errors = 0
  for (const contact of contacts) {
    if (!contact.email) continue
    const html = buildNewsletterHtml(topDeals, contact.email)
    try {
      await sendTransactionalEmail(contact.email, subject, html)
      sent++
      // Brevo free plan: respect rate limits
      await new Promise(r => setTimeout(r, 200))
    } catch (e) {
      errors++
      console.error(`[Email] Bülten gönderilemedi (${contact.email}):`, e.message)
    }
  }
  console.log(`📧 Haftalık bülten: ${sent} gönderildi, ${errors} hata (toplam ${contacts.length} abone)`)
}

export async function sendWatchlistAlert(email, products) {
  if (!process.env.BREVO_API_KEY || !email || !products?.length) return
  const count = products.length
  const subject = count === 1
    ? `⭐ ${products[0].name} is in de aanbieding! — DealHunter4U`
    : `⭐ ${count} favorieten zijn in de aanbieding! — DealHunter4U`
  const html = buildWatchlistHtml(products)
  await sendTransactionalEmail(email, subject, html)
}

function buildDealAlertHtml(keywords, products, unsubToken) {
  const keywordList = keywords.map(k => `<strong>${escapeHtml(k)}</strong>`).join(', ')
  const itemsHtml = products.slice(0, 8).map(p => {
    const hasDiscount = p.originalPrice > p.discountedPrice && p.originalPrice > 0
    const pct = hasDiscount
      ? (p.discount || Math.round(((p.originalPrice - p.discountedPrice) / p.originalPrice) * 100))
      : 0
    return `
    <tr>
      <td style="padding:14px 20px;border-bottom:1px solid #F0E6DE;vertical-align:middle">
        <strong style="color:#1A1A1A;font-size:14px">${escapeHtml(p.name)}</strong><br>
        <span style="color:#9C9389;font-size:12px">${escapeHtml(p.market)}</span>
      </td>
      <td style="padding:14px 20px;border-bottom:1px solid #F0E6DE;text-align:right;white-space:nowrap;vertical-align:middle">
        <span style="color:#E33D26;font-weight:900;font-size:17px">€${p.discountedPrice.toFixed(2)}</span>
        ${hasDiscount ? `<br><span style="color:#9C9389;font-size:12px;text-decoration:line-through">€${p.originalPrice.toFixed(2)}</span>
        <span style="background:#E33D26;color:white;font-size:10px;font-weight:900;padding:1px 5px;border-radius:8px;margin-left:3px">-${pct}%</span>` : ''}
      </td>
    </tr>`
  }).join('')

  const unsubUrl = unsubToken
    ? `https://www.dealhunter4u.nl/api/deal-alerts/unsubscribe?token=${encodeURIComponent(unsubToken)}`
    : 'https://www.dealhunter4u.nl'

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Deal alert: ${keywords[0]} in de aanbieding!</title>
</head>
<body style="margin:0;padding:0;background:#F5EDE3;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px">
    <div style="background:#1A1A1A;border-radius:16px 16px 0 0;padding:24px 28px;text-align:center">
      <div style="color:white;font-size:24px;font-weight:900;letter-spacing:-0.5px">
        <span style="font-style:italic;font-family:Georgia,Times,serif">Deal</span>Hunter<span style="background:#C41230;padding:2px 8px;border-radius:5px;font-size:15px;margin-left:4px">4U</span>
      </div>
    </div>
    <div style="background:white;border-radius:0 0 16px 16px;overflow:hidden;box-shadow:0 4px 0 #DDD0C4">
      <div style="padding:24px 28px 16px">
        <h2 style="color:#1A1A1A;margin:0 0 8px;font-size:20px;font-weight:900">🔔 Jouw deal alert!</h2>
        <p style="color:#6B6259;margin:0;font-size:13px;line-height:1.6">
          Er zijn actuele aanbiedingen voor ${keywordList}.
        </p>
      </div>
      <table style="width:100%;border-collapse:collapse">
        ${itemsHtml}
      </table>
      <div style="padding:24px 28px;text-align:center">
        <a href="https://www.dealhunter4u.nl" style="background:#E33D26;color:white;padding:14px 32px;border-radius:30px;text-decoration:none;font-weight:900;font-size:15px;display:inline-block">
          Bekijk alle deals →
        </a>
      </div>
    </div>
    <div style="text-align:center;padding:20px 16px;color:#9C9389;font-size:12px;line-height:1.8">
      Je ontvangt dit bericht omdat je een deal alert hebt ingesteld bij DealHunter4U.<br>
      <a href="${unsubUrl}" style="color:#E33D26;text-decoration:none">Alert uitschakelen</a>
       ·
      <a href="https://www.dealhunter4u.nl/privacy" style="color:#E33D26;text-decoration:none">Privacybeleid</a>
    </div>
  </div>
</body>
</html>`
}

export async function sendDealAlert(email, keywords, products, unsubToken) {
  if (!process.env.BREVO_API_KEY || !email || !products?.length) return
  const kw = keywords[0] ?? 'aanbieding'
  const subject = products.length === 1
    ? `🔔 ${products[0].name} in de aanbieding! — DealHunter4U`
    : `🔔 ${products.length} aanbiedingen voor ${kw} — DealHunter4U`
  const html = buildDealAlertHtml(keywords, products, unsubToken)
  await sendTransactionalEmail(email, subject, html)
}
