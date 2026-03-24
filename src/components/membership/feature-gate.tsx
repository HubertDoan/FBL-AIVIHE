'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { Lock, Crown } from 'lucide-react'

interface FeatureGateProps {
  children: React.ReactNode
  requiredRole?: string
}

export function FeatureGate({ children, requiredRole = 'member' }: FeatureGateProps) {
  const { user, loading } = useAuth({ redirect: false })

  if (loading) return null

  const isGuest = user?.role === 'guest'

  // If user is guest and feature requires membership, show lock
  if (isGuest && requiredRole !== 'guest') {
    return (
      <div className="relative">
        <div className="pointer-events-none opacity-20 blur-sm select-none" aria-hidden="true">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Card className="max-w-md mx-4 shadow-lg">
            <CardContent className="text-center space-y-4 py-8">
              <Lock className="size-12 text-muted-foreground mx-auto" />
              <p className="text-xl font-semibold">
                Tính năng này chỉ dành cho Thành viên AIVIHE
              </p>
              <p className="text-base text-muted-foreground">
                Đăng ký thành viên để sử dụng đầy đủ các tính năng quản lý sức khỏe.
              </p>
              <Link href="/dashboard/register-member">
                <Button className="min-h-[48px] text-lg font-semibold bg-purple-600 hover:bg-purple-700 px-8">
                  <Crown className="size-5 mr-2" />
                  Đăng ký thành viên ngay
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
