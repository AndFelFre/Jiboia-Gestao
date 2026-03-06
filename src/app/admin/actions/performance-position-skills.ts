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

export interface PositionSkill {
    id: string
    position_id: string
    skill_id: string
    required_level: number
    skills?: {
        name: string
        category: string
    }
}

export async function getPositionSkills(positionId: string): Promise<ActionResult<PositionSkill[]>> {
    try {
        const _auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from('position_skills')
            .select('*, skills(name, category)')
            .eq('position_id', positionId)

        if (error) throw error
        return { success: true, data: data as PositionSkill[] }
    } catch (_error) {
        return { success: false, error: 'Erro ao buscar competências do cargo' }
    }
}

export async function updatePositionSkill(
    positionId: string,
    skillId: string,
    level: number
): Promise<ActionResult> {
    try {
        const auth = await requirePermission('skills.manage')
        const supabase = createServerSupabaseClient()

        const { data: position } = await supabase.from('positions').select('org_id').eq('id', positionId).single()
        if (position?.org_id !== auth.orgId) throw new Error('FORBIDDEN')

        const { error } = await supabase
            .from('position_skills')
            .upsert({
                position_id: positionId,
                skill_id: skillId,
                required_level: level
            }, { onConflict: 'position_id, skill_id' })

        if (error) throw error

        await logAudit({
            tableName: 'position_skills',
            recordId: positionId, // Simplificado
            action: 'UPDATE',
            newValues: { skillId, level }
        })

        revalidatePath(`/admin/performance/positions/${positionId}`)
        return { success: true }
    } catch (_error) {
        return { success: false, error: 'Erro ao atualizar requisito' }
    }
}

export async function removePositionSkill(positionId: string, skillId: string): Promise<ActionResult> {
    try {
        const auth = await requirePermission('skills.manage')
        const supabase = createServerSupabaseClient()

        const { data: position } = await supabase.from('positions').select('org_id').eq('id', positionId).single()
        if (position?.org_id !== auth.orgId) throw new Error('FORBIDDEN')

        const { error } = await supabase
            .from('position_skills')
            .delete()
            .eq('position_id', positionId)
            .eq('skill_id', skillId)

        if (error) throw error

        revalidatePath(`/admin/performance/positions/${positionId}`)
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Erro ao remover requisito' }
    }
}

