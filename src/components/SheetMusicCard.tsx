import React, { useState, useEffect } from 'react'
import { Heart, Edit2, Check, X, FileText, Trash2 } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { SheetMusicItem } from '../types/index'
import { pdfjs } from 'react-pdf'
import PDFViewer from './PDFViewer'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

// Types
interface SheetMusicCardProps {
  item: SheetMusicItem;
  onUpdate: (id: string, updates: Partial<SheetMusicItem>) => void;
  onDelete: (id: string) => void;
  isNew?: boolean;
}

/**
 * Component for animating heart particles when favoriting/unfavoriting
 */
const HeartParticle: React.FC<{ 
  x: number; 
  y: number; 
  isFavoriting: boolean 
}> = ({ x, y, isFavoriting }) => {
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

/**
 * Hook for generating PDF thumbnails
 */
const usePdfThumbnail = (pdfPath: string | File) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const generateThumbnail = async () => {
      if (!pdfPath) return;
      
      setIsLoading(true);
      try {
        // Get the source URL (either from file or string)
        const pdfSource = pdfPath instanceof File
          ? URL.createObjectURL(pdfPath)
          : pdfPath;

        // Load the PDF document
        const loadingTask = pdfjs.getDocument(pdfSource);
        const pdf = await loadingTask.promise;
        
        // Get the first page
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });
        
        // Create a canvas to render the page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) throw new Error('Could not get canvas context');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render the page to the canvas
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        // Convert the canvas to a data URL
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.95);
        setThumbnail(thumbnailUrl);

        // Clean up
        canvas.remove();
        if (pdfPath instanceof File) {
          URL.revokeObjectURL(pdfSource);
        }
      } catch (error) {
        console.error('Error generating thumbnail:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateThumbnail();

    return () => {
      if (thumbnail) setThumbnail(null);
    };
  }, [pdfPath]);

  return { thumbnail, isLoading };
};

/**
 * Component for rendering the preview content (loading state, thumbnail, or placeholder)
 */
const PreviewContent: React.FC<{
  isLoading: boolean;
  thumbnail: string | null;
  title: string;
  isDarkMode: boolean;
}> = ({ isLoading, thumbnail, title, isDarkMode }) => {
  if (isLoading) {
    return (
      <div className={`absolute inset-0 flex flex-col items-center justify-center p-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mb-2" />
        <span className="text-sm">Loading preview...</span>
      </div>
    );
  }

  if (thumbnail) {
    return (
      <img
        src={thumbnail}
        alt={`Preview of ${title}`}
        className="absolute inset-0 w-full h-full object-contain bg-white"
      />
    );
  }

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center p-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
      <FileText size={32} className="mb-2" />
      <span className="text-sm">No preview available</span>
    </div>
  );
};

/**
 * Component for editable text fields (title and composer)
 */
const EditableText: React.FC<{
  value: string;
  onChange: (value: string) => void;
  isTitle?: boolean;
  isDarkMode: boolean;
  isEditing: boolean;
  onFinishEditing: () => void;
}> = ({ value, onChange, isTitle, isDarkMode, isEditing, onFinishEditing }) => {
  const [tempValue, setTempValue] = useState(value);
  const textRef = React.useRef<HTMLDivElement>(null);

  // Focus and select text when entering edit mode
  useEffect(() => {
    if (isEditing && isTitle && textRef.current) {
      textRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(textRef.current);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, [isEditing, isTitle]);

  // Update temp value when value changes
  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleBlur = () => {
    if (textRef.current) {
      onChange(textRef.current.textContent || value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (textRef.current) {
        onChange(textRef.current.textContent || value);
      }
      onFinishEditing();
    }
    if (e.key === 'Escape') {
      if (textRef.current) {
        textRef.current.textContent = value;
      }
      onFinishEditing();
    }
  };

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
  );
};

/**
 * Component for creating delete animation pieces
 */
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

/**
 * Main SheetMusicCard component
 * Displays a card with sheet music thumbnail, title, composer, and actions
 */
const SheetMusicCard: React.FC<SheetMusicCardProps> = ({ 
  item, 
  onUpdate, 
  onDelete, 
  isNew = false 
}) => {
  const { isDarkMode } = useTheme();
  
  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editComposer, setEditComposer] = useState(item.composer);
  
  // State for animations
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [deletePieces, setDeletePieces] = useState<number[]>([]);
  
  // PDF states
  const { thumbnail, isLoading } = usePdfThumbnail(item.pdfPath);
  const [isPDFOpen, setIsPDFOpen] = useState(false);

  // Add entrance animation
  useEffect(() => {
    setTimeout(() => setIsEntering(false), 50);
  }, []);

  /**
   * Update title and composer when saving edit mode
   */
  const handleSave = () => {
    onUpdate(item.id, { title: editTitle, composer: editComposer });
    setIsEditing(false);
  };

  /**
   * Reset edits when canceling edit mode
   */
  const handleCancel = () => {
    setEditTitle(item.title);
    setEditComposer(item.composer);
    setIsEditing(false);
  };

  /**
   * Handle deleting the sheet music with animation
   */
  const handleDelete = () => {
    setIsDeleting(true);
    setDeletePieces(Array.from({ length: 6 }, (_, i) => i));
    setTimeout(() => onDelete(item.id), 500);
  };

  /**
   * Create heart particles for favorite animation
   */
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

  /**
   * Toggle favorite status with animation
   */
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
          transition-all duration-500
          hover:shadow-xl
          group
          ${isDeleting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
          ${isEntering ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
          ${isNew ? 'ring-2 ring-blue-500 animate-pulse-twice' : ''}
          flex flex-col
          w-full
          ${isEditing ? 'editing-active' : ''}
          relative
        `}
      >
        {/* "New" indicator badge */}
        {isNew && (
          <div className="absolute top-3 left-3 z-50 bg-blue-500 text-white text-xs py-1 px-2 rounded-full animate-bounce">
            New
          </div>
        )}
        
        {/* Delete animation pieces */}
        {isDeleting && deletePieces.map((_, i) => (
          <DeletePiece key={i} />
        ))}
        
        {/* Thumbnail preview section */}
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

          {/* Favorite button */}
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

        {/* Details and actions section */}
        <div className={`
          p-4 
          ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
          rounded-b-xl
        `}>
          <div className="flex justify-between items-start gap-4">
            {/* Title and composer */}
            <div className="min-w-0 flex-1">
              <EditableText
                value={editTitle}
                onChange={(value) => {
                  setEditTitle(value);
                  onUpdate(item.id, { title: value });
                }}
                isTitle
                isDarkMode={isDarkMode}
                isEditing={isEditing}
                onFinishEditing={() => setIsEditing(false)}
              />
              <EditableText
                value={editComposer}
                onChange={(value) => {
                  setEditComposer(value);
                  onUpdate(item.id, { composer: value });
                }}
                isDarkMode={isDarkMode}
                isEditing={isEditing}
                onFinishEditing={() => setIsEditing(false)}
              />
            </div>

            {/* Action buttons */}
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
                title={isEditing ? "Save changes" : "Edit"}
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
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer modal */}
      <PDFViewer
        pdfPath={item.pdfPath}
        isOpen={isPDFOpen}
        onClose={() => setIsPDFOpen(false)}
        title={item.title}
        isDarkMode={isDarkMode}
      />
    </>
  );
};

export default SheetMusicCard; 