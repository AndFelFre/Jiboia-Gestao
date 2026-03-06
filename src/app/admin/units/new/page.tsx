import { getOrganizations } from '../../actions/organizations'
import { getUnits } from '../../actions/units'
import UnitForm from './UnitForm'

export const dynamic = 'force-dynamic'

interface Organization {
  id: string
  name: string
}

export default async function NewUnitPage() {
  const [orgsResult, unitsResult] = await Promise.all([
    getOrganizations(),
    getUnits()
  ])

  const organizations: Organization[] = orgsResult.success && orgsResult.data 
    ? (orgsResult.data as Organization[]) 
    : []
    
  const units = unitsResult.success && unitsResult.data 
    ? (unitsResult.data as { id: string; name: string; org_id: string }[]).map(u => ({ 
        id: u.id, 
        name: u.name, 
        org_id: u.org_id 
      }))
    : []

  return <UnitForm organizations={organizations} units={units} />
}
