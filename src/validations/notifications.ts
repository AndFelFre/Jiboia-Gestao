import { z } from 'zod'

export const pushSubscriptionSchema = z.object({
    subscription: z.any(), // JSON de assinatura do service worker
    deviceName: z.string().optional().default('Navegador Web')
})

export const deletePushSchema = z.object({
    subscriptionJson: z.any()
})
