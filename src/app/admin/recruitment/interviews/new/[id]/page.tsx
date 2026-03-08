import { notFound } from 'next/navigation'
import { getCandidateById, getResumeSignedUrl } from '@/services/recruitment/candidates'
import InterviewFormSTAR from '../InterviewFormSTAR'

export const dynamic = 'force-dynamic'

export default async function NewInterviewPage({ params }: { params: { id: string } }) {
    const result = await getCandidateById(params.id)

    if (!result.success || !result.data) {
        notFound()
    }

    let resumeSignedUrl = null
    if (result.data.resume_url) {
        const urlResult = await getResumeSignedUrl(result.data.resume_url)
        if (urlResult.success) {
            resumeSignedUrl = urlResult.data
        }
    }

    const candidate = {
        id: result.data.id,
        full_name: result.data.full_name,
        resumeUrl: resumeSignedUrl
    }


    return (
        <div className="min-h-screen bg-muted/20">
            <InterviewFormSTAR candidate={candidate} />
        </div>
    )
}
