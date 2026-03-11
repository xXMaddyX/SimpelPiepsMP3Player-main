// ------->>>>Electron Main Process - the heart of the whole app<<<<-------
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// ------->>>>global window reference so IPC handlers can reach it<<<<-------
let win;

const createWindow = () => {
  // ------->>>>create the frameless app window with custom title and icon<<<<-------
  win = new BrowserWindow({
    width: 1060,
    height: 700,
    minWidth: 820,
    minHeight: 560,
    frame: false,
    title: 'Pieps Music Player by PiepsSoft',
    icon: path.join(__dirname, 'PiepsmitTasseico.ico'),
    backgroundColor: '#0d0d14',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  // ------->>>>load the built Vue app from dist folder<<<<-------
  win.loadFile(path.join(__dirname, 'dist', 'index.html'));
};

app.whenReady().then(() => {
  // ------->>>>IPC handlers - renderer sends messages, main process handles them<<<<-------

  ipcMain.handle('exit-app', () => app.quit());

  ipcMain.handle('minimize-window', () => {
    if (win) win.minimize();
  });

  ipcMain.handle('maximize-window', () => {
    if (win) {
      // ------->>>>toggle between maximized and normal<<<<-------
      if (win.isMaximized()) win.unmaximize();
      else win.maximize();
    }
  });

  // ------->>>>open folder dialog and return a list of music files inside it<<<<-------
  ipcMain.handle('open-directory-dialog', async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const directoryPath = result.filePaths[0];
      const files = fs.readdirSync(directoryPath);
      // ------->>>>filter for all supported audio formats<<<<-------
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

  // ------->>>>macOS: re-create window when dock icon is clicked and no windows open<<<<-------
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// ------->>>>quit the app when all windows are closed (skip on macOS)<<<<-------
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
