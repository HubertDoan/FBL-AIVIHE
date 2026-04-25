/**
 * Kiểm tra chỉ số vital có vượt ngưỡng cảnh báo không
 * Dùng ở client-side sau khi save vital record
 */

export interface VitalThreshold {
  indicator_type: string
  low_critical: number | null
  low_warning: number | null
  high_warning: number | null
  high_critical: number | null
}

export type AlertLevel = 'critical' | 'warning' | null

export interface VitalAlertResult {
  level: AlertLevel
  message: string | null
  value: number
  indicator: string
}

/**
 * Detect alert level cho một giá trị so với ngưỡng
 */
export function detectAlertLevel(value: number, threshold: VitalThreshold): AlertLevel {
  const { low_critical: lc, low_warning: lw, high_warning: hw, high_critical: hc } = threshold
  if ((lc !== null && value <= lc) || (hc !== null && value >= hc)) return 'critical'
  if ((lw !== null && value <= lw) || (hw !== null && value >= hw)) return 'warning'
  return null
}

/**
 * Kiểm tra blood_pressure record (sys/dia) — trả về mức cao nhất
 */
export function detectBloodPressureAlert(
  sys: number,
  dia: number,
  thresholds: VitalThreshold[]
): AlertLevel {
  const sysThr = thresholds.find(t => t.indicator_type === 'bp_systolic')
  const diaThr = thresholds.find(t => t.indicator_type === 'bp_diastolic')

  const sysLevel = sysThr ? detectAlertLevel(sys, sysThr) : null
  const diaLevel = diaThr ? detectAlertLevel(dia, diaThr) : null

  if (sysLevel === 'critical' || diaLevel === 'critical') return 'critical'
  if (sysLevel === 'warning' || diaLevel === 'warning') return 'warning'
  return null
}

/**
 * Kiểm tra blood_glucose record
 */
export function detectGlucoseAlert(value: number, thresholds: VitalThreshold[]): AlertLevel {
  const thr = thresholds.find(t => t.indicator_type === 'blood_glucose')
  return thr ? detectAlertLevel(value, thr) : null
}

/**
 * Kiểm tra heart_rate record
 */
export function detectHeartRateAlert(value: number, thresholds: VitalThreshold[]): AlertLevel {
  const thr = thresholds.find(t => t.indicator_type === 'heart_rate')
  return thr ? detectAlertLevel(value, thr) : null
}

/** Label tiếng Việt cho alert level */
export function alertLevelLabel(level: AlertLevel): string {
  if (level === 'critical') return 'Nguy hiểm'
  if (level === 'warning') return 'Cần chú ý'
  return 'Bình thường'
}
