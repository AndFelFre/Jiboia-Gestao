'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createSafeAction } from '@/lib/supabase/safe-action'
import { calculateKpiAchievement } from '@/lib/kpi-engine'
import { kpiDefinitionSchema, kpiTargetSchema, kpiResultSchema } from '@/validations/kpis'
import { z } from 'zod'

// ==========================================
// 1. Administrar KPIs (Definições)
// ==========================================

export const createKpiDefinition = createSafeAction(kpiDefinitionSchema, async (data, auth) => {
    // Fallback pra garantir role
    if (auth.role !== 'admin') {
        throw new Error('Apenas administradores podem criar novos KPIs.')
    }

    const supabase = createServerSupabaseClient()

    const { data: kpi, error } = await supabase
        .from('kpi_definitions')
        .insert({
            ...data,
            org_id: auth.orgId,
        })
        .select('*')
        .single()

    if (error) throw error

    revalidatePath('/admin/kpis')
    return kpi
}, 'performance.evaluate')

export const getKpiDefinitions = createSafeAction(z.object({}), async (_, auth) => {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
        .from('kpi_definitions')
        .select('*')
        .eq('org_id', auth.orgId)
        .order('name')

    if (error) throw error
    return data
})

// ==========================================
// 2. Atribuir Metas (Targets) aos Colaboradores
// ==========================================

export const assignKpiTarget = createSafeAction(kpiTargetSchema, async (data, auth) => {
    const supabase = createServerSupabaseClient()

    // VALIDATION: Cross-tenant check (User must belong to the same Org)
    const { data: userData, error: userCheckErr } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', data.user_id)
        .single()

    if (userCheckErr || userData?.org_id !== auth.orgId) {
        throw new Error('O usuário selecionado não pertence à sua organização.')
    }

    const { data: target, error } = await supabase
        .from('kpi_targets')
        .upsert({
            ...data,
            org_id: auth.orgId
        }, { onConflict: 'user_id, kpi_id, period_start, period_end' })
        .select('*')
        .single()

    if (error) throw error

    // Se criou uma meta, vamos garantir que existe um "result" vazio atrelado
    const { error: resultErr } = await supabase.from('kpi_results').insert({
        org_id: auth.orgId,
        target_id: target.id,
        actual_value: 0,
        achievement_percentage: 0
    })

    // Ignorar duplicatas se já existe (upsert natural pelo ID unico target_id)
    if (resultErr && resultErr.code !== '23505') throw resultErr

    revalidatePath('/admin/kpis/targets')
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

    // 3. Atualizar Resultado (A Policy de RLS grantirá que ele só dê UPDATE se o target for dele)
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

    revalidatePath('/dashboard/kpis')
    return result
}, 'pdi.manage')
