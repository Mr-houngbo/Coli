import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Visible only in DevTools; helps diagnose missing apikey header issues
  // Ensure you have a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart dev server
  console.warn(
    'Supabase env vars missing. Check .env.local for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Auth requests may fail with "No API key found in request".'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
