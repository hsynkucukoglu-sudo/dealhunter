import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

export async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT,
      market TEXT,
      "originalPrice" REAL,
      "discountedPrice" REAL,
      discount INTEGER,
      "imageUrl" TEXT,
      "isCampaign" BOOLEAN,
      source TEXT,
      "expiresAt" TEXT,
      "createdAt" TEXT,
      category TEXT DEFAULT 'overig'
    )
  `)
  // Unit-price fields (added later — safe to run repeatedly)
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT`)
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS "unitSize" REAL`)
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS "unitType" TEXT`)
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS "unitPrice" REAL`)
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS "fullSizeLabel" TEXT`)
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS "campaignType" TEXT`)
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS "affiliate_url" TEXT`)
  // DB-level duplicate prevention: (market, lowercase name) unique index
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_products_market_name
    ON products (market, LOWER(TRIM(name)))
    WHERE market IS NOT NULL AND name IS NOT NULL
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      endpoint TEXT PRIMARY KEY,
      keys JSONB NOT NULL,
      user_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  await pool.query(`
    ALTER TABLE push_subscriptions
    ADD COLUMN IF NOT EXISTS user_id TEXT
  `)
  await pool.query(`
    ALTER TABLE push_subscriptions
    ADD COLUMN IF NOT EXISTS preferred_markets TEXT[] DEFAULT NULL
  `)
  await pool.query(`
    ALTER TABLE push_subscriptions
    ADD COLUMN IF NOT EXISTS preferred_categories TEXT[] DEFAULT NULL
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_favorites (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      product_market TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, product_name, product_market)
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS price_history (
      id SERIAL PRIMARY KEY,
      product_name TEXT NOT NULL,
      product_market TEXT NOT NULL,
      discounted_price REAL NOT NULL,
      original_price REAL NOT NULL,
      recorded_week DATE NOT NULL DEFAULT CURRENT_DATE,
      UNIQUE(product_name, product_market, recorded_week)
    )
  `)
  await pool.query(`ALTER TABLE price_history ADD COLUMN IF NOT EXISTS unit_size REAL`)
  await pool.query(`ALTER TABLE price_history ADD COLUMN IF NOT EXISTS unit_type TEXT`)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_emails (
      user_id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  
  // Performance Indexes
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_expiresAt ON products ("expiresAt")`)
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_lower_name_market ON products (lower(name), market)`)
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_category ON products (category)`)
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_market ON products (market)`)
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_price_history_recorded_week ON price_history (recorded_week)`)

  console.log('✅ PostgreSQL veritabanı başlatıldı')
}

export async function saveSubscription(subscription) {
  await pool.query(
    `INSERT INTO push_subscriptions (endpoint, keys, user_id, preferred_markets, preferred_categories)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (endpoint) DO UPDATE
       SET user_id = COALESCE(EXCLUDED.user_id, push_subscriptions.user_id),
           preferred_markets = COALESCE(EXCLUDED.preferred_markets, push_subscriptions.preferred_markets),
           preferred_categories = COALESCE(EXCLUDED.preferred_categories, push_subscriptions.preferred_categories)`,
    [
      subscription.endpoint,
      JSON.stringify(subscription.keys),
      subscription.userId || null,
      subscription.preferredMarkets?.length ? subscription.preferredMarkets : null,
      subscription.preferredCategories?.length ? subscription.preferredCategories : null,
    ]
  )
}

export async function updateSubscriptionPreferences(endpoint, { markets, categories }) {
  await pool.query(
    `UPDATE push_subscriptions
     SET preferred_markets = $1, preferred_categories = $2
     WHERE endpoint = $3`,
    [
      markets?.length ? markets : null,
      categories?.length ? categories : null,
      endpoint,
    ]
  )
}

// Sadece tercihsiz aboneler (genel push için)
export async function getUnsegmentedSubscriptions() {
  const { rows } = await pool.query(
    `SELECT endpoint, keys FROM push_subscriptions
     WHERE preferred_markets IS NULL AND preferred_categories IS NULL`
  )
  return rows.map(r => ({ endpoint: r.endpoint, keys: r.keys }))
}

// Verilen market veya kategorilerden herhangi biriyle eşleşen tercihli aboneler
export async function getSegmentedSubscriptions(markets, categories) {
  const { rows } = await pool.query(
    `SELECT DISTINCT endpoint, keys FROM push_subscriptions
     WHERE
       (preferred_markets IS NOT NULL AND preferred_markets && $1::text[])
       OR (preferred_categories IS NOT NULL AND preferred_categories && $2::text[])`,
    [markets.length ? markets : ['__none__'], categories.length ? categories : ['__none__']]
  )
  return rows.map(r => ({ endpoint: r.endpoint, keys: r.keys }))
}

export async function getSubscriptionsByMarket(market) {
  const { rows } = await pool.query(
    `SELECT endpoint, keys FROM push_subscriptions
     WHERE preferred_markets IS NULL OR $1 = ANY(preferred_markets)`,
    [market]
  )
  return rows.map(r => ({ endpoint: r.endpoint, keys: r.keys }))
}

export async function deleteSubscription(endpoint) {
  await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint])
}

export async function getAllSubscriptions() {
  const { rows } = await pool.query('SELECT endpoint, keys FROM push_subscriptions')
  return rows.map(r => ({ endpoint: r.endpoint, keys: r.keys }))
}

export async function getUserFavorites(userId) {
  const { rows } = await pool.query(
    'SELECT product_name, product_market FROM user_favorites WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  )
  return rows
}

export async function addUserFavorite(userId, productName, productMarket) {
  await pool.query(
    `INSERT INTO user_favorites (user_id, product_name, product_market)
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING`,
    [userId, productName, productMarket]
  )
}

export async function removeUserFavorite(userId, productName, productMarket) {
  await pool.query(
    'DELETE FROM user_favorites WHERE user_id = $1 AND product_name = $2 AND product_market = $3',
    [userId, productName, productMarket]
  )
}

function currentWeekMonday() {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.getFullYear(), d.getMonth(), diff).toISOString().split('T')[0]
}

export async function recordPriceHistory(products) {
  if (!products?.length) return
  const week = currentWeekMonday()
  const BATCH_SIZE = 50
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE)
    await Promise.all(batch.map(p =>
      pool.query(
        `INSERT INTO price_history (product_name, product_market, discounted_price, original_price, recorded_week, unit_size, unit_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (product_name, product_market, recorded_week)
         DO UPDATE SET discounted_price = LEAST(EXCLUDED.discounted_price, price_history.discounted_price),
                       original_price = EXCLUDED.original_price,
                       unit_size = COALESCE(EXCLUDED.unit_size, price_history.unit_size),
                       unit_type = COALESCE(EXCLUDED.unit_type, price_history.unit_type)`,
        [p.name, p.market, p.discountedPrice, p.originalPrice, week, p.unitSize ?? null, p.unitType ?? null]
      ).catch(() => {})
    ))
  }
}

export async function getMinPriceMap() {
  const { rows } = await pool.query(`
    SELECT
      product_name,
      product_market,
      unit_size,
      unit_type,
      MIN(discounted_price) AS min_price,
      COUNT(DISTINCT recorded_week) AS weeks
    FROM price_history
    GROUP BY product_name, product_market, unit_size, unit_type
  `)
  const map = {}
  for (const r of rows) {
    // Key includes unit dimensions so pack sizes don't share the same historical low
    const sizeKey = r.unit_size != null ? `::${r.unit_size}::${r.unit_type}` : ''
    map[`${r.product_name}::${r.product_market}${sizeKey}`] = {
      minPrice: parseFloat(r.min_price),
      weeks: parseInt(r.weeks),
    }
  }
  return map
}

export async function getSubscriptionsForFavoritedProducts() {
  const { rows } = await pool.query(`
    SELECT
      ps.endpoint,
      ps.keys,
      ps.user_id,
      array_agg(DISTINCT uf.product_name || '::' || uf.product_market) AS favorite_keys
    FROM push_subscriptions ps
    JOIN user_favorites uf ON ps.user_id = uf.user_id
    JOIN products p ON lower(p.name) = lower(uf.product_name) AND p.market = uf.product_market
    WHERE ps.user_id IS NOT NULL
    GROUP BY ps.endpoint, ps.keys, ps.user_id
  `)
  return rows.map(r => ({
    endpoint: r.endpoint,
    keys: r.keys,
    userId: r.user_id,
    favoriteKeys: r.favorite_keys,
  }))
}

// Fiyat karşılaştırma grupları: (name + unit_size + unit_type) kombinasyonuna göre
// Her grupta birden fazla market olan ürünleri döner
export async function getComparisonGroups() {
  const { rows } = await pool.query(`
    WITH best_per_market AS (
      SELECT
        name,
        market,
        "unitSize"  AS unit_size,
        "unitType"  AS unit_type,
        "unitPrice" AS unit_price,
        "discountedPrice" AS price,
        "fullSizeLabel" AS full_size_label,
        ROW_NUMBER() OVER (
          PARTITION BY market, "unitSize", "unitType",
            regexp_replace(lower(name), '\\m\\d+[\\s]*(g|gr|ml|cl|dl|l|kg|kilo|stuks?|stuk|pack|pak|x)\\M', '', 'gi')
          ORDER BY "discountedPrice" ASC
        ) AS rn
      FROM products
      WHERE "unitSize" IS NOT NULL
        AND "unitType" IS NOT NULL
        AND "discountedPrice" > 0
    ),
    groups_with_multi_market AS (
      SELECT
        regexp_replace(lower(name), '\\m\\d+[\\s]*(g|gr|ml|cl|dl|l|kg|kilo|stuks?|stuk|pack|pak|x)\\M', '', 'gi') AS base_name,
        unit_size,
        unit_type
      FROM best_per_market
      WHERE rn = 1
      GROUP BY base_name, unit_size, unit_type
      HAVING COUNT(DISTINCT market) >= 2
    )
    SELECT
      b.name,
      b.market,
      b.unit_size,
      b.unit_type,
      b.unit_price,
      b.price,
      b.full_size_label,
      g.base_name
    FROM best_per_market b
    JOIN groups_with_multi_market g
      ON g.base_name = regexp_replace(lower(b.name), '\\m\\d+[\\s]*(g|gr|ml|cl|dl|l|kg|kilo|stuks?|stuk|pack|pak|x)\\M', '', 'gi')
      AND g.unit_size = b.unit_size
      AND g.unit_type = b.unit_type
    WHERE b.rn = 1
    ORDER BY g.base_name, b.unit_size ASC, b.price ASC
  `)
  return rows
}

export async function getProducts(options = {}) {
  const { market, category } = options
  let query = `
    SELECT * FROM products
    WHERE "expiresAt" >= TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')
  `
  const params = []
  
  if (market) {
    params.push(market)
    query += ` AND market = $${params.length}`
  }
  
  if (category) {
    params.push(category)
    query += ` AND category = $${params.length}`
  }
  
  query += ` ORDER BY ("imageUrl" IS NOT NULL AND "imageUrl" != '') DESC, discount DESC`
  
  const { rows } = await pool.query(query, params)
  return rows.map(r => ({
    ...r,
    isCampaign: Boolean(r.isCampaign),
    affiliateUrl: r.affiliate_url ?? null
  }))
}

export async function getProduct(id) {
  const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id])
  if (!rows[0]) return null
  return {
    ...rows[0],
    isCampaign: Boolean(rows[0].isCampaign),
    affiliateUrl: rows[0].affiliate_url ?? null
  }
}

export async function createProduct(product) {
  await pool.query(
    `INSERT INTO products (id, name, market, "originalPrice", "discountedPrice", discount, "imageUrl", "isCampaign", source, "expiresAt", "createdAt", category, brand, "unitSize", "unitType", "unitPrice", "fullSizeLabel", "campaignType", "affiliate_url")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
     ON CONFLICT DO NOTHING`,
    [
      product.id, product.name, product.market,
      product.originalPrice, product.discountedPrice, product.discount,
      product.imageUrl, product.isCampaign ? true : false,
      product.source, product.expiresAt, product.createdAt, product.category || 'overig',
      product.brand ?? null, product.unitSize ?? null, product.unitType ?? null,
      product.unitPrice ?? null, product.fullSizeLabel ?? null,
      product.campaignType ?? null, product.affiliateUrl ?? null,
    ]
  )
  return product
}

export async function updateProduct(id, product) {
  await pool.query(
    `UPDATE products SET name=$1, market=$2, "originalPrice"=$3, "discountedPrice"=$4, discount=$5, "imageUrl"=$6, "isCampaign"=$7, source=$8, "expiresAt"=$9, "campaignType"=$11, "affiliate_url"=$12 WHERE id=$10`,
    [product.name, product.market, product.originalPrice, product.discountedPrice, product.discount, product.imageUrl, product.isCampaign ? true : false, product.source, product.expiresAt, id, product.campaignType ?? null, product.affiliateUrl ?? null]
  )
  return getProduct(id)
}

export async function updateProductImage(id, imageUrl) {
  await pool.query('UPDATE products SET "imageUrl" = $1 WHERE id = $2', [imageUrl, id])
}

export async function updateProductCategory(id, category) {
  await pool.query('UPDATE products SET category = $1 WHERE id = $2', [category, id])
}

export async function deleteProduct(id) {
  await pool.query('DELETE FROM products WHERE id = $1', [id])
}

export async function clearAllProducts() {
  await pool.query('DELETE FROM products')
}

export async function clearProductsByMarket(market) {
  await pool.query('DELETE FROM products WHERE market = $1', [market])
}

export async function clearOrphanProducts() {
  await pool.query("DELETE FROM products WHERE market IS NULL OR market = ''")
}

export async function clearExpiredProducts() {
  const res = await pool.query(`
    DELETE FROM products
    WHERE "expiresAt" IS NOT NULL
      AND "expiresAt" != ''
      AND "expiresAt"::TIMESTAMPTZ < NOW()
  `)
  return res.rowCount
}

export async function getProductCount() {
  const res = await pool.query('SELECT COUNT(*) as count FROM products')
  return parseInt(res.rows[0].count, 10)
}

export async function upsertUserEmail(userId, email) {
  await pool.query(
    `INSERT INTO user_emails (user_id, email)
     VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email`,
    [userId, email]
  )
}

export async function getEmailsForFavoritedProducts() {
  const { rows } = await pool.query(`
    SELECT
      ue.email,
      array_agg(
        json_build_object(
          'name', p.name,
          'market', p.market,
          'discountedPrice', p."discountedPrice",
          'originalPrice', p."originalPrice",
          'discount', p.discount
        )
      ) AS products
    FROM user_emails ue
    JOIN user_favorites uf ON ue.user_id = uf.user_id
    JOIN products p
      ON lower(p.name) = lower(uf.product_name)
     AND p.market = uf.product_market
    GROUP BY ue.email
  `)
  return rows.map(r => ({ email: r.email, products: r.products }))
}

export async function getScraperStats() {
  const { rows } = await pool.query(`
    SELECT
      market,
      COUNT(*)::int                                                                            AS total,
      COUNT(*) FILTER (WHERE "originalPrice" > "discountedPrice")::int                        AS with_discount,
      ROUND(
        AVG(("originalPrice" - "discountedPrice") / NULLIF("originalPrice", 0) * 100)
        FILTER (WHERE "originalPrice" > "discountedPrice")::numeric, 1
      )                                                                                        AS avg_discount_pct,
      MAX("createdAt")                                                                         AS last_scraped
    FROM products
    GROUP BY market
    ORDER BY total DESC
  `)
  const total = rows.reduce((s, r) => s + r.total, 0)
  return { total, markets: rows }
}
