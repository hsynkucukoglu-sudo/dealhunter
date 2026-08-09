import { v4 as uuidv4 } from 'uuid'
import * as db from './db.js'

export async function getProducts(options = {}) {
  return db.getProducts(options)
}

export async function getProduct(id) {
  return db.getProduct(id)
}

export async function createProduct(data) {
  const id = uuidv4()
  const originalPrice = parseFloat(data.originalPrice) || 0
  const discountedPrice = parseFloat(data.discountedPrice) || 0
  if (discountedPrice <= 0) throw new Error(`Geçersiz fiyat: ${data.name} disc=${data.discountedPrice}`)
  const discount = originalPrice > 0
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    : 0

  const product = {
    id,
    name: data.name,
    market: data.market,
    originalPrice,
    discountedPrice,
    discount,
    imageUrl: data.imageUrl || null,
    isCampaign: data.isCampaign || false,
    source: data.source || 'Manuel Ekleme',
    expiresAt: data.expiresAt,
    createdAt: new Date().toISOString(),
    category: data.category || 'overig',
    campaignType: data.campaignType ?? null,
    affiliateUrl: data.affiliateUrl ?? null,
    brand: data.brand ?? null,
    unitSize: data.unitSize ?? null,
    unitType: data.unitType ?? null,
    unitPrice: data.unitPrice ?? null,
    fullSizeLabel: data.fullSizeLabel ?? null,
  }

  await db.createProduct(product)
  // sourceId BEWUST niet in `product` en dus niet in de products-tabel: het is
  // alleen nodig om price_history aan een permanente markt-ID te koppelen
  // (AH webshopId, Jumbo sku, Kruidvat code). De products-tabel wordt elke run
  // toch volledig vervangen, daar voegt het niets toe.
  return { ...product, sourceId: data.sourceId ?? null }
}

export async function deleteProduct(id) {
  await db.deleteProduct(id)
}

export async function clearAllProducts() {
  await db.clearAllProducts()
}

export async function clearProductsByMarket(market) {
  await db.clearProductsByMarket(market)
}

export async function updateProductImage(id, imageUrl) {
  return db.updateProductImage(id, imageUrl)
}

export async function updateProductCategory(id, category) {
  return db.updateProductCategory(id, category)
}

export async function updateProduct(id, data) {
  const originalPrice = parseFloat(data.originalPrice) || 0
  const discountedPrice = parseFloat(data.discountedPrice) || 0
  const discount = originalPrice > 0
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    : 0

  const updatedData = {
    name: data.name,
    market: data.market,
    originalPrice,
    discountedPrice,
    discount,
    imageUrl: data.imageUrl || null,
    isCampaign: data.isCampaign !== undefined ? data.isCampaign : false,
    source: data.source || 'Manuel Ekleme',
    expiresAt: data.expiresAt,
    affiliateUrl: data.affiliateUrl ?? null,
  }

  return db.updateProduct(id, updatedData)
}
