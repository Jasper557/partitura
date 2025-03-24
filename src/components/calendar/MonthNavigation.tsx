import React from 'react'
import { format, addMonths, subMonths } from 'date-fns'
import { useTheme } from '../../context/ThemeContext'
import { ChevronLeft, ChevronRight, CalendarDays, Plus } from 'lucide-react'

interface MonthNavigationProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  onAddEvent: () => void
}

const MonthNavigation: React.FC<MonthNavigationProps> = ({ 
  currentDate, 
  onDateChange,
  onAddEvent 
}) => {
  const { isDarkMode } = useTheme()
  
  const goToPreviousMonth = () => {
    onDateChange(subMonths(currentDate, 1))
  }
  
  const goToNextMonth = () => {
    onDateChange(addMonths(currentDate, 1))
  }
  
  const goToToday = () => {
    onDateChange(new Date())
  }
  
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center">
        <h1 
          className={`
            text-2xl font-bold mr-4
            ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}
          `}
        >
          {format(currentDate, 'MMMM yyyy')}
        </h1>
        <div className="flex space-x-1">
          <button
            onClick={goToPreviousMonth}
            className={`
              p-2 rounded-lg
              ${isDarkMode 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
              }
              transition-colors
            `}
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToToday}
            className={`
              px-3 py-1 rounded-lg text-sm font-medium
              ${isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
              transition-colors flex items-center
            `}
          >
            <CalendarDays size={14} className="mr-1" />
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className={`
              p-2 rounded-lg
              ${isDarkMode 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
              }
              transition-colors
            `}
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <button
        onClick={onAddEvent}
        className={`
          py-2 px-4 rounded-lg text-sm font-medium
          bg-blue-600 text-white hover:bg-blue-700
          transition-colors flex items-center
        `}
      >
        <Plus size={16} className="mr-1" />
        Add Event
      </button>
    </div>
  )
}

export default MonthNavigation 