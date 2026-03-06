import { z } from 'zod'

export const kpiDefinitionSchema = z.object({
    name: z.string().min(2, "O nome do KPI deve ter no mínimo 2 caracteres"),
    key_slug: z.string().min(2),
    data_type: z.enum(['number', 'percentage', 'currency', 'time']),
    is_reversed: z.boolean().default(false),
    min_green_threshold: z.number().min(0).default(100),
    min_yellow_threshold: z.number().min(0).default(80),
    cap_percentage: z.number().min(50).default(150),
})

export const kpiTargetSchema = z.object({
    user_id: z.string().uuid(),
    kpi_id: z.string().uuid(),
    weight: z.number().min(0).max(100).default(1),
    period_start: z.string(), // YYYY-MM-DD
    period_end: z.string(),   // YYYY-MM-DD
    target_value: z.number().min(0),
})

export const kpiResultSchema = z.object({
    target_id: z.string().uuid(),
    actual_value: z.number().min(0),
    notes: z.string().optional(),
})
