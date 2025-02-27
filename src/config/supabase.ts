import { createClient } from '@supabase/supabase-js'

// Use environment variables for sensitive data
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Determine if we're in Electron and development mode
const isElectron = window.electron?.isElectron
const isDev = import.meta.env.DEV

// Create Supabase client with appropriate configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
    storageKey: 'partitura-auth',
    debug: true
  },
  global: {
    headers: {
      'x-redirect-to': isElectron 
        ? (isDev ? 'http://localhost:5173/auth/callback' : 'app://./auth/callback') 
        : `${window.location.origin}/auth/callback`
    }
  }
})

// Helper function to get file public URL
export const getPublicUrl = (bucketName: string, path: string) => {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(path)
  return data.publicUrl
} 