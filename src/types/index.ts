export type ISODateString = string

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface ActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// ============================================
// RBAC - Role Based Access Control
// ============================================

export const PERMISSIONS = [
  'org.manage',
  'unit.manage',
  'users.manage',
  'roles.manage',
  'recruitment.manage',
  'onboarding.manage',
  'offboarding.manage',
  'documents.manage',
  'requests.manage',
  'pdi.manage',
  'feedback.manage',
  'performance.evaluate',
  'audit.read',
  'candidates.manage',
  'interviews.manage',
  'skills.manage',
  'jobs.manage',
] as const

export type PermissionKey = typeof PERMISSIONS[number]
export type RolePermissions = Partial<Record<PermissionKey, boolean>>

export type UserRole = 'admin' | 'leader' | 'employee' | 'recruiter'

// ============================================
// ORGANIZAÇÃO E ESTRUTURA
// ============================================

export interface OrganizationSettings {
  timezone?: string
  currency?: string
  branding?: {
    logo_url?: string
    primary_color?: string
  }
  // Index signature removido - campos adicionais devem ser tipados explicitamente
}

export interface Organization {
  id: string
  name: string
  slug: string
  settings: OrganizationSettings
  created_at: ISODateString
  updated_at: ISODateString
}

export interface Unit {
  id: string
  org_id: string
  name: string
  parent_id: string | null
  created_at: ISODateString
  updated_at: ISODateString
}

// ============================================
// RBAC - ROLES
// ============================================

export interface Role {
  id: string
  name: UserRole
  permissions: RolePermissions
  created_at: ISODateString
}

// ============================================
// USUÁRIOS
// ============================================

export interface User {
  id: string
  org_id: string
  unit_id: string
  role_id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  status: 'active' | 'inactive' | 'pending'
  position_id: string | null
  // FASE 6: Rumo ao 10/10 (Excelência) [EM PROGRESSO]
  // - [/] Saneamento Global de Cores (Dark Mode 100%)
  // - [ ] Implementação de Action Wrappers (Segurança Automatizada)
  // - [ ] Painel de Saúde do Sistema (`/admin/health`)
  // - [ ] Testes de Estresse Multi-tenant
  // level_id removido - vem de position.level_id (fonte única)
  created_at: ISODateString
  updated_at: ISODateString
}

// ============================================
// CARGOS E NÍVEIS
// ============================================

export interface Position {
  id: string
  org_id: string
  title: string
  level_id: string | null
  track_id: string | null
  kpi_template_id: string | null
  description: string | null
  created_at: ISODateString
  updated_at: ISODateString
}

export interface Level {
  id: string
  org_id: string
  name: string
  sequence: number
  min_time_months: number
  description: string | null
  created_at: ISODateString
  updated_at: ISODateString
}

// ============================================
// TRILHAS E PROGRESSÃO
// ============================================

export interface TrackStageRequirement {
  type: 'time_in_level' | 'kpi_consistency' | 'no_critical_gaps' | 'custom'
  value?: number
  meta?: Json
}

export interface TrackStage {
  key: string
  sequence: number
  name: string
  description: string
  requirements: TrackStageRequirement[]
}

export interface Track {
  id: string
  org_id: string
  name: string
  description: string | null
  stages: TrackStage[]
  created_at: ISODateString
  updated_at: ISODateString
}

// ============================================
// AUDITORIA
// ============================================

export interface AuditLog {
  id: string
  org_id: string // Filtrar por org fica mais rápido
  table_name: string
  record_id: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  old_values: Json | null
  new_values: Json | null
  changed_by: string | null // string | null (ações do sistema/background)
  changed_at: ISODateString
  ip_address: string | null // Opcional - dado pessoal LGPD
  request_id?: string | null // Liga com Sentry
}

// ============================================
// PDI - PLANO DE DESENVOLVIMENTO INDIVIDUAL
// ============================================

export type PDIItemStatus = 'not_started' | 'in_progress' | 'completed' | 'cancelled'
export type PDIItemCategory = 'course' | 'mentoring' | 'reading' | 'project' | 'leadership_rite' | 'smart_goal' | 'other'

export type PDIPlanType = 'development' | 'leadership_rites'
export type DHORiteType = 'one_on_one' | 'feedback' | 'checkpoint'

export interface PDIPlan {
  id: string
  org_id: string
  user_id: string
  title: string
  description: string | null
  status: 'active' | 'archived'
  plan_type: PDIPlanType
  reference_year: number | null
  leader_id: string | null
  created_at: ISODateString
  updated_at: ISODateString
}

export interface PDIItem {
  id: string
  plan_id: string
  skill_id: string | null
  title: string
  description: string | null
  category: PDIItemCategory
  status: PDIItemStatus
  deadline: string | null
  rite_type: DHORiteType | null
  completed_by: string | null
  completed_at: ISODateString | null
  created_at: ISODateString
  updated_at: ISODateString
}

export interface SkillGap {
  skill_id: string
  skill_name: string
  current_level: number
  required_level: number
  gap: number
}

// ============================================
// KPIS E INDICADORES
// ============================================

export interface KpiDefinition {
  id: string
  org_id: string
  name: string
  key_slug: string
  data_type: 'number' | 'percentage' | 'currency' | 'time'
  is_reversed: boolean
  min_green_threshold: number
  min_yellow_threshold: number
  cap_percentage: number
  is_active: boolean
  created_at: ISODateString
  updated_at: ISODateString
}

export interface KpiTarget {
  id: string
  org_id: string
  user_id: string
  kpi_id: string
  weight: number
  period_start: string
  period_end: string
  target_value: number
  cycle_id: string | null
  created_at: ISODateString
  updated_at: ISODateString
  kpi_definitions?: KpiDefinition
  users?: { full_name: string }
}

export interface KpiResult {
  id: string
  org_id: string
  target_id: string
  actual_value: number
  achievement_percentage: number
  notes: string | null
  updated_at: ISODateString
}

// ============================================
// AVALIAÇÃO DE DESEMPENHO (RUA + SMART)
// ============================================

export type EvaluationStatus = 'draft' | 'in_progress' | 'closed' | 'cancelled'
export type SMARTGoalStatus = 'planned' | 'in_progress' | 'achieved' | 'partially_achieved' | 'missed'

export type NineBoxQuadrant =
  | 'dilemma' | 'rising_star' | 'star'
  | 'questionable' | 'critical_keeper' | 'future_star'
  | 'risk' | 'effective_specialist' | 'solid_professional'

export interface PerformanceEvaluation {
  id: string
  org_id: string
  user_id: string
  leader_id: string
  status: EvaluationStatus
  reference_period_start: string
  reference_period_end: string
  rua_resilience: number | null
  rua_utility: number | null
  rua_ambition: number | null
  rua_comments: string | null
  overall_comments: string | null
  // FASE 7: CALIBRAÇÃO (9-BOX)
  potential_score: number | null
  potential_comments: string | null
  performance_bucket: number | null
  nine_box_quadrant: NineBoxQuadrant | null
  calibrated_at: string | null
  calibrated_by: string | null

  closed_at: string | null
  closed_by: string | null
  created_at: string
  updated_at: string
  // Relações
  smart_goals?: PDIItem[]
}

export interface CustomReport {
  id: string
  org_id: string
  name: string
  config: Json // Estrutura livre do GridStack/Charts
  created_at: ISODateString
  updated_at: ISODateString
}

// ============================================
// SUPABASE DATABASE TYPES (placeholder)
// ============================================
// Em produção, gerar com: supabase gen types typescript --project-id <id>
// E estender/mapear estes types
