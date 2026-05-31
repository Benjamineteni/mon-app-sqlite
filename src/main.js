const { app, BrowserWindow, ipcMain } = require('electron');

//import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { initDatabase, createProduct, listProducts, closeDb } from './db.js'; // bref ici vous importez tout ce que vous avez exporté de db.js




// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}


const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
   mainWindow.webContents.openDevTools();
};

// Suppression d'un produit
ipcMain.handle('delete-product', async (event, id) => {
  const sql = 'DELETE FROM products WHERE id = ?';
  return new Promise((resolve, reject) => {
    db.run(sql, [id], function(err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
  });
});

// Mise à jour d'un produit
ipcMain.handle('update-product', async (event, product) => {
  const { id, name, price, stock } = product;
  const sql = 'UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?';
  return new Promise((resolve, reject) => {
    db.run(sql, [name, price, stock, id], function(err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
  });
});

/*function registerDbIpc() {
  ipcMain.handle('db:listNotes', async () => await listNotes());
  ipcMain.handle('db:addNote', async (_event, text) => await addNote(text));
  ipcMain.handle('db:deleteNote', async (_event, id) => await deleteNote(id));
}*/
const sessionsByWebContentsId = new Map();

function registerDbIpc() {
  ipcMain.handle('product:create', async (_event, product) => await createProduct(product));
  ipcMain.handle('product:list', async () => await listProducts());
  
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  console.log(`Initializing DB at the path: ${app.getPath('userData')}`);
  return initDatabase({ userDataPath: app.getPath('userData') });
}).then(() => {
  registerDbIpc();
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});


// Si database.js exporte initDb
//const { initDb } = require('./db.js'); 
// ou avec ES Modules :
// import { initDb } from './database.js';

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // best-effort shutdown
  void closeDb();
});