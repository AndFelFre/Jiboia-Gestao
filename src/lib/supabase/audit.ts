import { createServerSupabaseClient } from './server'
import { requireAuth } from './auth'

export async function logAudit(params: {
    tableName: string
    recordId: string
    action: 'INSERT' | 'UPDATE' | 'DELETE'
    oldValues?: any
    newValues?: any
}) {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        const { error } = await supabase.from('audit_logs').insert({
            table_name: params.tableName,
            record_id: params.recordId,
            action: params.action,
            old_values: params.oldValues,
            new_values: params.newValues,
            changed_by: auth.userId,
            org_id: auth.orgId,
        })

        if (error) {
            console.error(`[Audit] Erro ao gravar log para ${params.tableName}:`, {
                code: error.code,
                message: error.message,
                details: error.details
            })
        }
    } catch (error) {
        console.error('[Audit] Falha crítica ao processar auditoria:', error instanceof Error ? error.message : error)
    }
}
