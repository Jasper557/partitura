import React, { useState, useEffect, useRef } from 'react'
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Maximize2, Minimize2, Download } from 'lucide-react'
import { Document, Page } from 'react-pdf'
import { useShortcuts, ShortcutConfig } from '../context/ShortcutContext'

// Check if running in Electron
const isElectron = !!window.electron?.isElectron

interface PDFViewerProps {
  pdfPath: string | File
  isOpen: boolean
  onClose: () => void
  title: string
  isDarkMode: boolean
}

// Define the type for PDF viewer shortcut actions
type PDFViewerShortcutAction = 'previousPage' | 'nextPage' | 'zoomIn' | 'zoomOut' | 'toggleFullscreen'

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfPath, isOpen, onClose, title, isDarkMode }) => {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isPdfFullscreen, setIsPdfFullscreen] = useState(false)
  const viewerRef = useRef<HTMLDivElement>(null)
  const { isShortcutTriggered } = useShortcuts()

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const handleFullscreenChange = (fullscreen: boolean) => {
      setIsPdfFullscreen(fullscreen)
    }

    if (isElectron && window.electron) {
      const cleanup = window.electron.onFullscreenChange(handleFullscreenChange)
      unsubscribe = typeof cleanup === 'function' ? cleanup : undefined
    } else {
      const handleBrowserFullscreenChange = () => {
        setIsPdfFullscreen(document.fullscreenElement === viewerRef.current)
      }
      document.addEventListener('fullscreenchange', handleBrowserFullscreenChange)
      unsubscribe = () => {
        document.removeEventListener('fullscreenchange', handleBrowserFullscreenChange)
      }
    }

    return () => {
      if (unsubscribe) unsubscribe()
      if (isPdfFullscreen) {
        if (isElectron && window.electron) {
          window.electron.syncPdfFullscreen(false)
        } else if (document.fullscreenElement) {
          document.exitFullscreen()
        }
        setIsPdfFullscreen(false)
      }
    }
  }, [isOpen, isElectron, isPdfFullscreen])

  const togglePdfFullscreen = async () => {
    try {
      if (isElectron && window.electron) {
        const newState = !isPdfFullscreen
        setIsPdfFullscreen(newState)
        await window.electron.syncPdfFullscreen(newState)
      } else {
        if (!isPdfFullscreen && viewerRef.current) {
          await viewerRef.current.requestFullscreen()
        } else if (document.fullscreenElement) {
          await document.exitFullscreen()
        }
      }
    } catch (err) {
      console.error('Error toggling PDF fullscreen:', err)
    }
  }

  useEffect(() => {
    if (isOpen && pdfPath) {
      setIsLoading(true)
      setError(null)
      setPageNumber(1)

      try {
        if (pdfPath instanceof File) {
          const url = URL.createObjectURL(pdfPath)
          setPdfUrl(url)
          return () => {
            URL.revokeObjectURL(url)
            setPdfUrl(null)
          }
        } else {
          setPdfUrl(pdfPath)
          return () => setPdfUrl(null)
        }
      } catch (err) {
        setError('Failed to load PDF file')
        setIsLoading(false)
      }
    }
  }, [isOpen, pdfPath])

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setIsLoading(false)
    setError(null)
  }

  const handleError = () => {
    setError('Failed to load PDF file')
    setIsLoading(false)
  }

  const nextPage = () => {
    if (numPages && pageNumber < numPages) {
      setPageNumber(pageNumber + 1)
    }
  }

  const prevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1)
    }
  }

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.0))
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5))

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser's default zoom behavior when using our shortcuts
      if (e.ctrlKey && (e.key === '+' || e.key === '-')) {
        e.preventDefault()
      }

      // Check for our custom shortcuts
      if (isShortcutTriggered(e, 'pdfViewer', 'previousPage')) {
        e.preventDefault()
        prevPage()
      } else if (isShortcutTriggered(e, 'pdfViewer', 'nextPage')) {
        e.preventDefault()
        nextPage()
      } else if (isShortcutTriggered(e, 'pdfViewer', 'zoomIn')) {
        e.preventDefault()
        zoomIn()
      } else if (isShortcutTriggered(e, 'pdfViewer', 'zoomOut')) {
        e.preventDefault()
        zoomOut()
      } else if (isShortcutTriggered(e, 'pdfViewer', 'toggleFullscreen')) {
        e.preventDefault()
        togglePdfFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isShortcutTriggered, prevPage, nextPage, zoomIn, zoomOut, togglePdfFullscreen])

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isPdfFullscreen) {
      if (isElectron && window.electron) {
        window.electron.syncPdfFullscreen(false)
      } else if (document.fullscreenElement) {
        document.exitFullscreen()
      }
      setIsPdfFullscreen(false)
    }
    onClose()
  }

  const handleDownload = async () => {
    try {
      if (pdfPath instanceof File) {
        // Create a temporary link element
        const link = document.createElement('a')
        link.href = URL.createObjectURL(pdfPath)
        link.download = pdfPath.name || 'document.pdf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // For URL paths
        const response = await fetch(pdfPath)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = title || 'document.pdf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Error downloading PDF:', err)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 animate-fadeIn"
      onClick={handleClose}
    >
      <div 
        ref={viewerRef}
        className={`
          relative w-full max-w-4xl h-[90vh] 
          ${isDarkMode ? 'bg-gray-800' : 'bg-white'} 
          rounded-lg shadow-xl overflow-hidden 
          ${isPdfFullscreen ? 'max-w-none m-0 rounded-none h-screen' : ''}
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
          <h3 className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={zoomOut}
              className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
            >
              <ZoomOut size={20} />
            </button>
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{Math.round(scale * 100)}%</span>
            <button
              onClick={zoomIn}
              className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={handleClose}
              className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div 
          className={`
            overflow-auto flex flex-col items-center p-4 
            ${isDarkMode ? 'bg-gray-800' : 'bg-white'} 
            pdf-viewer-content
            ${isPdfFullscreen 
              ? 'h-[calc(100vh-8.5rem)]'
              : 'h-[calc(90vh-8.5rem)]'
            }
          `}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-2" />
            </div>
          )}
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <span>{error}</span>
            </div>
          ) : (
            pdfUrl && (
              <Document
                file={pdfUrl}
                onLoadSuccess={handleDocumentLoadSuccess}
                onLoadError={handleError}
                loading={
                  <div className="flex items-center justify-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-2" />
                  </div>
                }
                error={
                  <div className="flex items-center justify-center text-white">
                    <span>Failed to load PDF file</span>
                  </div>
                }
                className="max-w-full"
              >
                {!isLoading && !error && (
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    className="shadow-lg transition-transform duration-200 bg-white rounded-lg"
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                  />
                )}
              </Document>
            )
          )}
        </div>

        {/* Footer */}
        {!error && !isLoading && numPages && (
          <div className={`absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-4">
              <button
                onClick={prevPage}
                disabled={pageNumber <= 1}
                className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'} disabled:opacity-50`}
              >
                <ChevronLeft size={20} />
              </button>
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Page {pageNumber} of {numPages}
              </span>
              <button
                onClick={nextPage}
                disabled={pageNumber >= numPages}
                className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'} disabled:opacity-50`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className={`
                  p-2 rounded-full 
                  ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}
                  transition-all duration-200 hover:scale-110
                `}
              >
                <Download size={20} />
              </button>
              <button
                onClick={togglePdfFullscreen}
                className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'} transition-transform hover:scale-110`} 
              >
                {isPdfFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PDFViewer 