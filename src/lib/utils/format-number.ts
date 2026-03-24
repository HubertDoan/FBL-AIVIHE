/**
 * Format a numeric value with a specified number of decimal places.
 * Returns empty string for null/undefined.
 */
export function formatDecimal(
  value: number | string | null | undefined,
  decimals: number = 1
): string {
  if (value == null || value === '') return ''
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return ''
  return num.toFixed(decimals)
}

/**
 * Format blood pressure as "systolic/diastolic mmHg".
 */
export function formatBloodPressure(
  systolic: number | null | undefined,
  diastolic: number | null | undefined
): string {
  if (systolic == null || diastolic == null) return ''
  return `${systolic}/${diastolic} mmHg`
}

/**
 * Format BMI with classification in Vietnamese.
 */
export function formatBMI(bmi: number | null | undefined): string {
  if (bmi == null) return ''
  const value = typeof bmi === 'number' ? bmi : parseFloat(String(bmi))
  if (isNaN(value)) return ''

  const formatted = value.toFixed(1)
  const classification = getBMIClassification(value)
  return `${formatted} (${classification})`
}

function getBMIClassification(bmi: number): string {
  if (bmi < 18.5) return 'Thiếu cân'
  if (bmi < 23) return 'Bình thường'
  if (bmi < 25) return 'Thừa cân'
  if (bmi < 30) return 'Béo phì độ I'
  if (bmi < 35) return 'Béo phì độ II'
  return 'Béo phì độ III'
}

/**
 * Format temperature in Celsius.
 */
export function formatTemperature(temp: number | null | undefined): string {
  if (temp == null) return ''
  return `${formatDecimal(temp, 1)}°C`
}

/**
 * Format weight in kilograms.
 */
export function formatWeight(kg: number | null | undefined): string {
  if (kg == null) return ''
  return `${formatDecimal(kg, 1)} kg`
}

/**
 * Format height in centimeters.
 */
export function formatHeight(cm: number | null | undefined): string {
  if (cm == null) return ''
  return `${formatDecimal(cm, 1)} cm`
}

/**
 * Format a lab test result with unit and abnormal flag.
 */
export function formatLabResult(
  value: string | null | undefined,
  unit: string | null | undefined,
  isAbnormal: boolean = false
): string {
  if (!value) return ''
  const parts = [value]
  if (unit) parts.push(unit)
  const result = parts.join(' ')
  return isAbnormal ? `${result} *` : result
}

/**
 * Format pulse rate.
 */
export function formatPulse(pulse: number | null | undefined): string {
  if (pulse == null) return ''
  return `${pulse} lần/phút`
}

/**
 * Format respiratory rate.
 */
export function formatRespiratoryRate(rate: number | null | undefined): string {
  if (rate == null) return ''
  return `${rate} lần/phút`
}
