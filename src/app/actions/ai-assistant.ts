'use server'

import { createSafeAction } from '@/lib/supabase/safe-action'
import { aiQuestionSchema } from '@/validations/ai'

interface KBItem {
    keywords: string[]
    answer: string
    category: 'cultura' | 'beneficios' | 'onboarding' | 'ferramentas'
}

const KNOWLEDGE_BASE: KBItem[] = [
    {
        category: 'cultura',
        keywords: ['valores', 'pilar', 'missão', 'visão', 'cultura'],
        answer: 'Nossa cultura é baseada em 7 pilares: Transparência, Foco no Cliente, Agilidade, Inovação, Colaboração, Excelência e Pertencimento. Acreditamos que pessoas felizes constroem produtos incríveis.'
    },
    {
        category: 'beneficios',
        keywords: ['vale', 'refeição', 'alimentação', 'convênio', 'saúde', 'plano', 'benefício'],
        answer: 'Oferecemos Vale Refeição/Alimentação flexível de R$ 800,00 mensais via cartão Flash, Plano de Saúde Bradesco Top Nacional sem coparticipação e Gympass para cuidar do seu bem-estar.'
    },
    {
        category: 'onboarding',
        keywords: ['primeiro', 'dia', 'acesso', 'notebook', 'onboarding', 'checklist'],
        answer: 'No seu primeiro dia, você receberá seu kit de boas-vindas e notebook. Siga o checklist de onboarding no seu portal para configurar seus acessos iniciais e agendar seu papo de cultura.'
    },
    {
        category: 'ferramentas',
        keywords: ['slack', 'gmail', 'zoom', 'jira', 'confluence', 'ferramenta'],
        answer: 'Utilizamos o Slack para comunicação rápida, Gmail para e-mails formais, Jira para gestão de tarefas e Zoom para nossas reuniões remotas. Seus acessos são criados automaticamente.'
    },
    {
        category: 'cultura',
        keywords: ['carreira', 'promoção', 'crescimento', 'pdi'],
        answer: 'Temos ciclos de avaliação semestrais. Seu PDI é a bússola do seu crescimento. Foque nos gaps identificados no seu mapeamento de competências para subir de nível na sua trilha!'
    }
]

export const askCultureAssistant = createSafeAction(aiQuestionSchema, async (data) => {
    const normalized = data.question.toLowerCase()

    // Busca simples por palavras-chave
    const match = KNOWLEDGE_BASE.find(item =>
        item.keywords.some(kw => normalized.includes(kw))
    )

    if (match) {
        return {
            answer: match.answer,
            category: match.category
        }
    }

    return {
        answer: "Ainda estou aprendendo sobre esse assunto! Tente perguntar sobre Benefícios, Cultura ou Onboarding. Se for urgente, você pode procurar o time de DHO.",
        category: 'unknown'
    }
})
