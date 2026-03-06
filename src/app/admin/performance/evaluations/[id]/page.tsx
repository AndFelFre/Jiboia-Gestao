import { notFound } from 'next/navigation'
import { getEvaluationById } from '../../../actions/performance-evaluations'
import EvaluationForm from '../EvaluationForm'

export const dynamic = 'force-dynamic'

export default async function EvaluationDetailPage({ params }: { params: { id: string } }) {
    const result = await getEvaluationById(params.id)

    if (!result.success || !result.data) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-muted/20">
            <main className="max-w-4xl mx-auto px-6 py-8">
                <EvaluationForm evaluation={result.data} />
            </main>
        </div>
    )
}
