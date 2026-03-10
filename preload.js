const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('API', {
  exitApp: () => ipcRenderer.invoke('exit-app'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  selectDirectory: async () => ipcRenderer.invoke('open-directory-dialog'),
});
