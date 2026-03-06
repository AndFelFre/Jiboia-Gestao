'use server'
import { requireAuth } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAudit } from '@/lib/supabase/audit'

interface ActionResult<T = unknown> {
    success: boolean
    data?: T
    error?: string
}

export interface Evaluation {
    id: string
    org_id: string
    user_id: string
    evaluator_id: string
    cycle_name: string
    status: 'draft' | 'open' | 'completed' | 'canceled'
    started_at: string
    completed_at: string | null
    created_at: string
    updated_at: string
    user?: {
        full_name: string
        email: string
    }
    evaluator?: {
        full_name: string
    }
}

export async function getEvaluations(): Promise<ActionResult<Evaluation[]>> {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from('evaluations')
            .select('*, user:users!evaluations_user_id_fkey(full_name, email), evaluator:users!evaluations_evaluator_id_fkey(full_name)')
            .eq('org_id', auth.orgId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return { success: true, data: data as Evaluation[] }
    } catch (error) {
        console.error('Erro em getEvaluations:', error)
        return { success: false, error: 'Erro ao buscar avaliações' }
    }
}

export async function createEvaluationCycle(formData: {
    userIds: string[]
    cycleName: string
}): Promise<ActionResult> {
    try {
        const auth = await requireAuth() // Idealmente requirePermission('performance.manage')
        const supabase = createServerSupabaseClient()

        const evaluations = formData.userIds.map(userId => ({
            org_id: auth.orgId,
            user_id: userId,
            evaluator_id: auth.userId, // Por padrão, quem cria avalia (pode ser alterado depois)
            cycle_name: formData.cycleName,
            status: 'open'
        }))

        const { error } = await supabase.from('evaluations').insert(evaluations)

        if (error) throw error
        return { success: true }
    } catch (_error) {
        return { success: false, error: 'Erro ao criar ciclo' }
    }
}

export async function getEvaluationById(id: string): Promise<ActionResult<Evaluation>> {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        // 1. Buscar a avaliação
        const { data: evaluation, error: evError } = await supabase
            .from('evaluations')
            .select(`
                *,
                user:users!evaluations_user_id_fkey(
                    id, 
                    full_name, 
                    email, 
                    position:positions(
                        id, 
                        title, 
                        skills:position_skills(
                            required_level,
                            skill:skills(id, name, category, description)
                        )
                    )
                ),
                evaluator:users!evaluations_evaluator_id_fkey(full_name),
                scores:evaluation_scores(skill_id, score, comments)
            `)
            .eq('id', id)
            .single()

        if (evError) throw evError
        if (auth.role !== 'admin' && evaluation.org_id !== auth.orgId) throw new Error('FORBIDDEN')

        return { success: true, data: evaluation as Evaluation }
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Erro em getEvaluationById:', error)
        return { success: false, error: err.message || 'Erro ao buscar avaliação' }
    }
}

export async function submitEvaluation(
    evaluationId: string,
    scores: { skill_id: string, score: number, comments?: string }[]
): Promise<ActionResult> {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        // Verificar permissão
        const { data: ev } = await supabase.from('evaluations').select('org_id, evaluator_id').eq('id', evaluationId).single()
        if (auth.role !== 'admin' && ev?.evaluator_id !== auth.userId) throw new Error('FORBIDDEN')

        // Salvar scores (upsert)
        const scoreData = scores.map(s => ({
            evaluation_id: evaluationId,
            skill_id: s.skill_id,
            score: s.score,
            comments: s.comments
        }))

        const { error: scoreError } = await supabase
            .from('evaluation_scores')
            .upsert(scoreData, { onConflict: 'evaluation_id, skill_id' })

        if (scoreError) throw scoreError

        // Atualizar status da avaliação
        const { error: statusError } = await supabase
            .from('evaluations')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', evaluationId)

        if (statusError) throw statusError

        await logAudit({
            tableName: 'evaluations',
            recordId: evaluationId,
            action: 'UPDATE',
            newValues: { status: 'completed' }
        })

        revalidatePath('/admin/performance/evaluations')
        return { success: true }
    } catch (error) {
        console.error('Erro em submitEvaluation:', error)
        return { success: false, error: 'Erro ao salvar avaliação' }
    }
}
