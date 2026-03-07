'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth'
import { getUserOnboardingRampUp } from './dho-onboarding'
import { getUserLeadershipRites } from './dho-rites-fetch'
import type { ActionResult } from '@/types'
import { calculateScorecardFromData, type DHOScorecard } from './dho-utils'

export type { DHOScorecard }

/**
 * Calcula o Scorecard DHO de forma derivada (on-the-fly).
 */
export async function getDHOScorecard(userId: string): Promise<ActionResult<DHOScorecard>> {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()
        const now = new Date()

        const [userRes, onboardingRes, ritesRes, kpiResultsRes] = await Promise.all([
            supabase.from('users').select('created_at').eq('id', userId).single(),
            getUserOnboardingRampUp(userId),
            getUserLeadershipRites(userId),
            supabase
                .from('kpi_results')
                .select(`achievement_percentage, kpi_targets!inner(user_id)`)
                .eq('kpi_targets.user_id', userId)
                .order('updated_at', { ascending: false })
                .limit(5)
        ])

        if (userRes.error) throw userRes.error

        const createdAt = new Date(userRes.data.created_at)
        const diffTime = Math.abs(now.getTime() - createdAt.getTime())
        const daysInPosition = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        const onboardingScore = onboardingRes.success && onboardingRes.data
            ? onboardingRes.data.completionPercentage
            : null

        const rites = ritesRes.success ? (ritesRes.data || []) : []
        const kpiResults = kpiResultsRes.data || []
        const kpiScore = kpiResults.length > 0
            ? kpiResults.reduce((acc, curr) => acc + curr.achievement_percentage, 0) / kpiResults.length
            : null

        const scorecard = calculateScorecardFromData({
            daysInPosition,
            onboardingScore,
            rites,
            kpiScore,
            now
        })

        return {
            success: true,
            data: scorecard
        }
    } catch (error: any) {
        console.error('Erro em getDHOScorecard:', error)
        return { success: false, error: error.message }
    }
}
