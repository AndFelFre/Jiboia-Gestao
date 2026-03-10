import { AuthContext, requireAuth } from '@/lib/supabase/auth'

interface TenantContext {
    targetOrgId: string
    auth: AuthContext
}

/**
 * Utilitário para resolver o contexto de organização (Multi-tenant).
 * 1. Prioriza o orgId passado via parâmetro (para Superadmins).
 * 2. Faz fallback para o orgId do usuário na sessão.
 * 3. Lança erro explícito se nenhum orgId for encontrado, prevenindo queries globais acidentais.
 */
export async function getTenantContext(explicitOrgId?: string): Promise<TenantContext> {
    const auth = await requireAuth()

    // Resolução do orgId
    const targetOrgId = explicitOrgId || auth.orgId

    if (!targetOrgId) {
        console.error(`[Security] Tentativa de acesso sem org_id identificado. User: ${auth.userId}`)
        throw new Error('CONTEXTO_ORGANIZACAO_NAO_IDENTIFICADO')
    }

    // Se o usuário não for 'admin' (global/super), ele SÓ pode ver a própria organização
    if (auth.role !== 'admin' && targetOrgId !== auth.orgId) {
        console.warn(`[Security] Usuário ${auth.userId} [${auth.orgId}] tentou acessar org ${targetOrgId}`)
        throw new Error('FORBIDDEN')
    }

    return { targetOrgId, auth }
}

/**
 * Helper para validar se o usuário tem permissão para operar em uma organização específica.
 */
export async function validateOrgAccess(orgId: string): Promise<void> {
    const auth = await requireAuth()

    if (auth.role !== 'admin' && auth.orgId !== orgId) {
        throw new Error('FORBIDDEN')
    }
}
