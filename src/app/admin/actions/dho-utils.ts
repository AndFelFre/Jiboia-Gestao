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
 * Helper PURO para cálculo do Scorecard.
 * Deve ser mantido fora de arquivos 'use server' se for exportado para uso em lote.
 */
export function calculateScorecardFromData({
    daysInPosition,
    onboardingScore,
    rites,
    kpiScore,
    now
}: {
    daysInPosition: number,
    onboardingScore: number | null,
    rites: any[],
    kpiScore: number | null,
    now: Date
}): DHOScorecard {
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

    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const dayOfMonth = now.getDate()

    // Ritos MTD
    const completedThisMonth = rites.filter(r => {
        if (r.status !== 'completed' || !r.completed_at) return false
        const date = new Date(r.completed_at)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    }).length

    const targetPerMonth = 2
    const expectedProportional = Math.max(0.1, (targetPerMonth / 30) * dayOfMonth)
    const ritesScore = Math.min(100, (completedThisMonth / expectedProportional) * 100)

    const scores: Record<string, number | null> = {
        onboarding: onboardingScore,
        rites: ritesScore,
        kpis: kpiScore
    }

    let activeWeightsTotal = 0
    Object.keys(scores).forEach(key => {
        if (scores[key] !== null && baseWeights[key as keyof typeof baseWeights] > 0) {
            activeWeightsTotal += baseWeights[key as keyof typeof baseWeights]
        }
    })

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
        overallScore: Math.round(overallScore),
        status,
        phase,
        phaseLabel,
        daysInPosition,
        components: {
            onboarding: onboardingScore,
            rites: ritesScore,
            kpis: kpiScore
        },
        weights: {
            onboarding: activeWeightsTotal > 0 ? (baseWeights.onboarding / activeWeightsTotal) * 100 : 0,
            rites: activeWeightsTotal > 0 ? (baseWeights.rites / activeWeightsTotal) * 100 : 0,
            kpis: activeWeightsTotal > 0 ? (baseWeights.kpis / activeWeightsTotal) * 100 : 0
        }
    }
}
