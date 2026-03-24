'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Stethoscope, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { getSpecialtyName } from '@/lib/constants/medical-specialties'
import type { VisitPreparation, PrepStatus } from '@/types/database'

const STATUS_LABELS: Record<PrepStatus, string> = {
  draft: 'Bản nháp',
  ai_generated: 'Đã tạo',
  doctor_reviewed: 'Bác sĩ đã xem',
  completed: 'Hoàn tất',
  used: 'Đã dùng',
}

const STATUS_VARIANTS: Record<PrepStatus, 'default' | 'secondary' | 'outline'> = {
  draft: 'outline',
  ai_generated: 'default',
  doctor_reviewed: 'secondary',
  completed: 'secondary',
  used: 'outline',
}

export default function VisitPrepListPage() {
  const [preps, setPreps] = useState<VisitPreparation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: citizen } = await supabase
        .from('citizens')
        .select('id')
        .eq('auth_id', user.id)
        .single()
      if (!citizen) return

      const { data } = await supabase
        .from('visit_preparations')
        .select('*')
        .eq('citizen_id', citizen.id)
        .order('created_at', { ascending: false })

      setPreps((data as VisitPreparation[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Chuẩn bị đi khám</h1>
          <p className="text-muted-foreground mt-1">
            Tạo gói hồ sơ chuẩn bị trước khi đi khám bệnh
          </p>
        </div>
        <Link href="/dashboard/visit-prep/new">
          <Button className="min-h-[48px] text-base gap-2">
            <Plus className="size-5" />
            Tạo gói hồ sơ mới
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : preps.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Stethoscope className="size-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Chưa có gói chuẩn bị nào
            </p>
            <p className="text-base text-muted-foreground mt-1 mb-6">
              Tạo gói hồ sơ để chuẩn bị tốt hơn cho buổi khám
            </p>
            <Link href="/dashboard/visit-prep/new">
              <Button className="min-h-[48px] text-base">Tạo gói hồ sơ mới</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {preps.map((prep) => (
            <Card key={prep.id} className="hover:ring-2 hover:ring-primary/20 transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="size-5 text-primary" />
                    {getSpecialtyName(prep.specialty) ?? prep.specialty}
                  </CardTitle>
                  <Badge variant={STATUS_VARIANTS[prep.status]}>
                    {STATUS_LABELS[prep.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {new Date(prep.created_at).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </span>
                  <span>{prep.symptoms.length} triệu chứng</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
