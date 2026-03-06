import { getOrganizations } from '../../actions/organizations'
import TrackForm from './TrackForm'

export const dynamic = 'force-dynamic'

interface Organization {
  id: string
  name: string
}

export default async function NewTrackPage() {
  const orgsResult = await getOrganizations()

  const organizations: Organization[] = orgsResult.success && orgsResult.data 
    ? (orgsResult.data as Organization[]) 
    : []

  return <TrackForm organizations={organizations} />
}
