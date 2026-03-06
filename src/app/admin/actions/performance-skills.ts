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

export interface Skill {
    id: string
    org_id: string
    name: string
    category: 'hard_skill' | 'soft_skill'
    description: string | null
    created_at: string
    updated_at: string
}

export async function getSkills(): Promise<ActionResult<Skill[]>> {
    try {
        const _auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from('skills')
            .select('*')
            .eq('org_id', _auth.orgId)
            .order('name', { ascending: true })

        if (error) throw error
        return { success: true, data: data as Skill[] }
    } catch (_error) {
        return { success: false, error: 'Erro ao buscar competências' }
    }
}

export async function createSkill(formData: Partial<Skill>): Promise<ActionResult<Skill>> {
    try {
        const auth = await requirePermission('skills.manage')
        const supabase = createServerSupabaseClient()

        const skillData = {
            ...formData,
            org_id: auth.orgId
        }

        const { data, error } = await supabase
            .from('skills')
            .insert(skillData)
            .select()
            .single()

        if (error) throw error

        await logAudit({
            tableName: 'skills',
            recordId: data.id,
            action: 'INSERT',
            newValues: skillData
        })

        revalidatePath('/admin/performance/competencies')
        return { success: true, data: data as Skill }
    } catch (_error) {
        return { success: false, error: 'Erro ao criar competência' }
    }
}

export async function updateSkill(id: string, formData: Partial<Skill>): Promise<ActionResult<Skill>> {
    try {
        const auth = await requirePermission('skills.manage')
        const supabase = createServerSupabaseClient()

        const { data: oldData } = await supabase.from('skills').select('*').eq('id', id).single()
        if (oldData?.org_id !== auth.orgId) throw new Error('FORBIDDEN')

        const { data, error } = await supabase
            .from('skills')
            .update(formData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        await logAudit({
            tableName: 'skills',
            recordId: id,
            action: 'UPDATE',
            oldValues: oldData,
            newValues: formData
        })

        revalidatePath('/admin/performance/competencies')
        return { success: true, data: data as Skill }
    } catch (_error) {
        return { success: false, error: 'Erro ao atualizar competência' }
    }
}

export async function deleteSkill(id: string): Promise<ActionResult> {
    try {
        const auth = await requirePermission('skills.manage')
        const supabase = createServerSupabaseClient()

        const { data: oldData } = await supabase.from('skills').select('org_id').eq('id', id).single()
        if (oldData?.org_id !== auth.orgId) throw new Error('FORBIDDEN')

        const { error } = await supabase.from('skills').delete().eq('id', id)
        if (error) throw error

        await logAudit({
            tableName: 'skills',
            recordId: id,
            action: 'DELETE',
            oldValues: oldData
        })

        revalidatePath('/admin/performance/competencies')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Erro ao excluir competência' }
    }
}

