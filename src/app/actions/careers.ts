'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { publicApplicationSchema } from '@/validations/careers'

interface PublicJob {
    id: string
    title: string
    description: string | null
    location: string | null
    employment_type: string | null
    salary_min: number | null
    salary_max: number | null
    requirements?: string[]
    responsibilities?: string[]
    organizations: { name: string } | null
    positions?: { title: string } | null
}

/**
 * Lista vagas públicas — RLS policy `careers_public_read_open_jobs`
 * permite anon ler apenas vagas com status = 'open'.
 */
export async function getPublicJobs(): Promise<{ success: boolean, jobs: PublicJob[] }> {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from('jobs')
            .select('id, title, description, location, employment_type, salary_min, salary_max, organizations(name)')
            .eq('status', 'open') // Reforço de segurança
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[Careers] Erro ao buscar vagas:', error.message)
            return { success: false, jobs: [] }
        }

        // Normalização de joins (Supabase retorna array para relações)
        const normalizedJobs = (data || []).map(job => ({
            ...job,
            organizations: Array.isArray(job.organizations) ? job.organizations[0] : job.organizations
        }))

        return { success: true, jobs: normalizedJobs as unknown as PublicJob[] }
    } catch {
        return { success: false, jobs: [] }
    }
}

/**
 * Busca detalhes de uma vaga pública por ID.
 * RLS garante que só vagas abertas são visíveis para anon.
 */
export async function getPublicJobById(id: string): Promise<{ success: boolean, job: PublicJob | null }> {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from('jobs')
            .select('id, title, description, requirements, responsibilities, location, employment_type, salary_min, salary_max, organizations(name), positions(title)')
            .eq('id', id)
            .single()

        if (error || !data) {
            return { success: false, job: null }
        }

        // Normalização de joins
        const job = {
            ...data,
            organizations: Array.isArray(data.organizations) ? data.organizations[0] : data.organizations,
            positions: Array.isArray(data.positions) ? data.positions[0] : data.positions
        }

        return { success: true, job: job as unknown as PublicJob }
    } catch {
        return { success: false, job: null }
    }
}



/**
 * Write-Only Vault: candidatura pública opaca.
 * 
 * Segurança delegada ao PostgreSQL:
 * - RLS `careers_public_insert_candidate` valida que a vaga existe e está aberta
 * - Anon não tem SELECT/UPDATE/DELETE em candidates
 * - Zod sanitiza inputs antes do INSERT
 * 
 * Retorno OPACO — sem IDs, sem eco de dados.
 */
export async function submitApplication(formData: unknown) {
    try {
        // Camada 0: Validação Turnstile — barrar robôs antes de tocar no banco
        const rawData = formData as Record<string, unknown>
        const turnstileToken = rawData?.turnstile_token as string | undefined

        if (!turnstileToken) {
            return {
                success: false,
                message: 'Verificação de segurança obrigatória. Recarregue a página.'
            }
        }

        const turnstileSecret = process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA' // Test key (always passes)
        const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                secret: turnstileSecret,
                response: turnstileToken,
            }),
        })

        const verifyResult = await verifyResponse.json()

        if (!verifyResult.success) {
            console.warn('[Careers] Turnstile rejeitou token:', verifyResult['error-codes'])
            return {
                success: false,
                message: 'Verificação de segurança falhou. Tente novamente.'
            }
        }

        // Camada 1: Validação Zod agressiva
        const parsed = publicApplicationSchema.safeParse(formData)

        if (!parsed.success) {
            return {
                success: false,
                message: 'Dados inválidos. Verifique os campos e tente novamente.'
            }
        }

        const { job_id, full_name, email, phone, linkedin_url, summary, resume_file } = parsed.data

        // Camada 2: Server client — RLS anon filtra vagas abertas automaticamente
        const supabase = createServerSupabaseClient()

        // Camada 3: Upload do Currículo (Fortaleza de Uploads)
        let resumeUrl = null
        if (resume_file && resume_file instanceof File && resume_file.size > 0) {
            const fileExt = resume_file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
            const filePath = `${job_id}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(filePath, resume_file, {
                    contentType: resume_file.type,
                    upsert: false
                })

            if (uploadError) {
                console.error('[Careers] Erro no upload do currículo:', uploadError.message)
                return {
                    success: false,
                    message: 'Erro ao enviar currículo. Tente novamente ou use um link.'
                }
            }

            // Guardamos o caminho interno do bucket
            resumeUrl = filePath
        }

        // Camada 4: INSERT opaco — Trigger preenche org_id, RLS WITH CHECK valida
        // O front-end NUNCA envia org_id — o banco preenche sozinho
        const { error: insertError } = await supabase
            .from('candidates')
            .insert({
                job_id,
                // org_id: preenchido pelo Trigger trg_set_candidate_org
                full_name,
                email,
                phone: phone || null,
                linkedin_url: linkedin_url || null,
                resume_url: resumeUrl, // Novo campo preenchido
                notes: summary || null,
                source: 'careers_portal',
                stage: 'new',
                stage_changed_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })

        if (insertError) {
            if (insertError.code === '23505') {
                return {
                    success: false,
                    message: 'Você já se candidatou a esta vaga.'
                }
            }

            console.error('[Careers] Erro ao salvar candidatura:', insertError.message)
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
