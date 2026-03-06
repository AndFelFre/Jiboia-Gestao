/**
 * Utilitário para gerar o layout HTML base dos e-mails do sistema.
 * CSS inline é necessário para garantir compatibilidade em diversos clientes de e-mail.
 */
export function getEmailHtmlLayout(title: string, bodyContent: string) {
    const primaryColor = '#4f46e5'; // Indigo-600
    const bgColor = '#f8fafc'; // Slate-50
    const textColor = '#1e293b'; // Slate-800

    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: ${bgColor}; color: ${textColor};">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <tr>
                <td align="center" style="padding: 40px 20px; background-color: ${primaryColor};">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">RG DIGITAL</h1>
                    <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.8); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Gente & Gestão</p>
                </td>
            </tr>
            <!-- Content -->
            <tr>
                <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px 0; font-size: 20px; font-bold; color: #0f172a;">${title}</h2>
                    <div style="font-size: 16px; line-height: 1.6; color: #334155;">
                        ${bodyContent.replace(/\n/g, '<br/>')}
                    </div>
                </td>
            </tr>
            <!-- Footer -->
            <tr>
                <td align="center" style="padding: 30px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; font-size: 12px; color: #64748b;">
                        &copy; ${new Date().getFullYear()} RG Digital - Plataforma de Desenvolvimento Humano.
                    </p>
                    <p style="margin: 10px 0 0 0; font-size: 11px; color: #94a3b8;">
                        Este é um e-mail automático enviado pelo sistema. Por favor, não responda.
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
}
