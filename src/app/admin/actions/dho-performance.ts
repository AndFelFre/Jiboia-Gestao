'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth'
import type { ActionResult, PerformanceEvaluation, PDIItem, NineBoxQuadrant } from '@/types'
import { revalidatePath } from 'next/cache'

/**
 * Função determinística para converter Desempenho (RUA + SMART) em bucket 1-3.
 */
function calculatePerformanceBucket(ruaMean: number, smartProgress: number, hasSmart: boolean): number {
    if (!hasSmart) {
        if (ruaMean < 3.0) return 1
        if (ruaMean >= 4.5) return 3
        return 2
    }

    // Bucket 1 (Abaixo): RUA < 3.0 OU SMART < 50%
    if (ruaMean < 3.0 || smartProgress < 0.5) return 1

    // Bucket 3 (Supera): RUA >= 4.5 E SMART >= 90%
    if (ruaMean >= 4.5 && smartProgress >= 0.9) return 3

    // Bucket 2 (Atende): Todos os outros casos
    return 2
}

/**
 * Mapeia o cruzamento Performance x Potencial para o Quadrante 9-Box.
 */
function calculateNineBoxQuadrant(performance: number, potential: number): NineBoxQuadrant {
    const matrix: Record<string, NineBoxQuadrant> = {
        '1-3': 'dilemma',
        '2-3': 'rising_star',
        '3-3': 'star',
        '1-2': 'questionable',
        '2-2': 'critical_keeper',
        '3-2': 'future_star',
        '1-1': 'risk',
        '2-1': 'effective_specialist',
        '3-1': 'solid_professional'
    }
    return matrix[`${performance}-${potential}`] || 'questionable'
}

/**
 * Busca a avaliação atual (ou última) de um colaborador.
 * Aplica regras de visibilidade (colaborador não vê draft nem dados de calibração estratégica).
 */
export async function getEvaluationForUser(userId: string): Promise<ActionResult<PerformanceEvaluation | null>> {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        let query = supabase
            .from('performance_evaluations')
            .select(`
        *,
        smart_goals:pdi_items (*)
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)

        const { data: evalData, error } = await query.single()

        if (error && error.code !== 'PGRST116') throw error
        if (!evalData) return { success: true, data: null }

        const isLeader = evalData.leader_id === auth.userId
        const isOwner = evalData.user_id === auth.userId
        const isAdmin = auth.role === 'admin'

        // Filtro de Visibilidade
        if (!isAdmin && !isLeader) {
            if (isOwner) {
                // Colaborador vendo o próprio perfil:
                // 1. Não vê draft nem cancelled
                if (evalData.status === 'draft' || evalData.status === 'cancelled') {
                    return { success: true, data: null }
                }
                // 2. PRIVACIDADE: Oculta campos de calibração estratégica
                const {
                    potential_score,
                    potential_comments,
                    performance_bucket,
                    nine_box_quadrant,
                    calibrated_at,
                    calibrated_by,
                    ...safeData
                } = evalData
                return { success: true, data: safeData as PerformanceEvaluation }
            }
            return { success: false, error: 'Acesso negado' }
        }

        return { success: true, data: evalData as PerformanceEvaluation }
    } catch (error: any) {
        console.error('Erro em getEvaluationForUser:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Inicia um novo ciclo de avaliação.
 */
export async function createEvaluationCycle(
    userId: string,
    periodStart: string,
    periodEnd: string
): Promise<ActionResult<PerformanceEvaluation>> {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from('performance_evaluations')
            .insert({
                org_id: auth.orgId,
                user_id: userId,
                leader_id: auth.userId,
                reference_period_start: periodStart,
                reference_period_end: periodEnd,
                status: 'draft'
            })
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                return { success: false, error: 'Este colaborador já possui um ciclo de avaliação ativo.' }
            }
            throw error
        }

        revalidatePath(`/admin/users/${userId}`)
        return { success: true, data: data as PerformanceEvaluation }
    } catch (error: any) {
        console.error('Erro em createEvaluationCycle:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Atualiza notas RUA, Potencial e comentários.
 */
export async function updateEvaluationRUA(
    evaluationId: string,
    data: {
        resilience?: number
        utility?: number
        ambition?: number
        potential_score?: number
        potential_comments?: string
        rua_comments?: string
        overall_comments?: string
        status?: 'in_progress' | 'draft'
    }
): Promise<ActionResult<void>> {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        const { error } = await supabase
            .from('performance_evaluations')
            .update({
                rua_resilience: data.resilience,
                rua_utility: data.utility,
                rua_ambition: data.ambition,
                potential_score: data.potential_score,
                potential_comments: data.potential_comments,
                rua_comments: data.rua_comments,
                overall_comments: data.overall_comments,
                status: data.status,
                updated_at: new Date().toISOString()
            })
            .eq('id', evaluationId)
            .eq('leader_id', auth.userId)

        if (error) throw error

        revalidatePath(`/admin/users`)
        return { success: true }
    } catch (error: any) {
        console.error('Erro em updateEvaluationRUA:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Adiciona uma meta SMART vinculada ao ciclo no PDI.
 */
export async function addEvaluationSmartGoal(
    evaluationId: string,
    userId: string,
    goal: {
        title: string
        description?: string
        deadline?: string
    }
): Promise<ActionResult<PDIItem>> {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        const { data: plan, error: planError } = await supabase
            .from('pdi_plans')
            .select('id')
            .eq('user_id', userId)
            .eq('status', 'active')
            .eq('plan_type', 'development')
            .single()

        if (planError) throw new Error('Colaborador não possui um plano de PDI ativo.')

        const { data, error } = await supabase
            .from('pdi_items')
            .insert({
                plan_id: plan.id,
                performance_evaluation_id: evaluationId,
                title: goal.title,
                description: goal.description,
                deadline: goal.deadline,
                category: 'smart_goal',
                status: 'not_started'
            })
            .select()
            .single()

        if (error) throw error

        revalidatePath(`/admin/users/${userId}`)
        return { success: true, data: data as PDIItem }
    } catch (error: any) {
        console.error('Erro em addEvaluationSmartGoal:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Finaliza o ciclo de avaliação e gera o SNAPSHOT da calibração (9-Box).
 */
export async function closeEvaluationCycle(evaluationId: string): Promise<ActionResult<void>> {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        // 1. Buscar os dados atuais do ciclo e suas metas SMART
        const { data: evalData, error: fetchError } = await supabase
            .from('performance_evaluations')
            .select('*, smart_goals:pdi_items(*)')
            .eq('id', evaluationId)
            .single()

        if (fetchError) throw fetchError
        if (!evalData.potential_score) {
            return { success: false, error: 'A nota de Potencial é obrigatória para calibrar e fechar o ciclo.' }
        }

        // 2. Calcular Performance Bucket (X)
        const ruaMean = (evalData.rua_resilience + evalData.rua_utility + evalData.rua_ambition) / 3
        const smartGoals = evalData.smart_goals || []
        const hasSmart = smartGoals.length > 0
        const completedSmart = smartGoals.filter((g: any) => g.status === 'completed').length
        const smartProgress = hasSmart ? completedSmart / smartGoals.length : 0

        const perfBucket = calculatePerformanceBucket(ruaMean, smartProgress, hasSmart)

        // 3. Determinar Quadrante 9-Box
        const quadrant = calculateNineBoxQuadrant(perfBucket, evalData.potential_score)

        // 4. Salvar Snapshot e Fechar
        const { error } = await supabase
            .from('performance_evaluations')
            .update({
                status: 'closed',
                closed_at: new Date().toISOString(),
                closed_by: auth.userId,
                final_evaluator_id: auth.userId,      -- Snapshot: Quem fechou
                manager_at_closure_id: evalData.leader_id, --Snapshot: Líder no momento
                performance_bucket: perfBucket,
                nine_box_quadrant: quadrant,
                calibrated_at: new Date().toISOString(),
                calibrated_by: auth.userId
            })
            .eq('id', evaluationId)
        .eq('leader_id', auth.userId)

    if (error) throw error

    revalidatePath(`/admin/users`)
    return { success: true }
} catch (error: any) {
    console.error('Erro em closeEvaluationCycle:', error)
    return { success: false, error: error.message }
}
}

/**
 * Recupera dados para a Matriz 9-Box Organizacional.
 */
export async function getNineBoxMatrixData(): Promise<ActionResult<PerformanceEvaluation[]>> {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        if (auth.role !== 'admin' && auth.role !== 'leader') {
            return { success: false, error: 'Acesso restrito ao RH e Liderança' }
        }

        const { data, error } = await supabase
            .from('performance_evaluations')
            .select(`
        *,
        users:user_id (full_name, avatar_url, email)
      `)
            .eq('status', 'closed')
            .not('nine_box_quadrant', 'is', null)

        if (error) throw error

        return { success: true, data: data as any[] }
    } catch (error: any) {
        console.error('Erro em getNineBoxMatrixData:', error)
        return { success: false, error: error.message }
    }
}
