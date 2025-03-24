import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { v4 as uuidv4 } from 'uuid'
import { PracticeEvent, SheetMusicItem } from '../types/index'
import { 
  fetchEvents, 
  addEvent, 
  updateEvent,
  deleteEvent, 
  toggleEventCompletion 
} from '../services/calendarService'
import { useToast } from '../context/ToastContext'
import CalendarGrid from '../components/calendar/CalendarGrid'
import MonthNavigation from '../components/calendar/MonthNavigation'
import EventForm from '../components/calendar/EventForm'
import EventDetail from '../components/calendar/EventDetail'
import { fetchSheetMusic } from '../services/sheetMusicService'

const Calendar: React.FC = () => {
  const { isDarkMode } = useTheme()
  const { user } = useAuth()
  const { showToast } = useToast()
  // State
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<PracticeEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<PracticeEvent | null>(null)
  const [isEventFormOpen, setIsEventFormOpen] = useState(false)
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [sheetMusicItems, setSheetMusicItems] = useState<SheetMusicItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Load events and sheet music
  useEffect(() => {
    if (user) {
      loadEvents()
      loadSheetMusic()
    }
  }, [user])
  
  const loadEvents = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      const events = await fetchEvents(user.id)
      setEvents(events)
    } catch (error) {
      console.error('Error loading events:', error)
      showToast('Failed to load Practice Sessions', 'error')
    } finally {
      setIsLoading(false)
    }
  }
  
  const loadSheetMusic = async () => {
    if (!user) return
    
    try {
      const items = await fetchSheetMusic(user.id)
      setSheetMusicItems(items)
    } catch (error) {
      console.error('Error loading sheet music:', error)
    }
  }
  
  // Handle creating/updating events
  const handleSaveEvent = async (eventData: Omit<PracticeEvent, 'id'>) => {
    if (!user) return
    
    try {
      setIsSubmitting(true)
      
      if (selectedEvent) {
        // Update existing event
        await updateEvent(user.id, {
          ...eventData,
          id: selectedEvent.id
        })
        
        // Update local state
        setEvents(events.map(event => 
          event.id === selectedEvent.id 
            ? { ...eventData, id: selectedEvent.id } 
            : event
        ))
        
        showToast('Practice Session updated successfully', 'success')
      } else {
        // Create new event
        const newEvent = await addEvent(user.id, eventData)
        
        // Update local state
        setEvents([...events, newEvent])
        
        showToast('Practice Session created successfully', 'success')
      }
      
      // Close form
      handleCloseEventForm()
    } catch (error) {
      console.error('Error saving Practice Session:', error)
      showToast('Failed to save Practice Session', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle deleting event
  const handleDeleteEvent = async () => {
    if (!user || !selectedEvent) return
    
    try {
      await deleteEvent(user.id, selectedEvent.id)
      
      // Update local state
      setEvents(events.filter(event => event.id !== selectedEvent.id))
      
      // Close detail view
      setIsEventDetailOpen(false)
      setSelectedEvent(null)
      
      showToast('Practice Session deleted successfully', 'success')
    } catch (error) {
      console.error('Error deleting Practice Session:', error)
      showToast('Failed to delete Practice Session', 'error')
    }
  }
  
  // Handle toggling event completion
  const handleToggleCompletion = async (isCompleted: boolean) => {
    if (!user || !selectedEvent) return
    
    try {
      await toggleEventCompletion(user.id, selectedEvent.id, isCompleted)
      
      // Update local state
      setEvents(events.map(event => 
        event.id === selectedEvent.id 
          ? { ...event, isCompleted } 
          : event
      ))
      
      // Update selected event
      setSelectedEvent({
        ...selectedEvent,
        isCompleted
      })
      
      showToast(`Event marked as ${isCompleted ? 'completed' : 'incomplete'}`, 'success')
    } catch (error) {
      console.error('Error toggling Practice Session completion:', error)
      showToast('Failed to update Practice Session', 'error')
    }
  }
  
  // Open event form for creating a new event
  const handleAddEvent = () => {
    setSelectedEvent(null)
    setIsEventFormOpen(true)
  }
  
  // Open event form for editing an existing event
  const handleEditEvent = () => {
    setIsEventDetailOpen(false)
    setIsEventFormOpen(true)
  }
  
  // Open event detail view
  const handleViewEvent = (event: PracticeEvent) => {
    setSelectedEvent(event)
    setIsEventDetailOpen(true)
  }
  
  // Handle date click in calendar
  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setSelectedEvent(null)
    setIsEventFormOpen(true)
  }
  
  // Close event form
  const handleCloseEventForm = () => {
    setIsEventFormOpen(false)
    setSelectedEvent(null)
    setSelectedDate(null)
  }
  
  // Find sheet music item for selected event
  const getSheetMusicForEvent = () => {
    if (!selectedEvent?.sheetMusicId) return undefined
    return sheetMusicItems.find(item => item.id === selectedEvent.sheetMusicId)
  }
  
  return (
    <div className={`
      p-6 min-h-screen
      ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}
    `}>
      <div className="max-w-7xl mx-auto">
        {/* Month navigation and Add event button */}
        <MonthNavigation 
          currentDate={currentDate} 
          onDateChange={setCurrentDate}
          onAddEvent={handleAddEvent}
        />
        
        {/* Loading indicator */}
        {isLoading ? (
          <div className={`
            rounded-xl shadow-lg p-8 flex items-center justify-center
            ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
            min-h-[500px]
          `}>
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Loading calendar events...
              </p>
            </div>
          </div>
        ) : (
          <div className={`
            rounded-xl shadow-lg overflow-hidden
            ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
          `}>
            <CalendarGrid 
              currentDate={currentDate}
              events={events}
              onDateClick={handleDateClick}
              onEventClick={handleViewEvent}
            />
          </div>
        )}
      </div>
      
      {/* Event form modal */}
      {isEventFormOpen && (
        <EventForm 
          event={selectedEvent || undefined}
          isOpen={isEventFormOpen}
          onClose={handleCloseEventForm}
          onSave={handleSaveEvent}
          selectedDate={selectedDate || undefined}
          sheetMusicItems={sheetMusicItems}
        />
      )}
      
      {/* Event detail modal */}
      {isEventDetailOpen && selectedEvent && (
        <EventDetail 
          event={selectedEvent}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          onToggleComplete={handleToggleCompletion}
          onClose={() => setIsEventDetailOpen(false)}
          sheetMusicItem={getSheetMusicForEvent()}
        />
      )}
    </div>
  )
}

export default Calendar 