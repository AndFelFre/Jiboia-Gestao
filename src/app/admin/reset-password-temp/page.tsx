'use client'
import { useEffect, useState } from 'react'
import { resetUserPasswordAdmin } from './action'

export default function ResetPasswordPage() {
    const [status, setStatus] = useState('Iniciando reset...')

    useEffect(() => {
        async function doReset() {
            try {
                const result = await resetUserPasswordAdmin()
                if (result.success) {
                    setStatus('✅ Sucesso: ' + result.message)
                } else {
                    setStatus('❌ Erro: ' + result.error)
                }
            } catch (e: any) {
                setStatus('❌ Erro inesperado: ' + e.message)
            }
        }
        doReset()
    }, [])

    return (
        <div className="p-10 font-mono text-sm leading-relaxed">
            <h1 className="text-xl font-bold mb-4">Reset de Senha Admin</h1>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                {status}
            </div>
            <p className="mt-4 text-slate-400">Esta página é temporária e deve ser removida após o uso.</p>
        </div>
    )
}
