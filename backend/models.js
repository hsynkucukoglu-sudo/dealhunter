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
  const originalPrice = parseFloat(data.originalPrice)
  const discountedPrice = parseFloat(data.discountedPrice)
  const discount = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)

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

export async function updateProduct(id, data) {
  const originalPrice = parseFloat(data.originalPrice)
  const discountedPrice = parseFloat(data.discountedPrice)
  const discount = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)

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
