// ─── Enums ────────────────────────────────────────────────────────────────────

export type FamilyRole = 'owner' | 'manager' | 'member' | 'doctor' | 'staff' | 'viewer'

export type DocumentType =
  | 'lab_report'
  | 'prescription'
  | 'imaging'
  | 'discharge_summary'
  | 'vaccination_record'
  | 'medical_certificate'
  | 'referral'
  | 'other'

export type ExtractionStatus = 'pending' | 'confirmed' | 'rejected'

export type EventType =
  | 'visit'
  | 'lab_result'
  | 'medication'
  | 'vaccination'
  | 'diagnosis'
  | 'imaging'
  | 'vital_sign'
  | 'lifestyle'
  | 'document_upload'
  | 'other'

export type VisitType =
  | 'checkup'
  | 'follow_up'
  | 'emergency'
  | 'screening'
  | 'specialist'
  | 'other'

export type DiagnosisType = 'primary' | 'secondary' | 'differential' | 'complication'

export type ImagingType = 'xray' | 'ct' | 'mri' | 'ultrasound' | 'ecg' | 'endoscopy' | 'other'

export type TreatmentType =
  | 'medication'
  | 'surgery'
  | 'procedure'
  | 'rehabilitation'
  | 'therapy'
  | 'other'

export type DiseaseStatus = 'active' | 'controlled' | 'remission' | 'resolved'

export type PrepStatus = 'draft' | 'ai_generated' | 'doctor_reviewed' | 'completed' | 'used'

export type FeedbackCategory =
  | 'bug'
  | 'feature_request'
  | 'ui_suggestion'
  | 'ai_feedback'
  | 'general'
  | 'complaint'

export type FeedbackStatus = 'pending' | 'reviewing' | 'resolved' | 'closed'

// ─── Table Interfaces ─────────────────────────────────────────────────────────

export interface Citizen {
  id: string
  full_name: string
  username: string | null
  date_of_birth: string | null
  gender: 'male' | 'female' | 'other' | null
  national_id: string | null
  phone: string
  email: string | null
  address: string | null
  ethnicity: string | null
  occupation: string | null
  avatar_url: string | null
  has_consented: boolean
  created_at: string
  updated_at: string
}

export interface HealthProfile {
  id: string
  citizen_id: string
  blood_type: string | null
  height_cm: number | null
  weight_kg: number | null
  allergies: string[]
  disabilities: string[]
  chronic_conditions: string[]
  current_medications: string[]
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  emergency_contact_relationship: string | null
  pregnancy_status: string | null
  organ_donation_status: boolean
  lifestyle_notes: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Family {
  id: string
  name: string
  family_doctor_name: string | null
  family_doctor_phone: string | null
  address: string | null
  created_by: string | null
  created_at: string
}

export interface FamilyMember {
  id: string
  citizen_id: string
  family_id: string
  role: FamilyRole
  relationship: string | null
  permissions: {
    can_view: boolean
    can_edit: boolean
    can_upload: boolean
  }
  joined_at: string
}

export interface SourceDocument {
  id: string
  citizen_id: string
  file_url: string
  file_type: string
  file_size_bytes: number | null
  original_filename: string | null
  document_type: DocumentType
  document_date: string | null
  facility_name: string | null
  notes: string | null
  metadata: Record<string, unknown>
  is_classified: boolean
  ai_classification: string | null
  uploaded_by: string
  created_at: string
}

export interface ExtractedRecord {
  id: string
  document_id: string
  field_name: string
  field_value: string | null
  unit: string | null
  reference_range: string | null
  confidence_score: number | null
  ai_model: string
  extraction_date: string
  status: ExtractionStatus
}

export interface ConfirmedRecord {
  id: string
  extracted_record_id: string
  citizen_id: string
  confirmed_value: string
  confirmed_unit: string | null
  record_date: string | null
  category: string | null
  confirmed_by: string
  confirmed_at: string
}

export interface HealthEvent {
  id: string
  citizen_id: string
  event_type: EventType
  occurred_at: string
  title: string
  description: string | null
  source_document_id: string | null
  metadata: Record<string, unknown>
  created_by: string
  created_at: string
}

export interface HealthVisit {
  id: string
  citizen_id: string
  health_event_id: string | null
  facility: string | null
  doctor_name: string | null
  visit_type: VisitType
  reason: string | null
  visit_date: string
  notes: string | null
  source_document_id: string | null
  created_at: string
  updated_at: string
}

export interface ClinicalExam {
  id: string
  visit_id: string
  blood_pressure_systolic: number | null
  blood_pressure_diastolic: number | null
  pulse: number | null
  temperature: number | null
  respiratory_rate: number | null
  weight_kg: number | null
  height_cm: number | null
  bmi: number | null
  consciousness: string | null
  skin_condition: string | null
  symptoms: string[]
  findings: string[]
  notes: string | null
  created_at: string
}

export interface Diagnosis {
  id: string
  visit_id: string
  citizen_id: string
  icd_code: string | null
  disease_name: string
  diagnosis_type: DiagnosisType
  notes: string | null
  diagnosed_at: string | null
  created_at: string
}

export interface LabTest {
  id: string
  visit_id: string | null
  citizen_id: string
  test_type: string | null
  test_name: string
  result_value: string | null
  unit: string | null
  reference_range: string | null
  is_abnormal: boolean
  test_date: string
  source_document_id: string | null
  notes: string | null
  created_at: string
}

export interface Imaging {
  id: string
  visit_id: string | null
  citizen_id: string
  imaging_type: ImagingType
  body_part: string | null
  result: string | null
  conclusion: string | null
  image_file_url: string | null
  report_file_url: string | null
  imaging_date: string
  facility: string | null
  doctor_name: string | null
  source_document_id: string | null
  created_at: string
}

export interface Treatment {
  id: string
  visit_id: string
  treatment_type: TreatmentType
  description: string
  start_date: string | null
  end_date: string | null
  doctor_name: string | null
  facility: string | null
  outcome: string | null
  notes: string | null
  created_at: string
}

export interface Medication {
  id: string
  citizen_id: string
  visit_id: string | null
  drug_name: string
  dosage: string | null
  frequency: string | null
  route: string | null
  duration: string | null
  instructions: string | null
  start_date: string | null
  end_date: string | null
  is_active: boolean
  prescribed_by: string | null
  source_document_id: string | null
  created_at: string
  updated_at: string
}

export interface Vaccination {
  id: string
  citizen_id: string
  vaccine_name: string
  dose_number: number
  vaccination_date: string
  facility: string | null
  batch_number: string | null
  next_dose_date: string | null
  source_document_id: string | null
  notes: string | null
  created_at: string
}

export interface ChronicDisease {
  id: string
  citizen_id: string
  disease_name: string
  icd_code: string | null
  diagnosis_date: string | null
  status: DiseaseStatus
  current_treatment: string | null
  monitoring_plan: string | null
  last_review_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface VisitPreparation {
  id: string
  citizen_id: string
  specialty: string
  symptoms: string[]
  symptom_description: string | null
  questions_for_doctor: string[]
  ai_summary: string | null
  ai_summary_citations: unknown[]
  doctor_notes: string | null
  doctor_id: string | null
  pdf_url: string | null
  status: PrepStatus
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  target_table: string
  target_id: string | null
  details: Record<string, unknown>
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface Feedback {
  id: string
  user_id: string
  category: FeedbackCategory
  title: string | null
  content: string
  screenshot_url: string | null
  status: FeedbackStatus
  admin_response: string | null
  responded_at: string | null
  created_at: string
  updated_at: string
}
