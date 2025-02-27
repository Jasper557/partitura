import React from 'react'
import { Music, BookOpen, Calendar, Settings } from 'lucide-react'
import NavItem from './NavItem'
import { useTheme } from '../context/ThemeContext'
import { SidebarProps } from '../types'

const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, 
  onNavigate, 
  isExpanded, 
  onExpandedChange 
}) => {
  const { isDarkMode } = useTheme()
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
          flex items-center
          ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}
          group
        `}>
          <img
            src={import.meta.env.DEV ? '/assets/icon.png' : '/partitura/assets/icon.png'}
            alt="Partitura Logo"
            className={`
              w-10 h-10
              transition-all duration-500
              transform-gpu
              group-hover:scale-105
              ${isExpanded ? '' : 'rotate-360'}
            `}
          />
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
      </div>
    </aside>
  )
}

export default Sidebar