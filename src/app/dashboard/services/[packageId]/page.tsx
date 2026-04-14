// Service package detail page — async server component (Next.js 16 async params)
// Resolves packageId from params, delegates rendering to client component

import { notFound } from 'next/navigation'
import { getPackageById } from '@/lib/data/service-packages-config'
import { ServicePackageDetailClientPage } from './service-package-detail-client-page'

interface PageProps {
  params: Promise<{ packageId: string }>
}

export default async function ServicePackageDetailPage({ params }: PageProps) {
  const { packageId } = await params
  const pkg = getPackageById(packageId)
  if (!pkg) notFound()

  return <ServicePackageDetailClientPage pkg={pkg} />
}
