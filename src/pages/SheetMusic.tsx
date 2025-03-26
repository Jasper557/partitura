import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Plus, X, Music, Search } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { SheetMusicItem } from '../types/index'
import SheetMusicCard from '../components/SheetMusicCard'
import DropZone from '../components/DropZone'
import { 
  saveSheetMusic, 
  getUserSheetMusic, 
  updateSheetMusic, 
  deleteSheetMusic 
} from '../services/sheetMusicService'
import { useShortcuts } from '../context/ShortcutContext'
import useScrollReset from '../hooks/useScrollReset'
import PageTransition from '../components/PageTransition'

/**
 * Component for the "Add New" card that appears at the beginning of the sheet music grid
 */
const AddNewCard: React.FC<{ onClick: () => void; isDarkMode: boolean }> = ({ onClick, isDarkMode }) => (
  <div
    onClick={onClick}
    className={`
      rounded-xl shadow-lg overflow-hidden cursor-pointer
      transition-all duration-200
      hover:shadow-xl hover:scale-[1.02]
      ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}
      border-2 border-dashed
      ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
      group
      h-[420px]
    `}
  >
    <div className="h-full flex flex-col items-center justify-center p-4">
      <div className={`
        rounded-full p-4 mb-4
        ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'}
        group-hover:scale-110 transition-transform duration-200
      `}>
        <Plus size={32} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
      </div>
      <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Add New Sheet Music
      </p>
    </div>
  </div>
)

/**
 * Expandable search bar component for searching sheet music
 */
const SearchBar: React.FC<{
  onSearch: (query: string) => void;
  isDarkMode: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}> = ({ onSearch, isDarkMode, inputRef, isExpanded, setIsExpanded }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleExpand = () => {
    setIsExpanded(true);
    // Focus the input after a small delay to ensure the expansion animation has started
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        if (!searchQuery) {
          setIsExpanded(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchQuery, setIsExpanded]);

  return (
    <div className="relative flex items-center" ref={searchRef}>
      <div
        className={`
          flex items-center
          rounded-full
          ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
          shadow-md
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-64' : 'w-10'}
          h-10
        `}
      >
        <button
          onClick={handleExpand}
          className={`
            p-2 rounded-full
            ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}
            transition-colors duration-200
            flex-shrink-0
          `}
        >
          <Search size={20} />
        </button>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search music..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className={`
            bg-transparent
            border-none
            outline-none
            ${isDarkMode ? 'text-gray-100 placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}
            transition-all duration-300
            ${isExpanded ? 'w-full opacity-100 px-2' : 'w-0 opacity-0 px-0'}
          `}
        />
        {searchQuery && (
          <button
            onClick={() => handleSearch('')}
            className={`
              p-2
              ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}
              transition-colors duration-200
            `}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Modal component for adding new sheet music
 */
const AddNewModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  onAdd: (data: { title: string; composer: string; file?: File }) => void
  data: { title: string; composer: string; file?: File }
  onDataChange: (data: { title: string; composer: string; file?: File }) => void
  isDarkMode: boolean
  isLoading: boolean
}> = ({ isOpen, onClose, onAdd, data, onDataChange, isDarkMode, isLoading }) => {
  const { showToast } = useToast();
  const [animateIn, setAnimateIn] = useState(false);
  
  const handleClose = () => {
    if (isLoading) {
      showToast('Upload in progress. Please wait...', 'warning');
      return;
    }
    onClose();
  };
  
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setAnimateIn(true), 50);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Theme-based style classes
  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-white';
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const mutedTextClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const borderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBgClass = isDarkMode ? 'bg-gray-800' : 'bg-gray-50';

  const isFormComplete = data.title && data.composer && data.file;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${animateIn ? 'opacity-50' : 'opacity-0'}`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className={`
          ${bgClass} w-full max-w-lg rounded-xl overflow-hidden shadow-xl
          transition-all duration-500 ease-out
          ${animateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          z-10 relative
        `}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${mutedTextClass} hover:${textClass}`}
          disabled={isLoading}
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="p-6 pb-0">
          <h2 className={`text-xl font-medium ${textClass} flex items-center gap-2`}>
            <Music size={18} className="text-blue-500" />
            <span>New Sheet Music</span>
          </h2>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={data.title}
            onChange={e => onDataChange({ ...data, title: e.target.value })}
            disabled={isLoading}
            className={`
              w-full px-4 py-2 rounded-lg border ${borderClass}
              ${inputBgClass} ${textClass}
              focus:outline-none focus:ring-1 focus:ring-blue-500
              transition-all duration-200
              ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
            `}
          />
          
          <input
            type="text"
            placeholder="Composer"
            value={data.composer}
            onChange={e => onDataChange({ ...data, composer: e.target.value })}
            disabled={isLoading}
            className={`
              w-full px-4 py-2 rounded-lg border ${borderClass}
              ${inputBgClass} ${textClass}
              focus:outline-none focus:ring-1 focus:ring-blue-500
              transition-all duration-200
              ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
            `}
          />
          
          <div className="pt-2">
            <DropZone 
              onFileSelect={file => onDataChange({ ...data, file: file || undefined })}
              selectedFile={data.file}
              disabled={isLoading}
            />
          </div>
          
          <button
            onClick={() => isFormComplete && !isLoading && onAdd(data)}
            disabled={!isFormComplete || isLoading}
            className={`
              w-full py-2 rounded-lg mt-4
              transition-all duration-300
              flex items-center justify-center gap-2
              ${isFormComplete && !isLoading
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg' 
                : 'bg-gray-300 cursor-not-allowed text-gray-500'}
              ${data.file && !isLoading ? 'animate-pulse-once' : ''}
            `}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              'Create'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Main component for the Sheet Music page
 */
const SheetMusic: React.FC = () => {
  // Context hooks
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { isShortcutTriggered } = useShortcuts();
  
  // State for UI
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // State for data
  const [items, setItems] = useState<SheetMusicItem[]>([]);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [newItemData, setNewItemData] = useState<{
    title: string;
    composer: string;
    file?: File;
  }>({
    title: '',
    composer: ''
  });

  // Reset scroll position when component mounts
  useScrollReset();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Search shortcut (Cmd/Ctrl + F)
      if (isShortcutTriggered(e, 'sheetMusic', 'search')) {
        e.preventDefault();
        setIsSearchExpanded(true);
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isShortcutTriggered]);

  // Load user's sheet music
  useEffect(() => {
    const loadSheetMusic = async () => {
      if (!user) return;
      
      try {
        const userSheetMusic = await getUserSheetMusic(user.id);
        setItems(userSheetMusic);
      } catch (error) {
        console.error('Error loading sheet music:', error);
        showToast('Failed to load your sheet music', 'error');
      }
    };
    
    loadSheetMusic();
  }, [user, showToast]);

  /**
   * Handle adding new sheet music
   */
  const handleAddNew = async (data: { title: string; composer: string; file?: File }) => {
    if (!user || !data.file) return;

    try {
      setIsLoading(true);

      const newItemId = crypto.randomUUID();
      const newItem: SheetMusicItem = {
        id: newItemId,
        title: data.title,
        composer: data.composer,
        dateAdded: new Date(),
        isFavorite: false,
        pdfPath: '' // Will be replaced with URL after upload
      };

      // Close the modal right away for immediate feedback
      setIsAddingNew(false);
      
      // Show upload progress toast
      showToast(`Uploading "${data.title}"...`, 'info');

      // Upload file and get the URL
      const pdfUrl = await saveSheetMusic(user.id, newItem, data.file);
      
      // Update with the final URL
      newItem.pdfPath = pdfUrl;
      
      // Update the state with new item
      setItems(prev => [newItem, ...prev]);
      setNewItemData({ title: '', composer: '' });
      
      // Set the last added id for animation
      setLastAddedId(newItemId);
      
      // Clear the animation after 3 seconds
      setTimeout(() => setLastAddedId(null), 3000);

      // Show success toast
      showToast(`"${data.title}" successfully added!`, 'success');
    } catch (error) {
      console.error('Error adding new sheet music:', error);
      showToast('Failed to add sheet music. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle updating a sheet music item
   */
  const handleUpdateItem = async (id: string, updates: Partial<SheetMusicItem>) => {
    if (!user) return;

    try {
      await updateSheetMusic(user.id, id, updates);
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
    } catch (error) {
      console.error('Error updating sheet music:', error);
      showToast('Failed to update sheet music', 'error');
    }
  };

  /**
   * Handle deleting a sheet music item
   */
  const handleDeleteItem = async (id: string) => {
    if (!user) return;

    try {
      await deleteSheetMusic(user.id, id);
      setItems(prev => prev.filter(item => item.id !== id));
      showToast('Sheet music deleted', 'info');
    } catch (error) {
      console.error('Error deleting sheet music:', error);
      showToast('Failed to delete sheet music', 'error');
    }
  };

  /**
   * Filter and sort the sheet music items
   */
  const filteredItems = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    
    // First filter by search query
    const filtered = items.filter(item => 
      item.title.toLowerCase().includes(searchLower) ||
      item.composer.toLowerCase().includes(searchLower)
    );
    
    // Then sort: favorites first, then by date (newest first)
    return filtered.sort((a, b) => {
      // First sort by favorite status
      if (a.isFavorite !== b.isFavorite) {
        return a.isFavorite ? -1 : 1;
      }
      
      // If same favorite status, sort by date
      return b.dateAdded.getTime() - a.dateAdded.getTime();
    });
  }, [items, searchQuery]);

  /**
   * Handle opening the add new modal
   */
  const handleOpenAddNew = () => {
    if (isLoading) {
      showToast('Please wait for the current upload to finish', 'info');
      return;
    }
    setIsAddingNew(true);
  };

  /**
   * Handle closing the add new modal
   */
  const handleCloseAddNew = () => {
    if (isLoading) {
      showToast('Upload in progress. Please wait...', 'warning');
      return;
    }
    setIsAddingNew(false);
    setNewItemData({ title: '', composer: '' });
  };

  return (
    <PageTransition>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Sheet Music
          </h1>
          <SearchBar
            onSearch={setSearchQuery}
            isDarkMode={isDarkMode}
            inputRef={searchInputRef}
            isExpanded={isSearchExpanded}
            setIsExpanded={setIsSearchExpanded}
          />
        </div>

        {/* Sheet Music Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AddNewCard 
            onClick={handleOpenAddNew} 
            isDarkMode={isDarkMode} 
          />
          
          {filteredItems.map(item => (
            <SheetMusicCard
              key={item.id}
              item={item}
              onUpdate={handleUpdateItem}
              onDelete={handleDeleteItem}
              isNew={item.id === lastAddedId}
            />
          ))}
        </div>

        {/* Add New Modal */}
        <AddNewModal
          isOpen={isAddingNew}
          onClose={handleCloseAddNew}
          onAdd={handleAddNew}
          data={newItemData}
          onDataChange={setNewItemData}
          isDarkMode={isDarkMode}
          isLoading={isLoading}
        />
      </div>
    </PageTransition>
  );
};

export default SheetMusic; 