'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Star, Stethoscope, Languages, Award } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PublicDoctor {
  id: string
  specialty: string
  qualification: string
  experience_years: number
  public_bio: string | null
  languages: string[]
  avatar_url: string | null
  rating: number
  review_count: number
  specialty_tags: string[]
  years_at_center: number
  citizens: { full_name: string } | null
}

const SPECIALTIES = ['Nội khoa', 'Tim mạch', 'Tiểu đường', 'Cơ xương khớp', 'Thần kinh', 'Lão khoa']

export default function PublicDoctorListingPage() {
  const [doctors, setDoctors] = useState<PublicDoctor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('')

  const fetchDoctors = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (specialty) params.set('specialty', specialty)
    const res = await fetch(`/api/doctors/public-listing?${params}`)
    const data = await res.json()
    setDoctors(data.doctors ?? [])
    setLoading(false)
  }, [search, specialty])

  useEffect(() => { fetchDoctors() }, [fetchDoctors])

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest">Mạng lưới bác sĩ</p>
          <h1 className="text-3xl md:text-4xl font-bold">Đội ngũ Bác sĩ AIVIHE</h1>
          <p className="text-blue-100 max-w-xl mx-auto">
            Các bác sĩ chuyên khoa giàu kinh nghiệm, đồng hành cùng bạn trong hành trình chăm sóc sức khỏe.
          </p>
          <div className="flex gap-3 justify-center pt-2 flex-wrap">
            <Link href="/register">
              <Button className="bg-white text-blue-700 hover:bg-blue-50 min-h-[44px]">
                Đăng ký để kết nối BS
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="border-white text-white hover:bg-blue-600 min-h-[44px]">
                Đã có tài khoản
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Tìm theo tên hoặc chuyên khoa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 min-h-[44px]"
            />
          </div>
        </div>

        {/* Specialty filter pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSpecialty('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              specialty === '' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:border-blue-400'
            }`}
          >
            Tất cả
          </button>
          {SPECIALTIES.map(s => (
            <button
              key={s}
              onClick={() => setSpecialty(specialty === s ? '' : s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                specialty === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:border-blue-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Stethoscope className="size-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">Chưa có bác sĩ nào trong danh sách</p>
            <p className="text-sm mt-1">Đội ngũ đang được cập nhật. Quay lại sớm nhé!</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">{doctors.length} bác sĩ</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {doctors.map(doc => (
                <DoctorCard key={doc.id} doctor={doc} />
              ))}
            </div>
          </>
        )}

        {/* CTA bottom */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center space-y-3">
          <h2 className="font-bold text-blue-900 text-lg">Bạn muốn có bác sĩ gia đình riêng?</h2>
          <p className="text-blue-700 text-sm">
            Đăng ký tài khoản AIVIHE — miễn phí — để kết nối và theo dõi sức khỏe cùng bác sĩ gia đình.
          </p>
          <Link href="/register">
            <Button className="bg-blue-600 hover:bg-blue-700 min-h-[44px] px-8">
              Đăng ký miễn phí
            </Button>
          </Link>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 underline">
            ← Trở về trang chủ
          </Link>
        </div>
      </div>
    </main>
  )
}

function DoctorCard({ doctor }: { doctor: PublicDoctor }) {
  const name = doctor.citizens?.full_name ?? 'Bác sĩ'

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-5">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="shrink-0">
            {doctor.avatar_url ? (
              <Image
                src={doctor.avatar_url}
                alt={name}
                width={64}
                height={64}
                className="size-16 rounded-full object-cover"
              />
            ) : (
              <div className="size-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Stethoscope className="size-7 text-blue-500" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div>
              <h3 className="font-bold text-gray-900 text-base">{name}</h3>
              <p className="text-sm text-blue-600 font-medium">{doctor.specialty}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {doctor.qualification && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Award className="size-3" /> {doctor.qualification}
                </Badge>
              )}
              {doctor.experience_years > 0 && (
                <Badge variant="outline" className="text-xs">
                  {doctor.experience_years} năm KN
                </Badge>
              )}
            </div>

            {doctor.rating > 0 && (
              <div className="flex items-center gap-1 text-xs text-amber-600">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                <span className="font-semibold">{doctor.rating.toFixed(1)}</span>
                {doctor.review_count > 0 && (
                  <span className="text-gray-400">({doctor.review_count} đánh giá)</span>
                )}
              </div>
            )}

            {doctor.languages?.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Languages className="size-3" />
                {doctor.languages.join(', ')}
              </div>
            )}

            {doctor.public_bio && (
              <p className="text-xs text-gray-600 line-clamp-2 mt-1">{doctor.public_bio}</p>
            )}
          </div>
        </div>

        {doctor.specialty_tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t">
            {doctor.specialty_tags.slice(0, 4).map(tag => (
              <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
