'use server'

import { requirePermission } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getErrorMessage } from '@/lib/utils'

export interface RampUpMetrics {
    totalItems: number
    completedItems: number
    completionPercentage: number
    // We simulate D30/D60/D90 by dividing the items into 3 chunks for now, 
    // or by checking if the template name/item title implies a phase.
    phases: {
        name: string
        total: number
        completed: number
        percentage: number
        status: 'on_track' | 'lagging' | 'completed' | 'pending'
    }[]
}

export interface OnboardingAnalytics {
    summary: {
        totalEmployees: number
        onTrackEmployees: number
        laggingEmployees: number
        avgProgress: number
    }
    funnel: {
        d0_30: { total: number; onTrack: number; lagging: number }
        d31_60: { total: number; onTrack: number; lagging: number }
        d61_90: { total: number; onTrack: number; lagging: number }
        d91_120: { total: number; onTrack: number; lagging: number }
    }
    users: {
        id: string
        name: string
        role: string
        leaderName: string | null
        daysInHouse: number
        progress: number
        expected: number
        status: 'on_track' | 'lagging'
    }[]
}

export async function getUserOnboardingRampUp(userId: string): Promise<{ success: boolean; data?: RampUpMetrics; error?: string }> {
    try {
        const auth = await requirePermission('users.manage')
        const supabase = createServerSupabaseClient()

        // Fetch the user's progress joined with the item details
        const { data: progress, error } = await supabase
            .from('user_onboarding_progress')
            .select(`
                id, status, completed_at,
                item:onboarding_items(title, sequence)
            `)
            .eq('user_id', userId)

        if (error) throw error

        if (!progress || progress.length === 0) {
            return {
                success: true,
                data: { totalItems: 0, completedItems: 0, completionPercentage: 0, phases: [] }
            }
        }

        const totalItems = progress.length
        const completedItems = progress.filter(p => p.status === 'completed').length
        const completionPercentage = Math.round((completedItems / totalItems) * 100)

        // Simulate 3 phases (D30, D60, D90) by splitting items by sequence
        // In a real scenario, this would rely on a 'phase' column or 'deadline_days'.
        const sortedProgress = progress.sort((a, b) => {
            const itemA = a.item as any;
            const itemB = b.item as any;
            const seqA = Array.isArray(itemA) ? itemA[0]?.sequence : itemA?.sequence;
            const seqB = Array.isArray(itemB) ? itemB[0]?.sequence : itemB?.sequence;
            return (seqA || 0) - (seqB || 0);
        });

        const chunkSize = Math.ceil(totalItems / 3) || 1
        const chunks = [
            sortedProgress.slice(0, chunkSize),
            sortedProgress.slice(chunkSize, chunkSize * 2),
            sortedProgress.slice(chunkSize * 2)
        ]

        const phaseNames = ['D30 (Rampagem Inicial)', 'D60 (Aprofundamento)', 'D90 (Operacional)']

        const phases = chunks.map((chunk, index) => {
            const chunkTotal = chunk.length
            const chunkCompleted = chunk.filter(p => p.status === 'completed').length
            const chunkPercentage = chunkTotal > 0 ? Math.round((chunkCompleted / chunkTotal) * 100) : 0

            let status: 'on_track' | 'lagging' | 'completed' | 'pending' = 'pending'
            if (chunkTotal === 0) status = 'pending'
            else if (chunkPercentage === 100) status = 'completed'
            else if (chunkPercentage >= 50) status = 'on_track'
            else status = 'lagging'

            return {
                name: phaseNames[index],
                total: chunkTotal,
                completed: chunkCompleted,
                percentage: chunkPercentage,
                status
            }
        }).filter(p => p.total > 0)

        return {
            success: true,
            data: {
                totalItems,
                completedItems,
                completionPercentage,
                phases
            }
        }

    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) }
    }
}

/**
 * Agregação Organizacional de Onboarding (Bulk Processing)
 * Evita N+1 queries buscando todos os dados em lote.
 */
export async function getOnboardingOrganizationAnalytics(): Promise<ActionResult<OnboardingAnalytics>> {
    try {
        await requirePermission('onboarding.manage')
        const supabase = createServerSupabaseClient()
        const now = new Date()
        const cutoffDate = new Date(now.getTime() - (120 * 24 * 60 * 60 * 1000))

        // 1. Buscar usuários em rampagem (<= 120 dias)
        // Buscamos as roles e positions via join para a tabela
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select(`
                id, full_name, created_at,
                role:roles(name),
                position:positions(title)
            `)
            .gte('created_at', cutoffDate.toISOString())
            .eq('status', 'active')

        if (usersError) throw usersError
        if (!users || users.length === 0) {
            return {
                success: true,
                data: {
                    summary: { totalEmployees: 0, onTrackEmployees: 0, laggingEmployees: 0, avgProgress: 0 },
                    funnel: {
                        d0_30: { total: 0, onTrack: 0, lagging: 0 },
                        d31_60: { total: 0, onTrack: 0, lagging: 0 },
                        d61_90: { total: 0, onTrack: 0, lagging: 0 },
                        d91_120: { total: 0, onTrack: 0, lagging: 0 }
                    },
                    users: []
                }
            }
        }

        const userIds = users.map(u => u.id)

        // 2. Buscar progresso em lote
        const { data: allProgress, error: progressError } = await supabase
            .from('user_onboarding_progress')
            .select('user_id, status')
            .in('user_id', userIds)

        if (progressError) throw progressError

        // 3. Buscar Líderes (via pdi_plans leadership_rites) para compor a tabela
        // Nota: O líder é quem gerencia o rito de liderança.
        const { data: plans } = await supabase
            .from('pdi_plans')
            .select(`
                user_id,
                leader:users!pdi_plans_leader_id_fkey(full_name)
            `)
            .in('user_id', userIds)
            .eq('plan_type', 'leadership_rites')
            .eq('status', 'active')

        const leaderMap: Record<string, string> = {}
        plans?.forEach(p => {
            const l = p.leader as any
            if (l?.full_name) leaderMap[p.user_id] = l.full_name
        })

        // 4. Processamento em Memória (O(n))
        const analyticsUsers: OnboardingAnalytics['users'] = users.map(user => {
            const userProgress = allProgress?.filter(p => p.user_id === user.id) || []
            const total = userProgress.length
            const completed = userProgress.filter(p => p.status === 'completed').length
            const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0

            const hireDate = new Date(user.created_at)
            const daysInHouse = Math.max(0, Math.ceil((now.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24)))

            // Regra Linear: 100% em 90 dias. Tolerância de 10%
            const expected = Math.min(100, Math.round((daysInHouse / 90) * 100))
            const status: 'on_track' | 'lagging' = progressPercent >= (expected - 10) ? 'on_track' : 'lagging'

            return {
                id: user.id,
                name: user.full_name || 'Usuário',
                role: (user.position as any)?.title || (user.role as any)?.name || 'Colaborador',
                leaderName: leaderMap[user.id] || null,
                daysInHouse,
                progress: progressPercent,
                expected,
                status
            }
        })

        // 5. Agregação de Sumário e Funil
        const summary = {
            totalEmployees: analyticsUsers.length,
            onTrackEmployees: analyticsUsers.filter(u => u.status === 'on_track').length,
            laggingEmployees: analyticsUsers.filter(u => u.status === 'lagging').length,
            avgProgress: Math.round(analyticsUsers.reduce((acc, u) => acc + u.progress, 0) / analyticsUsers.length)
        }

        const funnel = {
            d0_30: { total: 0, onTrack: 0, lagging: 0 },
            d31_60: { total: 0, onTrack: 0, lagging: 0 },
            d61_90: { total: 0, onTrack: 0, lagging: 0 },
            d91_120: { total: 0, onTrack: 0, lagging: 0 }
        }

        analyticsUsers.forEach(u => {
            let key: keyof typeof funnel | null = null
            if (u.daysInHouse <= 30) key = 'd0_30'
            else if (u.daysInHouse <= 60) key = 'd31_60'
            else if (u.daysInHouse <= 90) key = 'd61_90'
            else if (u.daysInHouse <= 120) key = 'd91_120'

            if (key) {
                funnel[key].total++
                if (u.status === 'on_track') funnel[key].onTrack++
                else funnel[key].lagging++
            }
        })

        return {
            success: true,
            data: { summary, funnel, users: analyticsUsers }
        }

    } catch (error: unknown) {
        console.error('Erro em getOnboardingOrganizationAnalytics:', error)
        return { success: false, error: getErrorMessage(error) }
    }
}
