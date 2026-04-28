'use client'

/**
 * Section chỉ số ít thay đổi (chiều cao, cân nặng, BMI tự tính)
 * Hiển thị ở DƯỚI trang chỉ số sức khỏe — compact, không nổi bật
 */

import { Ruler, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { VitalRecord } from './vitals-frequent-indicators-section-blood-pressure-glucose-heart-rate'

interface Props {
  vitals: VitalRecord[]
  onAddClick: (defaultType: string) => void
}

function calcBmi(height_cm: number | null, weight_kg: number | null): string | null {
  if (!height_cm || !weight_kg || height_cm <= 0) return null
  const bmi = weight_kg / ((height_cm / 100) ** 2)
  return bmi.toFixed(1)
}

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Thiếu cân', color: 'text-blue-600' }
  if (bmi < 23)   return { label: 'Bình thường', color: 'text-green-600' }
  if (bmi < 25)   return { label: 'Thừa cân nhẹ', color: 'text-amber-600' }
  return { label: 'Béo phì', color: 'text-red-600' }
}

export function VitalsStaticIndicatorsSectionHeightAndWeight({ vitals, onAddClick }: Props) {
  const [expanded, setExpanded] = useState(false)

  const latestHeight = vitals.find(v => v.indicator_type === 'height')
  const latestWeight = vitals.find(v => v.indicator_type === 'weight')

  const heightVal = latestHeight?.value.value ?? null
  const weightVal = latestWeight?.value.value ?? null
  const bmi = calcBmi(heightVal, weightVal)
  const bmiInfo = bmi ? bmiCategory(parseFloat(bmi)) : null

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
      {/* Collapsed header — always visible */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Chỉ số cơ thể
          </span>
          <div className="flex items-center gap-4">
            {latestHeight && (
              <span className="text-sm text-gray-700">
                <span className="font-bold">{latestHeight.value.value}</span>
                <span className="text-gray-400 text-xs ml-0.5">cm</span>
              </span>
            )}
            {latestWeight && (
              <span className="text-sm text-gray-700">
                <span className="font-bold">{latestWeight.value.value}</span>
                <span className="text-gray-400 text-xs ml-0.5">kg</span>
              </span>
            )}
            {bmi && bmiInfo && (
              <span className={`text-xs font-semibold ${bmiInfo.color}`}>
                BMI {bmi} · {bmiInfo.label}
              </span>
            )}
          </div>
        </div>
        {expanded
          ? <ChevronUp className="size-4 text-gray-400" />
          : <ChevronDown className="size-4 text-gray-400" />
        }
      </button>

      {/* Expanded detail — chiều cao only; cân nặng đã chuyển sang theo dõi hàng ngày */}
      {expanded && (
        <div className="border-t border-gray-200 px-4 py-4">
          <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-2 max-w-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Ruler className="size-4 text-purple-700" />
                <span className="text-sm font-semibold text-gray-700">Chiều cao</span>
              </div>
              <button
                onClick={() => onAddClick('height')}
                className="text-xs text-gray-400 hover:text-gray-700 underline"
              >
                Cập nhật
              </button>
            </div>
            {latestHeight ? (
              <>
                <div className="text-2xl font-bold text-purple-700">
                  {latestHeight.value.value}
                  <span className="text-xs font-normal text-gray-400 ml-1">cm</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  {new Date(latestHeight.measured_at).toLocaleDateString('vi-VN')}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-400 italic">Chưa có</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
