import React, { useState, useEffect } from 'react'
import { PracticeEvent, SheetMusicItem } from '../../types'
import { Edit3, Trash2, X, Clock, CheckCircle, XCircle, Calendar, Music, ExternalLink } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { format } from 'date-fns'

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
  const [animateIn, setAnimateIn] = useState(false)
  
  useEffect(() => {
    // Trigger animation when component mounts
    const timer = setTimeout(() => setAnimateIn(true), 50);
    return () => clearTimeout(timer);
  }, []);
  
  const handleClose = () => {
    setAnimateIn(false);
    setTimeout(() => onClose(), 300);
  }
  
  const handleDelete = () => {
    setAnimateIn(false);
    setTimeout(() => onDelete(), 300);
  }
  
  const formatDateRange = () => {
    const start = new Date(event.startTime)
    const end = new Date(event.endTime)
    
    const isSameDay = 
      start.getDate() === end.getDate() && 
      start.getMonth() === end.getMonth() && 
      start.getFullYear() === end.getFullYear()
    
    if (isSameDay) {
      return (
        <>
          <span>{format(start, 'EEEE, MMMM d, yyyy')}</span>
          <span className="mx-1">•</span>
          <span>{format(start, 'h:mm a')} - {format(end, 'h:mm a')}</span>
        </>
      )
    } else {
      return (
        <>
          <div>{format(start, 'EEEE, MMMM d, yyyy')} • {format(start, 'h:mm a')}</div>
          <div>to</div>
          <div>{format(end, 'EEEE, MMMM d, yyyy')} • {format(end, 'h:mm a')}</div>
        </>
      )
    }
  }
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div 
        className={`
          fixed inset-0 bg-black transition-opacity duration-300
          ${animateIn ? 'bg-opacity-50' : 'bg-opacity-0'}
        `}
        onClick={handleClose}
      />
      
      <div 
        className={`
          w-full max-w-md p-6 rounded-xl shadow-xl
          ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
          transition-all duration-300 ease-out
          ${animateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          relative z-10
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
            onClick={handleClose}
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
                flex items-center gap-2 px-3 py-1 rounded-full text-sm
                transition-colors
                ${event.isCompleted
                  ? isDarkMode 
                    ? 'bg-green-900/30 text-green-400' 
                    : 'bg-green-100 text-green-700'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 text-gray-700'
                }
              `}
            >
              {event.isCompleted ? (
                <>
                  <CheckCircle size={16} />
                  <span>Completed</span>
                </>
              ) : (
                <>
                  <XCircle size={16} />
                  <span>Not completed</span>
                </>
              )}
            </button>
          </div>
          
          {/* Event title */}
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {event.title}
          </h2>
          
          {/* Date and time */}
          <div className={`flex items-start gap-3 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <Calendar size={18} className="mt-1" />
            <div className="text-sm">{formatDateRange()}</div>
          </div>
          
          {/* Sheet music */}
          {sheetMusicItem && (
            <div className={`flex items-start gap-3 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <Music size={18} className="mt-1" />
              <div className="text-sm">
                <p>{sheetMusicItem.title}</p>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {sheetMusicItem.composer}
                </p>
              </div>
            </div>
          )}
          
          {/* Notes */}
          {event.description && (
            <div className={`
              p-4 rounded-lg text-sm mt-6 mb-6
              ${isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-700'}
            `}>
              <p className="whitespace-pre-line">{event.description}</p>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={handleDelete}
              className={`
                flex items-center gap-2 p-2 rounded-lg
                ${isDarkMode 
                  ? 'bg-gray-700 text-red-400 hover:bg-gray-600' 
                  : 'bg-gray-100 text-red-600 hover:bg-gray-200'
                }
                transition-colors
              `}
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={onEdit}
              className={`
                flex items-center gap-2 p-2 px-4 rounded-lg
                ${isDarkMode 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
                }
                transition-colors
              `}
            >
              <Edit3 size={18} />
              <span>Edit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetail 