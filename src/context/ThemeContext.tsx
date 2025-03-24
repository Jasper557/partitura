import React, { createContext, useContext, useEffect, useState } from 'react'
import { ThemeContextType } from '../types/index'
import { supabase } from '../config/supabase'
import { useAuth } from './AuthContext'

/**
 * Context for managing theme state across the application.
 * Provides dark mode state and toggle functionality.
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * Provider component that manages theme state and syncs with Supabase.
 * - Initializes with system preference
 * - Loads user preference when logged in
 * - Syncs changes to database
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with system preference
  const [isDarkMode, setIsDarkMode] = useState(() => 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  const { user } = useAuth()

  /**
   * Load user's theme preference from Supabase on login
   */
  useEffect(() => {
    const loadThemePreference = async () => {
      if (!user) return

      try {
        const { data: prefs, error } = await supabase
          .from('user_preferences')
          .select('theme')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error && error.code !== 'PGRST116') {
          console.warn('Failed to load theme preference:', error)
          return
        }

        if (prefs) {
          setIsDarkMode(prefs.theme === 'dark')
        } else {
          // Create initial preference
          await supabase.from('user_preferences').insert({
            user_id: user.id,
            theme: isDarkMode ? 'dark' : 'light'
          })
        }
      } catch (error) {
        console.error('Theme preference error:', error)
      }
    }

    loadThemePreference()
  }, [user])

  /**
   * Toggle theme and sync with database
   */
  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode
      
      if (user) {
        const { error } = await supabase
          .from('user_preferences')
          .update({ theme: newTheme ? 'dark' : 'light' })
          .eq('user_id', user.id)

        if (error) {
          console.error('Failed to update theme:', error)
          return
        }
      }

      setIsDarkMode(newTheme)
    } catch (error) {
      console.error('Theme toggle error:', error)
    }
  }

  /**
   * Apply theme to document
   */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook to access theme context
 * @throws {Error} When used outside of ThemeProvider
 */
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
} 