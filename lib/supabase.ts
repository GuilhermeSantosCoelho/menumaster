import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Cria um cliente Supabase para uso no navegador
export const createSupabaseBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be defined")
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Cria um cliente Supabase para uso no servidor
export const createSupabaseServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase URL and Service Role Key must be defined")
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  })
}

// Cliente Supabase para uso no navegador (singleton)
let browserClient: ReturnType<typeof createSupabaseBrowserClient> | null = null

export const getSupabaseBrowserClient = () => {
  if (!browserClient) {
    browserClient = createSupabaseBrowserClient()
  }
  return browserClient
}

