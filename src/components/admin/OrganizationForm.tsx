'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { organizationSchema, type OrganizationInput } from '@/validations/schemas'
import Link from 'next/link'

interface OrganizationFormProps {
    initialData?: any
    onSubmit: (data: OrganizationInput) => Promise<{ success: boolean; error?: string }>
    title: string
    actionLabel: string
}

export function OrganizationForm({ initialData, onSubmit, title, actionLabel }: OrganizationFormProps) {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Extrai configurações existentes ou define padróes (ex.: cor primária)
    const defaultSettings = initialData?.settings || {}
    const initialTheme = defaultSettings.theme || { primary: '#4f46e5' }

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<any>({
        resolver: zodResolver(organizationSchema),
        defaultValues: {
            name: initialData?.name || '',
            slug: initialData?.slug || '',
            custom_domain: initialData?.custom_domain || '',
            mfa_enforced: initialData?.mfa_enforced || false,
            security_settings: initialData?.security_settings || {
                password_policy: {
                    min_length: 8,
                    require_uppercase: true,
                    require_numbers: true,
                    require_symbols: false,
                }
            },
            settings: defaultSettings,
        }
    })

    // Watchers manuais para o campo de settings no Form
    const currentSettings = watch('settings')

    const handleFormSubmit = async (data: OrganizationInput) => {
        setLoading(true)
        setError('')

        // Assegura injetar o objeto theme nas configurações de settings, 
        // com base no valor escolhido no color picker (mantido localmente pelo settings JSON)
        const result = await onSubmit(data)

        if (!result.success) {
            setError(result.error || 'Ocorreu um erro no formulário')
            setLoading(false)
        }
        // Caso de sucesso, quem invoca propaga (ex: router.push)
    }

    // Permite atualizar cor do sub-schema de Theme e refletir no hook form
    const updateThemePrimaryColor = (color: string) => {
        setValue('settings', {
            ...(currentSettings as any),
            theme: {
                ...(currentSettings as any)?.theme,
                primary: color
            }
        })
    }

    return (
        <div className="bg-card rounded-lg shadow-sm p-6">
            {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded">
                    <p className="text-destructive font-semibold">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                <h2 className="text-xl font-bold mb-4">{title}</h2>

                {/* Basic Information */}
                <div className="space-y-4 border-b border-border pb-6">
                    <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">Informações Básicas</h3>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground">
                            Nome da Organização *
                        </label>
                        <input
                            {...register('name')}
                            type="text"
                            className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            placeholder="Ex: Minha Empresa LTDA"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-destructive">{(errors.name as any).message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="slug" className="block text-sm font-medium text-foreground">
                            Slug *
                        </label>
                        <input
                            {...register('slug')}
                            type="text"
                            className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            placeholder="Ex: minha-empresa"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                            Usado nas URLs. Apenas letras minúsculas, números e hífens.
                        </p>
                        {errors.slug && (
                            <p className="mt-1 text-sm text-destructive">{(errors.slug as any).message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="custom_domain" className="block text-sm font-medium text-foreground">
                            Domínio Customizado (Opcional)
                        </label>
                        <input
                            {...register('custom_domain')}
                            type="text"
                            className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            placeholder="Ex: rh.minha-empresa.com.br"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                            Requer configuração CNAME no seu painel de DNS apontando para o nosso servidor.
                        </p>
                        {errors.custom_domain && (
                            <p className="mt-1 text-sm text-destructive">{(errors.custom_domain as any).message}</p>
                        )}
                    </div>
                </div>

                {/* Branding/Theme Settings */}
                <div className="space-y-4 pt-2">
                    <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">Identidade Visual (White-label)</h3>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Cor Primária da Marca
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                value={(currentSettings as any)?.theme?.primary || initialTheme.primary}
                                onChange={(e) => updateThemePrimaryColor(e.target.value)}
                                className="w-14 h-14 p-1 rounded-lg border border-input cursor-pointer"
                            />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">Cor de Destaque</p>
                                <p className="text-xs text-muted-foreground">Esta cor dominará botões, menus e links para seus colaboradores.</p>
                                <p className="mt-1 font-mono text-xs bg-muted px-2 py-1 rounded inline-block">
                                    {(currentSettings as any)?.theme?.primary || initialTheme.primary}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="block text-sm font-medium text-foreground mb-2">
                            URL do Logotipo (Opcional)
                        </label>
                        <input
                            type="text"
                            value={(currentSettings as any)?.theme?.logo_url || ''}
                            onChange={(e) => {
                                setValue('settings', {
                                    ...(currentSettings as any),
                                    theme: { ...(currentSettings as any)?.theme, logo_url: e.target.value }
                                })
                            }}
                            className="block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm"
                            placeholder="https://suadb.com/logo.png"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">Para obter o melhor resultado, utilize imagens em .PNG ou .SVG com fundo transparente.</p>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="space-y-4 pt-2 border-t border-border mt-8">
                    <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">Segurança & Conformidade</h3>

                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                        <div className="space-y-0.5">
                            <label className="text-sm font-medium">Exigir MFA para todos os usuários</label>
                            <p className="text-xs text-muted-foreground tracking-tight">
                                Usuários serão impedidos de acessar certas áreas se não tiverem MFA ativo.
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            {...register('mfa_enforced')}
                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg">
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold">Política de Senha</h4>
                            <div className="space-y-2">
                                <label className="text-xs font-medium">Comprimento Mínimo</label>
                                <input
                                    type="number"
                                    {...register('security_settings.password_policy.min_length', { valueAsNumber: true })}
                                    className="block w-full px-3 py-1.5 border rounded-md text-sm"
                                    min={6}
                                    max={72}
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    {...register('security_settings.password_policy.require_uppercase')}
                                    className="h-4 w-4 rounded"
                                />
                                <label className="text-xs">Exigir Letra Maiúscula</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    {...register('security_settings.password_policy.require_numbers')}
                                    className="h-4 w-4 rounded"
                                />
                                <label className="text-xs">Exigir Números</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    {...register('security_settings.password_policy.require_symbols')}
                                    className="h-4 w-4 rounded"
                                />
                                <label className="text-xs">Exigir Símbolos</label>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="flex justify-end space-x-4 pt-6 border-t border-border mt-8">
                    <Link
                        href="/admin/organizations"
                        className="px-4 py-2 border border-input rounded text-foreground hover:bg-muted font-medium"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 font-bold"
                    >
                        {loading ? 'Salvando...' : actionLabel}
                    </button>
                </div>
            </form>
        </div>
    )
}
