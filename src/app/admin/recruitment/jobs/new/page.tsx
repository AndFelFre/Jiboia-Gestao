import { getOrganizations } from '@/app/admin/actions/organizations'
import { getUnits } from '@/app/admin/actions/units'
import { getPositions } from '@/app/admin/actions/positions'
import JobFormAdmin from './JobFormAdmin'

export const dynamic = 'force-dynamic'

export default async function NewJobPage() {
    const [orgsResult, unitsResult, positionsResult] = await Promise.all([
        getOrganizations(),
        getUnits(),
        getPositions()
    ])

    const organizations = orgsResult.success && orgsResult.data ? orgsResult.data : []
    const units = unitsResult.success && unitsResult.data ? unitsResult.data : []
    const positions = positionsResult.success && positionsResult.data ? positionsResult.data : []

    return (
        <div className="min-h-screen bg-background">
            <JobFormAdmin
                organizations={organizations as any}
                units={units as any}
                positions={positions as any}
            />
        </div>
    )
}
