import React from 'react'
import { Music, BookOpen, Calendar, Sun, Moon } from 'lucide-react'
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
      transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
      flex flex-col
      rounded-xl shadow-lg
      overflow-hidden
      border
      transform-gpu
    `}>
      <div className={`
        flex items-center p-4 cursor-pointer
        ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}
        border-b
        transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        hover:brightness-110
        group
      `}
      onClick={toggleSidebar}
      >
        <div className={`
          flex items-center justify-center
          transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isExpanded ? 'w-10' : 'w-full'}
          transform-gpu
        `}>
          <img 
            src="/assets/icon.png"
            alt="Partitura Logo"
            className={`
              w-10 h-10
              transition-all duration-500
              transform-gpu
              group-hover:scale-105
              ${isExpanded ? '' : 'rotate-360'}
            `}
          />
        </div>
        <div className={`
          overflow-hidden
          transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isExpanded ? 'w-40 opacity-100' : 'w-0 opacity-0'}
        `}>
          <h1 className={`
            ml-3 text-xl font-bold whitespace-nowrap
            ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}
          `}>
            Partitura
          </h1>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <ul className={`
          space-y-2 p-4
          transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isExpanded ? 'opacity-100' : 'opacity-80'}
        `}>
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
        transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
      `}>
        <button
          onClick={toggleTheme}
          className={`
            p-2 rounded-lg focus:outline-none
            w-full flex items-center justify-center
            transition-all duration-300
            ${isDarkMode
              ? 'hover:bg-gray-700 text-gray-300'
              : 'hover:bg-gray-100 text-gray-600'
            }
          `}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <>
              <Sun size={20} className="transition-transform duration-300 hover:scale-110" />
              <div className={`
                overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                ${isExpanded ? 'w-20 ml-3' : 'w-0'}
              `}>
                <span className="whitespace-nowrap">Light Mode</span>
              </div>
            </>
          ) : (
            <>
              <Moon size={20} className="transition-transform duration-300 hover:scale-110" />
              <div className={`
                overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                ${isExpanded ? 'w-20 ml-3' : 'w-0'}
              `}>
                <span className="whitespace-nowrap">Dark Mode</span>
              </div>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar 