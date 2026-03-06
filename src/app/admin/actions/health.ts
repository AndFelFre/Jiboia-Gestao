'use server'

import { requirePermission } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function getSystemHealth() {
    try {
        const _auth = await requirePermission('audit.read')
        const supabase = createServerSupabaseClient()

        // 1. Teste de Conexão DB
        const startTime = Date.now()
        const { error: dbError } = await supabase.from('organizations').select('id').limit(1)
        const latency = Date.now() - startTime

        // 2. Volumetria de Logs de Auditoria (últimas 24h)
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const { count: auditCount } = await supabase
            .from('audit_logs')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', yesterday)

        // 3. Alertas de Segurança (Tentativas de FORBIDDEN logadas)
        // Nota: Assumimos que o middleware ou requirePermission loga erros de segurança
        // Por enquanto, vamos pegar os logs de auditoria mais recentes
        const { data: recentLogs } = await supabase
            .from('audit_logs')
            .select('*, users(full_name)')
            .order('created_at', { ascending: false })
            .limit(5)

        // 4. Verificação de Tabelas Críticas
        const { error: tablesError } = await supabase.from('users').select('id', { count: 'exact', head: true })

        return {
            success: true,
            data: {
                dbStatus: dbError ? 'offline' : 'online',
                latency: `${latency}ms`,
                audit24h: auditCount || 0,
                recentLogs: recentLogs || [],
                integrity: tablesError ? 'compromised' : 'healthy',
                timestamp: new Date().toISOString()
            }
        }
    } catch (error: unknown) {
        const err = error as Error
        return { success: false, error: err.message }
    }
}

