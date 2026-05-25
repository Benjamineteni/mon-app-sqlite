// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    addUser: (user) => ipcRenderer.invoke('add-user', user),
    getUsers: () => ipcRenderer.invoke('get-users')
});