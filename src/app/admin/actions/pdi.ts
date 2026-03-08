'use server'

import { requireAuth } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidateTag } from 'next/cache'
import { setAuditContext } from '@/lib/supabase/audit'
import { z } from 'zod'
import type { SkillGap, PDIPlan, PDIItem, ActionResult } from '@/types'

// Schema Zod para validação de entrada de PDI Items
const pdiItemSchema = z.object({
    planId: z.string().uuid('ID do plano inválido'),
    title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(200),
    skillId: z.string().uuid().optional(),
    category: z.string().min(1),
    deadline: z.string().optional(),
})

/**
 * Obtém os dados de PDI do usuário logado, incluindo a análise de GAP
 */
export async function getMyPDIData(): Promise<ActionResult<{
    plan: PDIPlan | null,
    items: PDIItem[],
    gaps: SkillGap[],
    nextPosition: { id: string, title: string } | null
}>> {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        // 1. Busca Plano e Itens
        const { data: plan } = await supabase
            .from('pdi_plans')
            .select('*')
            .eq('user_id', auth.userId)
            .eq('status', 'active')
            .eq('plan_type', 'development') // Isolamento DHO
            .maybeSingle()

        let items: PDIItem[] = []
        if (plan) {
            const { data: itemsData } = await supabase
                .from('pdi_items')
                .select('*')
                .eq('plan_id', plan.id)
                .order('created_at', { ascending: false })
            items = itemsData || []
        }

        // 2. Análise de GAP de Carreira
        // Busca cargo atual do usuário
        const { data: userProfile } = await supabase
            .from('users')
            .select('position_id, positions(track_id, level_id, levels(sequence))')
            .eq('id', auth.userId)
            .single()

        const currentPos = userProfile?.positions as unknown as { track_id: string, levels: { sequence: number } } | null
        if (!currentPos || !currentPos.track_id) {
            return { success: true, data: { plan: plan as PDIPlan | null, items, gaps: [], nextPosition: null } }
        }

        // Busca o próximo nível na mesma trilha
        const currentSequence = currentPos.levels?.sequence || 0
        const { data: nextLevel } = await supabase
            .from('levels')
            .select('id, name')
            .eq('org_id', auth.orgId)
            .eq('sequence', currentSequence + 1)
            .maybeSingle()

        if (!nextLevel) {
            return { success: true, data: { plan: plan as PDIPlan | null, items, gaps: [], nextPosition: null } }
        }

        // Busca o cargo correspondente ao próximo nível na mesma trilha
        const { data: nextPosition } = await supabase
            .from('positions')
            .select('id, title')
            .eq('track_id', currentPos.track_id)
            .eq('level_id', nextLevel.id)
            .maybeSingle()

        if (!nextPosition) {
            return { success: true, data: { plan: plan as PDIPlan | null, items, gaps: [], nextPosition: null } }
        }

        // 3. Calcula Gaps de Competências
        // Pegamos as skills do PRÓXIMO cargo
        const { data: reqSkills } = await supabase
            .from('position_skills')
            .select('skill_id, required_level, skills(name)')
            .eq('position_id', nextPosition.id)

        // Pegamos as notas do ÚLTIMO ciclo concluído do usuário
        const { data: lastEval } = await supabase
            .from('evaluations')
            .select('id')
            .eq('user_id', auth.userId)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        const { data: lastScores } = lastEval
            ? await supabase
                .from('evaluation_scores')
                .select('skill_id, score')
                .eq('evaluation_id', lastEval.id)
            : { data: [] }

        const gaps: SkillGap[] = (reqSkills || []).map(req => {
            const myScore = lastScores?.find(s => s.skill_id === req.skill_id)?.score || 0
            return {
                skill_id: req.skill_id,
                skill_name: (req.skills as unknown as { name: string })?.name || 'Desconhecida',
                current_level: myScore,
                required_level: req.required_level,
                gap: Math.max(0, req.required_level - myScore)
            }
        })

        return {
            success: true,
            data: {
                plan: plan as PDIPlan | null,
                items,
                gaps: gaps.filter(g => g.gap > 0),
                nextPosition
            }
        }
    } catch (error: unknown) {
        const err = error as Error
        console.error('Erro em getMyPDIData:', err)
        return { success: false, error: err.message }
    }
}

/**
 * Cria um novo item de ação no PDI (validado via Zod)
 */
export async function addPDIItem(formData: {
    planId: string
    title: string
    skillId?: string
    category: string
    deadline?: string
}): Promise<ActionResult> {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        // 1. Validação Zod (antes de qualquer regra de negócio)
        const validated = pdiItemSchema.parse(formData)

        // 2. Impedir categoria de rito em action genérica (Bloqueio de Domínio)
        if (validated.category === 'leadership_rite') {
            throw new Error('SECURITY_VIOLATION: Use addLeadershipRite para registrar ritos de gestão.')
        }

        const { data, error } = await supabase
            .from('pdi_items')
            .insert({
                plan_id: validated.planId,
                title: validated.title,
                skill_id: validated.skillId || null,
                category: validated.category,
                deadline: validated.deadline || null
            })
            .select()
            .single()

        if (error) throw error

        // Auditoria via Trigger Master (081) - logAudit é no-op
        revalidateTag('pdi-items')
        return { success: true }
    } catch (error: unknown) {
        const err = error as Error
        return { success: false, error: err.message }
    }
}

