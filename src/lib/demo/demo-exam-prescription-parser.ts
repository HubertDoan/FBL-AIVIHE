// Parses free-text prescription lines into MedicationReminder objects
// Format per line: "drug_name | dosage | frequency | duration" (optional 5th field: notes)

import type { MedicationReminder } from '@/lib/demo/demo-exam-registration-data'

export function parsePrescriptionToReminders(prescription: string): MedicationReminder[] {
  if (!prescription.trim()) return []

  return prescription
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('|').map((p) => p.trim())
      return {
        drug_name: parts[0] ?? line,
        dosage: parts[1] ?? '',
        frequency: parts[2] ?? '',
        duration: parts[3] ?? '',
        notes: parts[4] ?? null,
      }
    })
}
