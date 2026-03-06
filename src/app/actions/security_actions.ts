'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuth, requirePermission } from '@/lib/supabase/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const mfaVerifySchema = z.object({
    code: z.string().length(6, 'O código deve ter 6 dígitos'),
    factorId: z.string().uuid(),
})

export async function getMFASetup() {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        // Inicia o processo de enrollment para TOTP
        const { data, error } = await supabase.auth.mfa.enroll({
            factorType: 'totp'
        })

        if (error) {
            console.error('Erro ao iniciar enrollment MFA:', error.message)
            return { success: false, error: 'Erro ao iniciar configuração de MFA.' }
        }

        return {
            success: true,
            data: {
                id: data.id,
                type: data.type,
                totp: data.totp // Contém secret e qr_code (svg)
            }
        }
    } catch (err: any) {
        return { success: false, error: err.message || 'Erro inesperado.' }
    }
}

export async function verifyAndEnableMFA(code: string, factorId: string) {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        // 1. Cria o challenge
        const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
            factorId
        })

        if (challengeError) {
            return { success: false, error: 'Erro ao gerar desafio MFA.' }
        }

        // 2. Verifica o código
        const { error: verifyError } = await supabase.auth.mfa.verify({
            factorId,
            challengeId: challengeData.id,
            code
        })

        if (verifyError) {
            return { success: false, error: 'Código inválido ou expirado.' }
        }

        revalidatePath('/dashboard/meu-perfil')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message || 'Erro inesperado.' }
    }
}

export async function unenrollMFA(factorId: string) {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        const { error } = await supabase.auth.mfa.unenroll({
            factorId
        })

        if (error) {
            return { success: false, error: 'Erro ao remover MFA.' }
        }

        revalidatePath('/dashboard/meu-perfil')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message || 'Erro inesperado.' }
    }
}

export async function getActiveMFAFactors() {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase.auth.mfa.listFactors()

        if (error) {
            return { success: false, error: 'Erro ao listar fatores de segurança.' }
        }

        return { success: true, data: data.all }
    } catch (err: any) {
        return { success: false, error: err.message || 'Erro inesperado.' }
    }
}

export async function updateOrgSecuritySettings(orgId: string, payload: any) {
    try {
        await requirePermission('org.manage')
        const supabase = createServerSupabaseClient()

        const { error } = await supabase
            .from('organizations')
            .update({
                mfa_enforced: payload.mfa_enforced,
                security_settings: payload.security_settings,
                updated_at: new Date().toISOString()
            })
            .eq('id', orgId)

        if (error) {
            return { success: false, error: 'Erro ao atualizar configurações de segurança.' }
        }

        revalidatePath('/admin/organizations')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message || 'Erro inesperado.' }
    }
}
