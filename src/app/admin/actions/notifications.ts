'use server'

import { logAudit } from '@/lib/supabase/audit'
import { Resend } from 'resend'
import { getEmailHtmlLayout } from '@/lib/emails/EmailLayout'

interface EmailParams {
    to: string
    subject: string
    body: string
    type: 'welcome' | 'interview_scheduled' | 'onboarding_completed'
}

/**
 * Serviço centralizado de disparos de notificações.
 * Agora integrado com Resend para envios reais e profissionais.
 */
export async function sendNotification({ to, subject, body, type }: EmailParams) {
    try {
        console.log(`[Email Service] Iniciando envio para ${to}: ${subject}`)

        // Registramos no log de auditoria como uma notificação enviada pelo sistema
        await logAudit({
            tableName: 'notifications',
            recordId: 'system-' + Date.now(),
            action: 'INSERT',
            newValues: {
                to,
                subject,
                type,
                sent_at: new Date().toISOString()
            }
        })

        const RESEND_API_KEY = process.env.RESEND_API_KEY
        const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

        if (RESEND_API_KEY) {
            const resend = new Resend(RESEND_API_KEY)
            const html = getEmailHtmlLayout(subject, body)

            const { data, error: resendError } = await resend.emails.send({
                from: `RG Digital <${FROM_EMAIL}>`,
                to: [to],
                subject,
                html: html
            })

            if (resendError) {
                console.error('[Email Service] Erro no Resend API:', resendError)
                throw resendError
            }

            console.log(`[Email Service] E-mail enviado com sucesso via Resend. ID: ${data?.id}`)
        } else {
            console.warn('[Email Service] RESEND_API_KEY não configurada. E-mail apenas logado no console.')
        }

        return { success: true }
    } catch (error: unknown) {
        const err = error as Error
        console.error('Erro crítico ao enviar notificação:', err)
        return { success: false, error: err.message }
    }
}

/**
 * Atalho para e-mail de boas-vindas
 */
export async function sendWelcomeEmail(email: string, name: string) {
    return sendNotification({
        to: email,
        subject: 'Bem-vindo ao RG Digital! 🚀',
        type: 'welcome',
        body: `Olá ${name},\n\nSua conta no RG Digital foi criada com sucesso. Acesse agora para completar seu onboarding.`
    })
}

/**
 * Atalho para notificação de entrevista
 */
export async function sendInterviewNotification(email: string, candidateName: string, date: string) {
    return sendNotification({
        to: email,
        subject: `Entrevista Agendada: ${candidateName}`,
        type: 'interview_scheduled',
        body: `Uma nova entrevista foi agendada para o candidato ${candidateName} na data ${date}.`
    })
}
