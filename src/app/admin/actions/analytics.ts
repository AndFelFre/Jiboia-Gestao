'use server'

import { requirePermission, requireAuth } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface TurnoverStats {
    currentTotal: number
    activeTotal: number
    terminatedTotal: number
    turnoverRate: number
    byReason: { reason: string, count: number }[]
    byType: { type: string, count: number }[]
    monthlyTrend: { month: string, rate: number }[]
}

export interface RecruitmentStats {
    totalCandidates: number
    totalHired: number
    timeToHireAvg: number // Dias
    funnel: { stage: string, count: number, label: string }[]
    conversionRates: { from: string, to: string, rate: number }[]
}

export interface SkillHeatmapData {
    skills: { id: string, name: string }[]
    users: { id: string, name: string, position: string }[]
    matrix: { userId: string, skillId: string, score: number, gap: number }[]
}

export interface RiskAnalysis {
    userId: string
    userName: string
    position: string
    riskScore: number
    riskLevel: 'low' | 'medium' | 'high'
    factors: string[]
}

export interface PDISuggestion {
    skillName: string
    gap: number
    suggestion: string
    priority: 'high' | 'medium' | 'low'
}

/**
 * Calcula estatísticas de turnover para a organização do usuário
 */
export async function getTurnoverStats(): Promise<{ success: boolean, data?: TurnoverStats, error?: string }> {
    try {
        const auth = await requirePermission('org.manage') // Apenas admin por enquanto
        const supabase = createServerSupabaseClient()

        // 1. Total de usuários (ativos e inativos)
        const { count: totalCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', auth.orgId)

        // 2. Total de ativos
        const { count: activeCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', auth.orgId)
            .eq('status', 'active')

        // 3. Total de desligados (no último ano para simplicidade)
        const yearAgo = new Date()
        yearAgo.setFullYear(yearAgo.getFullYear() - 1)

        const { data: terminatedUsers } = await supabase
            .from('users')
            .select('status, terminated_at, termination_reason, termination_type')
            .eq('org_id', auth.orgId)
            .eq('status', 'inactive')
            .not('terminated_at', 'is', null)

        const terminatedCount = terminatedUsers?.length || 0

        // 4. Cálculo de Turnover (Fórmula Simplificada: Desligados / Total Médio no período)
        // Usando simplificação: Desligados / Total Atual
        const turnoverRate = activeCount && activeCount > 0 ? (terminatedCount / activeCount) * 100 : 0

        // 5. Agrupamentos
        const byReason = (terminatedUsers || []).reduce((acc: { reason: string, count: number }[], curr) => {
            const reason = curr.termination_reason || 'Outros'
            const existing = acc.find((r) => r.reason === reason)
            if (existing) existing.count++
            else acc.push({ reason, count: 1 })
            return acc
        }, [])

        const byType = (terminatedUsers || []).reduce((acc: { type: string, count: number }[], curr) => {
            const type = curr.termination_type === 'voluntary' ? 'Voluntário' : 'Involuntário'
            const existing = acc.find((t) => t.type === type)
            if (existing) existing.count++
            else acc.push({ type, count: 1 })
            return acc
        }, [])

        return {
            success: true,
            data: {
                currentTotal: totalCount || 0,
                activeTotal: activeCount || 0,
                terminatedTotal: terminatedCount,
                turnoverRate: parseFloat(turnoverRate.toFixed(2)),
                byReason,
                byType,
                monthlyTrend: [] // TODO: Implementar histórico mensal
            }
        }
    } catch (error: unknown) {
        const err = error as Error
        return { success: false, error: err.message }
    }
}

/**
 * Calcula estatísticas de recrutamento
 */
export async function getRecruitmentStats(): Promise<{ success: boolean, data?: RecruitmentStats, error?: string }> {
    try {
        const auth = await requirePermission('org.manage')
        const supabase = createServerSupabaseClient()

        // 1. Busca todos os candidatos da organização
        const { data: candidates, error } = await supabase
            .from('candidates')
            .select('*')
            .eq('org_id', auth.orgId)

        if (error) throw error

        if (!candidates || candidates.length === 0) {
            return {
                success: true,
                data: {
                    totalCandidates: 0,
                    totalHired: 0,
                    timeToHireAvg: 0,
                    funnel: [],
                    conversionRates: []
                }
            }
        }

        // 2. Funil de candidatos por etapa
        const stages = [
            { id: 'new', label: 'Inscritos' },
            { id: 'screening', label: 'Triagem' },
            { id: 'interview_1', label: 'Entrevista 1' },
            { id: 'interview_2', label: 'Entrevista 2' },
            { id: 'technical', label: 'Técnico' },
            { id: 'cultural', label: 'Cultura' },
            { id: 'offer', label: 'Proposta' },
            { id: 'hired', label: 'Contratados' }
        ]

        const funnel = stages.map(s => ({
            stage: s.id,
            label: s.label,
            count: candidates.filter(c => c.stage === s.id).length
        }))

        // 3. Time-to-Hire (apenas para quem foi contratado)
        const hiredCandidates = candidates.filter(c => c.stage === 'hired')
        let timeToHireTotalDays = 0

        hiredCandidates.forEach(c => {
            const start = new Date(c.created_at)
            const end = new Date(c.stage_changed_at || c.created_at)
            const diffTime = Math.abs(end.getTime() - start.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            timeToHireTotalDays += diffDays
        })

        const timeToHireAvg = hiredCandidates.length > 0
            ? timeToHireTotalDays / hiredCandidates.length
            : 0

        // 4. Taxas de Conversão (Simplificado: quantos passaram de uma etapa para a próxima)
        // Nota: Idealmente usaríamos stage_transitions para precisão histórica total,
        // mas aqui calculamos com base no estado atual para KPIs rápidos.
        const conversionRates = []
        for (let i = 0; i < funnel.length - 1; i++) {
            const current = funnel[i]
            const next = funnel[i + 1]

            // Candidatos que chegaram PELO MENOS nesta etapa ou além
            const reachedCurrent = candidates.filter(c => {
                const stageIdx = stages.findIndex(s => s.id === c.stage)
                return stageIdx >= i
            }).length

            const reachedNext = candidates.filter(c => {
                const stageIdx = stages.findIndex(s => s.id === c.stage)
                return stageIdx > i
            }).length

            const rate = reachedCurrent > 0 ? (reachedNext / reachedCurrent) * 100 : 0
            conversionRates.push({
                from: current.label,
                to: next.label,
                rate: parseFloat(rate.toFixed(2))
            })
        }

        return {
            success: true,
            data: {
                totalCandidates: candidates.length,
                totalHired: hiredCandidates.length,
                timeToHireAvg: parseFloat(timeToHireAvg.toFixed(1)),
                funnel,
                conversionRates
            }
        }

    } catch (error: unknown) {
        const err = error as Error
        console.error('Erro em getRecruitmentStats:', err)
        return { success: false, error: err.message }
    }
}

/**
 * Calcula o risco de turnover baseado em múltiplos fatores (IA Predict v1)
 */
export async function getTurnoverRiskAnalysis(): Promise<{ success: boolean, data?: RiskAnalysis[], error?: string }> {
    try {
        const auth = await requirePermission('org.manage') // Changed to org.manage as admin.view might not exist
        const supabase = createServerSupabaseClient()

        // 1. Buscar todos os usuários e dados correlacionados
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select(`
                id, 
                full_name,
                position_id,
                positions(title),
                levels(name),
                created_at
            `)
            .eq('org_id', auth.orgId)
            .eq('status', 'active')

        if (userError) throw userError

        if (!userData || userData.length === 0) {
            return { success: true, data: [] }
        }

        // 2. Buscar PDIs, Onboarding e Logs (simulado para performance)
        const analyses: RiskAnalysis[] = []

        for (const user of userData) {
            let score = 0
            const factors: string[] = []

            // Fator 1: Onboarding Pendente
            const { data: onboarding } = await supabase
                .from('user_onboarding_progress')
                .select('status')
                .eq('user_id', user.id)

            const totalItems = onboarding?.length || 0
            const completedItems = onboarding?.filter(i => i.status === 'completed').length || 0

            const daysSinceCreated = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))

            if (totalItems > 0 && completedItems < totalItems && daysSinceCreated > 30) {
                score += 30
                factors.push('Onboarding atrasado (> 30 dias)')
            }

            // Fator 2: Inatividade no PDI (Simulado - buscando última avaliação)
            const { data: evaluations } = await supabase
                .from('performance_evaluations')
                .select('created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)

            if (!evaluations || evaluations.length === 0) {
                if (daysSinceCreated > 90) {
                    score += 20
                    factors.push('Nunca realizou avaliação de performance')
                }
            } else {
                const lastEval = new Date(evaluations[0].created_at)
                const daysSinceEval = Math.floor((Date.now() - lastEval.getTime()) / (1000 * 60 * 60 * 24))
                if (daysSinceEval > 180) {
                    score += 25
                    factors.push('Sem avaliação há mais de 6 meses')
                }
            }

            // Fator 3: Gaps de Habilidade (Simulado via Heatmap logic)
            // Se tivéssemos a função getSkillHeatmap completa, cruzaríamos aqui.
            // Por simplicidade na v1, somamos risco aleatório baixo se usuário for antigo
            if (daysSinceCreated > 365 * 2) {
                score += 10
                factors.push('Tempo de casa elevado (Estagnação?)')
            }

            analyses.push({
                userId: user.id,
                userName: user.full_name || 'Unknown User',
                position: (user.positions as unknown as { title: string })?.title || 'Cargo não definido',
                riskScore: Math.min(score, 100),
                riskLevel: score > 60 ? 'high' : score > 30 ? 'medium' : 'low',
                factors
            })
        }

        return {
            success: true,
            data: analyses.sort((a, b) => b.riskScore - a.riskScore)
        }
    } catch (error: unknown) {
        const err = error as Error
        console.error('Erro em getTurnoverRiskAnalysis:', err)
        return { success: false, error: err.message }
    }
}

/**
 * Sugere ações de PDI baseadas nos gaps de competência (IA Predict v2)
 */
export async function suggestPDIImprovement(userId: string): Promise<{ success: boolean, data?: PDISuggestion[], error?: string }> {
    try {
        await requireAuth()
        // const supabase = createServerSupabaseClient() // Removed unused

        // 1. Obter os dados do Heatmap para este usuário (especificamente)
        // Como o getSkillHeatmap é para a org, vamos filtrar ou reusar a lógica.
        const heatmapRes = await getSkillHeatmap()
        if (!heatmapRes.success || !heatmapRes.data) throw new Error('Falha ao obter matriz de competências')

        const userMatrix = heatmapRes.data.matrix.filter(m => m.userId === userId && m.gap > 0)

        const suggestions: PDISuggestion[] = userMatrix.map(m => {
            const skill = heatmapRes.data?.skills.find(s => s.id === m.skillId)
            const skillName = skill?.name || 'Skill Desconhecida'

            let suggestion = ''
            if (m.gap >= 2) {
                suggestion = `Treinamento intensivo ou curso técnico especializado em ${skillName}.`
            } else {
                suggestion = `Mentoria com um benchmark interno ou leitura técnica sobre ${skillName}.`
            }

            return {
                skillName,
                gap: m.gap,
                suggestion,
                priority: m.gap >= 2 ? 'high' : 'medium'
            }
        })

        return {
            success: true,
            data: suggestions.sort((a, b) => b.gap - a.gap)
        }
    } catch (error: unknown) {
        const err = error as Error
        return { success: false, error: err.message }
    }
}

/**
 * Calcula o Heatmap de Competências da organização
 */
export async function getSkillHeatmap(unitId?: string): Promise<{ success: boolean, data?: SkillHeatmapData, error?: string }> {
    try {
        const auth = await requirePermission('org.manage')
        const supabase = createServerSupabaseClient()

        // 1. Busca Usuários com seus cargos
        let userQuery = supabase
            .from('users')
            .select('id, full_name, position_id, positions(title)')
            .eq('org_id', auth.orgId)
            .eq('status', 'active')

        if (unitId) userQuery = userQuery.eq('unit_id', unitId)

        const { data: usersData } = await userQuery
        const users = (usersData || []).map(u => ({
            id: u.id,
            name: u.full_name || 'Sem Nome',
            position: (u.positions as unknown as { title: string }[])?.[0]?.title || 'Sem Cargo'
        }))

        // 2. Busca todas as skills da organização
        const { data: skillsData } = await supabase
            .from('skills')
            .select('id, name')
            .eq('org_id', auth.orgId)

        const skills = skillsData || []

        // 3. Busca os Gaps e Scores (baseado no último ciclo concluído)
        // Nota: Para um heatmap, pegamos o último score de cada par usuário/skill
        const { data: scoresData } = await supabase
            .from('evaluation_scores')
            .select(`
                score,
                skill_id,
                evaluations!inner(user_id, status)
            `)
            .eq('evaluations.status', 'completed')
            .in('evaluations.user_id', users.map(u => u.id))

        // 4. Busca Requisitos dos Cargos para calcular Gaps
        const { data: requirementsData } = await supabase
            .from('position_skills')
            .select('position_id, skill_id, required_level')
            .in('position_id', (usersData || []).map(u => u.position_id).filter(Boolean))

        // 5. Monta a Matriz
        const matrix: { userId: string, skillId: string, score: number, gap: number }[] = []

        users.forEach(user => {
            const userPositionId = (usersData?.find(u => u.id === user.id) as unknown as { position_id: string })?.position_id

            skills.forEach(skill => {
                // Último score do usuário para esta skill
                const userScore = scoresData
                    ?.filter(s => (s.evaluations as unknown as { user_id: string }).user_id === user.id && s.skill_id === skill.id)
                    ?.[0]?.score || 0

                // Requisito do cargo dele
                const req = requirementsData?.find(r => r.position_id === userPositionId && r.skill_id === skill.id)
                const gap = req ? Math.max(0, req.required_level - userScore) : 0

                matrix.push({
                    userId: user.id,
                    skillId: skill.id,
                    score: userScore,
                    gap: gap
                })
            })
        })

        return {
            success: true,
            data: {
                skills,
                users,
                matrix
            }
        }

    } catch (error: unknown) {
        const err = error as Error
        console.error('Erro em getSkillHeatmap:', err)
        return { success: false, error: err.message }
    }
}

export interface PulseClimateStats {
    averageScore: number
    eNPS: number
    totalResponses: number
    byCategory: { category: string, average: number }[]
    recentTrends: { date: string, score: number }[]
}

/**
 * Calcula estatísticas de clima organizacional baseadas nas pesquisas pulse
 */
export async function getPulseClimateStats(): Promise<{ success: boolean, data?: PulseClimateStats, error?: string }> {
    try {
        const auth = await requirePermission('org.manage')
        const supabase = createServerSupabaseClient()

        // 1. Buscar todas as respostas da organização
        const { data: responses, error } = await supabase
            .from('pulse_responses')
            .select(`
                score,
                created_at,
                pulse_surveys(category)
            `)
            .eq('org_id', auth.orgId)

        if (error) throw error

        if (!responses || responses.length === 0) {
            return {
                success: true,
                data: {
                    averageScore: 0,
                    eNPS: 0,
                    totalResponses: 0,
                    byCategory: [],
                    recentTrends: []
                }
            }
        }

        // 2. Calcular Média Geral
        const totalScore = responses.reduce((acc, r) => acc + r.score, 0)
        const averageScore = totalScore / responses.length

        // 3. Calcular eNPS (Simplificado: % Promotores (4-5) - % Detratores (1-2))
        const promoters = responses.filter(r => r.score >= 4).length
        const detractors = responses.filter(r => r.score <= 2).length
        const eNPS = ((promoters - detractors) / responses.length) * 100

        // 4. Agrupar por Categoria
        const byCategoryMap = responses.reduce((acc: Record<string, { total: number, count: number }>, r) => {
            const cat = (r.pulse_surveys as unknown as { category: string })?.category || 'Geral'
            if (!acc[cat]) acc[cat] = { total: 0, count: 0 }
            acc[cat].total += r.score
            acc[cat].count++
            return acc
        }, {})

        const byCategory = Object.keys(byCategoryMap).map(cat => ({
            category: cat,
            average: parseFloat((byCategoryMap[cat].total / byCategoryMap[cat].count).toFixed(2))
        }))

        return {
            success: true,
            data: {
                averageScore: parseFloat(averageScore.toFixed(2)),
                eNPS: Math.round(eNPS),
                totalResponses: responses.length,
                byCategory,
                recentTrends: [] // TODO: Implementar histórico
            }
        }

    } catch (error: unknown) {
        const err = error as Error
        console.error('Erro em getPulseClimateStats:', err)
        return { success: false, error: err.message }
    }
}
