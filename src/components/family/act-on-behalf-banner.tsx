'use client'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft } from 'lucide-react'
import { useActingAs } from '@/hooks/use-acting-as'

export function ActOnBehalfBanner() {
  const { actingAs, clearActingAs, isActingAs } = useActingAs()

  if (!isActingAs) return null

  const initials = actingAs.citizenName
    ?.split(' ')
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase() ?? ''

  return (
    <div className="sticky top-0 z-30 bg-amber-50 border-b-2 border-amber-400 px-4 py-3">
      <div className="flex items-center justify-between gap-3 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarFallback className="bg-amber-200 text-amber-800 font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <p className="text-base font-medium text-amber-900">
            Đang thao tác cho{' '}
            <span className="font-bold">{actingAs.citizenName}</span>
          </p>
        </div>

        <Button
          variant="outline"
          className="h-10 text-base border-amber-400 text-amber-900 hover:bg-amber-100"
          onClick={clearActingAs}
        >
          <ArrowLeft className="size-4 mr-1" />
          Quay về tài khoản của tôi
        </Button>
      </div>
    </div>
  )
}
