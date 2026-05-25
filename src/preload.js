contextBridge.exposeInMainWorld('db', {
	listNotes: () => ipcRenderer.invoke('db:listNotes'),
	addNote: (text) => ipcRenderer.invoke('db:addNote', text),
	deleteNote: (id) => ipcRenderer.invoke('db:deleteNote', id),
});