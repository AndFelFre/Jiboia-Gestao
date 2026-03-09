import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // Se o 'next' não estiver presente, enviamos para o dashboard por padrão
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = createServerSupabaseClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // O origin pode ser localhost ou o domínio da Vercel
            return NextResponse.redirect(`${origin}${next}`)
        }

        console.error('❌ [Auth Callback] Erro ao trocar código por sessão:', error.message)
    }

    // Se falhar, manda para o login com erro amigável
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
