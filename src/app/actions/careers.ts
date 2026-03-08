'use server'

import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { publicApplicationSchema } from '@/validations/careers'

/**
 * Lista vagas públicas — apenas campos seguros de exibição.
 * Usa admin client pois visitantes públicos não têm sessão Supabase.
 */
export async function getPublicJobs() {
    try {
        const supabase = createAdminSupabaseClient()

        const { data, error } = await supabase
            .from('jobs')
            .select('id, title, description, location, employment_type, salary_min, salary_max, organizations(name)')
            .eq('status', 'open')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[Careers] Erro ao buscar vagas:', error.message)
            return { success: false, jobs: [] }
        }

        return { success: true, jobs: data || [] }
    } catch {
        return { success: false, jobs: [] }
    }
}

/**
 * Busca detalhes de uma vaga pública por ID.
 * Campos expostos: título, descrição, requisitos, local. Sem IDs internos de org/user.
 */
export async function getPublicJobById(id: string) {
    try {
        const supabase = createAdminSupabaseClient()

        const { data, error } = await supabase
            .from('jobs')
            .select('id, title, description, requirements, responsibilities, location, employment_type, salary_min, salary_max, organizations(name), positions(title)')
            .eq('id', id)
            .eq('status', 'open')
            .single()

        if (error || !data) {
            return { success: false, job: null }
        }

        return { success: true, job: data }
    } catch {
        return { success: false, job: null }
    }
}

/**
 * Write-Only Vault: candidatura pública opaca.
 * 
 * 1. Valida Zod agressivo (strip HTML, max lengths)
 * 2. INSERT em candidates via admin client
 * 3. Retorno OPACO — sem IDs, sem eco de dados
 * 4. Erro GENÉRICO — sem pistas da estrutura SQL
 */
export async function submitApplication(formData: unknown) {
    try {
        // Camada 1: Validação Zod agressiva
        const parsed = publicApplicationSchema.safeParse(formData)

        if (!parsed.success) {
            return {
                success: false,
                message: 'Dados inválidos. Verifique os campos e tente novamente.'
            }
        }

        const { job_id, full_name, email, phone, linkedin_url, summary } = parsed.data

        // Camada 2: Verificar se a vaga existe e está aberta
        const supabase = createAdminSupabaseClient()

        const { data: job, error: jobError } = await supabase
            .from('jobs')
            .select('id, org_id, status')
            .eq('id', job_id)
            .single()

        if (jobError || !job || job.status !== 'open') {
            return {
                success: false,
                message: 'Esta vaga não está mais disponível.'
            }
        }

        // Camada 3: INSERT opaco (Write-Only Vault)
        const { error: insertError } = await supabase
            .from('candidates')
            .insert({
                job_id,
                org_id: job.org_id,
                full_name,
                email,
                phone: phone || null,
                linkedin_url: linkedin_url || null,
                notes: summary || null,
                source: 'careers_portal',
                stage: 'new',
                stage_changed_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })

        if (insertError) {
            // Erro de duplicata (mesmo e-mail na mesma vaga)
            if (insertError.code === '23505') {
                return {
                    success: false,
                    message: 'Você já se candidatou a esta vaga.'
                }
            }

            console.error('[Careers] Erro ao salvar candidatura:', insertError.message)
            // Camada 4: Erro genérico — sem pistas
            return {
                success: false,
                message: 'Erro ao processar candidatura. Tente novamente mais tarde.'
            }
        }

        // Retorno OPACO — sem ID, sem eco
        return {
            success: true,
            message: 'Candidatura recebida com sucesso! Boa sorte no processo seletivo.'
        }
    } catch (error) {
        console.error('[Careers] Erro inesperado:', error)
        return {
            success: false,
            message: 'Erro ao processar candidatura. Tente novamente mais tarde.'
        }
    }
}
