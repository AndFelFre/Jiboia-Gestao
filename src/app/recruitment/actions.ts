'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

// Types
export interface Job {
  id: string
  org_id: string
  unit_id: string | null
  position_id: string | null
  title: string
  description: string | null
  requirements: string[] | null
  responsibilities: string[] | null
  location: string | null
  employment_type: string | null
  salary_min: number | null
  salary_max: number | null
  positions_count: number
  status: 'draft' | 'open' | 'paused' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  sla_days: number
  created_by: string | null
  created_at: string
  updated_at: string
  closed_at: string | null
  organizations?: { name: string }
  units?: { name: string }
  positions?: { title: string }
}

export interface Candidate {
  id: string
  job_id: string
  org_id: string
  full_name: string
  email: string
  phone: string | null
  linkedin_url: string | null
  portfolio_url: string | null
  resume_url: string | null
  source: string | null
  stage: string
  stage_changed_at: string
  fit_score: number | null
  notes: string | null
  created_at: string
  updated_at: string
  jobs?: { title: string }
}

export interface Interview {
  id: string
  candidate_id: string
  interviewer_id: string
  type: string
  star_situation: string | null
  star_task: string | null
  star_action: string | null
  star_result: string | null
  fit_integrity: number | null
  fit_focus: number | null
  fit_learning: number | null
  fit_challenge: number | null
  fit_communication: number | null
  fit_service: number | null
  fit_persistence: number | null
  final_score: number | null
  justification: string
  recommendation: string | null
  next_steps: string | null
  conducted_at: string
  users?: { full_name: string }
}

// Jobs
export async function getJobs(orgId?: string): Promise<ActionResult<Job[]>> {
  try {
    const supabase = createServerSupabaseClient()
    
    let query = supabase
      .from('jobs')
      .select('*, organizations(name), units(name), positions(title)')
      .order('created_at', { ascending: false })
    
    if (orgId) {
      query = query.eq('org_id', orgId)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Erro ao buscar vagas:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, data: data as Job[] }
  } catch (error: unknown) {
    console.error('Erro inesperado:', error)
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function createJob(formData: Partial<Job>): Promise<ActionResult<Job>> {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data: userData } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        ...formData,
        created_by: userData.user?.id,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar vaga:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/recruitment/jobs')
    return { success: true, data: data as Job }
  } catch (error: unknown) {
    console.error('Erro inesperado:', error)
    return { success: false, error: getErrorMessage(error) }
  }
}

// Candidates
export async function getCandidates(jobId?: string): Promise<ActionResult<Candidate[]>> {
  try {
    const supabase = createServerSupabaseClient()
    
    let query = supabase
      .from('candidates')
      .select('*, jobs(title)')
      .order('created_at', { ascending: false })
    
    if (jobId) {
      query = query.eq('job_id', jobId)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Erro ao buscar candidatos:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, data: data as Candidate[] }
  } catch (error: unknown) {
    console.error('Erro inesperado:', error)
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function createCandidate(formData: Partial<Candidate>): Promise<ActionResult<Candidate>> {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('candidates')
      .insert(formData)
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar candidato:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/recruitment/candidates')
    return { success: true, data: data as Candidate }
  } catch (error: unknown) {
    console.error('Erro inesperado:', error)
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function updateCandidateStage(
  candidateId: string, 
  newStage: string
): Promise<ActionResult> {
  try {
    const supabase = createServerSupabaseClient()
    
    const { error } = await supabase
      .from('candidates')
      .update({ stage: newStage })
      .eq('id', candidateId)
    
    if (error) {
      console.error('Erro ao atualizar etapa:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/recruitment/candidates')
    return { success: true }
  } catch (error: unknown) {
    console.error('Erro inesperado:', error)
    return { success: false, error: getErrorMessage(error) }
  }
}

// Interviews
export async function createInterview(formData: Partial<Interview>): Promise<ActionResult<Interview>> {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data: userData } = await supabase.auth.getUser()
    
    // Calcular score final
    const scores = [
      formData.fit_integrity,
      formData.fit_focus,
      formData.fit_learning,
      formData.fit_challenge,
      formData.fit_communication,
      formData.fit_service,
      formData.fit_persistence,
    ].filter(Boolean) as number[]
    
    const finalScore = scores.length > 0 
      ? scores.reduce((a, b) => a + b, 0) / scores.length 
      : null
    
    const { data, error } = await supabase
      .from('interviews')
      .insert({
        ...formData,
        interviewer_id: userData.user?.id,
        final_score: finalScore,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar entrevista:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/recruitment/interviews')
    return { success: true, data: data as Interview }
  } catch (error: unknown) {
    console.error('Erro inesperado:', error)
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function getInterviews(candidateId?: string): Promise<ActionResult<Interview[]>> {
  try {
    const supabase = createServerSupabaseClient()
    
    let query = supabase
      .from('interviews')
      .select('*, users(full_name)')
      .order('conducted_at', { ascending: false })
    
    if (candidateId) {
      query = query.eq('candidate_id', candidateId)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Erro ao buscar entrevistas:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, data: data as Interview[] }
  } catch (error: unknown) {
    console.error('Erro inesperado:', error)
    return { success: false, error: getErrorMessage(error) }
  }
}
