/**
 * Vietnamese name parsing and username generation utilities.
 *
 * Vietnamese naming convention: "Họ Đệm Tên"
 *   - lastName  = Họ  (first word)
 *   - middleName = Đệm (middle words, may be empty)
 *   - firstName  = Tên (last word)
 *
 * Username format: firstName + firstChar(lastName) + firstChar(middleName) + "_" + currentYear
 * Example: "Nguyễn Văn Minh" → "MinhNV_2026"
 */

export interface ParsedName {
  firstName: string
  middleName: string
  lastName: string
}

/**
 * Parse a Vietnamese full name into its components.
 * Handles extra spaces and single-word names gracefully.
 */
export function parseVietnameseName(fullName: string): ParsedName {
  const parts = fullName.trim().split(/\s+/)

  if (parts.length === 0 || (parts.length === 1 && parts[0] === '')) {
    return { firstName: '', middleName: '', lastName: '' }
  }

  if (parts.length === 1) {
    return { firstName: parts[0], middleName: '', lastName: '' }
  }

  if (parts.length === 2) {
    return { firstName: parts[1], middleName: '', lastName: parts[0] }
  }

  return {
    lastName: parts[0],
    middleName: parts.slice(1, -1).join(' '),
    firstName: parts[parts.length - 1],
  }
}

/**
 * Generate a username from a Vietnamese full name.
 * Format: firstName + firstChar(lastName) + firstChar(middleName) + "_" + currentYear
 */
export function generateUsername(fullName: string): string {
  const { firstName, middleName, lastName } = parseVietnameseName(fullName)

  if (!firstName) return ''

  const year = new Date().getFullYear()
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : ''
  const middleInitial = middleName ? middleName.charAt(0).toUpperCase() : ''

  return `${firstName}${lastInitial}${middleInitial}_${year}`
}
