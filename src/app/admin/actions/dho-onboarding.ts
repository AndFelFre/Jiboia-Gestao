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
