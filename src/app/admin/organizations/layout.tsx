import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Organizações - Admin',
}

export const dynamic = 'force-dynamic'

export default function OrganizationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
