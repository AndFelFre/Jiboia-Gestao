'use server'

import { requirePermission } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'

interface AuditFilters {
    table?: string
    action?: string
    changedBy?: string
    page?: number
    limit?: number
}

export async function getAuditLogs(filters: AuditFilters = {}) {
    try {
        const auth = await requirePermission('audit.read')
        const supabase = createServerSupabaseClient()

        const limit = filters.limit || 50
        const page = filters.page || 1
        const from = (page - 1) * limit
        const to = from + limit - 1

        let query = supabase
            .from('audit_logs')
            .select('*, changed_by_user:users!changed_by(full_name, email)', { count: 'exact' })
            .eq('org_id', auth.orgId)
            .order('created_at', { ascending: false })
            .range(from, to)

        if (filters.table) {
            query = query.eq('table_name', filters.table)
        }
        if (filters.action) {
            query = query.eq('action', filters.action)
        }
        if (filters.changedBy) {
            query = query.eq('changed_by', filters.changedBy)
        }

        const { data, error, count } = await query

        if (error) {
            console.error('[Action: getAuditLogs] Erro:', error.message)
            return { success: false, error: 'Erro ao carregar logs de auditoria' }
        }

        return {
            success: true,
            data,
            pagination: {
                total: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit)
            }
        }
    } catch (error: unknown) {
        console.error('Erro em getAuditLogs:', error)
        const message = error instanceof Error ? error.message : String(error)

        if (message === 'UNAUTHORIZED') return { success: false, error: 'Sessão expirada. Faça login novamente.' }
        if (message === 'FORBIDDEN') return { success: false, error: 'Você não tem permissão para ler logs de auditoria.' }

        return { success: false, error: `Erro: ${message}` }
    }
}

