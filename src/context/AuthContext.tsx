import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../config/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + (import.meta.env.DEV ? '' : '/partitura') + '/#/auth/callback'
        }
      })
      
      if (error) {
        console.error('Google sign-in error:', error)
        throw error
      }
      
      console.log('Google sign-in response:', data)
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      // Force user state update first
      setUser(null)

      // Clear all local storage
      localStorage.clear()
      sessionStorage.clear()

      // Try to sign out from Supabase, but don't wait for it
      supabase.auth.signOut().catch(error => {
        console.warn('Supabase sign out error:', error)
      })

      // If in Electron, navigate to login
      if (window.electron?.isElectron) {
        window.location.href = '/'
      } else {
        // In browser, force reload to clear any cached state
        window.location.reload()
      }
    } catch (error) {
      console.error('Error during logout:', error)
      // Even if there's an error, force a reload
      window.location.reload()
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 