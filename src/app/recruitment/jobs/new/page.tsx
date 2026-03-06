import { getOrganizations } from '@/app/admin/actions/organizations'
import { getUnits } from '@/app/admin/actions/units'
import { getPositions } from '@/app/admin/actions/positions'
import JobForm from './JobForm'

export const dynamic = 'force-dynamic'

interface Organization {
  id: string
  name: string
}

interface Unit {
  id: string
  name: string
  org_id: string
}

interface Position {
  id: string
  title: string
  org_id: string
}

export default async function NewJobPage() {
  const [orgsResult, unitsResult, positionsResult] = await Promise.all([
    getOrganizations(),
    getUnits(),
    getPositions()
  ])

  return (
    <JobForm
      organizations={orgsResult.success && orgsResult.data 
        ? (orgsResult.data as Organization[]) 
        : []}
      units={unitsResult.success && unitsResult.data 
        ? (unitsResult.data as Unit[]) 
        : []}
      positions={positionsResult.success && positionsResult.data 
        ? (positionsResult.data as Position[]) 
        : []}
    />
  )
}
