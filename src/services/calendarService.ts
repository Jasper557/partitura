import { supabase } from '../config/supabase'
import { PracticeEvent } from '../types/index'

/**
 * Fetch all practice events for a user
 */
export const fetchEvents = async (userId: string): Promise<PracticeEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('practice_events')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: true })

    if (error) throw error

    return data.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      startTime: new Date(event.start_time),
      endTime: new Date(event.end_time),
      isCompleted: event.is_completed,
      sheetMusicId: event.sheet_music_id,
      color: event.color || '#3B82F6' // Default to blue
    }))
  } catch (error) {
    console.error('Error fetching practice events:', error)
    throw error
  }
}

/**
 * Add a new practice event
 */
export const addEvent = async (userId: string, event: Omit<PracticeEvent, 'id'>): Promise<PracticeEvent> => {
  try {
    const { data, error } = await supabase
      .from('practice_events')
      .insert({
        user_id: userId,
        title: event.title,
        description: event.description,
        start_time: event.startTime.toISOString(),
        end_time: event.endTime.toISOString(),
        is_completed: event.isCompleted,
        sheet_music_id: event.sheetMusicId,
        color: event.color
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      startTime: new Date(data.start_time),
      endTime: new Date(data.end_time),
      isCompleted: data.is_completed,
      sheetMusicId: data.sheet_music_id,
      color: data.color
    }
  } catch (error) {
    console.error('Error adding practice event:', error)
    throw error
  }
}

/**
 * Update an existing practice event
 */
export const updateEvent = async (userId: string, event: PracticeEvent): Promise<void> => {
  try {
    const { error } = await supabase
      .from('practice_events')
      .update({
        title: event.title,
        description: event.description,
        start_time: event.startTime.toISOString(),
        end_time: event.endTime.toISOString(),
        is_completed: event.isCompleted,
        sheet_music_id: event.sheetMusicId,
        color: event.color
      })
      .eq('id', event.id)
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating practice event:', error)
    throw error
  }
}

/**
 * Delete a practice event
 */
export const deleteEvent = async (userId: string, eventId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('practice_events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting practice event:', error)
    throw error
  }
}

/**
 * Toggle the completion status of a practice event
 */
export const toggleEventCompletion = async (userId: string, eventId: string, isCompleted: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('practice_events')
      .update({ is_completed: isCompleted })
      .eq('id', eventId)
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error toggling practice event completion:', error)
    throw error
  }
} 