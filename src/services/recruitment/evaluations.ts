'use server'

import { requirePermission } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidateTag } from 'next/cache'
import { sanitizeError } from '@/lib/utils'

export interface Interview {
    id: string
    candidate_id: string
    interviewer_id: string
    type: string
    star_situation: string | null
    star_task: string | null
    star_action: string | null
    star_result: string | null
    fit_integrity: number | null
    fit_focus: number | null
    fit_learning: number | null
    fit_challenge: number | null
    fit_communication: number | null
    fit_service: number | null
    fit_persistence: number | null
    final_score: number | null
    justification: string
    recommendation: string | null
    next_steps: string | null
    conducted_at: string
    users?: { full_name: string }
}

interface ActionResult<T = unknown> {
    success: boolean
    data?: T
    error?: string
}

/**
 * Registra uma entrevista com recálculo de score no servidor (Zero Trust).
 */
export async function evaluateCandidate(formData: Partial<Interview>): Promise<ActionResult<Interview>> {
    try {
        const auth = await requirePermission('interviews.manage')
        const supabase = createServerSupabaseClient()

        // 1. Coletar scores para recálculo determinístico
        const fitScores = [
            formData.fit_integrity,
            formData.fit_focus,
            formData.fit_learning,
            formData.fit_challenge,
            formData.fit_communication,
            formData.fit_service,
            formData.fit_persistence,
        ].filter(s => s !== null && s !== undefined) as number[]

        // 2. Cálculo no servidor (Não confia no valor enviado pelo cliente)
        // Nota: O banco de dados deve estar tipado como NUMERIC para suportar essa precisão
        const rawScore = fitScores.length > 0
            ? fitScores.reduce((a, b) => a + b, 0) / fitScores.length
            : 0

        // Aplicação de Number.EPSILON para arredondamento seguro em JS antes da persistência
        const finalScore = Math.round((rawScore + Number.EPSILON) * 100) / 100

        const evalData = {
            ...formData,
            interviewer_id: auth.userId,
            final_score: finalScore,
            conducted_at: new Date().toISOString(),
        }

        const { data, error } = await supabase
            .from('interviews')
            .insert(evalData)
            .select()
            .single()

        if (error) {
            console.error('[EvaluationsService] Error saving evaluation:', error)
            return { success: false, error: 'Erro ao salvar avaliação técnica.' }
        }

        // Auditoria via Trigger Master (081)
        revalidateTag('recruitment')

        return { success: true, data: data as Interview }
    } catch (error: unknown) {
        return { success: false, error: sanitizeError(error) }
    }
}

/**
 * Busca histórico de entrevistas de um candidato.
 */
export async function getInterviews(candidateId?: string): Promise<ActionResult<Interview[]>> {
    try {
        const supabase = createServerSupabaseClient()

        let query = supabase
            .from('interviews')
            .select('*, users(full_name)')
            .order('conducted_at', { ascending: false })

        if (candidateId) {
            query = query.eq('candidate_id', candidateId)
        }

        const { data, error } = await query

        if (error) {
            console.error('[EvaluationsService] Error fetching interviews:', error)
            return { success: false, error: 'Erro ao buscar histórico de entrevistas.' }
        }

        return { success: true, data: data as Interview[] }
    } catch (error: unknown) {
        return { success: false, error: sanitizeError(error) }
    }
}
