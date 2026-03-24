import {
  format,
  formatDistanceToNow,
  parseISO,
  isValid,
  differenceInYears,
} from 'date-fns'
import { vi } from 'date-fns/locale'

/**
 * Format a date string to Vietnamese locale display.
 * Example: "23/03/2026"
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const date = parseISO(dateStr)
  if (!isValid(date)) return ''
  return format(date, 'dd/MM/yyyy', { locale: vi })
}

/**
 * Format a date string with time.
 * Example: "23/03/2026 14:30"
 */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const date = parseISO(dateStr)
  if (!isValid(date)) return ''
  return format(date, 'dd/MM/yyyy HH:mm', { locale: vi })
}

/**
 * Format a date string to long Vietnamese format.
 * Example: "Ngày 23 tháng 03 năm 2026"
 */
export function formatDateLong(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const date = parseISO(dateStr)
  if (!isValid(date)) return ''
  return format(date, "'Ngày' dd 'tháng' MM 'năm' yyyy", { locale: vi })
}

/**
 * Format a date as relative time in Vietnamese.
 * Example: "3 ngày trước", "khoảng 2 giờ trước"
 */
export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const date = parseISO(dateStr)
  if (!isValid(date)) return ''
  return formatDistanceToNow(date, { addSuffix: true, locale: vi })
}

/**
 * Calculate age from a date of birth string.
 */
export function calculateAge(dateOfBirth: string | null | undefined): number | null {
  if (!dateOfBirth) return null
  const dob = parseISO(dateOfBirth)
  if (!isValid(dob)) return null
  return differenceInYears(new Date(), dob)
}

/**
 * Format month/year for reports.
 * Example: "Tháng 03/2026"
 */
export function formatMonthYear(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const date = parseISO(dateStr)
  if (!isValid(date)) return ''
  return format(date, "'Tháng' MM/yyyy", { locale: vi })
}
