import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

// Define shortcut action types for each category
type GeneralShortcutAction = 'closeDialog' | 'tabNavigation'
type SheetMusicShortcutAction = 'search' | 'addNew'
type PDFViewerShortcutAction = 'previousPage' | 'nextPage' | 'zoomIn' | 'zoomOut' | 'toggleFullscreen'

// Define shortcut type structure
export type ShortcutConfig = {
  general: Record<GeneralShortcutAction, string>
  sheetMusic: Record<SheetMusicShortcutAction, string>
  pdfViewer: Record<PDFViewerShortcutAction, string>
}

// Define shortcut categories and their default values
export const DEFAULT_SHORTCUTS: ShortcutConfig = {
  general: {
    closeDialog: 'Escape',
    tabNavigation: 'Tab'
  },
  sheetMusic: {
    search: 'Ctrl + F',
    addNew: 'Ctrl + N'
  },
  pdfViewer: {
    previousPage: 'ArrowLeft',
    nextPage: 'ArrowRight',
    zoomIn: 'Ctrl + +',
    zoomOut: 'Ctrl + -',
    toggleFullscreen: 'F'
  }
}

// Define the context type
type ShortcutContextType = {
  shortcuts: ShortcutConfig
  updateShortcuts: (newShortcuts: ShortcutConfig) => void
  getShortcut: (category: keyof ShortcutConfig, action: string) => string
  isShortcutTriggered: (e: KeyboardEvent, category: keyof ShortcutConfig, action: string) => boolean
}

// Create the context
const ShortcutContext = createContext<ShortcutContextType | undefined>(undefined)

// Helper function to standardize shortcut display
const standardizeShortcutDisplay = (shortcut: string): string => {
  return shortcut
    .replace(/Control \+/g, 'Ctrl +')  // Standardize Control to Ctrl
    .replace(/Command \+/g, 'Cmd +')   // Handle Command key on Mac
    .replace(/Meta \+/g, 'Cmd +')      // Handle Meta key
}

// Helper function to standardize shortcut comparison
const standardizeShortcutForComparison = (shortcut: string): string => {
  return shortcut
    .toLowerCase()
    .replace(/control \+/g, 'ctrl +')
    .replace(/command \+/g, 'cmd +')
    .replace(/meta \+/g, 'cmd +')
}

// Create provider component
export const ShortcutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [shortcuts, setShortcuts] = useState<ShortcutConfig>(() => {
    const savedShortcuts = localStorage.getItem('shortcuts')
    if (savedShortcuts) {
      const parsed = JSON.parse(savedShortcuts) as ShortcutConfig
      // Normalize shortcuts when loading from localStorage
      return {
        general: {
          closeDialog: standardizeShortcutDisplay(parsed.general.closeDialog),
          tabNavigation: standardizeShortcutDisplay(parsed.general.tabNavigation)
        },
        sheetMusic: {
          search: standardizeShortcutDisplay(parsed.sheetMusic.search),
          addNew: standardizeShortcutDisplay(parsed.sheetMusic.addNew)
        },
        pdfViewer: {
          previousPage: standardizeShortcutDisplay(parsed.pdfViewer.previousPage),
          nextPage: standardizeShortcutDisplay(parsed.pdfViewer.nextPage),
          zoomIn: standardizeShortcutDisplay(parsed.pdfViewer.zoomIn),
          zoomOut: standardizeShortcutDisplay(parsed.pdfViewer.zoomOut),
          toggleFullscreen: standardizeShortcutDisplay(parsed.pdfViewer.toggleFullscreen)
        }
      }
    }
    return DEFAULT_SHORTCUTS
  })

  const isShortcutTriggered = useCallback((e: KeyboardEvent, category: keyof ShortcutConfig, action: string): boolean => {
    const shortcut = shortcuts[category][action as keyof typeof shortcuts[typeof category]]
    if (!shortcut) return false

    // Standardize the shortcut for comparison
    const normalizedShortcut = standardizeShortcutForComparison(shortcut)
    
    // Build the current key combination
    let currentKeys = []
    if (e.ctrlKey || e.metaKey) currentKeys.push('ctrl')
    if (e.altKey) currentKeys.push('alt')
    if (e.shiftKey) currentKeys.push('shift')
    
    // Add the main key
    if (e.key === ' ') {
      currentKeys.push('space')
    } else if (e.key === 'Control' || e.key === 'Alt' || e.key === 'Shift' || e.key === 'Meta') {
      // Don't add modifier keys by themselves
      return false
    } else {
      // Add the key in lowercase for case-insensitive comparison
      currentKeys.push(e.key.toLowerCase())
    }
    
    // Create the current shortcut string
    const currentShortcut = currentKeys.join(' + ')
    
    // Compare the normalized shortcuts
    return normalizedShortcut === currentShortcut
  }, [shortcuts])

  const updateShortcuts = useCallback((newShortcuts: ShortcutConfig) => {
    // Normalize shortcuts before saving
    const normalizedShortcuts: ShortcutConfig = {
      general: {
        closeDialog: standardizeShortcutDisplay(newShortcuts.general.closeDialog),
        tabNavigation: standardizeShortcutDisplay(newShortcuts.general.tabNavigation)
      },
      sheetMusic: {
        search: standardizeShortcutDisplay(newShortcuts.sheetMusic.search),
        addNew: standardizeShortcutDisplay(newShortcuts.sheetMusic.addNew)
      },
      pdfViewer: {
        previousPage: standardizeShortcutDisplay(newShortcuts.pdfViewer.previousPage),
        nextPage: standardizeShortcutDisplay(newShortcuts.pdfViewer.nextPage),
        zoomIn: standardizeShortcutDisplay(newShortcuts.pdfViewer.zoomIn),
        zoomOut: standardizeShortcutDisplay(newShortcuts.pdfViewer.zoomOut),
        toggleFullscreen: standardizeShortcutDisplay(newShortcuts.pdfViewer.toggleFullscreen)
      }
    }
    setShortcuts(normalizedShortcuts)
    localStorage.setItem('shortcuts', JSON.stringify(normalizedShortcuts))
  }, [])

  // Helper function to get a specific shortcut
  const getShortcut = useCallback((category: keyof ShortcutConfig, action: string): string => {
    return shortcuts[category][action as keyof typeof shortcuts[typeof category]] || ''
  }, [shortcuts])

  // Context value
  const value = {
    shortcuts,
    updateShortcuts,
    getShortcut,
    isShortcutTriggered
  }

  return (
    <ShortcutContext.Provider value={value}>
      {children}
    </ShortcutContext.Provider>
  )
}

// Custom hook to use the shortcut context
export const useShortcuts = () => {
  const context = useContext(ShortcutContext)
  if (context === undefined) {
    throw new Error('useShortcuts must be used within a ShortcutProvider')
  }
  return context
} 