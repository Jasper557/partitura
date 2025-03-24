import React from 'react'
import { useTheme } from '../context/ThemeContext'

interface SettingRowProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  control?: React.ReactNode;
  onClick?: () => void;
}

const SettingRow: React.FC<SettingRowProps> = ({ 
  icon, 
  title, 
  description, 
  control, 
  onClick 
}) => {
  const { isDarkMode } = useTheme()
  
  return (
    <div 
      className={`
        flex items-center justify-between p-5 rounded-lg mb-4
        ${onClick ? 'cursor-pointer' : ''}
        ${isDarkMode 
          ? 'bg-gray-800 hover:bg-gray-700' 
          : 'bg-white hover:bg-gray-50'
        }
        transition-colors duration-200
      `}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          {icon}
        </div>
        <div>
          <h3 className={`font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            {title}
          </h3>
          {description && (
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {description}
            </p>
          )}
        </div>
      </div>
      {control && (
        <div>
          {control}
        </div>
      )}
    </div>
  )
}

export default SettingRow 