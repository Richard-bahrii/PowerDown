const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  scheduleShutdown: (timestamp) => ipcRenderer.send('schedule-shutdown', timestamp),
  cancelShutdown: () => ipcRenderer.send('cancel-shutdown'),
  getStatus: () => ipcRenderer.invoke('get-status'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  setLocale: (lang) => ipcRenderer.send('set-locale', lang),
  getAutoLaunch: () => ipcRenderer.invoke('get-auto-launch'),
  setAutoLaunch: (enabled) => ipcRenderer.invoke('set-auto-launch', enabled),
  onStatusChanged: (callback) => {
    ipcRenderer.on('status-changed', (_event, status) => callback(status));
  },
});
