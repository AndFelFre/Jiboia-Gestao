'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { createSafeAction } from '@/lib/supabase/safe-action'
import { z } from 'zod'

/**
 * Recupera as configurações de branding da organização.
 * Versão pública e segura para uso no RootLayout (não lança exceções de auth).
 */
export async function getBrandingSettings() {
    try {
        const supabase = createServerSupabaseClient()

        // 1. TENTA OBTER A COR BASEADO NO DOMÍNIO (Permite branding antes do login)
        const headerStore = await headers()
        const tenantDomain = headerStore.get('x-tenant-domain')

        if (tenantDomain) {
            const { data: tenantData } = await supabase
                .from('organizations')
                .select('settings')
                .eq('custom_domain', tenantDomain)
                .maybeSingle()

            if (tenantData?.settings) {
                return tenantData.settings
            }
        }

        // 2. TENTA OBTER A COR BASEADO NO USUÁRIO LOGADO (Se houver sessão)
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
            // Busca o orgId do usuário no banco (public.users)
            const { data: userData } = await supabase
                .from('users')
                .select('org_id')
                .eq('id', session.user.id)
                .maybeSingle()

            if (userData?.org_id) {
                const { data: orgData } = await supabase
                    .from('organizations')
                    .select('settings')
                    .eq('id', userData.org_id)
                    .maybeSingle()

                return orgData?.settings || null
            }
        }

        return null
    } catch (error) {
        console.error('⚠️ [getBrandingSettings] Erro silencioso ao buscar branding:', error)
        return null
    }
}
