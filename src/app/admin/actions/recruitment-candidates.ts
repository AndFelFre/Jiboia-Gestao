'use server'
import { requirePermission, requireAuth } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAudit } from '@/lib/supabase/audit'

interface ActionResult<T = unknown> {
    success: boolean
    data?: T
    error?: string
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    return String(error)
}

function sanitizeError(error: unknown): string {
    const message = getErrorMessage(error)
    if (message === 'UNAUTHORIZED') return 'Sessão expirada. Faça login novamente.'
    if (message === 'FORBIDDEN') return 'Você não tem permissão para realizar esta ação.'
    return 'Erro ao processar solicitação.'
}

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
}

export async function getCandidates(jobId?: string): Promise<ActionResult<Candidate[]>> {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        let query = supabase
            .from('candidates')
            .select('*, jobs(title)')
            .order('created_at', { ascending: false })

        // Isolamento multi-tenant
        if (auth.role !== 'admin') {
            query = query.eq('org_id', auth.orgId)
        }

        if (jobId) {
            query = query.eq('job_id', jobId)
        }

        const { data, error } = await query

        if (error) {
            console.error('Erro ao buscar candidatos:', error)
            return { success: false, error: 'Erro ao buscar dados' }
        }

        return { success: true, data: data as Candidate[] }
    } catch (error: unknown) {
        console.error('Erro em getCandidates:', getErrorMessage(error))
        return { success: false, error: sanitizeError(error) }
    }
}

export async function createCandidate(formData: Partial<Candidate>): Promise<ActionResult<Candidate>> {
    try {
        const auth = await requirePermission('candidates.manage')
        const supabase = createServerSupabaseClient()

        const candidateData = {
            ...formData,
            org_id: auth.orgId,
            stage: formData.stage || 'new',
            stage_changed_at: new Date().toISOString(),
        }

        const { data, error } = await supabase
            .from('candidates')
            .insert(candidateData)
            .select()
            .single()

        if (error) {
            console.error('Erro ao criar candidato:', error)
            return { success: false, error: 'Erro ao salvar candidato' }
        }

        await logAudit({
            tableName: 'candidates',
            recordId: data.id,
            action: 'INSERT',
            newValues: candidateData,
        })

        revalidatePath('/admin/recruitment/kanban')
        return { success: true, data: data as Candidate }
    } catch (error: unknown) {
        console.error('Erro em createCandidate:', getErrorMessage(error))
        return { success: false, error: sanitizeError(error) }
    }
}

export async function updateCandidateStage(
    candidateId: string,
    newStage: string
): Promise<ActionResult> {
    try {
        const auth = await requirePermission('candidates.manage')
        const supabase = createServerSupabaseClient()

        // Verificar posse
        const { data: oldData } = await supabase.from('candidates').select('org_id, stage').eq('id', candidateId).single()
        if (auth.role !== 'admin' && oldData?.org_id !== auth.orgId) {
            throw new Error('FORBIDDEN')
        }

        const { error } = await supabase
            .from('candidates')
            .update({
                stage: newStage,
                stage_changed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', candidateId)

        if (error) {
            console.error('Erro ao atualizar etapa:', error)
            return { success: false, error: 'Erro ao atualizar' }
        }

        await logAudit({
            tableName: 'candidates',
            recordId: candidateId,
            action: 'UPDATE',
            oldValues: { stage: oldData?.stage },
            newValues: { stage: newStage },
        })

        revalidatePath('/admin/recruitment/kanban')
        return { success: true }
    } catch (error: unknown) {
        console.error('Erro em updateCandidateStage:', getErrorMessage(error))
        return { success: false, error: sanitizeError(error) }
    }
}

export async function getCandidateById(id: string): Promise<ActionResult<Candidate>> {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from('candidates')
            .select('*, jobs(title)')
            .eq('id', id)
            .single()

        if (error) throw error
        if (auth.role !== 'admin' && data.org_id !== auth.orgId) throw new Error('FORBIDDEN')

        return { success: true, data: data as Candidate }
    } catch (error: unknown) {
        return { success: false, error: sanitizeError(error) }
    }
}
