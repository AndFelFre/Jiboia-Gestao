import { getOrganizations } from '../../actions/organizations'
import LevelForm from './LevelForm'

interface Organization {
  id: string
  name: string
}

export const dynamic = 'force-dynamic'

export default async function NewLevelPage() {
  const orgsResult = await getOrganizations()

  const organizations: Organization[] = orgsResult.success && orgsResult.data 
    ? (orgsResult.data as Organization[])
    : []

  return <LevelForm organizations={organizations} />
}
