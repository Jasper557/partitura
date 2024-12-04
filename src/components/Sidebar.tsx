import React from 'react'
import { Music, BookOpen, Calendar, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react'
import NavItem from './NavItem'
import { useTheme } from '../context/ThemeContext'
import { SidebarProps } from '../types'

const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, 
  onNavigate, 
  isExpanded, 
  onExpandedChange 
}) => {
  const { isDarkMode, toggleTheme } = useTheme()
  const toggleSidebar = () => onExpandedChange(!isExpanded)

  return (
    <aside className={`
      ${isExpanded ? 'w-64' : 'w-20'}
      fixed top-4 left-4 h-[calc(100vh-2rem)] 
      ${isDarkMode 
        ? 'bg-gray-800 text-gray-100 border-gray-700' 
        : 'bg-white text-gray-600 border-gray-200'
      }
      transition-all duration-300 ease-in-out
      flex flex-col
      rounded-xl shadow-lg
      overflow-hidden
      border
    `}>
      <div className={`
        flex items-center justify-between p-4 
        ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}
        border-b
      `}>
        {isExpanded && (
          <h1 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Partitura
          </h1>
        )}
        <button 
          onClick={toggleSidebar}
          className={`
            p-2 rounded-full focus:outline-none transition-colors duration-200
            ${isExpanded ? 'ml-auto' : 'mx-auto'}
            ${isDarkMode
              ? 'hover:bg-gray-700 text-gray-300'
              : 'hover:bg-gray-100 text-gray-600'
            }
          `}
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isExpanded ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-2 p-4">
          <NavItem 
            icon={<Music size={24} />} 
            text="Sheet Music" 
            isExpanded={isExpanded}
            isActive={currentPage === 'sheet-music'}
            onClick={() => onNavigate('sheet-music')}
          />
          <NavItem 
            icon={<BookOpen size={24} />} 
            text="Practice" 
            isExpanded={isExpanded}
            isActive={currentPage === 'practice'}
            onClick={() => onNavigate('practice')}
          />
          <NavItem 
            icon={<Calendar size={24} />} 
            text="Calendar" 
            isExpanded={isExpanded}
            isActive={currentPage === 'calendar'}
            onClick={() => onNavigate('calendar')}
          />
        </ul>
      </nav>

      <div className={`
        p-4 
        ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}
        border-t
      `}>
        <button
          onClick={toggleTheme}
          className={`
            p-2 rounded-lg focus:outline-none transition-colors duration-200
            w-full flex items-center justify-center
            ${isDarkMode
              ? 'hover:bg-gray-700 text-gray-300'
              : 'hover:bg-gray-100 text-gray-600'
            }
          `}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <>
              <Sun size={20} />
              {isExpanded && <span className="ml-3">Light Mode</span>}
            </>
          ) : (
            <>
              <Moon size={20} />
              {isExpanded && <span className="ml-3">Dark Mode</span>}
            </>
          )}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar 