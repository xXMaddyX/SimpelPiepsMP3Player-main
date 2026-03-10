const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let win;

const createWindow = () => {
  win = new BrowserWindow({
    width: 1060,
    height: 700,
    minWidth: 820,
    minHeight: 560,
    frame: false,
    backgroundColor: '#0d0d14',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  win.loadFile(path.join(__dirname, 'dist', 'index.html'));
};

app.whenReady().then(() => {
  ipcMain.handle('exit-app', () => app.quit());

  ipcMain.handle('minimize-window', () => {
    if (win) win.minimize();
  });

  ipcMain.handle('maximize-window', () => {
    if (win) {
      if (win.isMaximized()) win.unmaximize();
      else win.maximize();
    }
  });

  ipcMain.handle('open-directory-dialog', async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const directoryPath = result.filePaths[0];
      const files = fs.readdirSync(directoryPath);
      const musicFiles = files.filter(file =>
        ['.mp3', '.wav', '.flac', '.ogg', '.aac', '.m4a'].some(ext =>
          file.toLowerCase().endsWith(ext)
        )
      );
      return { directoryPath, musicFiles };
    }
    return null;
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
