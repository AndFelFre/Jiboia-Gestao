export const dynamic = 'force-dynamic'
import Link from 'next/link'
import PositionForm from '../PositionForm'
import { getOrganizations } from '../../actions/organizations'
import { getLevels } from '../../actions/levels'

export default async function NewPositionPage() {
  const [orgsResult, levelsResult] = await Promise.all([
    getOrganizations(),
    getLevels()
  ])

  const organizations = orgsResult.success ? (orgsResult.data as any) : []
  const levels = levelsResult.success ? (levelsResult.data as any) : []

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/admin/positions" className="text-primary hover:text-primary/80 text-sm font-medium">
            ← Voltar
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-1">Novo Cargo</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PositionForm organizations={organizations} levels={levels} />
      </main>
    </div>
  )
}
