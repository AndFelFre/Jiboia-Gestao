'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createSafeAction } from '@/lib/supabase/safe-action'
import { submitPulseSchema, getPulseSchema } from '@/validations/pulse'
import { z } from 'zod'

export interface PulseSurvey {
    id: string
    question: string
    category: string
}

/**
 * Busca pesquisas pulse ativas para o usuário
 */
export const getActivePulseSurveys = createSafeAction(getPulseSchema, async (data, auth) => {
    const { activeOnly } = data
    const supabase = createServerSupabaseClient()

    let query = supabase
        .from('pulse_surveys')
        .select('*')
        .eq('org_id', auth.orgId)

    if (activeOnly) {
        query = query.eq('is_active', true)
    }

    const { data: surveys, error } = await query
        .order('created_at', { ascending: false })

    if (error) throw error

    return surveys as PulseSurvey[]
})

/**
 * Envia uma resposta para uma pesquisa pulse
 */
export const submitPulseResponse = createSafeAction(submitPulseSchema, async (data, auth) => {
    const { surveyId, score } = data
    const supabase = createServerSupabaseClient()

    const { error } = await supabase
        .from('pulse_responses')
        .insert({
            survey_id: surveyId,
            user_id: auth.userId,
            org_id: auth.orgId,
            score
        })

    if (error) throw error

    revalidatePath('/dashboard')
    return { success: true }
})

/**
 * Cria uma pesquisa pulse padrão (Seed para demonstração)
 */
export const seedDefaultPulseSurvey = createSafeAction(z.object({}), async (_, auth) => {
    const supabase = createServerSupabaseClient()

    const { count } = await supabase
        .from('pulse_surveys')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', auth.orgId)

    if (count && count > 0) return { success: true }

    const { error } = await supabase
        .from('pulse_surveys')
        .insert({
            org_id: auth.orgId,
            question: 'Como você avalia sua produtividade e bem-estar nesta semana?',
            category: 'satisfacao'
        })

    if (error) throw error

    return { success: true }
})
