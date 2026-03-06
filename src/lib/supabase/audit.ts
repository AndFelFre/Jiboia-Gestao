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
            console.error('Erro ao salvar audit log:', error)
        }
    } catch (error) {
        console.error('Erro ao processar audit log:', error)
    }
}
