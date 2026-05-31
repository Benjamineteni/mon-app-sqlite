import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3');


let db;

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve({ changes: this.changes, lastID: this.lastID });
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function checkDbInitialized() {
  if (!db) {
    throw new Error('DB not initialized. Call initDatabase() first.');
  }
}


export async function initDatabase({ userDataPath }) {
  if (db) return db;

  fs.mkdirSync(userDataPath, { recursive: true });
  const dbPath = path.join(userDataPath, 'electron-sample.db');

  db = new sqlite3.Database(dbPath);

  await run('PRAGMA journal_mode = WAL');
  await run('PRAGMA foreign_keys = ON');

  await run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

export async function closeDb() {
  if (!db) return;
  await new Promise((resolve, reject) => {
    db.close((err) => (err ? reject(err) : resolve()));
  });
  db = undefined;
}

export async function createProduct(product) {
  
  checkDbInitialized();

  const name = String(product.name ?? '').trim();
  if (!name) throw new Error('Product name is required');

  const price = Number(product.price ?? 0);
  const quantity = Number(product.quantity ?? 0);

  const result = await run('INSERT INTO products (name, price, quantity) VALUES (?, ?, ?)', [name, price, quantity]);
  return await get('SELECT id, name, price, quantity, created_at FROM products WHERE id = ?', [result.lastID]);
}

export async function listProducts() {

  checkDbInitialized();
  
  return await all('SELECT id, name, price, quantity, created_at FROM products ORDER BY created_at DESC');
}

export async function deleteProduct(id) {
  checkDbInitialized();

  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) {
    throw new Error('Invalid product id');
  }

  const result = await run('DELETE FROM products WHERE id = ?', [productId]);
  return { changes: result.changes };
}

export async function updateProduct(id, product) {
  checkDbInitialized();

  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) {
    throw new Error('Invalid product id');
  }

  const name = String(product.name ?? '').trim();
  if (!name) throw new Error('Product name is required');

  const price = Number(product.price ?? 0);
  const quantity = Number(product.quantity ?? 0);

  await run(
    'UPDATE products SET name = ?, price = ?, quantity = ? WHERE id = ?',
    [name, price, quantity, productId]
  );

  return await get('SELECT id, name, price, quantity, created_at FROM products WHERE id = ?', [productId]);
}
