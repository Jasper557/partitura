import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Download, 
  FileText, 
  AlertCircle, 
  MousePointer 
} from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'
import { useShortcuts } from '../context/ShortcutContext'
import { saveAs } from 'file-saver'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.js`

interface PDFViewerProps {
  pdfPath: string | File
  isOpen: boolean
  onClose: () => void
  title: string
  isDarkMode: boolean
}

/**
 * PDFViewer component for displaying and interacting with PDF documents.
 * Features include:
 * - Page navigation
 * - Zoom controls with mouse wheel support
 * - Fullscreen mode
 * - Visual feedback for zoom limits
 * - PDF download
 * - Keyboard shortcuts support
 */
const PDFViewer: React.FC<PDFViewerProps> = ({ pdfPath, isOpen, onClose, title, isDarkMode }) => {
  // Document state
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isPdfFullscreen, setIsPdfFullscreen] = useState(false)
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isPageChanging, setIsPageChanging] = useState(false)
  
  // Page transition states
  const [pageWidth, setPageWidth] = useState(0)
  const [pageHeight, setPageHeight] = useState(0)
  const [renderKey, setRenderKey] = useState(0)
  const [animateIn, setAnimateIn] = useState(false)
  
  // Zoom indicator states
  const [showWheelZoomIndicator, setShowWheelZoomIndicator] = useState(false)
  const [zoomIndicatorOpacity, setZoomIndicatorOpacity] = useState(0)
  const [zoomIndicatorScale, setZoomIndicatorScale] = useState(0.95)
  const [reachedZoomLimit, setReachedZoomLimit] = useState<'min' | 'max' | null>(null)
  const [isActivelyZooming, setIsActivelyZooming] = useState(false)
  
  // Refs
  const viewerRef = useRef<HTMLDivElement>(null)
  const pdfContentRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  
  // Timers
  const wheelZoomIndicatorTimer = useRef<NodeJS.Timeout | null>(null)
  const zoomLimitTimer = useRef<NodeJS.Timeout | null>(null)
  const zoomActivityTimer = useRef<NodeJS.Timeout | null>(null)
  
  // Hooks
  const { isShortcutTriggered, useMouseWheelZoom } = useShortcuts()

  // Utility functions

  /**
   * Clear all active timers
   */
  const clearAllTimers = useCallback(() => {
    if (wheelZoomIndicatorTimer.current) clearTimeout(wheelZoomIndicatorTimer.current);
    if (zoomLimitTimer.current) clearTimeout(zoomLimitTimer.current);
    if (zoomActivityTimer.current) clearTimeout(zoomActivityTimer.current);
  }, []);
  
  /**
   * Reset zoom indicator state
   */
  const resetZoomIndicator = useCallback(() => {
    setShowWheelZoomIndicator(false);
    setZoomIndicatorOpacity(0);
    setZoomIndicatorScale(0.95);
    setReachedZoomLimit(null);
    setIsActivelyZooming(false);
  }, []);

  /**
   * Show zoom indicator with animation
   */
  const showZoomIndicator = useCallback(() => {
    setShowWheelZoomIndicator(true);
    requestAnimationFrame(() => {
      setZoomIndicatorOpacity(1);
      setZoomIndicatorScale(1);
    });
  }, []);
  
  /**
   * Hide zoom indicator with animation
   */
  const hideZoomIndicator = useCallback(() => {
    setZoomIndicatorOpacity(0);
    setZoomIndicatorScale(0.9);
    setTimeout(() => {
      setShowWheelZoomIndicator(false);
    }, 150);
  }, []);
  
  /**
   * Show zoom limit feedback
   */
  const showZoomLimitFeedback = useCallback((limit: 'min' | 'max') => {
    setReachedZoomLimit(limit);
    showZoomIndicator();
    
    if (zoomLimitTimer.current) {
      clearTimeout(zoomLimitTimer.current);
    }
    
    zoomLimitTimer.current = setTimeout(() => {
      setReachedZoomLimit(null);
      hideZoomIndicator();
    }, 600);
  }, [showZoomIndicator, hideZoomIndicator]);

  /**
   * Show temporary zoom activity indicator (for mouse wheel only)
   */
  const showZoomActivity = useCallback(() => {
    setIsActivelyZooming(true);
    showZoomIndicator();
    
    if (zoomActivityTimer.current) {
      clearTimeout(zoomActivityTimer.current);
    }
    
    zoomActivityTimer.current = setTimeout(() => {
      setIsActivelyZooming(false);
      hideZoomIndicator();
    }, 300);
  }, [showZoomIndicator, hideZoomIndicator]);

  // ======= LIFECYCLE & EFFECTS =======

  // Animation effect for opening/closing modal
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setAnimateIn(true), 50);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
    }
  }, [isOpen]);

  // Reset indicator when component visibility changes
  useEffect(() => {
    if (!isOpen) {
      resetZoomIndicator();
    }
  }, [isOpen, resetZoomIndicator]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // ======= PDF DOCUMENT HANDLING =======
  
  // Load PDF when component opens
  useEffect(() => {
    if (isOpen && pdfPath) {
      // Reset state
      resetZoomIndicator();
      clearAllTimers();
      setScale(1.0);
      
      // Setup loading state
      setIsLoading(true);
      setLoadingProgress(0);
      setError(null);
      setPageNumber(1);

      // Simulate loading progress for better UX
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          const newProgress = prev + (Math.random() * 15);
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);

      // Set up PDF URL and cleanup function
      try {
        if (pdfPath instanceof File) {
          const url = URL.createObjectURL(pdfPath);
          setPdfUrl(url);
          return () => {
            clearInterval(progressInterval);
            URL.revokeObjectURL(url);
            setPdfUrl(null);
          };
        } else {
          setPdfUrl(pdfPath);
          return () => {
            clearInterval(progressInterval);
            setPdfUrl(null);
          };
        }
      } catch (err) {
        clearInterval(progressInterval);
        setError('Failed to load PDF file');
        setIsLoading(false);
      }
    }
  }, [isOpen, pdfPath, clearAllTimers, resetZoomIndicator]);

  const handleDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoadingProgress(100);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    setError(null);
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error('PDF loading error:', error);
    setError('Failed to load PDF file');
    setIsLoading(false);
  }, []);

  // Capture page dimensions for transitions
  const handlePageRenderSuccess = useCallback((page: any) => {
    if (pageRef.current) {
      const { width, height } = pageRef.current.getBoundingClientRect();
      setPageWidth(width);
      setPageHeight(height);
    }
    
    if (isPageChanging) {
      setTimeout(() => {
        setIsPageChanging(false);
      }, 100);
    }
  }, [isPageChanging]);

  // ======= PAGE NAVIGATION =======

  const nextPage = useCallback(() => {
    if (numPages && pageNumber < numPages && !isPageChanging) {
      setIsPageChanging(true);
      setRenderKey(prev => prev + 1);
      setPageNumber(pageNumber + 1);
    }
  }, [numPages, pageNumber, isPageChanging]);

  const prevPage = useCallback(() => {
    if (pageNumber > 1 && !isPageChanging) {
      setIsPageChanging(true);
      setRenderKey(prev => prev + 1);
      setPageNumber(pageNumber - 1);
    }
  }, [pageNumber, isPageChanging]);

  // ======= FULLSCREEN HANDLING =======

  const handleFullscreenChange = useCallback((fullscreen: boolean) => {
    setIsPdfFullscreen(fullscreen);
    document.body.style.overflow = fullscreen ? 'hidden' : '';
    
    const handleBrowserFullscreenChange = () => {
      if (!document.fullscreenElement && isPdfFullscreen) {
        setIsPdfFullscreen(false);
        document.body.style.overflow = '';
      }
    };
    
    document.addEventListener('fullscreenchange', handleBrowserFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleBrowserFullscreenChange);
    };
  }, [isPdfFullscreen]);
  
  const togglePdfFullscreen = useCallback(async () => {
    if (!isPdfFullscreen) {
      try {
        if (viewerRef.current?.requestFullscreen) {
          await viewerRef.current.requestFullscreen();
        }
        handleFullscreenChange(true);
      } catch (error) {
        console.error('Error enabling fullscreen:', error);
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        handleFullscreenChange(false);
      } catch (error) {
        console.error('Error exiting fullscreen:', error);
      }
    }
  }, [isPdfFullscreen, handleFullscreenChange]);

  // ======= ZOOM CONTROLS =======
  
  const zoomIn = useCallback(() => {
    // Clear any opposite zoom limit warning
    if (reachedZoomLimit === 'min') {
      setReachedZoomLimit(null);
    }
    
    // Check if we've reached the maximum zoom
    if (scale >= 3.0) {
      showZoomLimitFeedback('max');
      return;
    }
    
    // Just change scale without showing floating indicator for button clicks
    setScale(prev => Math.min(prev + 0.2, 3.0));
  }, [reachedZoomLimit, scale, showZoomLimitFeedback]);
  
  const zoomOut = useCallback(() => {
    // Clear any opposite zoom limit warning
    if (reachedZoomLimit === 'max') {
      setReachedZoomLimit(null);
    }
    
    // Check if we've reached the minimum zoom
    if (scale <= 0.5) {
      showZoomLimitFeedback('min');
      return;
    }
    
    // Just change scale without showing floating indicator for button clicks
    setScale(prev => Math.max(prev - 0.2, 0.5));
  }, [reachedZoomLimit, scale, showZoomLimitFeedback]);
  
  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!useMouseWheelZoom) return;
    
    const isCtrlPressed = e.ctrlKey || e.metaKey;
    
    if (isCtrlPressed) {
      e.preventDefault();
      e.stopPropagation();
      
      // Show we're actively zooming with the wheel
      setIsActivelyZooming(true);
      showZoomIndicator();
      
      if (zoomActivityTimer.current) {
        clearTimeout(zoomActivityTimer.current);
      }
      
      // Handle zoom direction
      if (e.deltaY < 0) {
        // Zooming in
        if (reachedZoomLimit === 'min') {
          setReachedZoomLimit(null);
        }
        
        if (scale >= 3.0) {
          showZoomLimitFeedback('max');
          return;
        }
        
        // Smoother increment for wheel
        setScale(prev => {
          const newScale = prev + 0.1;
          return newScale > 3.0 ? 3.0 : newScale;
        });
      } else {
        // Zooming out
        if (reachedZoomLimit === 'max') {
          setReachedZoomLimit(null);
        }
        
        if (scale <= 0.5) {
          showZoomLimitFeedback('min');
          return;
        }
        
        // Smoother decrement for wheel
        setScale(prev => {
          const newScale = prev - 0.1;
          return newScale < 0.5 ? 0.5 : newScale;
        });
      }
      
      // Hide indicator quickly after mouse wheel stops
      zoomActivityTimer.current = setTimeout(() => {
        setIsActivelyZooming(false);
        hideZoomIndicator();
      }, 100);
    }
  }, [
    useMouseWheelZoom, 
    scale, 
    reachedZoomLimit, 
    showZoomIndicator, 
    showZoomLimitFeedback, 
    hideZoomIndicator
  ]);

  // ======= EVENT LISTENERS =======
  
  // Handle Ctrl key release
  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if ((e.key === 'Control' || e.key === 'Meta') && isActivelyZooming) {
        setIsActivelyZooming(false);
        hideZoomIndicator();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keyup', handleKeyUp);
    }
    
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, [isOpen, isActivelyZooming, hideZoomIndicator]);
  
  // Mouse wheel event listener
  useEffect(() => {
    if (!isOpen) return;
    
    let wheelStopTimer: NodeJS.Timeout | null = null;
    
    const captureWheel = (e: WheelEvent) => {
      if (useMouseWheelZoom && (e.ctrlKey || e.metaKey)) {
        handleWheel(e);
        
        if (wheelStopTimer) {
          clearTimeout(wheelStopTimer);
        }
        
        wheelStopTimer = setTimeout(() => {
          if (isActivelyZooming) {
            setIsActivelyZooming(false);
            hideZoomIndicator();
          }
        }, 100);
      }
    };
    
    window.addEventListener('wheel', captureWheel, { passive: false, capture: true });
    
    return () => {
      window.removeEventListener('wheel', captureWheel, { capture: true });
      if (wheelStopTimer) clearTimeout(wheelStopTimer);
      clearAllTimers();
    };
  }, [
    isOpen, 
    handleWheel, 
    useMouseWheelZoom, 
    isActivelyZooming, 
    hideZoomIndicator, 
    clearAllTimers
  ]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser's default zoom behavior
      if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=' || e.code === 'Equal' || e.code === 'Minus')) {
        e.preventDefault();
      }

      // Handle custom shortcuts
      if (isShortcutTriggered(e, 'pdfViewer', 'previousPage')) {
        e.preventDefault();
        prevPage();
      } else if (isShortcutTriggered(e, 'pdfViewer', 'nextPage')) {
        e.preventDefault();
        nextPage();
      } else if (isShortcutTriggered(e, 'pdfViewer', 'zoomIn')) {
        e.preventDefault();
        zoomIn();
      } else if (isShortcutTriggered(e, 'pdfViewer', 'zoomOut')) {
        e.preventDefault();
        zoomOut();
      } else if (isShortcutTriggered(e, 'pdfViewer', 'toggleFullscreen')) {
        e.preventDefault();
        togglePdfFullscreen();
      }
      
      // Direct keyboard handling for standard zoom shortcuts
      if (e.ctrlKey) {
        if (e.key === '+' || e.key === '=' || e.code === 'Equal') {
          e.preventDefault();
          zoomIn();
        } else if (e.key === '-' || e.code === 'Minus') {
          e.preventDefault();
          zoomOut();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isShortcutTriggered, prevPage, nextPage, zoomIn, zoomOut, togglePdfFullscreen]);

  // ======= UI INTERACTION HANDLERS =======

  const handleClose = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimateIn(false);
    
    setTimeout(() => {
      onClose();
      
      if (isPdfFullscreen) {
        try {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
          handleFullscreenChange(false);
        } catch (error) {
          console.error('Error exiting fullscreen:', error);
        }
      }
    }, 300);
  }, [onClose, isPdfFullscreen, handleFullscreenChange]);

  const handleDownload = useCallback(async () => {
    try {
      if (typeof pdfPath === 'string') {
        const response = await fetch(pdfPath);
        const blob = await response.blob();
        saveAs(blob, `${title || 'document'}.pdf`);
      } else if (pdfPath instanceof File) {
        saveAs(pdfPath, pdfPath.name);
      }
    } catch (err) {
      console.error('Error downloading PDF:', err);
    }
  }, [pdfPath, title]);

  // Early return if not open
  if (!isOpen) return null;

  // ======= THEME-BASED STYLES =======

  // Theme-based color classes
  const textClass = isDarkMode ? 'text-gray-200' : 'text-gray-800';
  const bgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const borderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const headerBgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const loadingBgClass = isDarkMode ? 'bg-gray-700' : 'bg-gray-200';
  const loadingFillClass = isDarkMode ? 'bg-blue-500' : 'bg-blue-600';
  const errorBgClass = isDarkMode ? 'bg-red-900/20' : 'bg-red-50';
  const errorTextClass = isDarkMode ? 'text-red-300' : 'text-red-600';
  const skeletonBgClass = isDarkMode ? 'bg-gray-700' : 'bg-gray-300';

  // ======= COMPONENT DEFINITIONS =======

  /**
   * Mouse wheel zoom indicator component
   */
  const ZoomIndicator = () => {
    if (!showWheelZoomIndicator) return null;
    
    return (
      <div 
        className={`
          absolute top-4 left-1/2 z-50
          ${reachedZoomLimit ? 'bg-amber-500/90' : 'bg-blue-500/90'} 
          text-white px-4 py-2 rounded-full
          flex items-center gap-2 shadow-lg
          will-change-transform will-change-opacity
        `}
        style={{ 
          opacity: zoomIndicatorOpacity,
          transform: `translate(-50%, 0) scale(${zoomIndicatorScale})`,
          transition: 'opacity 150ms cubic-bezier(0.4, 0.0, 0.2, 1), transform 150ms cubic-bezier(0.18, 0.89, 0.32, 1.28)'
        }}
      >
        {reachedZoomLimit ? (
          <>
            <ZoomIn size={16} className={`${reachedZoomLimit === 'max' ? '' : 'hidden'} animate-pulse`} />
            <ZoomOut size={16} className={`${reachedZoomLimit === 'min' ? '' : 'hidden'} animate-pulse`} />
            <span className="font-medium text-sm">
              {reachedZoomLimit === 'max' ? 'Maximum zoom reached' : 'Minimum zoom reached'}
            </span>
          </>
        ) : (
          <>
            <MousePointer size={16} className="animate-pulse" />
            <span className="font-medium text-sm">Zoom: {Math.round(scale * 100)}%</span>
          </>
        )}
      </div>
    );
  };

  // ======= COMPONENT RENDER =======

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-black transition-opacity duration-300 ease-in-out
        ${animateIn ? 'bg-opacity-75' : 'bg-opacity-0'} 
      `}
      onClick={handleClose}
    >
      <div 
        ref={viewerRef}
        className={`
          relative w-full max-w-4xl h-[90vh] 
          ${bgClass} 
          rounded-lg shadow-xl overflow-hidden 
          ${isPdfFullscreen ? 'max-w-none m-0 rounded-none h-screen' : ''}
          transition-all duration-300 ease-out
          ${animateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${borderClass} ${headerBgClass}`}>
          <h3 className={`font-semibold truncate ${textClass}`}>{title}</h3>
          <div className="flex items-center gap-2">
            {useMouseWheelZoom && (
              <div className={`
                flex items-center gap-1 px-2 py-1 rounded-full text-xs
                ${isDarkMode ? 'bg-blue-600/20 text-blue-300' : 'bg-blue-100 text-blue-700'}
              `}>
                <MousePointer size={12} />
                <span>Ctrl+Wheel Zoom</span>
              </div>
            )}
            <button
              onClick={zoomOut}
              disabled={isLoading}
              className={`
                p-2 rounded-full transition-colors duration-200
                ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'} 
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              aria-label="Zoom out"
            >
              <ZoomOut size={20} />
            </button>
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{Math.round(scale * 100)}%</span>
            <button
              onClick={zoomIn}
              disabled={isLoading}
              className={`
                p-2 rounded-full transition-colors duration-200
                ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'} 
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              aria-label="Zoom in"
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

        {/* PDF Content Area */}
        <div 
          ref={pdfContentRef}
          className={`
            overflow-auto flex flex-col items-center p-4 
            ${bgClass} 
            pdf-viewer-content
            ${isPdfFullscreen 
              ? 'h-[calc(100vh-8.5rem)]'
              : 'h-[calc(90vh-8.5rem)]'
            }
            relative
          `}
        >
          {/* Mouse wheel zoom indicator */}
          <ZoomIndicator />
          
          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-20">
              <div className="w-full max-w-md flex flex-col items-center gap-4">
                <div className="flex items-center justify-center">
                  <FileText size={32} className={`${textClass} mb-2 opacity-90`} />
                </div>
                
                <div className="font-medium text-lg mb-2 text-center max-w-[80%]">
                  <span className={textClass}>Loading {title}</span>
                </div>
                
                {/* Progress bar */}
                <div className={`w-full h-2 rounded-full overflow-hidden ${loadingBgClass}`}>
                  <div 
                    className={`h-full ${loadingFillClass} transition-all duration-300 ease-out`}
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Preparing document...
                </div>
              </div>
            </div>
          )}
          
          {/* Error state */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              <div className={`p-6 rounded-lg ${errorBgClass} max-w-md shadow-lg`}>
                <div className="flex items-center gap-4 mb-4">
                  <AlertCircle size={24} className={errorTextClass} />
                  <span className={`font-medium ${errorTextClass}`}>Failed to load document</span>
                </div>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                  There was a problem loading this PDF. Please check if the file is valid or try again later.
                </p>
                <button
                  onClick={handleClose}
                  className={`mt-4 px-4 py-2 rounded-md ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} transition-colors`}
                >
                  Close
                </button>
              </div>
            </div>
          )}
          
          {/* Page skeleton for transitions */}
          {isPageChanging && !isLoading && pageWidth > 0 && (
            <div 
              className={`
                absolute z-10 rounded-lg shadow-lg ${skeletonBgClass}
                transition-opacity duration-200 opacity-80
              `}
              style={{
                width: `${pageWidth}px`,
                height: `${pageHeight}px`,
              }}
            />
          )}
          
          {/* Document display */}
          {pdfUrl && !error && (
            <Document
              file={pdfUrl}
              onLoadSuccess={handleDocumentLoadSuccess}
              onLoadError={handleError}
              loading={null}
              error={null}
              className="max-w-full relative z-10"
            >
              {(!isLoading || isPageChanging) && !error && (
                <div ref={pageRef} key={renderKey} className="relative">
                  <Page
                    key={`page_${pageNumber}`}
                    pageNumber={pageNumber}
                    scale={scale}
                    className={`
                      shadow-lg bg-white rounded-lg
                      transition-all duration-300
                      ${isPageChanging ? 'opacity-0' : 'opacity-100'}
                    `}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                    onRenderSuccess={handlePageRenderSuccess}
                  />
                </div>
              )}
            </Document>
          )}
          
          {/* Loading skeleton placeholder */}
          {isLoading && (
            <div className={`w-full max-w-[600px] aspect-[3/4] ${skeletonBgClass} rounded-lg opacity-30 absolute z-0`} />
          )}
        </div>

        {/* Footer */}
        {!error && numPages && (
          <div className={`absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 ${headerBgClass} border-t ${borderClass}`}>
            <div className="flex items-center gap-4">
              <button
                onClick={prevPage}
                disabled={pageNumber <= 1 || isLoading || isPageChanging}
                className={`
                  p-2 rounded-full 
                  ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'} 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-200
                `}
              >
                <ChevronLeft size={20} />
              </button>
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Page {pageNumber} of {numPages}
              </span>
              <button
                onClick={nextPage}
                disabled={pageNumber >= numPages || isLoading || isPageChanging}
                className={`
                  p-2 rounded-full 
                  ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'} 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-200
                `}
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={isLoading}
                className={`
                  p-2 rounded-full 
                  ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}
                  transition-colors duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <Download size={20} />
              </button>
              <button
                onClick={togglePdfFullscreen}
                disabled={isLoading}
                className={`
                  p-2 rounded-full 
                  ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'} 
                  transition-colors duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                `} 
              >
                {isPdfFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;