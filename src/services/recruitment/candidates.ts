'use server'

import { requirePermission, requireAuth } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAudit } from '@/lib/supabase/audit'
import { sanitizeError } from '@/lib/utils'

export interface Candidate {
    id: string
    job_id: string
    org_id: string
    full_name: string
    email: string
    phone: string | null
    linkedin_url: string | null
    portfolio_url: string | null
    resume_url: string | null
    source: string | null
    stage: string
    stage_changed_at: string
    fit_score: number | null
    notes: string | null
    created_at: string
    updated_at: string
    jobs?: { title: string }
}

/**
 * Busca um candidato por ID com isolamento multi-tenant.
 */
export async function getCandidateById(id: string): Promise<ActionResult<Candidate>> {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        let query = supabase
            .from('candidates')
            .select('*, jobs(title)')
            .eq('id', id)
            .single()

        const { data, error } = await query

        if (error || !data) {
            console.error('[CandidatesService] Error fetching candidate:', error)
            return { success: false, error: 'Candidato não encontrado.' }
        }

        // Isolamento multi-tenant
        if (auth.role !== 'admin' && data.org_id !== auth.orgId) {
            return { success: false, error: 'Acesso negado.' }
        }

        return { success: true, data: data as Candidate }
    } catch (error: unknown) {
        return { success: false, error: sanitizeError(error) }
    }
}

interface ActionResult<T = unknown> {
    success: boolean
    data?: T
    error?: string
}

/**
 * Busca candidatos com isolamento multi-tenant.
 */
export async function getCandidates(jobId?: string): Promise<ActionResult<Candidate[]>> {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        let query = supabase
            .from('candidates')
            .select('*, jobs(title)')
            .order('created_at', { ascending: false })

        if (auth.role !== 'admin') {
            query = query.eq('org_id', auth.orgId)
        }

        if (jobId) query = query.eq('job_id', jobId)

        const { data, error } = await query

        if (error) {
            console.error('[CandidatesService] Error fetching candidates:', error)
            return { success: false, error: 'Erro ao buscar candidatos.' }
        }

        return { success: true, data: data as Candidate[] }
    } catch (error: unknown) {
        return { success: false, error: sanitizeError(error) }
    }
}

/**
 * Transição de estágio via Máquina de Estados Dinâmica.
 */
export async function transitionCandidate(candidateId: string, newStage: string): Promise<ActionResult> {
    try {
        const auth = await requirePermission('candidates.manage')
        const supabase = createServerSupabaseClient()

        // 1. Validar posse e estágio atual
        const { data: candidate, error: fetchError } = await supabase
            .from('candidates')
            .select('org_id, stage, full_name, job_id')
            .eq('id', candidateId)
            .single()

        if (fetchError || !candidate) return { success: false, error: 'Candidato não encontrado.' }
        if (auth.role !== 'admin' && candidate.org_id !== auth.orgId) {
            return { success: false, error: 'Acesso negado.' }
        }

        // 2. Máquina de Estados Dinâmica (Configurável por Org)
        // Buscamos as configurações da organização para validar se a transição é permitida
        const { data: orgSettings } = await supabase
            .from('recruitment_settings')
            .select('workflow_type, flow_rules')
            .eq('org_id', candidate.org_id)
            .single()

        const workflowType = orgSettings?.workflow_type || 'standard'

        // Regra de Ouro: Não permitir Hired sem passar por estágios de avaliação no fluxo 'standard'
        const evaluationStages = ['interview_1', 'interview_2', 'technical', 'cultural']
        const isEvaluationStage = (s: string) => evaluationStages.includes(s)

        if (workflowType === 'standard' && newStage === 'hired') {
            const { count: evalCount } = await supabase
                .from('interviews')
                .select('*', { count: 'exact', head: true })
                .eq('candidate_id', candidateId)

            if (!evalCount || evalCount === 0) {
                return {
                    success: false,
                    error: 'Violação de Workflow: Este candidato não possui avaliações técnicas ou entrevistas registradas.'
                }
            }
        }

        // 3. Executar transição
        const updatePayload = {
            stage: newStage,
            stage_changed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        const { error: updateError } = await supabase
            .from('candidates')
            .update(updatePayload)
            .eq('id', candidateId)

        if (updateError) {
            console.error('[CandidatesService] Transition error:', updateError)
            return { success: false, error: 'Falha na atualização de estágio no banco de dados.' }
        }

        // 4. Auditoria rica (quem, quando, o que e qual papel)
        await logAudit({
            tableName: 'candidates',
            recordId: candidateId,
            action: 'UPDATE',
            oldValues: { stage: candidate.stage },
            newValues: {
                stage: newStage,
                _executor_role: auth.role,
                _org_id: candidate.org_id,
                _candidate_name: candidate.full_name
            },
        })

        revalidatePath('/admin/recruitment/kanban')
        revalidatePath(`/admin/recruitment/jobs/${candidate.job_id}`)
        revalidatePath('/recruitment')

        return { success: true }
    } catch (error: unknown) {
        return { success: false, error: sanitizeError(error) }
    }
}

/**
 * Cria um novo candidato com auditoria.
 */
export async function createCandidate(formData: Partial<Candidate>): Promise<ActionResult<Candidate>> {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        const candidateData = {
            ...formData,
            org_id: auth.orgId,
            stage: formData.stage || 'new',
            stage_changed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        const { data, error } = await supabase
            .from('candidates')
            .insert(candidateData)
            .select()
            .single()

        if (error) {
            console.error('[CandidatesService] Error creating candidate:', error)
            return { success: false, error: 'Erro ao cadastrar candidato.' }
        }

        await logAudit({
            tableName: 'candidates',
            recordId: data.id,
            action: 'INSERT',
            newValues: { ...candidateData, _executor_role: auth.role },
        })

        revalidatePath('/admin/recruitment/kanban')
        revalidatePath(`/admin/recruitment/jobs/${formData.job_id}`)

        return { success: true, data: data as Candidate }
    } catch (error: unknown) {
        return { success: false, error: sanitizeError(error) }
    }
}

/**
 * Gera uma URL assinada temporária para visualização do currículo.
 * O bucket 'resumes' é privado por segurança.
 */
export async function getResumeSignedUrl(path: string): Promise<ActionResult<string>> {
    try {
        await requirePermission('candidates.manage')
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase.storage
            .from('resumes')
            .createSignedUrl(path, 3600) // Válido por 1 hora

        if (error || !data) {
            console.error('[CandidatesService] Error creating signed URL:', error)
            return { success: false, error: 'Erro ao gerar link do currículo.' }
        }

        return { success: true, data: data.signedUrl }
    } catch (error: unknown) {
        return { success: false, error: sanitizeError(error) }
    }
}

