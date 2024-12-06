import { app, BrowserWindow, session, protocol, ipcMain } from 'electron'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isDev = process.env.VITE_DEV_SERVER_URL !== undefined

let mainWindow = null

async function createWindow() {
  // Register file protocol
  protocol.registerFileProtocol('file', (request, callback) => {
    const filePath = decodeURIComponent(request.url.slice('file://'.length))
    callback({ path: filePath })
  })

  // Set up CSP
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          `default-src 'self' file: data: blob:;` +
          `script-src 'self' 'unsafe-inline' 'unsafe-eval';` +
          `style-src 'self' 'unsafe-inline';` +
          `img-src 'self' data: blob: file: https:;` +
          `font-src 'self' data:;` +
          `worker-src 'self' blob: file:;` +
          `connect-src 'self' ${isDev ? "ws: http: https:" : ""} file: blob:;` +
          `media-src 'self' file: blob:;`
        ]
      }
    })
  })

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // Don't show until we're ready
    frame: true,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../assets/icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      webviewTag: false,
      allowRunningInsecureContent: false,
      preload: path.join(__dirname, 'preload.cjs')
    }
  })

  // Remove the menu bar completely
  mainWindow.setMenu(null)

  // Maximize the window before showing it
  mainWindow.maximize()
  mainWindow.show()

  // Handle fullscreen changes
  mainWindow.on('enter-full-screen', () => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('fullscreen-change', true)
    }
  })

  mainWindow.on('leave-full-screen', () => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('fullscreen-change', false)
    }
  })

  // Enable file access
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['media', 'openExternal']
    if (allowedPermissions.includes(permission)) {
      callback(true)
    } else {
      callback(false)
    }
  })

  // IPC handlers for fullscreen
  ipcMain.handle('toggle-fullscreen', () => {
    try {
      if (mainWindow && !mainWindow.isDestroyed()) {
        const isFullScreen = mainWindow.isFullScreen()
        mainWindow.setFullScreen(!isFullScreen)
        return !isFullScreen
      }
      return false
    } catch (error) {
      console.error('Error toggling fullscreen:', error)
      return false
    }
  })

  ipcMain.handle('is-fullscreen', () => {
    try {
      return mainWindow && !mainWindow.isDestroyed() ? mainWindow.isFullScreen() : false
    } catch (error) {
      console.error('Error checking fullscreen:', error)
      return false
    }
  })

  // Add handler for PDF viewer fullscreen sync
  ipcMain.handle('sync-pdf-fullscreen', (_, isFullscreen) => {
    try {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.setFullScreen(isFullscreen)
        return true
      }
      return false
    } catch (error) {
      console.error('Error syncing PDF fullscreen:', error)
      return false
    }
  })

  try {
    if (isDev) {
      // In development, use the Vite dev server
      await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
      mainWindow.webContents.openDevTools()
    } else {
      // In production, load the built files
      const indexHtml = path.join(__dirname, '../dist/index.html')
      mainWindow.loadFile(indexHtml)
    }
  } catch (e) {
    console.error('Failed to load app:', e)
  }

  // Clean up window reference when closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Handle file protocol registration
app.whenReady().then(() => {
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURI(request.url.replace('file:///', ''))
    callback(pathname)
  })
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
}) 