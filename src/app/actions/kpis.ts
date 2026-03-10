'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { revalidateTag } from 'next/cache'
import { createSafeAction } from '@/lib/supabase/safe-action'
import { calculateKpiAchievement } from '@/lib/kpi-engine'
import { kpiDefinitionSchema, kpiTargetSchema, kpiResultSchema } from '@/validations/kpis'
import { z } from 'zod'
import { getTenantContext, validateOrgAccess } from '@/lib/supabase/tenant-context'

// ==========================================
// 1. Administrar KPIs (Definições)
// ==========================================

const createKpiDefinitionSchema = kpiDefinitionSchema.extend({
    org_id: z.string().uuid('Selecione uma organização válida.'),
})

export const createKpiDefinition = createSafeAction(createKpiDefinitionSchema, async (data, auth) => {
    if (auth.role !== 'admin') {
        throw new Error('Apenas administradores podem criar novos KPIs.')
    }

    // Anti-spoofing: user normal só opera na própria org
    if (auth.role !== 'admin' && data.org_id !== auth.orgId) {
        throw new Error('FORBIDDEN')
    }

    // Superadmin usa admin client (sem org_id no RLS)
    const supabase = auth.role === 'admin'
        ? createAdminSupabaseClient()
        : createServerSupabaseClient()

    const { org_id, ...kpiData } = data

    const { data: kpi, error } = await supabase
        .from('kpi_definitions')
        .insert({
            ...kpiData,
            org_id,
        })
        .select('*')
        .single()

    if (error) throw error

    revalidateTag('admin-kpis')
    return kpi
}, 'performance.evaluate')

const getKpiSchema = z.object({
    org_id: z.string().uuid().optional(),
})

export const getKpiDefinitions = createSafeAction(getKpiSchema, async (data, auth) => {
    // Determinar org_id via contexto centralizado (Multi-tenant)
    const { targetOrgId, auth: userAuth } = await getTenantContext(data.org_id)

    // Superadmin usa admin client (bypass RLS)
    const supabase = userAuth.role === 'admin'
        ? createAdminSupabaseClient()
        : createServerSupabaseClient()

    const { data: kpis, error } = await supabase
        .from('kpi_definitions')
        .select('*')
        .eq('org_id', targetOrgId)
        .order('name')

    if (error) throw error
    return kpis
})

// ==========================================
// 2. Atribuir Metas (Targets) aos Colaboradores
// ==========================================

export const assignKpiTarget = createSafeAction(kpiTargetSchema, async (data, auth) => {
    const supabase = auth.role === 'admin'
        ? createAdminSupabaseClient()
        : createServerSupabaseClient()

    // VALIDATION: Cross-tenant check (User must belong to the same Org)
    const { data: userData, error: userCheckErr } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', data.user_id)
        .single()

    if (userCheckErr || !userData) {
        throw new Error('Usuário não encontrado.')
    }

    // Anti-spoofing: non-admin can only assign targets in their own org
    if (auth.role !== 'admin' && userData.org_id !== auth.orgId) {
        throw new Error('O usuário selecionado não pertence à sua organização.')
    }

    const targetOrgId = userData.org_id
    await validateOrgAccess(targetOrgId)

    const { data: target, error } = await supabase
        .from('kpi_targets')
        .upsert({
            ...data,
            org_id: targetOrgId
        }, { onConflict: 'user_id, kpi_id, period_start, period_end' })
        .select('*')
        .single()

    if (error) throw error

    // Se criou uma meta, vamos garantir que existe um "result" vazio atrelado
    const { error: resultErr } = await supabase.from('kpi_results').insert({
        org_id: targetOrgId,
        target_id: target.id,
        actual_value: 0,
        achievement_percentage: 0
    })

    // Ignorar duplicatas se já existe
    if (resultErr && resultErr.code !== '23505') throw resultErr

    revalidateTag('admin-kpis')
    return target
}, 'performance.evaluate')

// ==========================================
// 3. Inserir Realizado Diário/Semanal/Mensal (Colaborador)
// ==========================================

export const updateKpiResult = createSafeAction(kpiResultSchema, async (data, _auth) => {
    const supabase = createServerSupabaseClient()

    // 1. Busca a Meta e o KPI atrelado (Protegido por RLS - ele só acha se ele for o dono ou Admin)
    const { data: targetData, error: targetErr } = await supabase
        .from('kpi_targets')
        .select('*, kpi_definitions(*)')
        .eq('id', data.target_id)
        .single()

    if (targetErr || !targetData) throw new Error('Meta não encontrada ou sem acesso.')

    const kpiDef = targetData.kpi_definitions

    // 2. Usar o Engine Matemático seguro rodando estritamente no Server (Node)
    const mathResult = calculateKpiAchievement({
        target: Number(targetData.target_value),
        actual: data.actual_value,
        isReversed: Boolean(kpiDef.is_reversed),
        capPercentage: Number(kpiDef.cap_percentage),
        weight: Number(targetData.weight)
    })

    // 3. Atualizar Resultado (A Policy de RLS garante que ele só dê UPDATE se o target for dele)
    const { data: result, error } = await supabase
        .from('kpi_results')
        .update({
            actual_value: data.actual_value,
            achievement_percentage: mathResult.achievement,
            notes: data.notes,
            updated_at: new Date().toISOString()
        })
        .eq('target_id', data.target_id)
        .select('*')
        .single()

    if (error) throw error

    revalidateTag('dashboard-kpis')
    return result
}, 'pdi.manage')
export const getMyKpiTargets = createSafeAction(z.object({}), async (_data, auth) => {
    const supabase = createServerSupabaseClient()

    // Busca metas, definições e resultados do usuário logado
    const { data: targets, error } = await supabase
        .from('kpi_targets')
        .select(`
            *,
            kpi_definitions (*),
            kpi_results (*)
        `)
        .eq('user_id', auth.userId)
        .order('period_end', { ascending: false })

    if (error) throw error
    return targets
})
