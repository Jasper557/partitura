declare global {
  interface Window {
    electron?: {
      isElectron: boolean
      toggleFullscreen: () => Promise<boolean>
      isFullscreen: () => Promise<boolean>
      onFullscreenChange: (callback: (isFullscreen: boolean) => void) => () => void
      removeFullscreenListener: (callback: (isFullscreen: boolean) => void) => void
      syncPdfFullscreen: (isFullscreen: boolean) => Promise<boolean>
    }
  }
}

export {} 