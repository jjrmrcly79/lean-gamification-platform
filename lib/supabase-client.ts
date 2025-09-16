// lib/supabase-client.ts

import { createBrowserClient } from '@supabase/ssr'
// --- CAMBIO IMPORTANTE: Importa tus nuevos tipos ---
import { Database } from '@/types/supabase' // Asegúrate de que la ruta sea correcta

export function getSupabaseBrowserClient() {
  // --- CAMBIO IMPORTANTE: Pasa el tipo <Database> al cliente ---
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}