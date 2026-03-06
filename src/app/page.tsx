import { redirect } from 'next/navigation'
import { createServerSupabaseClientReadOnly } from '@/lib/supabase/server'

// Garante que a página não seja cacheada indevidamente
export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = createServerSupabaseClientReadOnly()
  const { data: { user } } = await supabase.auth.getUser()

  redirect(user ? '/dashboard' : '/login')
}
