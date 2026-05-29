
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('db', {
	listNotes: () => ipcRenderer.invoke('db:listNotes'),
	addNote: (text) => ipcRenderer.invoke('db:addNote', text),
	deleteNote: (id) => ipcRenderer.invoke('db:deleteNote', id),
});


contextBridge.exposeInMainWorld('apiProducts', {
  create: (product) => ipcRenderer.invoke('product:create', product),
  readAll: () => ipcRenderer.invoke('product:read-all'),
  update: (id, updatedData) => ipcRenderer.invoke('product:update', id, updatedData),
  delete: (id) => ipcRenderer.invoke('product:delete', id)
});