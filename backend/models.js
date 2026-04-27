import { v4 as uuidv4 } from 'uuid'
import * as db from './db.js'

export async function getProducts() {
  return db.getProducts()
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
  }

  await db.createProduct(product)
  return product
}

export async function deleteProduct(id) {
  await db.deleteProduct(id)
}

export async function clearAllProducts() {
  await db.clearAllProducts()
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
  }

  return db.updateProduct(id, updatedData)
}
