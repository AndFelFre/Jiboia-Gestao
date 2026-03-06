'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createSafeAction } from '@/lib/supabase/safe-action'
import { z } from 'zod'
import type { User, Organization, Unit, Role, Position, Level } from '@/types'

export interface FullProfile extends User {
    organizations: Organization
    units: Unit
    roles: Role
    positions: (Position & {
        levels: Level | null
    }) | null
}

export const getMyProfile = createSafeAction(z.object({}), async (_, auth) => {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
        .from('users')
        .select(`
            *,
            organizations (*),
            units (*),
            roles (*),
            positions (
                *,
                levels (*)
            )
        `)
        .eq('id', auth.userId)
        .single()

    if (error) throw error

    return data as unknown as FullProfile
})
