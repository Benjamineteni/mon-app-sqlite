
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('apiProducts', {
  createProduct: (product) => ipcRenderer.invoke('product:create', product),
  listProducts: () => ipcRenderer.invoke('product:list'),
  updateProduct: (id, productToUpdate) => ipcRenderer.invoke('product:update', id, productToUpdate),
  deleteProduct: (id) => ipcRenderer.invoke('product:delete', id)
});