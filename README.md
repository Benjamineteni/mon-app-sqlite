# Electron App with SQLite

A desktop application built with **Electron**, **Vite**, and **SQLite3** for managing a product inventory. It provides a simple CRUD interface to create, read, update, and delete products, with data persisted locally in a SQLite database.

## ✨ Features

- 📦 **Product management** — Add, edit, and delete products
- 💾 **Local SQLite database** — Data stored persistently in the user's data directory
- 🔒 **Secure IPC** — Context isolation enabled with a preload script
- 🎨 **Bootstrap UI** — Responsive interface using Bootstrap 5 and Bootstrap Icons
- ⚡ **Vite** — Fast build tooling for both main and renderer processes

## 🛠️ Tech Stack

| Technology | Role |
|---|---|
| [Electron](https://www.electronjs.org/) | Desktop app framework |
| [Vite](https://vitejs.dev/) | Bundler / Dev server |
| [SQLite3](https://github.com/TryGhost/node-sqlite3) | Local database |
| [Bootstrap 5](https://getbootstrap.com/) | UI styling |
| [Electron Forge](https://www.electronforge.io/) | Build & packaging |

## 📁 Project Structure

```
mon-app-sqlite/
├── src/
│   ├── main.js          # Electron main process — window creation & IPC handlers
│   ├── preload.js       # Preload script — exposes safe APIs to renderer
│   ├── db.js            # SQLite database layer (CRUD operations)
│   ├── renderer.js      # Renderer process — UI logic
│   ├── index.css        # Global styles
│   └── renderer/
│       ├── css/         # Bootstrap CSS & custom styles
│       └── js/          # Bootstrap JS
├── index.html           # App entry HTML
├── vite.main.config.mjs
├── vite.preload.config.mjs
├── vite.renderer.config.mjs
└── forge.config.cjs     # Electron Forge configuration
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm

### Installation

```bash
git clone https://github.com/Benjamineteni/mon-app-sqlite.git
cd mon-app-sqlite
npm install
```

> Native modules (`sqlite3`) are automatically rebuilt for Electron via the `postinstall` script.

### Run in development

```bash
npm start
```

### Build / Package

```bash
# Package the app
npm run package

# Create a distributable (deb, rpm, zip…)
npm run make
```

## 🗄️ Database

The SQLite database file is stored in the Electron `userData` directory:

- **Linux:** `~/.config/mon-app-sqlite/electron-sample.db`
- **Windows:** `%APPDATA%\mon-app-sqlite\electron-sample.db`
- **macOS:** `~/Library/Application Support/mon-app-sqlite/electron-sample.db`

### Products table schema

```sql
CREATE TABLE IF NOT EXISTS products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  price       REAL    NOT NULL,
  quantity    INTEGER DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 📡 IPC API

Communication between the renderer and main process is done via the `window.apiProducts` object exposed by the preload script:

| Method | Description |
|---|---|
| `apiProducts.createProduct(product)` | Create a new product |
| `apiProducts.listProducts()` | Get all products |
| `apiProducts.updateProduct(id, product)` | Update an existing product |
| `apiProducts.deleteProduct(id)` | Delete a product by ID |

## 📄 License

MIT — © [Eteni Elat Benjamin](mailto:benjamineteni@gmail.com)
