'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createSafeAction } from '@/lib/supabase/safe-action'
import { funnelActivitySchema, funnelInputSchema, getFunnelSchema } from '@/validations/funnel'
import { z } from 'zod'

// ==========================================
// 1. Administrar Atividades do Funil
// ==========================================

export const createFunnelActivity = createSafeAction(funnelActivitySchema, async (data, auth) => {
    // Fallback pra garantir role
    if (auth.role !== 'admin') {
        throw new Error('Apenas administradores podem criar atividades de funil.')
    }

    const supabase = createServerSupabaseClient()

    const { data: activity, error } = await supabase
        .from('funnel_activities')
        .insert({
            ...data,
            org_id: auth.orgId,
        })
        .select('*')
        .single()

    if (error) throw error

    revalidatePath('/admin/funnel')
    return activity
}, 'org.manage')

export const getFunnelActivities = createSafeAction(z.object({}), async (_, auth) => {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
        .from('funnel_activities')
        .select('*')
        .eq('org_id', auth.orgId)
        .eq('is_active', true)
        .order('sequence', { ascending: true })

    if (error) throw error
    return data
})

/**
 * Recupera o consolidado do funil para o dashboard
 */
export const getFunnelStats = createSafeAction(getFunnelSchema, async (data, auth) => {
    const supabase = createServerSupabaseClient()

    // Filtro básico por org_id (RLS cuida disso, mas explícito é melhor para performance em joins)
    const { data: stats, error } = await supabase
        .from('funnel_inputs')
        .select(`
            amount,
            input_date,
            funnel_activities ( name, sequence )
        `)
        .eq('org_id', auth.orgId)
        .gte('input_date', data.startDate || '1970-01-01')
        .lte('input_date', data.endDate || '2100-01-01')

    if (error) throw error
    return stats
})

// ==========================================
// 2. Registrar Input Diário (Colaborador)
// ==========================================

export const logFunnelInput = createSafeAction(funnelInputSchema, async (data, auth) => {
    const supabase = createServerSupabaseClient()

    // 1. Cross-tenant check for activity_id (RLS faria, mas validamos explicitamente para erro amigável)
    const { data: actData, error: actErr } = await supabase
        .from('funnel_activities')
        .select('org_id')
        .eq('id', data.activity_id)
        .single()

    if (actErr || actData?.org_id !== auth.orgId) {
        throw new Error('Atividade não encontrada ou não pertence à sua organização.')
    }

    const { data: result, error } = await supabase
        .from('funnel_inputs')
        .upsert({
            org_id: auth.orgId,
            user_id: auth.userId,
            activity_id: data.activity_id,
            input_date: data.input_date,
            amount: data.amount
        }, { onConflict: 'user_id, activity_id, input_date' })
        .select('*')
        .single()

    if (error) throw error

    revalidatePath('/dashboard/funnel')
    return result
}, 'pdi.manage')
