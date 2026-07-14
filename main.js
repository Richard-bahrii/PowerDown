const { app, BrowserWindow, Tray, Menu, ipcMain, dialog, nativeImage } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

app.setName('PowerDown');

const ICON_PATH = path.join(__dirname, 'assets', 'icon.png');

const LOCALES = {
  en: {
    tag: 'en-US',
    trayShow: 'Show window',
    trayScheduledAt: (time) => `Scheduled for ${time}`,
    trayNotScheduled: 'No shutdown scheduled',
    trayCancel: 'Cancel shutdown',
    trayQuit: 'Quit',
    errorTitle: 'Could not shut down the computer',
    errorBody: 'The shutdown command failed:\n',
  },
  uk: {
    tag: 'uk-UA',
    trayShow: 'Показати вікно',
    trayScheduledAt: (time) => `Заплановано на ${time}`,
    trayNotScheduled: 'Вимкнення не заплановано',
    trayCancel: 'Скасувати вимкнення',
    trayQuit: 'Вийти',
    errorTitle: 'Не вдалося вимкнути компʼютер',
    errorBody: 'Команда вимкнення завершилась помилкою:\n',
  },
  es: {
    tag: 'es-ES',
    trayShow: 'Mostrar ventana',
    trayScheduledAt: (time) => `Programado para ${time}`,
    trayNotScheduled: 'Ningún apagado programado',
    trayCancel: 'Cancelar apagado',
    trayQuit: 'Salir',
    errorTitle: 'No se pudo apagar el ordenador',
    errorBody: 'El comando de apagado falló:\n',
  },
  fr: {
    tag: 'fr-FR',
    trayShow: 'Afficher la fenêtre',
    trayScheduledAt: (time) => `Programmé pour ${time}`,
    trayNotScheduled: 'Aucune extinction programmée',
    trayCancel: "Annuler l'extinction",
    trayQuit: 'Quitter',
    errorTitle: "Impossible d'éteindre l'ordinateur",
    errorBody: "La commande d'extinction a échoué :\n",
  },
  de: {
    tag: 'de-DE',
    trayShow: 'Fenster anzeigen',
    trayScheduledAt: (time) => `Geplant für ${time}`,
    trayNotScheduled: 'Kein Herunterfahren geplant',
    trayCancel: 'Herunterfahren abbrechen',
    trayQuit: 'Beenden',
    errorTitle: 'Der Computer konnte nicht heruntergefahren werden',
    errorBody: 'Der Befehl zum Herunterfahren ist fehlgeschlagen:\n',
  },
};

let currentLocale = 'en';
function loc() {
  return LOCALES[currentLocale] || LOCALES.en;
}

let mainWindow = null;
let tray = null;
let checkIntervalId = null;
let targetTime = null; // ms since epoch, or null when nothing scheduled

function buildShutdownCommand() {
  switch (process.platform) {
    case 'win32':
      return 'shutdown /s /f /t 0';
    case 'darwin':
      return `osascript -e 'tell application "System Events" to shut down'`;
    default:
      // Linux: try the modern systemd path first, then fall back.
      return 'systemctl poweroff || loginctl poweroff || shutdown -h now';
  }
}

function executeShutdown() {
  exec(buildShutdownCommand(), (error) => {
    if (error) {
      console.error('Failed to shut down the computer:', error);
      if (mainWindow) {
        dialog.showErrorBox(
          loc().errorTitle,
          loc().errorBody + error.message
        );
      }
    }
  });
  clearSchedule();
}

function clearSchedule() {
  if (checkIntervalId) {
    clearInterval(checkIntervalId);
    checkIntervalId = null;
  }
  targetTime = null;
  updateTrayMenu();
}

function scheduleShutdown(timestamp) {
  clearSchedule();
  targetTime = timestamp;
  checkIntervalId = setInterval(() => {
    if (targetTime !== null && Date.now() >= targetTime) {
      executeShutdown();
    }
  }, 1000);
  updateTrayMenu();
}

function getStatus() {
  return { active: targetTime !== null, targetTime };
}

// --- Auto-launch on system startup ---
// macOS/Windows use the native login-item API; Linux uses an XDG autostart
// .desktop file, since Electron's login-item API doesn't cover it.
const linuxAutostartFile = path.join(os.homedir(), '.config', 'autostart', 'powerdown.desktop');

function getAutoLaunch() {
  if (process.platform === 'linux') {
    return fs.existsSync(linuxAutostartFile);
  }
  return app.getLoginItemSettings().openAtLogin;
}

function setAutoLaunch(enabled) {
  if (process.platform === 'linux') {
    if (enabled) {
      const execCmd = app.isPackaged
        ? `"${process.execPath}"`
        : `"${process.execPath}" "${app.getAppPath()}"`;
      const desktopEntry = [
        '[Desktop Entry]',
        'Type=Application',
        'Name=PowerDown',
        `Exec=${execCmd}`,
        'X-GNOME-Autostart-enabled=true',
        'Terminal=false',
        '',
      ].join('\n');
      fs.mkdirSync(path.dirname(linuxAutostartFile), { recursive: true });
      fs.writeFileSync(linuxAutostartFile, desktopEntry);
    } else if (fs.existsSync(linuxAutostartFile)) {
      fs.rmSync(linuxAutostartFile);
    }
    return;
  }
  app.setLoginItemSettings({ openAtLogin: enabled });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 470,
    useContentSize: true,
    resizable: false,
    backgroundColor: '#1b1b1e',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile('index.html');

  mainWindow.on('close', (event) => {
    if (tray && !app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'icon.png'));
  const trayIcon = icon.isEmpty() ? icon : icon.resize({ width: 16, height: 16 });
  try {
    tray = new Tray(trayIcon);
    tray.setToolTip('PowerDown');
    tray.on('click', () => {
      if (mainWindow) {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      }
    });
    updateTrayMenu();
  } catch (err) {
    console.error('Failed to create tray icon:', err);
    tray = null;
  }
}

function updateTrayMenu() {
  if (!tray) return;
  const active = targetTime !== null;
  const l = loc();
  const menu = Menu.buildFromTemplate([
    { label: l.trayShow, click: () => mainWindow && mainWindow.show() },
    { type: 'separator' },
    {
      label: active ? l.trayScheduledAt(new Date(targetTime).toLocaleString(l.tag)) : l.trayNotScheduled,
      enabled: false,
    },
    {
      label: l.trayCancel,
      enabled: active,
      click: () => {
        clearSchedule();
        if (mainWindow) mainWindow.webContents.send('status-changed', getStatus());
      },
    },
    { type: 'separator' },
    {
      label: l.trayQuit,
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(menu);
}

app.whenReady().then(() => {
  // In development on macOS the Dock shows the generic Electron icon; set ours explicitly.
  if (process.platform === 'darwin' && app.dock) {
    const dockIcon = nativeImage.createFromPath(ICON_PATH);
    if (!dockIcon.isEmpty()) app.dock.setIcon(dockIcon);
  }

  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (!tray) {
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

ipcMain.handle('get-status', () => getStatus());

ipcMain.on('schedule-shutdown', (_event, timestamp) => {
  scheduleShutdown(timestamp);
});

ipcMain.on('cancel-shutdown', () => {
  clearSchedule();
});

ipcMain.handle('get-platform', () => process.platform);

ipcMain.on('set-locale', (_event, lang) => {
  if (LOCALES[lang]) {
    currentLocale = lang;
    updateTrayMenu();
  }
});

ipcMain.on('resize-window', (_event, height) => {
  if (!mainWindow) return;
  const [width] = mainWindow.getContentSize();
  const clamped = Math.max(200, Math.min(1200, Math.round(height)));
  mainWindow.setContentSize(width, clamped, false);
});

ipcMain.handle('get-auto-launch', () => getAutoLaunch());

ipcMain.handle('set-auto-launch', (_event, enabled) => {
  setAutoLaunch(enabled);
  return getAutoLaunch();
});
