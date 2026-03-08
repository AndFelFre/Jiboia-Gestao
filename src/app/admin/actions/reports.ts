'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/supabase/auth'
import { getPerformanceOrganizationAnalytics } from './dho-performance-analytics'
import { getRetentionRiskData } from './analytics'
import { getPulseClimateStats } from './analytics'

export interface ExecutiveReportData {
    period: string
    organizationName: string
    performance: any[]
    retention: any[]
    climate: any
    generatedAt: string
}

export async function getExecutiveSummaryReport(): Promise<{ success: boolean, data?: ExecutiveReportData, error?: string }> {
    try {
        const auth = await requirePermission('org.manage')
        const supabase = createServerSupabaseClient()

        // 1. Buscar nome da organização
        const { data: org } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', auth.orgId)
            .single()

        // 2. Consolidar dados das diversas fontes
        const [perfRes, rentRes, climRes] = await Promise.all([
            getPerformanceOrganizationAnalytics(),
            getRetentionRiskData(),
            getPulseClimateStats()
        ])

        return {
            success: true,
            data: {
                period: 'Trimestre Atual (Q1)',
                organizationName: org?.name || 'Projeto Jiboia',
                performance: perfRes.data || [],
                retention: rentRes.data || [],
                climate: climRes.data || null,
                generatedAt: new Date().toISOString()
            }
        }
    } catch (error) {
        console.error('Error generating executive report:', error)
        return { success: false, error: 'Erro ao consolidar dados do relatório' }
    }
}
