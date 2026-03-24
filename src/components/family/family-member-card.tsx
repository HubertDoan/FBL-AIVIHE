'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Eye, UserCog } from 'lucide-react'
import { ROLE_LABELS } from '@/lib/constants/roles'
import { formatRelativeTime } from '@/lib/utils/format-date'
import type { FamilyRole } from '@/types/database'

const RELATIONSHIP_LABELS: Record<string, string> = {
  father: 'Bố',
  mother: 'Mẹ',
  son: 'Con trai',
  daughter: 'Con gái',
  grandfather: 'Ông',
  grandmother: 'Bà',
  wife: 'Vợ',
  husband: 'Chồng',
  sibling: 'Anh/Chị/Em',
  other: 'Khác',
}

interface FamilyMemberCardProps {
  memberId: string
  citizenId: string
  name: string
  relationship: string | null
  role: FamilyRole
  joinedAt: string
  canManage: boolean
  onViewProfile: (citizenId: string) => void
  onActOnBehalf: (citizenId: string, name: string) => void
}

export function FamilyMemberCard({
  name,
  relationship,
  role,
  citizenId,
  joinedAt,
  canManage,
  onViewProfile,
  onActOnBehalf,
}: FamilyMemberCardProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase()

  const relationLabel = relationship
    ? RELATIONSHIP_LABELS[relationship] ?? relationship
    : ''

  const roleColors: Record<string, string> = {
    owner: 'bg-amber-100 text-amber-800',
    manager: 'bg-blue-100 text-blue-800',
    doctor: 'bg-green-100 text-green-800',
    member: 'bg-gray-100 text-gray-800',
    viewer: 'bg-gray-100 text-gray-600',
    staff: 'bg-purple-100 text-purple-800',
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center text-center gap-3 pt-2">
        <Avatar className="size-16">
          <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div>
          <p className="text-lg font-semibold">{name}</p>
          {relationLabel && (
            <Badge variant="outline" className="text-sm mt-1">
              {relationLabel}
            </Badge>
          )}
        </div>

        <Badge className={`text-sm ${roleColors[role] ?? ''}`}>
          {ROLE_LABELS[role]}
        </Badge>

        <p className="text-sm text-muted-foreground">
          {formatRelativeTime(joinedAt)}
        </p>

        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            className="flex-1 h-12 text-base"
            onClick={() => onViewProfile(citizenId)}
          >
            <Eye className="size-4 mr-1" />
            Xem hồ sơ
          </Button>
          {canManage && (
            <Button
              variant="secondary"
              className="flex-1 h-12 text-base"
              onClick={() => onActOnBehalf(citizenId, name)}
            >
              <UserCog className="size-4 mr-1" />
              Thao tác hộ
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
