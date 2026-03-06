'use client'

import { createOrganization } from '../../actions/organizations'
import { useRouter } from 'next/navigation'
import { OrganizationForm } from '@/components/admin/OrganizationForm'
import { OrganizationInput } from '@/validations/schemas'
import Link from 'next/link'

export default function NewOrganizationPage() {
  const router = useRouter()

  const handleCreate = async (data: OrganizationInput) => {
    const result = await createOrganization(data)
    if (result.success) {
      router.push('/admin/organizations')
      router.refresh()
    }
    return result
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/admin/organizations" className="text-primary hover:text-primary/80 text-sm">
            ← Voltar
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-1">Nova Organização</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OrganizationForm
          title="Nova Organização"
          actionLabel="Criar Sistema de Organização"
          onSubmit={handleCreate}
        />
      </main>
    </div>
  )
}
