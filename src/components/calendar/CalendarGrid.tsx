import React from 'react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay,
  parseISO,
  isToday
} from 'date-fns'
import { useTheme } from '../../context/ThemeContext'
import { PracticeEvent } from '../../types/index'

interface CalendarGridProps {
  currentDate: Date
  events: PracticeEvent[]
  onDateClick: (date: Date) => void
  onEventClick: (event: PracticeEvent) => void
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  currentDate, 
  events, 
  onDateClick,
  onEventClick 
}) => {
  const { isDarkMode } = useTheme()
  
  // Get all days in month view, including days from previous/next months to fill grid
  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)
    
    const rows = []
    let days = []
    let day = startDate
    
    // Generate array of dates
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        days.push(day)
        day = addDays(day, 1)
      }
      rows.push(days)
      days = []
    }
    
    return rows
  }
  
  // Group events by date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(date, new Date(event.startTime))
    )
  }
  
  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, 'd')
  }
  
  return (
    <div className="w-full">
      {/* Header row with weekday names */}
      <div className="grid grid-cols-7 mb-1 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div 
            key={index}
            className={`
              py-2 text-sm font-medium
              ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}
            `}
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid">
        {getDaysInMonth().map((week, weekIndex) => (
          <div 
            key={weekIndex} 
            className="grid grid-cols-7"
          >
            {week.map((day, dayIndex) => {
              const eventsForDay = getEventsForDate(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isSelectedDay = isSameDay(day, currentDate)
              const isTodayDate = isToday(day)
              
              return (
                <div
                  key={dayIndex}
                  onClick={() => onDateClick(day)}
                  className={`
                    min-h-[100px] p-1 border-t border-l
                    ${weekIndex === 5 ? 'border-b' : ''}
                    ${dayIndex === 6 ? 'border-r' : ''}
                    ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
                    ${isCurrentMonth 
                      ? isDarkMode ? 'bg-gray-800' : 'bg-white' 
                      : isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
                    }
                    ${isSelectedDay 
                      ? isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50' 
                      : ''
                    }
                    transition-colors duration-200
                    cursor-pointer
                  `}
                >
                  <div className="flex flex-col h-full">
                    {/* Date number */}
                    <div 
                      className={`
                        text-sm font-medium mb-1 h-6 w-6 flex items-center justify-center rounded-full
                        ${!isCurrentMonth 
                          ? isDarkMode ? 'text-gray-600' : 'text-gray-400' 
                          : isDarkMode ? 'text-gray-300' : 'text-gray-800'
                        }
                        ${isTodayDate 
                          ? isDarkMode 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-blue-500 text-white' 
                          : ''
                        }
                      `}
                    >
                      {formatDate(day)}
                    </div>
                    
                    {/* Events */}
                    <div className="flex flex-col gap-1 overflow-hidden">
                      {eventsForDay.slice(0, 3).map((event, index) => (
                        <div
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation()
                            onEventClick(event)
                          }}
                          className={`
                            px-2 py-1 text-xs rounded truncate
                            ${isDarkMode ? 'text-white' : 'text-white'}
                            hover:opacity-90 transition-opacity
                          `}
                          style={{ backgroundColor: event.color || '#3B82F6' }}
                        >
                          {event.title}
                        </div>
                      ))}
                      
                      {/* Show indicator for more events */}
                      {eventsForDay.length > 3 && (
                        <div 
                          className={`
                            text-xs px-2
                            ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}
                          `}
                        >
                          +{eventsForDay.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CalendarGrid 