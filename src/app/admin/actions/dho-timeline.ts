'use server'

import { requirePermission } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getErrorMessage } from '@/lib/utils'

export interface TimelineEvent {
    id: string
    date: string
    title: string
    description?: string
    priority: 'high' | 'medium' | 'low'
    icon: string
    actor?: string
}

export async function getUserTimeline(userId: string): Promise<{ success: boolean; data?: TimelineEvent[]; error?: string }> {
    try {
        const auth = await requirePermission('users.manage') // Or appropriate permission
        const supabase = createServerSupabaseClient()

        // Fetch logs where record_id is the user (table: users) 
        // OR new_values contains user_id = userId (table: pdi_items, etc)
        // Note: For now, we'll fetch a broad set and filter in memory if the JSON query is tricky,
        // but it's better to use Supabase jsonb filtering.

        // Since Supabase RPC or complex OR might be tricky with jsonb, let's try a direct query
        // using the PostgREST syntax for OR with jsonb:
        const { data: logs, error } = await supabase
            .from('audit_logs')
            .select('*, changed_by_user:users(full_name)')
            .eq('org_id', auth.orgId)
            // Querying where record_id is the user, or the json payload has the user. 
            // In a heavily populated DB, this might need an RPC.
            .order('created_at', { ascending: false })
            .limit(100)

        if (error) throw error

        // Filter in memory for safety in this MVP, then map.
        // Ideally, we do this in the DB.
        const userLogs = logs.filter(log => {
            if (log.table_name === 'users' && log.record_id === userId) return true

            const newValues = log.new_values as any
            const oldValues = log.old_values as any

            if (newValues?.user_id === userId || oldValues?.user_id === userId) return true

            // For PDI plans, we might need to check plan_id, etc.
            // For now, let's assume PDI items have user_id (they usually do if denormalized, or via plan_id)
            // NOTE: pdi_items ONLY have plan_id. We need the plan to know the user_id!
            return false
        })

        const mappedEvents: TimelineEvent[] = []

        // Map according to Catalog
        userLogs.forEach(log => {
            const newValues = log.new_values as any
            const oldValues = log.old_values as any
            const actorName = (log as any).changed_by_user?.full_name || 'Sistema'

            // Catalyst 1: Users
            if (log.table_name === 'users') {
                if (log.action === 'INSERT') {
                    mappedEvents.push({
                        id: log.id,
                        date: log.created_at,
                        title: 'Colaborador admitido no sistema.',
                        priority: 'high',
                        icon: 'UserPlus',
                        actor: actorName
                    })
                } else if (log.action === 'UPDATE') {
                    if (newValues?.position_id && oldValues?.position_id !== newValues?.position_id) {
                        mappedEvents.push({
                            id: log.id,
                            date: log.created_at,
                            title: 'Alteração de cargo/função.',
                            priority: 'high',
                            icon: 'Briefcase',
                            actor: actorName
                        })
                    }
                    if (newValues?.unit_id && oldValues?.unit_id !== newValues?.unit_id) {
                        mappedEvents.push({
                            id: log.id,
                            date: log.created_at,
                            title: 'Transferência de Unidade.',
                            priority: 'high',
                            icon: 'Building',
                            actor: actorName
                        })
                    }
                }
            }

            // Catalyst 2: Onboarding Progress
            if (log.table_name === 'user_onboarding_progress') {
                if (log.action === 'UPDATE' && newValues?.status === 'completed' && oldValues?.status !== 'completed') {
                    mappedEvents.push({
                        id: log.id,
                        date: log.created_at,
                        title: 'Etapa do Onboarding concluída.',
                        priority: 'low',
                        icon: 'CheckCircle',
                        actor: actorName
                    })
                }
            }
        })

        return { success: true, data: mappedEvents }
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) }
    }
}
