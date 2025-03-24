import React from 'react'
import { useTheme } from '../context/ThemeContext'

interface InfoBoxProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning';
}

const InfoBox: React.FC<InfoBoxProps> = ({ 
  icon, 
  children, 
  variant = 'info' 
}) => {
  const { isDarkMode } = useTheme()
  
  const getStyles = () => {
    switch (variant) {
      case 'success':
        return {
          box: isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
          border: 'border-green-500'
        }
      case 'warning':
        return {
          box: isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-50 text-yellow-700',
          border: 'border-yellow-500'
        }
      case 'info':
      default:
        return {
          box: isDarkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-700',
          border: 'border-blue-500'
        }
    }
  }
  
  const styles = getStyles()
  
  return (
    <div className={`
      mb-6 p-4 rounded-lg border-l-4 
      ${styles.box} ${styles.border}
    `}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {icon}
        </div>
        <div className="text-sm">
          {children}
        </div>
      </div>
    </div>
  )
}

export default InfoBox 