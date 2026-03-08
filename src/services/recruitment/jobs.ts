'use server'

import { requirePermission, requireAuth } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidateTag } from 'next/cache'
import { sanitizeError } from '@/lib/utils'

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
    organizations?: { name: string }
    units?: { name: string }
    positions?: { title: string }
}

/**
 * Busca uma vaga por ID com isolamento multi-tenant.
 */
export async function getJobById(id: string): Promise<ActionResult<Job>> {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        let query = supabase
            .from('jobs')
            .select('*, organizations(name), units(name), positions(title)')
            .eq('id', id)
            .single()

        const { data, error } = await query

        if (error || !data) {
            console.error('[JobsService] Error fetching job:', error)
            return { success: false, error: 'Vaga não encontrada.' }
        }

        // Isolamento multi-tenant
        if (auth.role !== 'admin' && data.org_id !== auth.orgId) {
            return { success: false, error: 'Acesso negado.' }
        }

        return { success: true, data: data as Job }
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
 * Busca todas as vagas da organização com filtros opcionais.
 */
export async function getJobs(orgId?: string): Promise<ActionResult<Job[]>> {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        let query = supabase
            .from('jobs')
            .select('*, organizations(name), units(name), positions(title)')
            .order('created_at', { ascending: false })

        // Isolamento multi-tenant rigoroso
        if (auth.role !== 'admin') {
            query = query.eq('org_id', auth.orgId)
        } else if (orgId) {
            query = query.eq('org_id', orgId)
        }

        const { data, error } = await query

        if (error) {
            console.error('[JobsService] Error fetching jobs:', error)
            return { success: false, error: 'Erro ao buscar vagas no banco de dados.' }
        }

        return { success: true, data: data as Job[] }
    } catch (error: unknown) {
        return { success: false, error: sanitizeError(error) }
    }
}

/**
 * Cria uma nova vaga com auditoria e vínculo de organização.
 */
export async function createJob(formData: Partial<Job>): Promise<ActionResult<Job>> {
    try {
        const auth = await requirePermission('jobs.manage')
        const supabase = createServerSupabaseClient()

        const jobData = {
            ...formData,
            org_id: auth.orgId,
            created_by: auth.userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        const { data, error } = await supabase
            .from('jobs')
            .insert(jobData)
            .select()
            .single()

        if (error) {
            console.error('[JobsService] Error creating job:', error)
            return { success: false, error: 'Falha ao persistir nova vaga.' }
        }

        // Auditoria via Trigger Master (081) - logAudit é no-op
        revalidateTag('recruitment')

        return { success: true, data: data as Job }
    } catch (error: unknown) {
        return { success: false, error: sanitizeError(error) }
    }
}

/**
 * Atualiza uma vaga existente com validação de posse e auditoria.
 */
export async function updateJob(id: string, formData: Partial<Job>): Promise<ActionResult<Job>> {
    try {
        const auth = await requirePermission('jobs.manage')
        const supabase = createServerSupabaseClient()

        // Validar se a vaga pertence à organização (exceto superadmin)
        const { data: oldData } = await supabase.from('jobs').select('org_id').eq('id', id).single()

        if (!oldData) return { success: false, error: 'Vaga não encontrada.' }
        if (auth.role !== 'admin' && oldData.org_id !== auth.orgId) {
            return { success: false, error: 'Acesso negado: esta vaga pertence a outra organização.' }
        }

        const updatePayload = {
            ...formData,
            updated_at: new Date().toISOString()
        }

        const { data, error } = await supabase
            .from('jobs')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('[JobsService] Error updating job:', error)
            return { success: false, error: 'Erro ao atualizar dados da vaga.' }
        }

        // Auditoria via Trigger Master (081)
        revalidateTag('recruitment')

        return { success: true, data: data as Job }
    } catch (error: unknown) {
        return { success: false, error: sanitizeError(error) }
    }
}
