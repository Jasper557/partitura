import React, { useState, useEffect } from 'react'
import { Heart, Edit2, Check, X, FileText, Trash2 } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { SheetMusicItem } from '../types/index'
import { pdfjs } from 'react-pdf'
import PDFViewer from './PDFViewer'

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString()

// Particle component for heart animation
const HeartParticle: React.FC<{ x: number; y: number; isFavoriting: boolean }> = ({ x, y, isFavoriting }) => {
  const randomTranslate = () => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 20 + Math.random() * 30;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance
    };
  };

  const translate = randomTranslate();
  const style = {
    '--tx': `${translate.x}px`,
    '--ty': `${translate.y}px`,
    left: x + 'px',
    top: y + 'px',
    fontSize: '14px'
  } as React.CSSProperties;

  return (
    <div className="particle" style={style}>
      {isFavoriting ? '❤️' : '💔'}
    </div>
  );
};

// Types
interface SheetMusicCardProps {
  item: SheetMusicItem
  onUpdate: (id: string, updates: Partial<SheetMusicItem>) => void
  onDelete: (id: string) => void
}

// Custom Hook for PDF thumbnail
const usePdfThumbnail = (pdfPath: string | File) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const generateThumbnail = async () => {
      setIsLoading(true)
      try {
        const pdfSource = pdfPath instanceof File
          ? URL.createObjectURL(pdfPath)
          : pdfPath

        const loadingTask = pdfjs.getDocument(pdfSource)
        const pdf = await loadingTask.promise
        const page = await pdf.getPage(1)
        const viewport = page.getViewport({ scale: 2.0 })
        
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        
        if (!context) throw new Error('Could not get canvas context')

        canvas.width = viewport.width
        canvas.height = viewport.height

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise

        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.95)
        setThumbnail(thumbnailUrl)

        canvas.remove()
        if (pdfPath instanceof File) {
          URL.revokeObjectURL(pdfSource)
        }
      } catch (error) {
        console.error('Error generating thumbnail:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (pdfPath) {
      generateThumbnail()
    }

    return () => {
      if (thumbnail) setThumbnail(null)
    }
  }, [pdfPath])

  return { thumbnail, isLoading }
}

const PreviewContent: React.FC<{
  isLoading: boolean
  thumbnail: string | null
  title: string
  isDarkMode: boolean
}> = ({ isLoading, thumbnail, title, isDarkMode }) => {
  if (isLoading) {
    return (
      <div className={`absolute inset-0 flex flex-col items-center justify-center p-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mb-2" />
        <span className="text-sm">Loading preview...</span>
      </div>
    )
  }

  if (thumbnail) {
    return (
      <img
        src={thumbnail}
        alt={`Preview of ${title}`}
        className="absolute inset-0 w-full h-full object-contain bg-white"
      />
    )
  }

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center p-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
      <FileText size={32} className="mb-2" />
      <span className="text-sm">No preview available</span>
    </div>
  )
}

const EditableText: React.FC<{
  value: string
  onChange: (value: string) => void
  isTitle?: boolean
  isDarkMode: boolean
  isEditing: boolean
  onFinishEditing: () => void
}> = ({ value, onChange, isTitle, isDarkMode, isEditing, onFinishEditing }) => {
  const [tempValue, setTempValue] = useState(value)
  const textRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isEditing && isTitle && textRef.current) {
      textRef.current.focus()
      const range = document.createRange()
      range.selectNodeContents(textRef.current)
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  }, [isEditing, isTitle])

  useEffect(() => {
    setTempValue(value)
  }, [value])

  const handleBlur = () => {
    if (textRef.current) {
      onChange(textRef.current.textContent || value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (textRef.current) {
        onChange(textRef.current.textContent || value)
      }
      onFinishEditing()
    }
    if (e.key === 'Escape') {
      if (textRef.current) {
        textRef.current.textContent = value
      }
      onFinishEditing()
    }
  }

  return (
    <div
      ref={textRef}
      contentEditable={isEditing}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      suppressContentEditableWarning
      className={`
        truncate outline-none
        ${isEditing ? 'border-b ' + (isDarkMode ? 'border-gray-600' : 'border-gray-300') : ''}
        ${isTitle 
          ? `font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`
          : `text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`
        }
        ${!isEditing ? 'select-none' : ''}
      `}
    >
      {value}
    </div>
  )
}

// Add this new component for delete animation pieces
const DeletePiece: React.FC = () => {
  const randomTransform = () => {
    const tx = (Math.random() - 0.5) * 100;
    const ty = (Math.random() - 0.5) * 100;
    const rotate = (Math.random() - 0.5) * 90;
    const clip1 = Math.random() * 50;
    const clip2 = 50 + Math.random() * 50;
    const clip3 = Math.random() * 50;
    const clip4 = 50 + Math.random() * 50;

    return {
      '--tx': `${tx}px`,
      '--ty': `${ty}px`,
      '--rotate': `${rotate}deg`,
      '--clip-1': `${clip1}%`,
      '--clip-2': `${clip2}%`,
      '--clip-3': `${clip3}%`,
      '--clip-4': `${clip4}%`,
    } as React.CSSProperties;
  };

  return <div className="delete-piece" style={randomTransform()} />;
};

// Main Component
const SheetMusicCard: React.FC<SheetMusicCardProps> = ({ item, onUpdate, onDelete }) => {
  const { isDarkMode } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(item.title)
  const [editComposer, setEditComposer] = useState(item.composer)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEntering, setIsEntering] = useState(true)
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([])
  const [isFavoriting, setIsFavoriting] = useState(false)
  const [deletePieces, setDeletePieces] = useState<number[]>([])
  const { thumbnail, isLoading } = usePdfThumbnail(item.pdfPath)
  const [isPDFOpen, setIsPDFOpen] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsEntering(false), 50)
  }, [])

  const handleSave = () => {
    onUpdate(item.id, { title: editTitle, composer: editComposer })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditTitle(item.title)
    setEditComposer(item.composer)
    setIsEditing(false)
  }

  const handleDelete = () => {
    setIsDeleting(true)
    setDeletePieces(Array.from({ length: 6 }, (_, i) => i))
    setTimeout(() => onDelete(item.id), 500)
  }

  const createParticles = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newParticles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y
    }));
    
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 600);
  };

  const toggleFavorite = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsFavoriting(!item.isFavorite);
    createParticles(e);
    onUpdate(item.id, { isFavorite: !item.isFavorite });
  };

  return (
    <>
      <div 
        className={`
          rounded-xl shadow-lg overflow-hidden
          ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
          transition-all duration-300
          hover:shadow-xl
          group
          ${isDeleting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
          ${isEntering ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
          flex flex-col
          w-full
          ${isEditing ? 'editing-active' : ''}
          relative
        `}
      >
        {isDeleting && deletePieces.map((_, i) => (
          <DeletePiece key={i} />
        ))}
        
        <div className="relative aspect-[3/4] rounded-t-xl overflow-hidden">
          <div 
            onClick={() => setIsPDFOpen(true)}
            className={`
              absolute inset-0
              cursor-pointer
              transition-transform duration-200
              hover:scale-[1.02]
              ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}
            `}
          >
            <PreviewContent
              isLoading={isLoading}
              thumbnail={thumbnail}
              title={item.title}
              isDarkMode={isDarkMode}
            />
          </div>

          <div className="absolute top-2 right-2 z-50">
            <button
              onClick={toggleFavorite}
              className={`
                heart-button
                p-2 rounded-full
                ${isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'}
                shadow-md backdrop-blur-sm
                transition-colors duration-200
                ${item.isFavorite ? 'text-red-500 active' : 'text-gray-400 hover:text-red-500'}
              `}
            >
              <Heart 
                fill={item.isFavorite ? "currentColor" : "none"} 
                size={20}
              />
              {particles.map(particle => (
                <HeartParticle 
                  key={particle.id} 
                  x={particle.x} 
                  y={particle.y} 
                  isFavoriting={isFavoriting}
                />
              ))}
            </button>
          </div>
        </div>

        <div className={`
          p-4 
          ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
          rounded-b-xl
        `}>
          <div className="flex justify-between items-start gap-4">
            <div className="min-w-0 flex-1">
              <EditableText
                value={editTitle}
                onChange={(value) => {
                  setEditTitle(value)
                  onUpdate(item.id, { title: value })
                }}
                isTitle
                isDarkMode={isDarkMode}
                isEditing={isEditing}
                onFinishEditing={() => setIsEditing(false)}
              />
              <EditableText
                value={editComposer}
                onChange={(value) => {
                  setEditComposer(value)
                  onUpdate(item.id, { composer: value })
                }}
                isDarkMode={isDarkMode}
                isEditing={isEditing}
                onFinishEditing={() => setIsEditing(false)}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`
                  p-2 rounded-full
                  ${isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-400' 
                    : 'hover:bg-gray-100 text-gray-500'
                  }
                  ${isEditing ? 'bg-blue-500/10 text-blue-500' : ''}
                  transition-colors duration-200
                `}
              >
                {isEditing ? <Check size={16} /> : <Edit2 size={16} />}
              </button>
              <button
                onClick={handleDelete}
                className={`
                  p-2 rounded-full
                  ${isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-red-500'
                  }
                  transition-colors duration-200
                `}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <PDFViewer
        pdfPath={item.pdfPath}
        isOpen={isPDFOpen}
        onClose={() => setIsPDFOpen(false)}
        title={item.title}
        isDarkMode={isDarkMode}
      />
    </>
  )
}

export default SheetMusicCard 