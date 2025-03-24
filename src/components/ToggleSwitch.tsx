import React from 'react'
import { useTheme } from '../context/ThemeContext'

interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
  isOn, 
  onToggle, 
  disabled = false 
}) => {
  const { isDarkMode } = useTheme()
  
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${isOn 
          ? isDarkMode ? 'bg-blue-600' : 'bg-blue-500' 
          : isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition duration-300
          ${isOn ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  )
}

export default ToggleSwitch 