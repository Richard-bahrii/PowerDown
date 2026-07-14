import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

const api: PowerDownApi = {
  scheduleShutdown: (timestamp) => ipcRenderer.send('schedule-shutdown', timestamp),
  cancelShutdown: () => ipcRenderer.send('cancel-shutdown'),
  getStatus: () => ipcRenderer.invoke('get-status'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  setLocale: (lang) => ipcRenderer.send('set-locale', lang),
  getAutoLaunch: () => ipcRenderer.invoke('get-auto-launch'),
  setAutoLaunch: (enabled) => ipcRenderer.invoke('set-auto-launch', enabled),
  resizeWindow: (height) => ipcRenderer.send('resize-window', height),
  onStatusChanged: (callback) => {
    ipcRenderer.on('status-changed', (_event: IpcRendererEvent, status: ShutdownStatus) =>
      callback(status)
    );
  },
};

contextBridge.exposeInMainWorld('api', api);
