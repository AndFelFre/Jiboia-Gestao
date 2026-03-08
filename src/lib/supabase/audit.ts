import { createServerSupabaseClient } from './server'
import { requireAuth } from './auth'

/**
 * Remove campos de ruído do snapshot de auditoria para economizar storage e I/O.
 */
function sanitizePayload(obj: any) {
    if (!obj || typeof obj !== 'object') return obj

    // Lista de campos que não agregam valor analítico no log histórico
    const noiseFields = ['updated_at', 'created_at', 'org_id', 'id']

    const clean = { ...obj }
    noiseFields.forEach(field => delete clean[field])

    return clean
}

/**
 * @deprecated Auditoria agora é Trigger-Only (Migration 081).
 * Todas as mutações no banco disparam automaticamente o log de auditoria Delta.
 * 
 * Utilize 'setAuditContext' se precisar passar motivos de alteração ou metadados extras.
 */
export async function logAudit(params: {
    tableName: string
    recordId: string
    action: 'INSERT' | 'UPDATE' | 'DELETE'
    oldValues?: any
    newValues?: any
}) {
    // No-op para compatibilidade retroativa durante a transição.
    // O Trigger no banco já capturou a ação.
    console.debug(`[Audit-Bypass] Ação em ${params.tableName} interceptada pelo Trigger Master.`);
}

/**
 * Define o contexto de auditoria para a transação atual.
 * Permite passar o motivo da alteração que será capturado pelo trigger no banco.
 */
export async function setAuditContext(reason: string) {
    try {
        const supabase = createServerSupabaseClient();
        // Seta variável de sessão do Postgres
        await supabase.rpc('set_session_context', { key: 'app.audit_reason', value: reason });
    } catch (error) {
        console.error('[Audit-Context] Falha ao definir contexto:', error);
    }
}
