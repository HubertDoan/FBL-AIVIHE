'use client'

// Client page for service package detail — shows package info, benefits, and registration form
// Redirects to login if unauthenticated

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ArrowLeft, Home, CheckCircle } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/use-auth'
import { ServicePackageRegistrationForm } from './service-package-registration-form'
import type { ServicePackage } from '@/lib/data/service-packages-config'

// Map tagColor string to Tailwind classes
const TAG_COLOR_CLASSES: Record<string, { badge: string; icon: string; header: string }> = {
  green:  { badge: 'bg-green-100 text-green-800',  icon: 'text-green-600',  header: 'from-green-50 to-white' },
  teal:   { badge: 'bg-teal-100 text-teal-800',    icon: 'text-teal-600',   header: 'from-teal-50 to-white' },
  blue:   { badge: 'bg-blue-100 text-blue-800',    icon: 'text-blue-600',   header: 'from-blue-50 to-white' },
  purple: { badge: 'bg-purple-100 text-purple-800', icon: 'text-purple-600', header: 'from-purple-50 to-white' },
}

interface Props {
  pkg: ServicePackage
}

export function ServicePackageDetailClientPage({ pkg }: Props) {
  const { user, loading } = useAuth({ redirect: false })
  const router = useRouter()
  const colors = TAG_COLOR_CLASSES[pkg.tagColor] ?? TAG_COLOR_CLASSES.green

  // Resolve lucide icon dynamically
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (LucideIcons as any)[pkg.icon] as React.ElementType | undefined

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router])

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-gray-500">Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {/* Top navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-base text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </button>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-base text-gray-500 hover:text-gray-800 transition-colors"
          >
            <Home className="h-4 w-4" />
            Trở về trang chủ
          </Link>
        </div>

        {/* Package header card */}
        <Card className="overflow-hidden">
          <div className={`bg-gradient-to-br ${colors.header} px-6 pt-6 pb-4`}>
            <div className="flex items-start gap-4">
              {IconComponent && (
                <div className={`mt-1 shrink-0 ${colors.icon}`}>
                  <IconComponent className="h-10 w-10" />
                </div>
              )}
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{pkg.name}</h1>
                  <Badge className={`text-sm font-medium ${colors.badge}`}>
                    {pkg.price}
                  </Badge>
                </div>
                <p className="text-lg text-gray-600">{pkg.shortDesc}</p>
              </div>
            </div>
          </div>

          <CardContent className="px-6 py-5 space-y-4">
            <p className="text-base leading-relaxed text-gray-700">{pkg.details}</p>

            <Separator />

            {/* Benefits list */}
            <div>
              <CardTitle className="mb-3 text-lg text-gray-800">Quyền lợi bao gồm</CardTitle>
              <ul className="space-y-2">
                {pkg.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-base text-gray-700">
                    <CheckCircle className={`mt-0.5 h-5 w-5 shrink-0 ${colors.icon}`} />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Registration form card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Đăng ký gói dịch vụ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ServicePackageRegistrationForm pkg={pkg} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
