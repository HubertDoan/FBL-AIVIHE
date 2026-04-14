/**
 * Generate TDL customer code: TDL-{PROVINCE}-{SEQ6}
 * e.g. TDL-HN-000001
 */
export function formatTdlCustomerCode(locationCode: string, sequence: number): string {
  return `TDL-${locationCode}-${String(sequence).padStart(6, '0')}`
}

/**
 * Generate service-specific code: TDL-{PROVINCE}-{SERVICE}-{SEQ6}
 * e.g. TDL-HN-DC-000001
 */
export function formatServiceCode(
  locationCode: string,
  serviceType: string,
  sequence: number
): string {
  return `TDL-${locationCode}-${serviceType}-${String(sequence).padStart(6, '0')}`
}

/**
 * Parse TDL code into components
 */
export function parseTdlCode(code: string): {
  prefix: string
  location: string
  service?: string
  sequence: number
} | null {
  // Match TDL-HN-000001 or TDL-HN-DC-000001
  const match = code.match(/^(TDL)-([A-Z]{2})(?:-([A-Z]{1,2}))?-(\d{6})$/)
  if (!match) return null
  return {
    prefix: match[1],
    location: match[2],
    service: match[3] || undefined,
    sequence: parseInt(match[4], 10),
  }
}

/** Valid service types */
export const SERVICE_TYPES = ['DC', 'FD', 'RH', 'H', 'L', 'RT'] as const
export type ServiceType = typeof SERVICE_TYPES[number]
