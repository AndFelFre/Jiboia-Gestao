'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth'
import type { ActionResult } from '@/types'
import { calculateScorecardFromData } from './dho-utils'

export interface DHOAlert {
    userId: string
    userName: string
    type: 'rite_overdue' | 'score_low' | 'onboarding_stagnated' | 'no_recent_rite'
    level: 'yellow' | 'red'
    message: string
    daysOverdue?: number
}

/**
 * Busca alertas de risco para a liderança de forma derivada (MTD).
 * Processamento VERDADEIRAMENTE em lote (Bulk) para evitar N+1.
 */
export async function getLeadershipAlerts(): Promise<ActionResult<DHOAlert[]>> {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()
        const now = new Date()

        // 1. Identificar Liderados (via pdi_plans.leader_id)
        const { data: plans, error: plansError } = await supabase
            .from('pdi_plans')
            .select(`
        user_id,
        users!pdi_plans_user_id_fkey (
          full_name,
          created_at
        )
      `)
            .eq('leader_id', auth.userId)
            .eq('plan_type', 'leadership_rites')
            .eq('status', 'active')

        if (plansError) throw plansError
        if (!plans || plans.length === 0) return { success: true, data: [] }

        const subordinates = plans.map(p => ({
            id: p.user_id,
            name: (p.users as any)?.full_name || 'Colaborador',
            createdAt: new Date((p.users as any)?.created_at)
        }))

        const subordinateIds = subordinates.map(s => s.id)

        // 2. Coletar dados em lote (Bulk Queries)

        // Todos os ritos do time (MTD + Pendentes)
        const { data: allRites } = await supabase
            .from('pdi_items')
            .select('plan_id, title, deadline, rite_type, status, completed_at, pdi_plans!inner(user_id)')
            .in('pdi_plans.user_id', subordinateIds)
            .eq('category', 'leadership_rite')

        // Onboarding Progress (Bulk)
        const { data: onboardingProgress } = await supabase
            .from('user_onboarding_progress')
            .select('user_id, status')
            .in('user_id', subordinateIds)

        // KPI Results (Últimos resultados em lote)
        const { data: kpiResults } = await supabase
            .from('kpi_results')
            .select(`
        achievement_percentage,
        kpi_targets!inner(user_id)
      `)
            .in('kpi_targets.user_id', subordinateIds)
            .order('updated_at', { ascending: false })

        // 3. Processar Alertas em Memória
        const alerts: DHOAlert[] = []

        for (const sub of subordinates) {
            const diffTime = Math.abs(now.getTime() - sub.createdAt.getTime())
            const daysInPosition = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            // Dados específicos do liderado
            const subRites = allRites?.filter(r => (r.pdi_plans as any).user_id === sub.id) || []
            const subOnboarding = onboardingProgress?.filter(p => p.user_id === sub.id) || []
            const subKpis = kpiResults?.filter(k => (k.kpi_targets as any).user_id === sub.id).slice(0, 5) || []

            // GATILHO 1: Rito Vencido (RED)
            const subOverdue = subRites.filter(r => r.status !== 'completed' && r.deadline && new Date(r.deadline) < now)
            subOverdue.forEach(r => {
                alerts.push({
                    userId: sub.id,
                    userName: sub.name,
                    type: 'rite_overdue',
                    level: 'red',
                    message: `Rito de ${r.rite_type || 'Gestão'} em atraso.`
                })
            })

            // GATILHO 2: Ausência de Rito (YELLOW) - Apenas D90+
            const fortyFiveDaysAgo = new Date(now.getTime() - (45 * 24 * 60 * 60 * 1000))
            if (daysInPosition > 90) {
                const hasRecent = subRites.some(r => r.status === 'completed' && r.completed_at && new Date(r.completed_at) > fortyFiveDaysAgo)
                if (!hasRecent) {
                    alerts.push({
                        userId: sub.id,
                        userName: sub.name,
                        type: 'no_recent_rite',
                        level: 'yellow',
                        message: 'Sem rito concluído nos últimos 45 dias.'
                    })
                }
            }

            // GATILHO 3: Rampagem Lenta (YELLOW) - D0-D90
            if (daysInPosition <= 90 && subOnboarding.length > 0) {
                const completed = subOnboarding.filter(p => p.status === 'completed').length
                const progress = (completed / subOnboarding.length) * 100
                const expected = daysInPosition * 1.1 * 0.8
                if (progress < expected) {
                    alerts.push({
                        userId: sub.id,
                        userName: sub.name,
                        type: 'onboarding_stagnated',
                        level: 'yellow',
                        message: 'Rampagem abaixo do esperado para a fase.'
                    })
                }
            }

            // GATILHO 4: Scorecard Baixo (RED)
            const onboardingScore = subOnboarding.length > 0
                ? (subOnboarding.filter(p => p.status === 'completed').length / subOnboarding.length) * 100
                : null
            const kpiScoreRes = subKpis.length > 0
                ? subKpis.reduce((acc, curr) => acc + curr.achievement_percentage, 0) / subKpis.length
                : null

            const scorecard = calculateScorecardFromData({
                daysInPosition,
                onboardingScore,
                rites: subRites,
                kpiScore: kpiScoreRes,
                now
            })

            if (scorecard.overallScore < 70) {
                alerts.push({
                    userId: sub.id,
                    userName: sub.name,
                    type: 'score_low',
                    level: 'red',
                    message: 'Score DHO abaixo da faixa esperada no mês.'
                })
            }
        }

        return { success: true, data: alerts }
    } catch (error: any) {
        console.error('Erro em getLeadershipAlerts:', error)
        return { success: false, error: error.message }
    }
}
