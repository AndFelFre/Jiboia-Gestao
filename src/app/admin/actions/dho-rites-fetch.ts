'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth'
import type { PDIItem, ActionResult } from '@/types'

/**
 * Busca todos os ritos de liderança associados aos planos do colaborador.
 */
export async function getUserLeadershipRites(userId: string): Promise<ActionResult<PDIItem[]>> {
    try {
        await requireAuth()
        const supabase = createServerSupabaseClient()

        // 1. Busca os planos de rito do usuário
        const { data: plans } = await supabase
            .from('pdi_plans')
            .select('id')
            .eq('user_id', userId)
            .eq('plan_type', 'leadership_rites')

        if (!plans || plans.length === 0) {
            return { success: true, data: [] }
        }

        const planIds = plans.map(p => p.id)

        // 2. Busca os itens desse plano que sejam categoria 'leadership_rite'
        const { data: rites, error } = await supabase
            .from('pdi_items')
            .select('*')
            .in('plan_id', planIds)
            .eq('category', 'leadership_rite')
            .order('deadline', { ascending: false })

        if (error) throw error

        return { success: true, data: rites || [] }
    } catch (error: any) {
        console.error('Erro em getUserLeadershipRites:', error)
        return { success: false, error: error.message }
    }
}
