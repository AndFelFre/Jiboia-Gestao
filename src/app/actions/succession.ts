'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createSafeAction } from '@/lib/supabase/safe-action'
import { successionPlanSchema } from '@/validations/succession'
import OpenAI from 'openai'

interface SuccessionPlanResult {
    aiSuggestedReadinessScore: number
    confirmedReadinessScore: number | null
    requiresHumanReview: boolean
    strengths: string[]
    developmentAreas: string[]
    recommendedNextSteps: string[]
    isAiGenerated: boolean
    aiDisclaimer: string
}

export const generateSuccessionPlan = createSafeAction(successionPlanSchema, async (data, auth) => {
    const supabase = createServerSupabaseClient()

    // 1. Coleta os dados do perfil primário do usuário
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
            full_name,
            role:roles(name)
        `)
        .eq('id', data.userId)
        .eq('org_id', auth.orgId)
        .single()

    if (userError || !userData) {
        throw new Error('Usuário não encontrado ou acesso negado.')
    }

    const roleName = (userData.role as unknown as { name: string })?.name || 'employee'
    const apiKey = process.env.OPENAI_API_KEY
    const disclaimer = "AVISO DE IA: Este score é uma sugestão baseada em algoritmos e deve ser revisado por um gestor ou DPO antes de qualquer decisão de carreira."

    // Se existir a chave, tenta via OpenAI
    if (apiKey && apiKey.length > 20) {
        try {
            const openai = new OpenAI({ apiKey })

            const prompt = `
            Você é um consultor executivo de Recursos Humanos.
            Crie uma SUGESTÃO de plano de sucessão.
            Nome: ${userData.full_name}
            Papel Atual: ${roleName}
            Retorne ESTRITAMENTE um JSON:
            "readinessScore" (0-100), "strengths", "developmentAreas", "recommendedNextSteps"
            `

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3,
            })

            const content = response.choices[0].message.content || '{}'
            const parsedData = JSON.parse(content)

            return {
                aiSuggestedReadinessScore: parsedData.readinessScore || 70,
                confirmedReadinessScore: null,
                requiresHumanReview: true,
                strengths: parsedData.strengths || [],
                developmentAreas: parsedData.developmentAreas || [],
                recommendedNextSteps: parsedData.recommendedNextSteps || [],
                isAiGenerated: true,
                aiDisclaimer: disclaimer
            } as SuccessionPlanResult
        } catch (aiError) {
            console.error('Falha na resposta da OpenAI, acionando fallback', aiError)
        }
    }

    // 2. Fallback Heurístico
    return {
        aiSuggestedReadinessScore: 75,
        confirmedReadinessScore: null,
        requiresHumanReview: true,
        strengths: ['Habilidade Comportamental alinhada'],
        developmentAreas: ['Gestão de tempo'],
        recommendedNextSteps: ['Curso de OKRs'],
        isAiGenerated: false,
        aiDisclaimer: disclaimer
    } as SuccessionPlanResult
}, 'users.manage')
