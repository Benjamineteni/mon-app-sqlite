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


/*export function registerProductIpc() {
  // 1. CREATE (Créer un produit)
  ipcMain.handle('product:create', async (event, product) => {
    try {
      const stmt = db.prepare('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)');
      const info = stmt.run(product.name, product.price, product.stock);
      return { success: true, id: info.lastInsertRowid };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // 2. READ (Lire/Récupérer les produits)
  ipcMain.handle('product:read-all', async () => {
    try {
      const stmt = db.prepare('SELECT * FROM products ORDER BY id DESC');
      return stmt.all();
    } catch (error) {
      throw error;
    }
  });

  // 3. UPDATE (Modifier un produit)
  ipcMain.handle('product:update', async (event, id, updatedData) => {
    try {
      const stmt = db.prepare('UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?');
      const info = stmt.run(updatedData.name, updatedData.price, updatedData.stock, id);
      return { success: info.changes > 0 };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // 4. DELETE (Supprimer un produit)
  ipcMain.handle('product:delete', async (event, id) => {
    try {
      const stmt = db.prepare('DELETE FROM products WHERE id = ?');
      const info = stmt.run(id);
      return { success: info.changes > 0 };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}*/