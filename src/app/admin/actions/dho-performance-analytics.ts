'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/supabase/auth'
import { getErrorMessage, sanitizeError } from '@/lib/utils'
import type { ActionResult, PerformanceOrgAnalytics } from '@/types'

/**
 * Busca analytics de performance organizacional agregados.
 * SEGURANÇA: Utilizamos a View Segura 'vw_performance_org_safe' que 
 * respeita o RLS via security_invoker, garantindo isolamento total de tenants.
 */
export async function getPerformanceOrganizationAnalytics(
    unitId?: string
): Promise<ActionResult<PerformanceOrgAnalytics[]>> {
    try {
        await requirePermission('performance.evaluate')
        const supabase = createServerSupabaseClient()

        // 2. Consulta à View Segura (Multi-tenancy garantido pelo banco)
        let query = supabase
            .from('vw_performance_org_safe')
            .select('*')

        if (unitId) {
            query = query.eq('unit_id', unitId)
        }

        const { data, error } = await query.order('period', { ascending: false })

        if (error) throw error

        return {
            success: true,
            data: data as PerformanceOrgAnalytics[]
        }
    } catch (error) {
        return {
            success: false,
            error: sanitizeError(error)
        }
    }
}

/**
 * Dispara o Refresh da Materialized View.
 * Apenas para ADMINS.
 */
export async function refreshPerformanceAnalytics(): Promise<ActionResult> {
    try {
        await requirePermission('org.manage') // Restrito a Admin
        const supabase = createServerSupabaseClient()

        // RPC para executar o comando SQL de refresh
        // Nota: O REFRESH CONCURRENTLY exige o índice único criado na migration 070.
        const { error } = await supabase.rpc('refresh_performance_view')

        if (error) throw error

        return { success: true }
    } catch (error) {
        return {
            success: false,
            error: sanitizeError(error)
        }
    }
}
