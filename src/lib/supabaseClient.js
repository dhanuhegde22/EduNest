import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate that URL looks like a real URL (starts with https://)
const isValidUrl = supabaseUrl && supabaseUrl.startsWith('https://')

if (!isValidUrl) {
  console.warn(
    '⚠️ EduNest: Supabase credentials not configured.\n' +
    'Please update your .env file with your Supabase Project URL and Anon Key.\n' +
    'Get them from: https://supabase.com/dashboard → Your Project → Settings → API'
  )
}

// Use a safe fallback so the app doesn't crash on module load
export const supabase = createClient(
  isValidUrl ? supabaseUrl : 'https://xyzcompany.supabase.co',
  supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key'
    ? supabaseAnonKey
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.ZopqoUt20nEV8rw6HtnRmaiXw'
)

export const isSupabaseConfigured = isValidUrl
