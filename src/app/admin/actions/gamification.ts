'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAudit } from '@/lib/supabase/audit'
import { dispatchWebhook } from '@/lib/integrations/webhooks'
import { createSafeAction } from '@/lib/supabase/safe-action'
import { badgeSchema, awardBadgeSchema } from '@/validations/gamification'
import { z } from 'zod'

export interface Badge {
    id: string
    name: string
    description: string
    icon: string
    color: string
    type: string
}

export interface UserBadge {
    id: string
    user_id: string
    badge_id: string
    awarded_at: string
    awarded_by_name?: string
    comment?: string
    badges?: Badge
}

/**
 * Busca todas as medalhas disponíveis na organização
 */
export const getBadges = createSafeAction(z.object({}), async (_, auth) => {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('org_id', auth.orgId)
        .order('name', { ascending: true })

    if (error) throw error
    return data as Badge[]
})

/**
 * Cria uma nova definição de medalha (Apenas Admin)
 */
export const createBadge = createSafeAction(badgeSchema, async (data, auth) => {
    const supabase = createServerSupabaseClient()

    const { data: badgeData, error } = await supabase
        .from('badges')
        .insert({ ...data, org_id: auth.orgId })
        .select()
        .single()

    if (error) throw error

    await logAudit({
        tableName: 'badges',
        recordId: badgeData.id,
        action: 'INSERT',
        newValues: data
    })

    revalidatePath('/admin/gamification')
    return badgeData as Badge
}, 'org.manage')

/**
 * Atribui uma medalha a um colaborador
 */
export const awardBadge = createSafeAction(awardBadgeSchema, async (data, auth) => {
    const supabase = createServerSupabaseClient()

    const { data: awardData, error } = await supabase
        .from('user_badges')
        .insert({
            user_id: data.userId,
            badge_id: data.badgeId,
            org_id: auth.orgId,
            awarded_by: auth.userId,
            comment: data.comment
        })
        .select()
        .single()

    if (error) {
        if (error.code === '23505') throw new Error('O colaborador já possui esta medalha.')
        throw error
    }

    await logAudit({
        tableName: 'user_badges',
        recordId: awardData.id,
        action: 'INSERT',
        newValues: { user_id: data.userId, badge_id: data.badgeId }
    })

    // Disparar Webhook (Background)
    dispatchWebhook(auth.orgId, 'badge.awarded', {
        user_id: data.userId,
        badge_id: data.badgeId,
        awarded_by: auth.userId,
        comment: data.comment
    }).catch(console.error)

    revalidatePath('/dashboard/profile')
    revalidatePath(`/admin/users/${data.userId}`)
    return { success: true }
}, 'users.manage')

/**
 * Busca as medalhas conquistas por um usuário
 */
export const getUserBadges = createSafeAction(z.object({ userId: z.string().uuid() }), async (data) => {
    const supabase = createServerSupabaseClient()

    const { data: userBadges, error } = await supabase
        .from('user_badges')
        .select('*, badges(*), awarded_by_user:users!awarded_by(full_name)')
        .eq('user_id', data.userId)
        .order('awarded_at', { ascending: false })

    if (error) throw error

    return userBadges.map(item => ({
        ...item,
        awarded_by_name: (item.awarded_by_user as { full_name: string | null } | null)?.full_name
    })) as UserBadge[]
})

/**
 * Cria medalhas padrão para demonstração
 */
export const seedDefaultBadges = createSafeAction(z.object({}), async (_, auth) => {
    const supabase = createServerSupabaseClient()

    const { count } = await supabase
        .from('badges')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', auth.orgId)

    if (count && count > 0) return { message: 'Já existem medalhas.' }

    const defaultBadges = [
        { name: 'Onboarding Concluído', description: 'Completou todas as etapas do checklist de entrada.', icon: 'CheckCircle2', color: 'blue', type: 'achievement' },
        { name: 'Fera da Cultura', description: 'Demonstrou exemplaridade nos 7 pilares da empresa.', icon: 'Star', color: 'gold', type: 'culture' },
        { name: 'Mestre Técnico', description: 'Atingiu nota máxima em competências críticas.', icon: 'Award', color: 'purple', type: 'hard-skill' },
        { name: 'Colaborador Solidário', description: 'Reconhecido pelos pares por ajudar a equipe.', icon: 'Users', color: 'blue', type: 'peer' }
    ]

    const { error } = await supabase
        .from('badges')
        .insert(defaultBadges.map(b => ({ ...b, org_id: auth.orgId })))

    if (error) throw error

    revalidatePath('/admin/gamification')
    return { success: true }
}, 'org.manage')

export interface LeaderboardEntry {
    userId: string
    userName: string
    position: string
    points: number
    badgesCount: number
    rank: number
}

/**
 * Calcula o ranking de aprendizado da organização
 */
export const getLeaderboard = createSafeAction(z.object({ unitId: z.string().uuid().optional() }), async (data, auth) => {
    const supabase = createServerSupabaseClient()

    // 1. Buscar usuários e suas medalhas
    let query = supabase
        .from('users')
        .select(`
            id,
            full_name,
            unit_id,
            positions(title),
            user_badges(id)
        `)
        .eq('org_id', auth.orgId)
        .eq('status', 'active')

    if (data.unitId) {
        query = query.eq('unit_id', data.unitId)
    }

    const { data: userData, error: userError } = await query
    if (userError) throw userError

    // 2. Calcular pontos
    const entries: LeaderboardEntry[] = (userData || []).map(u => {
        const badgesCount = (u.user_badges as { id: string }[] | null)?.length || 0
        const points = badgesCount * 100

        return {
            userId: u.id,
            userName: u.full_name || 'Desconhecido',
            position: (u.positions as { title: string }[] | null)?.[0]?.title || 'N/A',
            badgesCount,
            points,
            rank: 0
        }
    })

    // 3. Ordenar e atribuir Rank
    const sorted = entries.sort((a, b) => b.points - a.points)
    sorted.forEach((item, index) => {
        item.rank = index + 1
    })

    return sorted
})

/**
 * Busca as premiações recentes de medalhas (para o Feed Social)
 */
export const getRecentAwards = createSafeAction(z.object({ limit: z.number().optional().default(10) }), async (data, auth) => {
    const supabase = createServerSupabaseClient()

    const { data: awards, error } = await supabase
        .from('user_badges')
        .select('*, badges(*), users!user_id(full_name)')
        .eq('org_id', auth.orgId)
        .order('awarded_at', { ascending: false })
        .limit(data.limit)

    if (error) throw error

    return awards
})
