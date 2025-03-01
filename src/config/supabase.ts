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

// Configure auth URLs
const site = isDev ? 'http://localhost:5173' : 'https://jasper557.github.io/partitura'
const redirectTo = `${site}${isDev ? '' : '/partitura'}`

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
      'x-client-info': 'partitura',
      'x-site-url': site,
      'x-redirect-to': redirectTo
    }
  }
})

// Helper function to get file public URL
export const getPublicUrl = (bucketName: string, path: string) => {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(path)
  return data.publicUrl
} 