import React, { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { format, addHours } from 'date-fns'
import { useTheme } from '../../context/ThemeContext'
import { PracticeEvent, SheetMusicItem } from '../../types/index'
import { X, Calendar, Clock, Music, Check } from 'lucide-react'

interface EventFormProps {
  event?: PracticeEvent
  isOpen: boolean
  onClose: () => void
  onSave: (event: Omit<PracticeEvent, 'id'>) => void
  selectedDate?: Date
  sheetMusicItems: SheetMusicItem[]
}

// Color options for events
const colorOptions = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Pink', value: '#EC4899' },
]

const EventForm: React.FC<EventFormProps> = ({ 
  event, 
  isOpen, 
  onClose, 
  onSave,
  selectedDate,
  sheetMusicItems 
}) => {
  const { isDarkMode } = useTheme()
  const isEditing = !!event
  
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState<Date>(new Date())
  const [endTime, setEndTime] = useState<Date>(addHours(new Date(), 1))
  const [isCompleted, setIsCompleted] = useState(false)
  const [sheetMusicId, setSheetMusicId] = useState<string | undefined>(undefined)
  const [color, setColor] = useState('#3B82F6') // Default blue
  
  // Initialize form with event data or defaults
  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDescription(event.description)
      setStartTime(new Date(event.startTime))
      setEndTime(new Date(event.endTime))
      setIsCompleted(event.isCompleted)
      setSheetMusicId(event.sheetMusicId)
      setColor(event.color || '#3B82F6')
    } else {
      // Default to selected date if provided, or current time
      const baseDate = selectedDate || new Date()
      
      // Reset form for new event
      setTitle('')
      setDescription('')
      setStartTime(baseDate)
      setEndTime(addHours(baseDate, 1))
      setIsCompleted(false)
      setSheetMusicId(undefined)
      setColor('#3B82F6')
    }
  }, [event, isOpen, selectedDate])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create event object
    const eventData: Omit<PracticeEvent, 'id'> = {
      title,
      description,
      startTime,
      endTime,
      isCompleted,
      sheetMusicId,
      color
    }
    
    onSave(eventData)
  }
  
  // Custom date picker styles
  const datePickerClassName = `
    w-full py-2 px-3 rounded-lg
    ${isDarkMode 
      ? 'bg-gray-700 text-gray-100 border-gray-600' 
      : 'bg-white text-gray-800 border-gray-300'
    }
    border focus:outline-none focus:ring-2 focus:ring-blue-500
  `
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className={`
          w-full max-w-md p-6 rounded-xl shadow-xl
          ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
          max-h-[90vh] overflow-y-auto
        `}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {isEditing ? 'Edit Practice Session' : 'New Practice Session'}
          </h2>
          <button
            onClick={onClose}
            className={`
              p-2 rounded-full
              ${isDarkMode 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }
              transition-colors
            `}
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-4">
            <label 
              htmlFor="title" 
              className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Title*
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Practice session title"
              className={`
                w-full py-2 px-3 rounded-lg
                ${isDarkMode 
                  ? 'bg-gray-700 text-gray-100 border-gray-600' 
                  : 'bg-white text-gray-800 border-gray-300'
                }
                border focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
            />
          </div>
          
          {/* Description */}
          <div className="mb-4">
            <label 
              htmlFor="description" 
              className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What do you plan to practice?"
              rows={3}
              className={`
                w-full py-2 px-3 rounded-lg resize-none
                ${isDarkMode 
                  ? 'bg-gray-700 text-gray-100 border-gray-600' 
                  : 'bg-white text-gray-800 border-gray-300'
                }
                border focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
            />
          </div>
          
          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label 
                className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Start
              </label>
              <div className="relative">
                <DatePicker
                  selected={startTime}
                  onChange={(date: Date | null) => date && setStartTime(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMM d, yyyy h:mm aa"
                  className={datePickerClassName}
                  wrapperClassName="w-full"
                />
                <Calendar 
                  size={16} 
                  className={`absolute right-3 top-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} 
                />
              </div>
            </div>
            
            <div>
              <label 
                className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                End
              </label>
              <div className="relative">
                <DatePicker
                  selected={endTime}
                  onChange={(date: Date | null) => date && setEndTime(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMM d, yyyy h:mm aa"
                  className={datePickerClassName}
                  wrapperClassName="w-full"
                  minDate={startTime}
                />
                <Clock 
                  size={16} 
                  className={`absolute right-3 top-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} 
                />
              </div>
            </div>
          </div>
          
          {/* Sheet Music */}
          <div className="mb-4">
            <label 
              htmlFor="sheetMusic" 
              className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Sheet Music (Optional)
            </label>
            <div className="relative">
              <select
                id="sheetMusic"
                value={sheetMusicId || ''}
                onChange={(e) => setSheetMusicId(e.target.value || undefined)}
                className={`
                  w-full py-2 pl-3 pr-10 rounded-lg appearance-none
                  ${isDarkMode 
                    ? 'bg-gray-700 text-gray-100 border-gray-600' 
                    : 'bg-white text-gray-800 border-gray-300'
                  }
                  border focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
              >
                <option value="">No sheet music</option>
                {sheetMusicItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} - {item.composer}
                  </option>
                ))}
              </select>
              <Music 
                size={16} 
                className={`absolute right-3 top-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} 
              />
            </div>
          </div>
          
          {/* Color Selection */}
          <div className="mb-4">
            <label 
              className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColor(option.value)}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${color === option.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''}
                    ${isDarkMode ? 'ring-offset-gray-800' : 'ring-offset-white'}
                  `}
                  style={{ backgroundColor: option.value }}
                  title={option.name}
                >
                  {color === option.value && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </div>
          
          {/* Completed Status (only for editing) */}
          {isEditing && (
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={(e) => setIsCompleted(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Mark as completed
                </span>
              </label>
            </div>
          )}
          
          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`
                py-2 px-4 rounded-lg text-sm font-medium
                ${isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
                transition-colors
              `}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`
                py-2 px-4 rounded-lg text-sm font-medium
                bg-blue-600 text-white hover:bg-blue-700
                transition-colors
              `}
            >
              {isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventForm 