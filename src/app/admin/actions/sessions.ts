'use server'

import { requirePermission } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Recupera todas as sessões ativas da organização do administrador.
 */
export async function getActiveSessions() {
    try {
        const auth = await requirePermission('users.manage')
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from('active_sessions')
            .select('*')
            .eq('org_id', auth.orgId)
            .order('last_active_at', { ascending: false })

        if (error) {
            console.error('Erro ao buscar sessões:', error)
            throw new Error('Falha ao carregar sessões ativas')
        }

        return { success: true, data }
    } catch (error: unknown) {
        const err = error as Error;
        return { success: false, error: err.message }
    }
}

/**
 * Revoga uma sessão específica.
 */
export async function revokeSession(sessionId: string) {
    try {
        const auth = await requirePermission('users.manage')
        const supabase = createServerSupabaseClient()

        // Revoga chamando a função RPC que atua no schema auth
        const { error } = await supabase
            .rpc('revoke_user_session', { p_session_id: sessionId })

        if (error) {
            console.error('Erro ao revogar sessão:', error)
            throw new Error('Falha ao encerrar sessão')
        }

        revalidatePath('/admin/sessions')
        return { success: true }
    } catch (error: unknown) {
        const err = error as Error;
        return { success: false, error: err.message }
    }
}
