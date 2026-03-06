import { z } from 'zod'
import { PERMISSIONS } from '@/types'

/**
 * Helpers reusáveis
 */
const trimmed = (min = 1, msg = 'Campo obrigatório') =>
  z.string().trim().min(min, msg)

const uuid = z.string().uuid('UUID inválido')

const email = z
  .string()
  .trim()
  .email('Email inválido')
  .transform((v) => v.toLowerCase())



/**
 * Slug: mantém seu regex, mas normaliza antes.
 */
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, 'Slug deve ter no mínimo 2 caracteres')
  .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens')

/**
 * Login
 */
export const loginSchema = z
  .object({
    email,
    password: z
      .string()
      .min(6, 'Senha deve ter no mínimo 6 caracteres')
      .max(72, 'Senha muito longa'),
  })
  .strict()

export type LoginInput = z.infer<typeof loginSchema>

/**
 * Organization
 */
export const organizationSchema = z
  .object({
    name: trimmed(2, 'Nome deve ter no mínimo 2 caracteres').max(120, 'Nome muito longo'),
    slug,
    custom_domain: z.string().trim().toLowerCase().optional().or(z.literal('')),
    mfa_enforced: z.boolean().default(false),
    security_settings: z.object({
      password_policy: z.object({
        min_length: z.number().min(6).max(72).default(8),
        require_uppercase: z.boolean().default(true),
        require_numbers: z.boolean().default(true),
        require_symbols: z.boolean().default(false),
      }),
    }).default({
      password_policy: {
        min_length: 8,
        require_uppercase: true,
        require_numbers: true,
        require_symbols: false,
      },
    }),
    settings: z.record(z.string(), z.unknown()).default({}),
  })
  .strict()

export type OrganizationInput = z.infer<typeof organizationSchema>

/**
 * Unit
 */
export const unitSchema = z
  .object({
    name: trimmed(2, 'Nome deve ter no mínimo 2 caracteres').max(120, 'Nome muito longo'),
    parent_id: z.string().uuid().optional(),
  })
  .strict()

export type UnitInput = z.infer<typeof unitSchema>

/**
 * User
 */
export const userSchema = z
  .object({
    email,
    full_name: trimmed(2, 'Nome deve ter no mínimo 2 caracteres').max(120, 'Nome muito longo'),
    role_id: uuid,
    unit_id: uuid,
    position_id: z.string().uuid().optional(),
  })
  .strict()

export type UserInput = z.infer<typeof userSchema>

/**
 * Position
 */
export const positionSchema = z
  .object({
    title: trimmed(2, 'Título deve ter no mínimo 2 caracteres').max(120, 'Título muito longo'),
    level_id: z.string().uuid().optional(),
    track_id: z.string().uuid().optional(),
    description: z.string().trim().max(2000, 'Descrição muito longa').optional(),
  })
  .strict()

export type PositionInput = z.infer<typeof positionSchema>

/**
 * Level
 */
export const levelSchema = z
  .object({
    name: trimmed(2, 'Nome deve ter no mínimo 2 caracteres').max(80, 'Nome muito longo'),
    sequence: z.number().int('Sequence deve ser inteiro').min(0, 'Sequence deve ser >= 0'),
    min_time_months: z.number().int('Tempo mínimo deve ser inteiro').min(0, 'Tempo mínimo deve ser >= 0'),
    description: z.string().trim().max(2000, 'Descrição muito longa').optional(),
  })
  .strict()

export type LevelInput = z.infer<typeof levelSchema>

/**
 * Track Stage
 */
export const trackStageSchema = z
  .object({
    key: trimmed(1, 'Key é obrigatória').max(10, 'Key muito longa'),
    sequence: z.number().int().min(0),
    name: trimmed(2, 'Nome deve ter no mínimo 2 caracteres').max(100, 'Nome muito longo'),
    description: trimmed(0).max(500, 'Descrição muito longa').optional(),
    requirements: z.array(
      z.object({
        type: z.enum(['time_in_level', 'kpi_consistency', 'no_critical_gaps', 'custom']),
        value: z.number().optional(),
      })
    ).default([]),
  })
  .strict()

export type TrackStageInput = z.infer<typeof trackStageSchema>

/**
 * Track
 */
export const trackSchema = z
  .object({
    name: trimmed(2, 'Nome deve ter no mínimo 2 caracteres').max(120, 'Nome muito longo'),
    description: z.string().trim().max(2000, 'Descrição muito longa').optional(),
    stages: z.array(trackStageSchema).min(1, 'Adicione pelo menos uma etapa'),
  })
  .strict()

export type TrackInput = z.infer<typeof trackSchema>

/**
 * Custom Reports (Self-service Analytics)
 */
export const customReportSchema = z
  .object({
    name: trimmed(3, 'Nome deve ter no mínimo 3 caracteres').max(100, 'Nome muito longo'),
    config: z.record(z.string(), z.unknown()).default({}),
  })
  .strict()

export type CustomReportInput = z.infer<typeof customReportSchema>

/**
 * Permissions - RBAC
 */
// Usar unknown primeiro para evitar erro de readonly
const permissionKeys = (PERMISSIONS as unknown) as [string, ...string[]]

export const rolePermissionsSchema = z
  .record(
    z.enum(permissionKeys),
    z.boolean()
  )
  .optional()

export type RolePermissionsInput = z.infer<typeof rolePermissionsSchema>
