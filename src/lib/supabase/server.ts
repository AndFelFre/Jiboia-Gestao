import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis de ambiente do Supabase não configuradas.\n' +
      'Verifique se o arquivo .env.local existe e contém:\n' +
      'NEXT_PUBLIC_SUPABASE_URL=\n' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY='
  )
}

/**
 * Use em Route Handlers e Server Actions (onde cookies().set funciona).
 * Permite leitura e escrita de cookies (sessão).
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options)
        })
      },
    },
  })
}

/**
 * Use em Server Components (read-only).
 * Evita erros silenciosos e deixa intenção clara.
 * Server Components não conseguem setar cookies (por design do Next.js).
 */
export function createServerSupabaseClientReadOnly() {
  const cookieStore = cookies()

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll() {
        // Server Components não conseguem setar cookie (por design).
        // Esta função é intencionalmente vazia.
      },
    },
  })
}
