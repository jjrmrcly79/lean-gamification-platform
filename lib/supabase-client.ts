// lib/supabase-client.ts
import { createClient as _createClient } from "@supabase/supabase-js";
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
// lib/supabase-client.ts


const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Si quieres instancia nueva en cada llamada (broadcast simple):
export function createClient() {
  return _createClient(url, anon, { auth: { persistSession: false } });
}

// Si además quieres un singleton opcional:
let _singleton: ReturnType<typeof _createClient> | null = null;
export function getClient() {
  if (_singleton) return _singleton;
  _singleton = _createClient(url, anon, { auth: { persistSession: false } });
  return _singleton;
}
