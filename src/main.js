const { app, BrowserWindow, ipcMain } = require('electron');

//import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { initDatabase } from './db.js'; // bref ici vous importez tout ce que vous avez exporté de db.js



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
  // mainWindow.webContents.openDevTools();
};

/*function registerDbIpc() {
  ipcMain.handle('db:listNotes', async () => await listNotes());
  ipcMain.handle('db:addNote', async (_event, text) => await addNote(text));
  ipcMain.handle('db:deleteNote', async (_event, id) => await deleteNote(id));
}*/
const sessionsByWebContentsId = new Map();

function registerDbIpc() {
  
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
  void closeDb();
});

// creation d'un nouveau produit (exemple d'utilisation de l'API exposée dans preload.js)
async function ajouterNouveauProduit() {
  const nouveauProduit = {
    name: "Paracetamol",
    price: 150, // prix en FCFA par exemple
    stock: 50
  };

  const resultat = await window.apiProducts.create(nouveauProduit);
  if (resultat.success) {
    console.log(`Produit créé avec succès ! ID : ${resultat.id}`);
    chargerListeProduits(); // Rafraîchir l'affichage
  } else {
    console.error("Erreur lors de la création :", resultat.error);
  }
}

//afficher le produit
async function chargerListeProduits() {
  try {
    const listeProduits = await window.apiProducts.readAll();
    console.log("Produits en stock :", listeProduits);
    
    // Exemple d'injection rapide dans le DOM
    const conteneur = document.getElementById('liste-produits');
    conteneur.innerHTML = listeProduits.map(p => `
      <div id="prod-${p.id}">
        <strong>${p.name}</strong> - ${p.price} XAF (Stock: ${p.stock})
        <button onclick="modifierProduit(${p.id})">Modifier</button>
        <button onclick="supprimerProduit(${p.id})">Supprimer</button>
      </div>
    `).join('');
  } catch (error) {
    console.error("Erreur d'affichage :", error);
  }
}

//mise a jour d'un produit
async function modifierProduit(id) {
  const donneesModifiees = {
    name: "paracetamol (Modifié)",
    price: 1300,
    stock: 45
  };

  const resultat = await window.apiProducts.update(id, donneesModifiees);
  if (resultat.success) {
    console.log("Le produit a été mis à jour.");
    chargerListeProduits();
  }
}

//suppression d'un produit
async function supprimerProduit(id) {
  if (confirm("Voulez-vous vraiment supprimer ce produit ?")) {
    const resultat = await window.apiProducts.delete(id);
    if (resultat.success) {
      console.log("Produit supprimé.");
      // Optionnel : Retirer directement l'élément du DOM sans tout recharger
      document.getElementById(`prod-${id}`).remove();
    }
  }
}