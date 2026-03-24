'use client'

import { Building2, MapPin, Phone, Users, Pause, Pencil } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface BranchCardData {
  id: string
  name: string
  code: string
  address: string
  phone: string
  director_name: string
  is_headquarters: boolean
  is_active: boolean
  staff_count: number
}

interface BranchCardProps {
  branch: BranchCardData
  onEdit: (id: string) => void
  onStaff: (id: string) => void
  onDeactivate: (id: string) => void
}

export function BranchCard({ branch, onEdit, onStaff, onDeactivate }: BranchCardProps) {
  return (
    <Card className={!branch.is_active ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="size-5 text-primary shrink-0" />
          <CardTitle className="text-lg">{branch.name}</CardTitle>
        </div>
        <CardAction>
          <div className="flex gap-1">
            {branch.is_headquarters && (
              <Badge variant="default">Trụ sở chính</Badge>
            )}
            <Badge variant={branch.is_active ? 'secondary' : 'destructive'}>
              {branch.is_active ? 'Hoạt động' : 'Tạm dừng'}
            </Badge>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Mã: <span className="font-mono font-medium text-foreground">{branch.code}</span>
        </p>
        {branch.address && (
          <p className="text-sm text-muted-foreground flex items-start gap-1.5">
            <MapPin className="size-4 shrink-0 mt-0.5" />
            {branch.address}
          </p>
        )}
        {branch.phone && (
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Phone className="size-4 shrink-0" />
            {branch.phone}
          </p>
        )}
        <p className="text-sm">
          Giám đốc: <span className="font-medium">{branch.director_name || 'Chưa chỉ định'}</span>
        </p>
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <Users className="size-4 shrink-0" />
          {branch.staff_count} nhân viên
        </p>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(branch.id)}>
            <Pencil className="size-4 mr-1" />
            Sửa
          </Button>
          <Button variant="outline" size="sm" onClick={() => onStaff(branch.id)}>
            <Users className="size-4 mr-1" />
            Nhân viên
          </Button>
          {branch.is_active && !branch.is_headquarters && (
            <Button variant="outline" size="sm" onClick={() => onDeactivate(branch.id)} className="text-destructive">
              <Pause className="size-4 mr-1" />
              Tạm dừng
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
