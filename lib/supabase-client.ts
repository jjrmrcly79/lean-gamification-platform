import { createClient as _createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import { Database } from "./database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// --- Cliente para navegador (útil en componentes con 'use client') ---
export function getSupabaseBrowserClient() {
  return createBrowserClient<Database>(url, anon);
}

// --- Crear nueva instancia (uso puntual) ---
export function createClient() {
  return _createClient(url, anon, { auth: { persistSession: false } });
}

// --- Singleton (instancia única en toda la app) ---
let _singleton: ReturnType<typeof _createClient> | null = null;
export function getClient() {
  if (_singleton) return _singleton;
  _singleton = _createClient(url, anon, { auth: { persistSession: false } });
  return _singleton;
}

// ✅ Exporta una instancia lista para importar donde quieras
export const supabase = getClient();
