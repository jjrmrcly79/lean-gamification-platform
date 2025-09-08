import { createBrowserClient } from '@supabase/ssr'
import { type Database } from './database.types' // 1. Importa los tipos

export function getSupabaseBrowserClient() {
  // 2. Pasa el tipo 'Database' al crear el cliente
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}