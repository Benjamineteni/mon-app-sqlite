
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('apiProducts', {
  createProduct: (name, price, quantity) => ipcRenderer.invoke('product:create', name, price, quantity),
  listProducts: () => ipcRenderer.invoke('product:list'),
  updateProduct: (id, name, price, quantity) => ipcRenderer.invoke('product:update', id, name, price, quantity),
  deleteProduct: (id) => ipcRenderer.invoke('product:delete', id)
});