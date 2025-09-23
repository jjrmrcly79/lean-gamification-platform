// lib/supabase-client.ts

import { createBrowserClient } from '@supabase/ssr'

// --- CORRECCIÓN FINAL: Cambia esta línea para apuntar al archivo correcto ---
import { Database } from './database.types'

export function getSupabaseBrowserClient() {
  // Pasa el tipo <Database> al cliente
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}