import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, 'data.db')

let db

export function initDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) return reject(err)
      
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT,
          market TEXT,
          originalPrice REAL,
          discountedPrice REAL,
          discount INTEGER,
          imageUrl TEXT,
          isCampaign BOOLEAN,
          source TEXT,
          expiresAt TEXT,
          createdAt TEXT
        )
      `, (err) => {
        if (err) return reject(err)
        console.log('✅ Veritabanı başlatıldı (SQLite aktif, ürünler kalıcı)')
        resolve()
      })
    })
  })
}

export function getProducts() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM products ORDER BY (imageUrl IS NOT NULL AND imageUrl != "") DESC, discount DESC', [], (err, rows) => {
      if (err) return reject(err)
      resolve(rows.map(r => ({ ...r, isCampaign: Boolean(r.isCampaign) })))
    })
  })
}

export function getProduct(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err)
      if (!row) return resolve(null)
      resolve({ ...row, isCampaign: Boolean(row.isCampaign) })
    })
  })
}

export function createProduct(product) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO products (id, name, market, originalPrice, discountedPrice, discount, imageUrl, isCampaign, source, expiresAt, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [product.id, product.name, product.market, product.originalPrice, product.discountedPrice, product.discount, product.imageUrl, product.isCampaign ? 1 : 0, product.source, product.expiresAt, product.createdAt],
      function (err) {
        if (err) return reject(err)
        resolve(product)
      }
    )
  })
}

export function updateProduct(id, product) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE products SET name=?, market=?, originalPrice=?, discountedPrice=?, discount=?, imageUrl=?, isCampaign=?, source=?, expiresAt=? WHERE id=?`,
      [product.name, product.market, product.originalPrice, product.discountedPrice, product.discount, product.imageUrl, product.isCampaign ? 1 : 0, product.source, product.expiresAt, id],
      function (err) {
        if (err) return reject(err)
        getProduct(id).then(resolve).catch(reject)
      }
    )
  })
}

export function deleteProduct(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
      if (err) return reject(err)
      resolve()
    })
  })
}

export function clearAllProducts() {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM products', [], function (err) {
      if (err) return reject(err)
      resolve()
    })
  })
}
