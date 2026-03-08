import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidateTag } from 'next/cache'

/**
 * Route Handler para Refresh de Analytics (Orquestrador Vercel Cron)
 * Segurança: Exige CRON_SECRET via Bearer token.
 */
export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization')
        const cronSecret = process.env.CRON_SECRET

        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const supabase = createServerSupabaseClient()

        // 1. Disparar Refresh no Banco (Materialized View)
        // O banco executa REFRESH MATERIALIZED VIEW CONCURRENTLY
        const { error } = await supabase.rpc('refresh_performance_view')

        if (error) {
            console.error('[CRON ANALYTICS] Database RPC Error:', error)
            return new NextResponse(`Database Error: ${error.message}`, { status: 500 })
        }

        // 2. Invalidar Cache do App Router
        // Garante que o front-end carregue os dados novos na próxima requisição
        revalidateTag('analytics-bi')

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            message: 'Analytics refreshed and cache invalidated'
        })
    } catch (error: any) {
        console.error('[CRON ANALYTICS] Unexpected Error:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
