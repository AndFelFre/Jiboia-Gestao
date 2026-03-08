import { z } from 'zod'

/**
 * SmartGoalSchema: Contrato de integridade para metas SMART.
 * Garante que mudanças no módulo de PDI não quebrem o motor de Performance.
 */
export const SmartGoalSchema = z.object({
    id: z.string().uuid(),
    plan_id: z.string().uuid(),
    performance_evaluation_id: z.string().uuid().nullable(),
    title: z.string().min(3, "Título muito curto"),
    description: z.string().optional(),
    deadline: z.string().optional(),
    category: z.literal('smart_goal'),
    status: z.enum(['not_started', 'in_progress', 'completed', 'cancelled']),
    created_at: z.string(),
    updated_at: z.string()
})

/**
 * EvaluationSnapshotSchema: Validação de entrada para mutações de performance.
 */
export const EvaluationSnapshotSchema = z.object({
    resilience: z.number().min(1).max(5),
    utility: z.number().min(1).max(5),
    ambition: z.number().min(1).max(5),
    potential_score: z.number().min(1).max(3).optional(),
    potential_comments: z.string().optional(),
    rua_comments: z.string().optional(),
    overall_comments: z.string().optional(),
    status: z.enum(['draft', 'in_progress', 'closed', 'cancelled'])
})

export type SmartGoal = z.infer<typeof SmartGoalSchema>
export type EvaluationSnapshot = z.infer<typeof EvaluationSnapshotSchema>
