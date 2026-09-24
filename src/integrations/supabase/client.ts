import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { browserAuthStorage } from "./previewAuthStorage";

function createSupabaseClient() {
  // Vite exposes VITE_* variables to the browser. Keep legacy aliases so an
  // existing Vercel project can migrate its environment without breaking auth.
  const serverEnv = typeof process !== "undefined" ? process.env : undefined;
  const SUPABASE_URL =
    import.meta.env["VITE_SUPABASE_URL"] ||
    serverEnv?.["SUPABASE_URL"];

  const SUPABASE_KEY =
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    serverEnv?.["SUPABASE_PUBLISHABLE_KEY"];

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    const missing = [
      ...(!SUPABASE_URL ? ["VITE_SUPABASE_URL"] : []),
      ...(!SUPABASE_KEY ? ["VITE_SUPABASE_PUBLISHABLE_KEY"] : []),
    ];
    throw new Error(
      `Supabase não está configurado neste deployment. Variáveis em falta: ${missing.join(", ")}. Configure-as na Vercel e faça um novo deployment.`,
    );
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      storage: browserAuthStorage(),
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});
