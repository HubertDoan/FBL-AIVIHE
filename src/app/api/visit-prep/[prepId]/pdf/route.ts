import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { VisitPrepPdfDocument } from '@/lib/pdf/visit-prep-template'
import { getSpecialtyName } from '@/lib/constants/medical-specialties'
import type { VisitPreparation, Citizen, ChronicDisease, Medication } from '@/types/database'
import React from 'react'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ prepId: string }> }
) {
  try {
    const { prepId } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })
    }

    // Fetch visit preparation
    const { data: prep } = await supabase
      .from('visit_preparations')
      .select('*')
      .eq('id', prepId)
      .single<VisitPreparation>()

    if (!prep) {
      return NextResponse.json(
        { error: 'Không tìm thấy gói chuẩn bị.' },
        { status: 404 }
      )
    }

    // Fetch citizen info
    const { data: citizen } = await supabase
      .from('citizens')
      .select('full_name, date_of_birth, gender, phone')
      .eq('id', prep.citizen_id)
      .single<Pick<Citizen, 'full_name' | 'date_of_birth' | 'gender' | 'phone'>>()

    if (!citizen) {
      return NextResponse.json(
        { error: 'Không tìm thấy thông tin bệnh nhân.' },
        { status: 404 }
      )
    }

    // Fetch chronic diseases
    const { data: diseases } = await supabase
      .from('chronic_diseases')
      .select('disease_name, status, current_treatment')
      .eq('citizen_id', prep.citizen_id)

    const chronicDiseases = (diseases ?? []).map((d: any) => ({
      name: d.disease_name,
      status: d.status,
      treatment: d.current_treatment,
    }))

    // Fetch active medications
    const { data: meds } = await supabase
      .from('medications')
      .select('drug_name, dosage, frequency')
      .eq('citizen_id', prep.citizen_id)
      .eq('is_active', true)

    const medications = (meds ?? []).map((m: any) => ({
      name: m.drug_name,
      dosage: m.dosage,
      frequency: m.frequency,
    }))

    const specialtyName = getSpecialtyName(prep.specialty) ?? prep.specialty
    const dateStr = new Date(prep.created_at).toLocaleDateString('vi-VN')

    const doc = React.createElement(VisitPrepPdfDocument, {
      patient: {
        fullName: citizen.full_name,
        dateOfBirth: citizen.date_of_birth,
        gender: citizen.gender,
        phone: citizen.phone,
      },
      specialty: specialtyName,
      date: dateStr,
      symptoms: prep.symptoms,
      symptomDescription: prep.symptom_description,
      questionsForDoctor: prep.questions_for_doctor,
      chronicDiseases,
      medications,
      aiSummary: prep.ai_summary ?? '',
    })

    const buffer = await renderToBuffer(doc as any)

    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="visit-prep-${prepId}.pdf"`,
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json(
      { error: 'Tạo PDF thất bại: ' + message },
      { status: 500 }
    )
  }
}
