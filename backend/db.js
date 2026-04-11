// In-memory storage (gerçek uygulamada SQLite/PostgreSQL kullan)
let products = []

export async function initDatabase() {
  console.log('✅ Veritabanı başlatıldı (In-memory)')
}

export async function getProducts() {
  return products
}

export async function getProduct(id) {
  return products.find(p => p.id === id)
}

export async function createProduct(product) {
  products.push(product)
  return product
}

export async function updateProduct(id, updatedProduct) {
  const index = products.findIndex(p => p.id === id)
  if (index !== -1) {
    products[index] = { ...products[index], ...updatedProduct }
    return products[index]
  }
  return null
}

export async function deleteProduct(id) {
  products = products.filter(p => p.id !== id)
}

export async function clearAllProducts() {
  products = []
}
