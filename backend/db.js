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
  console.log('✅ PostgreSQL veritabanı başlatıldı')
}

export async function saveSubscription(subscription) {
  await pool.query(
    `INSERT INTO push_subscriptions (endpoint, keys, user_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (endpoint) DO UPDATE SET user_id = COALESCE(EXCLUDED.user_id, push_subscriptions.user_id)`,
    [subscription.endpoint, JSON.stringify(subscription.keys), subscription.userId || null]
  )
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
  await Promise.all(products.map(p =>
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

export async function getProducts() {
  const { rows } = await pool.query(`
    SELECT * FROM products
    ORDER BY ("imageUrl" IS NOT NULL AND "imageUrl" != '') DESC, discount DESC
  `)
  return rows.map(r => ({ ...r, isCampaign: Boolean(r.isCampaign) }))
}

export async function getProduct(id) {
  const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id])
  if (!rows[0]) return null
  return { ...rows[0], isCampaign: Boolean(rows[0].isCampaign) }
}

export async function createProduct(product) {
  await pool.query(
    `INSERT INTO products (id, name, market, "originalPrice", "discountedPrice", discount, "imageUrl", "isCampaign", source, "expiresAt", "createdAt", category, brand, "unitSize", "unitType", "unitPrice", "fullSizeLabel", "campaignType")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
    [
      product.id, product.name, product.market,
      product.originalPrice, product.discountedPrice, product.discount,
      product.imageUrl, product.isCampaign ? true : false,
      product.source, product.expiresAt, product.createdAt, product.category || 'overig',
      product.brand ?? null, product.unitSize ?? null, product.unitType ?? null,
      product.unitPrice ?? null, product.fullSizeLabel ?? null,
      product.campaignType ?? null,
    ]
  )
  return product
}

export async function updateProduct(id, product) {
  await pool.query(
    `UPDATE products SET name=$1, market=$2, "originalPrice"=$3, "discountedPrice"=$4, discount=$5, "imageUrl"=$6, "isCampaign"=$7, source=$8, "expiresAt"=$9, "campaignType"=$11 WHERE id=$10`,
    [product.name, product.market, product.originalPrice, product.discountedPrice, product.discount, product.imageUrl, product.isCampaign ? true : false, product.source, product.expiresAt, id, product.campaignType ?? null]
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
