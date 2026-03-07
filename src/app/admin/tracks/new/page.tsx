export const dynamic = 'force-dynamic'
import Link from 'next/link'
import TrackForm from '../TrackForm'
import { getOrganizations } from '../../actions/organizations'

export default async function NewTrackPage() {
  const orgsResult = await getOrganizations()
  const organizations = orgsResult.success ? (orgsResult.data as any) : []

  return (
    <div className="min-h-screen bg-background text-sm">
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/admin/tracks" className="text-primary hover:text-primary/80 text-sm font-medium">
            ← Voltar
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-1">Nova Trilha de Carreira</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TrackForm organizations={organizations} />
      </main>
    </div>
  )
}
