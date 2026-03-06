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

export interface Job {
    id: string
    org_id: string
    unit_id: string | null
    position_id: string | null
    title: string
    description: string | null
    requirements: string[] | null
    responsibilities: string[] | null
    location: string | null
    employment_type: string | null
    salary_min: number | null
    salary_max: number | null
    positions_count: number
    status: 'draft' | 'open' | 'paused' | 'closed'
    priority: 'low' | 'normal' | 'high' | 'urgent'
    sla_days: number
    created_by: string | null
    created_at: string
    updated_at: string
    closed_at: string | null
}

export async function getJobs(orgId?: string): Promise<ActionResult<Job[]>> {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        let query = supabase
            .from('jobs')
            .select('*, organizations(name), units(name), positions(title)')
            .order('created_at', { ascending: false })

        // Isolamento multi-tenant
        if (auth.role !== 'admin') {
            query = query.eq('org_id', auth.orgId)
        } else if (orgId) {
            query = query.eq('org_id', orgId)
        }

        const { data, error } = await query

        if (error) {
            console.error('Erro ao buscar vagas:', error)
            return { success: false, error: 'Erro ao buscar dados' }
        }

        return { success: true, data: data as Job[] }
    } catch (error: unknown) {
        console.error('Erro em getJobs:', getErrorMessage(error))
        return { success: false, error: sanitizeError(error) }
    }
}

export async function createJob(formData: Partial<Job>): Promise<ActionResult<Job>> {
    try {
        const auth = await requirePermission('jobs.manage')
        const supabase = createServerSupabaseClient()

        const jobData = {
            ...formData,
            org_id: auth.orgId, // Forçar org_id do usuário logado se não for admin
            created_by: auth.userId,
        }

        const { data, error } = await supabase
            .from('jobs')
            .insert(jobData)
            .select()
            .single()

        if (error) {
            console.error('Erro ao criar vaga:', error)
            return { success: false, error: 'Erro ao salvar vaga' }
        }

        await logAudit({
            tableName: 'jobs',
            recordId: data.id,
            action: 'INSERT',
            newValues: jobData,
        })

        revalidatePath('/admin/recruitment/jobs')
        return { success: true, data: data as Job }
    } catch (error: unknown) {
        console.error('Erro em createJob:', getErrorMessage(error))
        return { success: false, error: sanitizeError(error) }
    }
}

export async function updateJob(id: string, formData: Partial<Job>): Promise<ActionResult<Job>> {
    try {
        const auth = await requirePermission('jobs.manage')
        const supabase = createServerSupabaseClient()

        // Verificar se pertence Ã  mesma org
        const { data: oldData } = await supabase.from('jobs').select('org_id').eq('id', id).single()
        if (auth.role !== 'admin' && oldData?.org_id !== auth.orgId) {
            throw new Error('FORBIDDEN')
        }

        const { data, error } = await supabase
            .from('jobs')
            .update({ ...formData, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Erro ao atualizar vaga:', error)
            return { success: false, error: 'Erro ao atualizar' }
        }

        await logAudit({
            tableName: 'jobs',
            recordId: id,
            action: 'UPDATE',
            oldValues: oldData,
            newValues: formData,
        })

        revalidatePath('/admin/recruitment/jobs')
        return { success: true, data: data as Job }
    } catch (error: unknown) {
        console.error('Erro em updateJob:', getErrorMessage(error))
        return { success: false, error: sanitizeError(error) }
    }
}

