'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth'
import { getUserOnboardingRampUp } from './dho-onboarding'
import { getUserLeadershipRites } from './dho-rites-fetch'
import type { ActionResult } from '@/types'

export interface DHOScorecard {
    overallScore: number
    status: 'low' | 'medium' | 'high'
    phase: 'rampUp' | 'learning' | 'effective' | 'mature'
    phaseLabel: string
    components: {
        onboarding: number | null
        rites: number | null
        kpis: number | null
    }
    weights: {
        onboarding: number
        rites: number
        kpis: number
    }
    daysInPosition: number
}

/**
 * Calcula o Scorecard DHO de forma derivada (on-the-fly).
 * Fonte Oficinal de KPI: kpi_results via kpi_targets.
 * Janela: Mês Vigente (MTD) Proporcional.
 */
export async function getDHOScorecard(userId: string): Promise<ActionResult<DHOScorecard>> {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        // 1. Coletar dados base
        const [userRes, onboardingRes, ritesRes] = await Promise.all([
            supabase.from('users').select('created_at').eq('id', userId).single(),
            getUserOnboardingRampUp(userId),
            getUserLeadershipRites(userId)
        ])

        if (userRes.error) throw userRes.error

        // 2. Calcular tempo no cargo (dias)
        const createdAt = new Date(userRes.data.created_at)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - createdAt.getTime())
        const daysInPosition = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        // 3. Determinar Fase e Pesos Base
        let baseWeights = { onboarding: 0, rites: 0, kpis: 0 }
        let phase: DHOScorecard['phase'] = 'mature'
        let phaseLabel = 'Operação Plena (D90+)'

        if (daysInPosition <= 30) {
            baseWeights = { onboarding: 0.8, rites: 0.2, kpis: 0 }
            phase = 'rampUp'
            phaseLabel = 'Rampagem Inicial (D0-D30)'
        } else if (daysInPosition <= 60) {
            baseWeights = { onboarding: 0.6, rites: 0.2, kpis: 0.2 }
            phase = 'learning'
            phaseLabel = 'Aprendizado (D31-D60)'
        } else if (daysInPosition <= 90) {
            baseWeights = { onboarding: 0.3, rites: 0.3, kpis: 0.4 }
            phase = 'effective'
            phaseLabel = 'Efetivação (D61-D90)'
        } else {
            baseWeights = { onboarding: 0, rites: 0.4, kpis: 0.6 }
            phase = 'mature'
        }

        // 4. Coletar notas dos componentes

        // ONBOARDING
        const onboardingScore = onboardingRes.success && onboardingRes.data
            ? onboardingRes.data.completionPercentage
            : null

        // RITOS (MTD Proporcional)
        const rites = ritesRes.success ? (ritesRes.data || []) : []
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()
        const dayOfMonth = now.getDate()

        const completedThisMonth = ritosMtd(rites, currentMonth, currentYear)

        // Meta: 2 ritos/mês (1:1 + Feedback). Proporcionalidade: Meta/30 * dia_atual
        const targetPerMonth = 2
        const expectedProportional = Math.max(0.1, (targetPerMonth / 30) * dayOfMonth)
        const ritesScore = Math.min(100, (completedThisMonth / expectedProportional) * 100)

        // KPIs (Fonte: kpi_results)
        const { data: kpiResults } = await supabase
            .from('kpi_results')
            .select(`
        achievement_percentage,
        kpi_targets!inner(user_id)
      `)
            .eq('kpi_targets.user_id', userId)
            .order('updated_at', { ascending: false })
            .limit(5) // Média dos últimos 5 resultados

        const kpiScoreRes = kpiResults && kpiResults.length > 0
            ? kpiResults.reduce((acc, curr) => acc + curr.achievement_percentage, 0) / kpiResults.length
            : null

        // 5. Rebalanceamento de Pesos (Ausência Legítima não penaliza)
        const scores: Record<string, number | null> = {
            onboarding: onboardingScore,
            rites: ritesScore,
            kpis: kpiScoreRes
        }

        let activeWeightsTotal = 0
        Object.keys(scores).forEach(key => {
            if (scores[key] !== null && baseWeights[key as keyof typeof baseWeights] > 0) {
                activeWeightsTotal += baseWeights[key as keyof typeof baseWeights]
            }
        })

        // Calcular nota final ponderada
        let overallScore = 0
        if (activeWeightsTotal > 0) {
            Object.keys(scores).forEach(key => {
                const val = scores[key]
                const baseW = baseWeights[key as keyof typeof baseWeights]
                if (val !== null && baseW > 0) {
                    overallScore += val * (baseW / activeWeightsTotal)
                }
            })
        }

        const status = overallScore >= 85 ? 'high' : overallScore >= 70 ? 'medium' : 'low'

        return {
            success: true,
            data: {
                overallScore: Math.round(overallScore),
                status,
                phase,
                phaseLabel,
                components: {
                    onboarding: onboardingScore,
                    rites: ritesScore,
                    kpis: kpiScoreRes
                },
                weights: {
                    onboarding: activeWeightsTotal > 0 ? (baseWeights.onboarding / activeWeightsTotal) * 100 : 0,
                    rites: activeWeightsTotal > 0 ? (baseWeights.rites / activeWeightsTotal) * 100 : 0,
                    kpis: activeWeightsTotal > 0 ? (baseWeights.kpis / activeWeightsTotal) * 100 : 0
                },
                daysInPosition
            }
        }
    } catch (error: any) {
        console.error('Erro em getDHOScorecard:', error)
        return { success: false, error: error.message }
    }
}

function ritosMtd(rites: any[], month: number, year: number) {
    return rites.filter(r => {
        if (r.status !== 'completed' || !r.completed_at) return false
        const date = new Date(r.completed_at)
        return date.getMonth() === month && date.getFullYear() === year
    }).length
}
