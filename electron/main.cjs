const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const url = require('url');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // Remove the menu bar
  Menu.setApplicationMenu(null);

  // Load the app
  if (isDev) {
    // In development mode, load from the dev server
    mainWindow.loadURL('http://localhost:5174');
    // Open DevTools
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from the built files
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, '../dist/index.html'),
        protocol: 'file:',
        slashes: true
      })
    );
  }

  // Handle fullscreen for PDF viewer
  let isFullscreen = false;
  ipcMain.handle('sync-pdf-fullscreen', (_, shouldBeFullscreen) => {
    if (shouldBeFullscreen !== isFullscreen) {
      mainWindow.setFullScreen(shouldBeFullscreen);
      isFullscreen = shouldBeFullscreen;
    }
    return isFullscreen;
  });

  mainWindow.on('enter-full-screen', () => {
    mainWindow.webContents.send('fullscreen-change', true);
    isFullscreen = true;
  });

  mainWindow.on('leave-full-screen', () => {
    mainWindow.webContents.send('fullscreen-change', false);
    isFullscreen = false;
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
}); 