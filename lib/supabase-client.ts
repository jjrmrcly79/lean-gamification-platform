import { createBrowserClient } from '@supabase/ssr'

// Esta variable guardará la conexión para no tener que crearla múltiples veces.
let client: ReturnType<typeof createBrowserClient> | undefined;

export function getSupabaseBrowserClient() {
  if (client) {
    return client;
  }

  // Si no existe una conexión, la crea.
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return client;
}