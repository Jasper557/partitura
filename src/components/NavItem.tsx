import React from 'react'
import { useTheme } from '../context/ThemeContext'
import { NavItemProps } from '../types/index'

const NavItem: React.FC<NavItemProps> = ({ icon, text, isExpanded, isActive = false, onClick }) => {
  const { isDarkMode } = useTheme()

  const getIconAnimation = () => {
    if (text === 'Settings') {
      return 'transition-transform duration-300 group-hover:rotate-180'
    }
    return 'transition-transform duration-300 group-hover:scale-125'
  }

  return (
    <li>
      <button 
        onClick={onClick}
        className={`
          w-full flex items-center p-3 rounded-lg
          transition-colors duration-200
          focus:outline-none focus:ring-2
          ${isDarkMode
            ? `${isActive 
                ? 'bg-gray-700 text-blue-400' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
              } focus:ring-gray-600`
            : `${isActive 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
              } focus:ring-blue-200`
          }
          group
        `}
      >
        <span className={`
          inline-flex justify-center items-center w-8 h-8
          ${getIconAnimation()}
        `}>
          {icon}
        </span>
        {isExpanded && (
          <span className="ml-3 font-medium">{text}</span>
        )}
        {!isExpanded && (
          <span className="sr-only">{text}</span>
        )}
      </button>
    </li>
  )
}

export default NavItem 