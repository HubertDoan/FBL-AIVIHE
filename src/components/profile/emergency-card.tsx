'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Phone, Share2 } from 'lucide-react'
import { formatDate } from '@/lib/utils/format-date'
import type { Citizen, HealthProfile } from '@/types/database'

interface EmergencyCardProps {
  citizen: Citizen
  healthProfile: HealthProfile | null
}

export function EmergencyCard({ citizen, healthProfile }: EmergencyCardProps) {
  const hp = healthProfile

  const handleShare = async () => {
    const text = [
      `HỒ SƠ CẤP CỨU`,
      `Họ tên: ${citizen.full_name}`,
      `Ngày sinh: ${formatDate(citizen.date_of_birth)}`,
      hp?.blood_type ? `Nhóm máu: ${hp.blood_type}` : '',
      hp?.allergies?.length ? `Dị ứng: ${hp.allergies.join(', ')}` : '',
      hp?.current_medications?.length ? `Thuốc: ${hp.current_medications.join(', ')}` : '',
      hp?.chronic_conditions?.length ? `Bệnh nền: ${hp.chronic_conditions.join(', ')}` : '',
      hp?.emergency_contact_name ? `Liên hệ: ${hp.emergency_contact_name} - ${hp.emergency_contact_phone}` : '',
    ].filter(Boolean).join('\n')

    if (navigator.share) {
      await navigator.share({ title: 'Hồ sơ cấp cứu', text })
    } else {
      await navigator.clipboard.writeText(text)
    }
  }

  return (
    <Card className="border-2 border-red-500">
      <CardHeader className="bg-red-600 text-white rounded-t-xl -mt-4 pt-4">
        <CardTitle className="text-2xl font-bold text-center text-white">
          HỒ SƠ CẤP CỨU
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div>
          <p className="text-muted-foreground text-base">Họ và tên</p>
          <p className="text-2xl font-bold">{citizen.full_name}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground text-base">Ngày sinh</p>
            <p className="text-xl font-semibold">{formatDate(citizen.date_of_birth)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-base">Nhóm máu</p>
            <p className="text-xl font-bold text-red-600">{hp?.blood_type ?? '--'}</p>
          </div>
        </div>

        {hp?.allergies && hp.allergies.length > 0 && (
          <div>
            <p className="text-muted-foreground text-base mb-2">Dị ứng</p>
            <div className="flex flex-wrap gap-2">
              {hp.allergies.map((a, i) => (
                <Badge key={i} variant="destructive" className="text-base px-3 py-1 h-auto">
                  {a}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {hp?.current_medications && hp.current_medications.length > 0 && (
          <div>
            <p className="text-muted-foreground text-base mb-2">Thuốc đang dùng</p>
            <div className="flex flex-wrap gap-2">
              {hp.current_medications.map((m, i) => (
                <Badge key={i} variant="secondary" className="text-base px-3 py-1 h-auto">
                  {m}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {hp?.chronic_conditions && hp.chronic_conditions.length > 0 && (
          <div>
            <p className="text-muted-foreground text-base mb-2">Bệnh nền</p>
            <div className="flex flex-wrap gap-2">
              {hp.chronic_conditions.map((c, i) => (
                <Badge key={i} variant="outline" className="text-base px-3 py-1 h-auto">
                  {c}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {hp?.emergency_contact_name && (
          <div className="border-t pt-4">
            <p className="text-muted-foreground text-base">Người liên hệ khẩn cấp</p>
            <p className="text-xl font-semibold">{hp.emergency_contact_name}</p>
            <p className="text-muted-foreground">{hp.emergency_contact_relationship}</p>
            <a
              href={`tel:${hp.emergency_contact_phone}`}
              className="inline-flex items-center gap-2 mt-2 text-xl font-bold text-primary"
            >
              <Phone className="size-5" />
              {hp.emergency_contact_phone}
            </a>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full h-12 text-lg mt-4"
          onClick={handleShare}
        >
          <Share2 className="size-5 mr-2" />
          Chia sẻ hồ sơ cấp cứu
        </Button>
      </CardContent>
    </Card>
  )
}
