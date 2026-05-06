import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
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
  await pool.query(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      endpoint TEXT PRIMARY KEY,
      keys JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  console.log('✅ PostgreSQL veritabanı başlatıldı')
}

export async function saveSubscription(subscription) {
  await pool.query(
    `INSERT INTO push_subscriptions (endpoint, keys)
     VALUES ($1, $2)
     ON CONFLICT (endpoint) DO NOTHING`,
    [subscription.endpoint, JSON.stringify(subscription.keys)]
  )
}

export async function deleteSubscription(endpoint) {
  await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint])
}

export async function getAllSubscriptions() {
  const { rows } = await pool.query('SELECT endpoint, keys FROM push_subscriptions')
  return rows.map(r => ({ endpoint: r.endpoint, keys: r.keys }))
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
    `INSERT INTO products (id, name, market, "originalPrice", "discountedPrice", discount, "imageUrl", "isCampaign", source, "expiresAt", "createdAt", category)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [product.id, product.name, product.market, product.originalPrice, product.discountedPrice, product.discount, product.imageUrl, product.isCampaign ? true : false, product.source, product.expiresAt, product.createdAt, product.category || 'overig']
  )
  return product
}

export async function updateProduct(id, product) {
  await pool.query(
    `UPDATE products SET name=$1, market=$2, "originalPrice"=$3, "discountedPrice"=$4, discount=$5, "imageUrl"=$6, "isCampaign"=$7, source=$8, "expiresAt"=$9 WHERE id=$10`,
    [product.name, product.market, product.originalPrice, product.discountedPrice, product.discount, product.imageUrl, product.isCampaign ? true : false, product.source, product.expiresAt, id]
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
