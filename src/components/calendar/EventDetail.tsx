import React from 'react'
import { format } from 'date-fns'
import { useTheme } from '../../context/ThemeContext'
import { PracticeEvent, SheetMusicItem } from '../../types/index'
import { Clock, CalendarDays, Music, Edit, Trash2, Check, X } from 'lucide-react'

interface EventDetailProps {
  event: PracticeEvent
  onEdit: () => void
  onDelete: () => void
  onToggleComplete: (isCompleted: boolean) => void
  onClose: () => void
  sheetMusicItem?: SheetMusicItem
}

const EventDetail: React.FC<EventDetailProps> = ({ 
  event, 
  onEdit, 
  onDelete, 
  onToggleComplete,
  onClose,
  sheetMusicItem
}) => {
  const { isDarkMode } = useTheme()
  
  // Format dates
  const formatDateRange = () => {
    const startDate = format(new Date(event.startTime), 'MMMM d, yyyy')
    const endDate = format(new Date(event.endTime), 'MMMM d, yyyy')
    
    const startTime = format(new Date(event.startTime), 'h:mm a')
    const endTime = format(new Date(event.endTime), 'h:mm a')
    
    if (startDate === endDate) {
      return (
        <>
          <span>{startDate}</span>
          <span className="text-sm mx-1">•</span>
          <span>{startTime} - {endTime}</span>
        </>
      )
    } else {
      return (
        <>
          <div>{startDate} {startTime}</div>
          <div className="mt-1">to</div>
          <div>{endDate} {endTime}</div>
        </>
      )
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`
          w-full max-w-md p-6 rounded-xl shadow-xl
          ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
          relative
        `}
      >
        {/* Header with color bar */}
        <div 
          className="absolute top-0 left-0 right-0 h-2 rounded-t-xl"
          style={{ backgroundColor: event.color || '#3B82F6' }}
        />
        
        <div className="mt-4">
          {/* Close button */}
          <button
            onClick={onClose}
            className={`
              absolute top-4 right-4 p-2 rounded-full
              ${isDarkMode 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }
              transition-colors
            `}
          >
            <X size={20} />
          </button>
          
          {/* Completion status */}
          <div className="flex items-center mb-4">
            <button
              onClick={() => onToggleComplete(!event.isCompleted)}
              className={`
                flex items-center justify-center w-6 h-6 rounded-full mr-2
                ${event.isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                }
              `}
            >
              {event.isCompleted ? <Check size={14} /> : null}
            </button>
            <span 
              className={`
                text-sm font-medium
                ${event.isCompleted 
                  ? isDarkMode ? 'text-green-400' : 'text-green-600'
                  : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }
              `}
            >
              {event.isCompleted ? 'Completed' : 'Not completed'}
            </span>
          </div>
          
          {/* Title */}
          <h2 
            className={`
              text-xl font-bold mb-2
              ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}
            `}
          >
            {event.title}
          </h2>
          
          {/* Date and time */}
          <div 
            className={`
              flex items-start mb-4 
              ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}
            `}
          >
            <CalendarDays size={18} className="mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm">{formatDateRange()}</div>
          </div>
          
          {/* Sheet music reference */}
          {sheetMusicItem && (
            <div 
              className={`
                flex items-start mb-4
                ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}
              `}
            >
              <Music size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium">{sheetMusicItem.title}</div>
                <div>{sheetMusicItem.composer}</div>
              </div>
            </div>
          )}
          
          {/* Description */}
          {event.description && (
            <div 
              className={`
                ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                mb-6 text-sm
              `}
            >
              <p className="whitespace-pre-line">{event.description}</p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onEdit}
              className={`
                py-2 px-3 rounded-lg text-sm font-medium flex items-center
                ${isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
                transition-colors
              `}
            >
              <Edit size={16} className="mr-1" />
              Edit
            </button>
            <button
              onClick={onDelete}
              className={`
                py-2 px-3 rounded-lg text-sm font-medium flex items-center
                bg-red-600 text-white hover:bg-red-700
                transition-colors
              `}
            >
              <Trash2 size={16} className="mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetail 