import React, { useState, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'
import { 
  ArrowLeft,
  File, 
  Search, 
  ZoomIn,
  ZoomOut, 
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Keyboard,
  Save,
  RefreshCw,
  Check,
  Edit2
} from 'lucide-react'
import { Page } from '../types/index'
import { useShortcuts, ShortcutConfig, DEFAULT_SHORTCUTS } from '../context/ShortcutContext'
import InfoBox from '../components/InfoBox'
import SettingRow from '../components/SettingRow'
import useScrollReset from '../hooks/useScrollReset'
import PageTransition from '../components/PageTransition'

// Type to safely access action names within a category
type ActionName<T extends keyof ShortcutConfig> = keyof ShortcutConfig[T]

// Readable names for actions
const SHORTCUT_LABELS: Record<string, string> = {
  // Navigation
  closeDialog: "Close Dialog / Modal",
  tabNavigation: "Navigate Between Elements",
  
  // Sheet Music
  search: "Search In Collection",
  addNew: "Add New Sheet Music",
  
  // PDF Viewer
  previousPage: "Previous Page",
  nextPage: "Next Page",
  zoomIn: "Zoom In",
  zoomOut: "Zoom Out",
  toggleFullscreen: "Toggle Fullscreen Mode"
}

const KeyboardShortcuts: React.FC<{
  onNavigate?: (page: Page) => void
}> = ({ onNavigate }) => {
  const { isDarkMode } = useTheme()
  const { shortcuts, updateShortcuts } = useShortcuts()
  const [activeEdit, setActiveEdit] = useState<{category: keyof ShortcutConfig, action: string} | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const listeningRef = useRef<HTMLDivElement>(null)
  
  // Reset scroll position when component mounts
  useScrollReset()

  // Functions to handle the shortcut editing
  const handleStartRecording = <T extends keyof ShortcutConfig>(category: T, action: ActionName<T>) => {
    setActiveEdit({ category, action: action as string })
    setSuccessMessage('')
  }

  const handleSaveShortcuts = () => {
    localStorage.setItem('shortcuts', JSON.stringify(shortcuts))
    setSuccessMessage('Shortcuts saved successfully!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleResetShortcuts = () => {
    updateShortcuts(DEFAULT_SHORTCUTS)
    localStorage.removeItem('shortcuts')
    setSuccessMessage('Shortcuts reset to defaults!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!activeEdit) return

    const { category, action } = activeEdit
    
    let keyString = ''
    if (e.ctrlKey || e.metaKey) keyString += 'Ctrl + '
    if (e.altKey) keyString += 'Alt + '
    if (e.shiftKey) keyString += 'Shift + '
    
    // Add the pressed key
    if (e.key === ' ') {
      keyString += 'Space'
    } else if (e.key === 'Control' || e.key === 'Alt' || e.key === 'Shift' || e.key === 'Meta') {
      // Don't add modifier keys by themselves
      return
    } else {
      // Capitalize single character keys
      keyString += e.key.length === 1 ? e.key.toUpperCase() : e.key
    }
    
    // Update the shortcut with proper type safety
    const newShortcuts = { ...shortcuts }
    
    // Type assertion needed here to safely update the shortcuts
    if (category === 'general') {
      (newShortcuts.general[action as keyof typeof newShortcuts.general] as string) = keyString
    } else if (category === 'sheetMusic') {
      (newShortcuts.sheetMusic[action as keyof typeof newShortcuts.sheetMusic] as string) = keyString
    } else if (category === 'pdfViewer') {
      (newShortcuts.pdfViewer[action as keyof typeof newShortcuts.pdfViewer] as string) = keyString
    }
    
    updateShortcuts(newShortcuts)
    
    // Stop listening
    setActiveEdit(null)
  }

  // Render shortcut groups
  const renderShortcutCategory = <T extends keyof ShortcutConfig>(
    category: T, 
    title: string, 
    icon: React.ReactNode
  ) => {
    return (
      <div className="mb-8">
        <h2 className={`
          text-lg font-semibold mb-4 flex items-center gap-2
          ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}
        `}>
          {icon}
          {title}
        </h2>
        
        <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden`}>
          {Object.entries(shortcuts[category]).map(([action, shortcut]) => (
            <div 
              key={`${category}-${action}`} 
              className={`
                p-4 flex items-center justify-between
                ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
                border-b last:border-0
              `}
            >
              <div>
                <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {SHORTCUT_LABELS[action] || action}
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartRecording(category, action as ActionName<T>)}
                  className={`
                    px-4 py-1.5 rounded text-sm font-medium relative
                    transition-all duration-300 ease-in-out 
                    overflow-hidden group
                    ${activeEdit?.category === category && activeEdit?.action === action
                      ? isDarkMode 
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-blue-500 text-white animate-pulse'
                      : isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-400'
                    }
                  `}
                >
                  {/* Background reveal animation */}
                  <span 
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
                    style={{ 
                      clipPath: 'circle(0% at 50% 50%)',
                      transition: 'clip-path 0.5s ease-in-out' 
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.clipPath = 'circle(100% at 50% 50%)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.clipPath = 'circle(0% at 50% 50%)';
                    }}
                  />

                  {/* Shortcut text */}
                  <span className={`
                    relative z-10 inline-block w-full text-center
                    transition-all duration-300 ease-in-out
                    group-hover:blur-sm group-hover:opacity-60 group-hover:scale-90
                    ${activeEdit?.category === category && activeEdit?.action === action ? '' : 'group-hover:text-white'}
                  `}>
                    {activeEdit?.category === category && activeEdit?.action === action
                      ? 'Press new shortcut...'
                      : shortcut}
                  </span>
                  
                  {/* Edit icon with glow effect */}
                  <Edit2 
                    size={18} 
                    className={`
                      absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      opacity-0 group-hover:opacity-100
                      scale-0 group-hover:scale-110
                      transition-all duration-300 ease-in-out
                      text-white filter drop-shadow-glow
                      group-hover:animate-pulse
                    `} 
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Category labels and icons
  const categoryInfo = {
    general: { title: "General Navigation", icon: <ChevronRight size={18} /> },
    sheetMusic: { title: "Sheet Music Library", icon: <File size={18} /> },
    pdfViewer: { title: "PDF Viewer Controls", icon: <File size={18} /> }
  }

  return (
    <PageTransition>
      <div 
        ref={listeningRef}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className={`
          p-6 outline-none
          ${isDarkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'}
        `}
      >
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => onNavigate && onNavigate('settings')}
              className={`
                p-2 rounded-full mr-2
                ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}
                transition-colors duration-200
              `}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold">Keyboard Shortcuts</h1>
          </div>
          
          {/* Information box */}
          <InfoBox icon={<Keyboard size={20} />}>
            Customize keyboard shortcuts to make your workflow faster and more efficient.
            Click any shortcut to change it, then press the new key combination.
          </InfoBox>
          
          {/* Success message */}
          {successMessage && (
            <InfoBox icon={<Check size={20} />} variant="success">
              {successMessage}
            </InfoBox>
          )}
          
          {/* Shortcut categories */}
          {Object.entries(categoryInfo).map(([category, info]) => (
            renderShortcutCategory(
              category as keyof ShortcutConfig,
              info.title,
              info.icon
            )
          ))}
          
          {/* Action buttons */}
          <div className="flex gap-4 mt-8 mb-12">
            <button
              onClick={handleSaveShortcuts}
              className={`
                px-6 py-2 rounded-lg font-medium flex items-center gap-2
                ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}
                text-white transition-all duration-300 ease-in-out
                transform hover:scale-105
              `}
            >
              <Save size={18} className="transform group-hover:rotate-12 transition-transform duration-300" />
              Save Changes
            </button>
            
            <button
              onClick={handleResetShortcuts}
              className={`
                px-6 py-2 rounded-lg font-medium flex items-center gap-2
                ${isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                  : 'bg-white hover:bg-gray-50 text-gray-700'}
                transition-all duration-300 ease-in-out
                transform hover:scale-105
                border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}
              `}
            >
              <RefreshCw size={18} className="transform hover:rotate-180 transition-transform duration-500" />
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default KeyboardShortcuts 