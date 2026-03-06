import { getOrganizations } from '../../actions/organizations'
import { getLevels } from '../../actions/levels'
import PositionForm from './PositionForm'

export const dynamic = 'force-dynamic'

interface Organization {
  id: string
  name: string
}

export default async function NewPositionPage() {
  const [orgsResult, levelsResult] = await Promise.all([
    getOrganizations(),
    getLevels()
  ])

  const organizations: Organization[] = orgsResult.success && orgsResult.data 
    ? (orgsResult.data as Organization[]) 
    : []
    
  const levels = levelsResult.success && levelsResult.data 
    ? levelsResult.data 
    : []

  return <PositionForm organizations={organizations} levels={levels} />
}
