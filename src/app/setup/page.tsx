import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClientReadOnly } from '@/lib/supabase/server'
import SetupClient from './SetupClient'

export const dynamic = 'force-dynamic'

export default async function SetupPage() {
  // DEV ONLY: não deixa isso existir em produção
  if (process.env.NODE_ENV !== 'development') {
    notFound()
  }

  // Exige login
  const supabase = createServerSupabaseClientReadOnly()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  return <SetupClient />
}
