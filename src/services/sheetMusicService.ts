import { supabase, getPublicUrl } from '../config/supabase'
import { SheetMusicItem } from '../types/index'

const STORAGE_BUCKET = 'sheet-music'

export const saveSheetMusic = async (userId: string, item: SheetMusicItem, pdfFile: File) => {
  try {
    // Upload PDF to Supabase Storage
    const filePath = `${userId}/${item.id}`
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, pdfFile)

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      throw uploadError
    }

    // Get the public URL
    const pdfUrl = getPublicUrl(STORAGE_BUCKET, filePath)

    // Save metadata to Supabase database
    const { error: insertError } = await supabase
      .from('sheet_music')
      .insert({
        id: item.id,
        user_id: userId,
        title: item.title,
        composer: item.composer,
        pdf_url: pdfUrl,
        is_favorite: item.isFavorite,
        date_added: item.dateAdded.toISOString()
      })

    if (insertError) {
      console.error('Database insert error:', insertError)
      throw insertError
    }

    return pdfUrl
  } catch (error) {
    console.error('Error saving sheet music:', error)
    throw error
  }
}

export const getUserSheetMusic = async (userId: string): Promise<SheetMusicItem[]> => {
  try {
    console.log('Fetching sheet music for user:', userId)
    const { data, error } = await supabase
      .from('sheet_music')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('Database query error:', error)
      throw error
    }

    if (!data) {
      console.log('No data found for user:', userId)
      return []
    }

    return data.map(item => ({
      id: item.id,
      title: item.title,
      composer: item.composer,
      pdfPath: item.pdf_url,
      isFavorite: item.is_favorite,
      dateAdded: new Date(item.date_added)
    }))
  } catch (error) {
    console.error('Error getting user sheet music:', error)
    throw error
  }
}

export const updateSheetMusic = async (
  userId: string, 
  itemId: string, 
  updates: Partial<SheetMusicItem>
) => {
  try {
    const { error } = await supabase
      .from('sheet_music')
      .update({
        title: updates.title,
        composer: updates.composer,
        is_favorite: updates.isFavorite
      })
      .match({ id: itemId, user_id: userId })

    if (error) throw error
  } catch (error) {
    console.error('Error updating sheet music:', error)
    throw error
  }
}

export const deleteSheetMusic = async (userId: string, itemId: string) => {
  try {
    // Delete from Storage
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([`${userId}/${itemId}`])

    if (storageError) throw storageError

    // Delete from database
    const { error: dbError } = await supabase
      .from('sheet_music')
      .delete()
      .match({ id: itemId, user_id: userId })

    if (dbError) throw dbError
  } catch (error) {
    console.error('Error deleting sheet music:', error)
    throw error
  }
} 

export const fetchSheetMusic = async (userId: string): Promise<SheetMusicItem[]> => {
  try {
    const { data, error } = await supabase
      .from('sheet_music')
      .select('*')
      .eq('user_id', userId)
      .order('date_added', { ascending: false })

    if (error) throw error

    return data.map(item => ({
      id: item.id,
      title: item.title,
      composer: item.composer,
      pdfPath: item.pdf_url,
      isFavorite: item.is_favorite,
      dateAdded: new Date(item.date_added)
    }))
  } catch (error) {
    console.error('Error fetching sheet music:', error)
    throw error
  }
} 