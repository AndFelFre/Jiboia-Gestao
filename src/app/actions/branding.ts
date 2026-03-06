'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { createSafeAction } from '@/lib/supabase/safe-action'
import { z } from 'zod'

/**
 * Recupera as configurações de branding da organização.
 * Suporta identificação via header (domínio) ou sessão.
 */
export const getBrandingSettings = createSafeAction(z.object({}), async (_, authContext) => {
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

    // 2. FALLBACK: OBTER A COR BASEADO NO USUÁRIO LOGADO (Se authContext for injetado pelo wrapper)
    if (authContext?.orgId) {
        const { data: orgData } = await supabase
            .from('organizations')
            .select('settings')
            .eq('id', authContext.orgId)
            .single()

        return orgData?.settings || null
    }

    return null
})
