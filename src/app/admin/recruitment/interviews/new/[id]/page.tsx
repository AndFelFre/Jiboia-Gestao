import { notFound } from 'next/navigation'
import { getCandidateById } from '../../../../actions/recruitment-candidates'
import InterviewFormSTAR from '../InterviewFormSTAR'

export const dynamic = 'force-dynamic'

export default async function NewInterviewPage({ params }: { params: { id: string } }) {
    const result = await getCandidateById(params.id)

    if (!result.success || !result.data) {
        notFound()
    }

    const candidate = {
        id: result.data.id,
        full_name: result.data.full_name
    }

    return (
        <div className="min-h-screen bg-muted/20">
            <InterviewFormSTAR candidate={candidate} />
        </div>
    )
}
