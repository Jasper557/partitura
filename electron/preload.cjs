const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    toggleFullscreen: async () => {
      try {
        return await ipcRenderer.invoke('toggle-fullscreen')
      } catch (error) {
        console.error('Error toggling fullscreen:', error)
        return false
      }
    },
    isFullscreen: async () => {
      try {
        return await ipcRenderer.invoke('is-fullscreen')
      } catch (error) {
        console.error('Error checking fullscreen:', error)
        return false
      }
    },
    onFullscreenChange: (callback) => {
      const subscription = (_event, value) => callback(value)
      ipcRenderer.on('fullscreen-change', subscription)
      return () => {
        ipcRenderer.removeListener('fullscreen-change', subscription)
      }
    },
    removeFullscreenListener: (callback) => {
      ipcRenderer.removeListener('fullscreen-change', callback)
    },
    // Add new method for PDF viewer fullscreen sync
    syncPdfFullscreen: async (isFullscreen) => {
      try {
        return await ipcRenderer.invoke('sync-pdf-fullscreen', isFullscreen)
      } catch (error) {
        console.error('Error syncing PDF fullscreen:', error)
        return false
      }
    }
  }
) 