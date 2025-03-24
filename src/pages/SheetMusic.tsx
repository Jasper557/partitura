import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Plus, X, Music, Search } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
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

const AddNewModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  onAdd: (data: { title: string; composer: string; file?: File }) => void
  data: { title: string; composer: string; file?: File }
  onDataChange: (data: { title: string; composer: string; file?: File }) => void
  isDarkMode: boolean
}> = ({ isOpen, onClose, onAdd, data, onDataChange, isDarkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50">
      <div className={`
        relative w-full max-w-4xl rounded-xl shadow-lg
        ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
        p-6
      `}>
        <button
          onClick={onClose}
          className={`
            absolute top-4 right-4
            p-2 rounded-full
            ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}
          `}
        >
          <X size={20} />
        </button>

        <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Add New Sheet Music
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={data.title}
              onChange={e => onDataChange({ ...data, title: e.target.value })}
              className={`
                w-full px-4 py-2 rounded-lg
                ${isDarkMode
                  ? 'bg-gray-700 text-gray-100'
                  : 'bg-gray-50 text-gray-900'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
            />
            <input
              type="text"
              placeholder="Composer"
              value={data.composer}
              onChange={e => onDataChange({ ...data, composer: e.target.value })}
              className={`
                w-full px-4 py-2 rounded-lg
                ${isDarkMode
                  ? 'bg-gray-700 text-gray-100'
                  : 'bg-gray-50 text-gray-900'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
            />
            <button
              onClick={() => onAdd(data)}
              disabled={!data.file || !data.title || !data.composer}
              className={`
                w-full py-2 rounded-lg
                ${!data.file || !data.title || !data.composer
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-blue-500 hover:bg-blue-600'
                }
                text-white transition-colors duration-200
              `}
            >
              Create
            </button>
          </div>
          <DropZone 
            onFileSelect={file => onDataChange({ ...data, file })}
            selectedFile={data.file}
          />
        </div>
      </div>
    </div>
  )
}

const SheetMusic: React.FC = () => {
  const { isDarkMode } = useTheme()
  const { user } = useAuth()
  const { isShortcutTriggered } = useShortcuts()
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [items, setItems] = useState<SheetMusicItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [newItemData, setNewItemData] = useState<{
    title: string
    composer: string
    file?: File
  }>({
    title: '',
    composer: ''
  })

  // Reset scroll position when component mounts
  useScrollReset()

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

  // Load user's sheet music from Firestore
  useEffect(() => {
    const loadSheetMusic = async () => {
      if (user) {
        try {
          const userSheetMusic = await getUserSheetMusic(user.id)
          setItems(userSheetMusic)
        } catch (error) {
          console.error('Error loading sheet music:', error)
        }
      }
    }
    loadSheetMusic()
  }, [user])

  const handleAddNew = async (data: { title: string; composer: string; file?: File }) => {
    if (!user || !data.file) return

    try {
      const newItem: SheetMusicItem = {
        id: crypto.randomUUID(),
        title: data.title,
        composer: data.composer,
        dateAdded: new Date(),
        isFavorite: false,
        pdfPath: data.file
      }

      await saveSheetMusic(user.id, newItem, data.file)
      setItems(prev => [...prev, newItem])
      setIsAddingNew(false)
      setNewItemData({ title: '', composer: '' })
    } catch (error) {
      console.error('Error adding new sheet music:', error)
    }
  }

  const handleUpdateItem = async (id: string, updates: Partial<SheetMusicItem>) => {
    if (!user) return

    try {
      await updateSheetMusic(user.id, id, updates)
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ))
    } catch (error) {
      console.error('Error updating sheet music:', error)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!user) return

    try {
      await deleteSheetMusic(user.id, id)
      setItems(prev => prev.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error deleting sheet music:', error)
    }
  }

  const filteredItems = useMemo(() => {
    const searchLower = searchQuery.toLowerCase()
    
    // First filter by search query
    const filtered = items.filter(item => 
      item.title.toLowerCase().includes(searchLower) ||
      item.composer.toLowerCase().includes(searchLower)
    )
    
    // Then sort: favorites first, then by date (newest first)
    return filtered.sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) {
        return a.isFavorite ? -1 : 1
      }
      // If both items have the same favorite status, sort by date
      return b.dateAdded.getTime() - a.dateAdded.getTime()
    })
  }, [items, searchQuery])

  return (
    <div className="p-6">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AddNewCard onClick={() => setIsAddingNew(true)} isDarkMode={isDarkMode} />
        {filteredItems.map(item => (
          <SheetMusicCard
            key={item.id}
            item={item}
            onUpdate={handleUpdateItem}
            onDelete={handleDeleteItem}
          />
        ))}
      </div>

      <AddNewModal
        isOpen={isAddingNew}
        onClose={() => {
          setIsAddingNew(false)
          setNewItemData({ title: '', composer: '' })
        }}
        onAdd={handleAddNew}
        data={newItemData}
        onDataChange={setNewItemData}
        isDarkMode={isDarkMode}
      />
    </div>
  )
}

export default SheetMusic 