import React from 'react'
import { useTheme } from '../context/ThemeContext'

const Calendar: React.FC = () => {
  const { isDarkMode } = useTheme()

  return (
    <div className="p-6">
      <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
        Calendar
      </h1>
      <div className={`
        rounded-xl shadow-lg p-6
        ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'}
      `}>
        <p>Your calendar content will go here.</p>
      </div>
    </div>
  )
}

export default Calendar 