const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to render process through 'electron'
contextBridge.exposeInMainWorld('electron', {
  isElectron: true,

  // Handle fullscreen for PDF viewer
  syncPdfFullscreen: (state) => ipcRenderer.invoke('sync-pdf-fullscreen', state),
  onFullscreenChange: (callback) => {
    const subscription = (_event, isFullscreen) => callback(isFullscreen);
    ipcRenderer.on('fullscreen-change', subscription);
    
    // Return a function to clean up the event listener
    return () => {
      ipcRenderer.removeListener('fullscreen-change', subscription);
    };
  }
}); 