import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Register Roboto font with Vietnamese support
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 70,
    fontSize: 11,
    fontFamily: 'Roboto',
    lineHeight: 1.6,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 700,
    color: '#2563EB',
    fontFamily: 'Roboto',
  },
  headerRight: {
    textAlign: 'right',
  },
  headerDate: {
    fontSize: 9,
    color: '#666',
    fontFamily: 'Roboto',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'Roboto',
  },
  header: {
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1E293B',
    fontFamily: 'Roboto',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Roboto',
  },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 4,
    color: '#1E40AF',
    fontFamily: 'Roboto',
  },
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { width: 120, fontWeight: 700, color: '#444', fontFamily: 'Roboto' },
  value: { flex: 1, fontFamily: 'Roboto' },
  text: { marginBottom: 4, fontFamily: 'Roboto' },
  listItem: { paddingLeft: 12, marginBottom: 3, fontFamily: 'Roboto' },
  disclaimer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 4,
  },
  disclaimerTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#92400E',
    marginBottom: 4,
    fontFamily: 'Roboto',
  },
  disclaimerText: { fontSize: 9, color: '#92400E', fontFamily: 'Roboto' },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 6,
  },
  footerText: {
    fontSize: 8,
    color: '#94A3B8',
    fontFamily: 'Roboto',
  },
  footerPage: {
    fontSize: 8,
    color: '#94A3B8',
    fontFamily: 'Roboto',
  },
})

interface PatientInfo {
  fullName: string
  dateOfBirth: string | null
  gender: string | null
  phone: string
}

interface VisitPrepPdfProps {
  patient: PatientInfo
  specialty: string
  date: string
  symptoms: string[]
  symptomDescription: string | null
  questionsForDoctor: string[]
  chronicDiseases: { name: string; status: string; treatment: string | null }[]
  medications: { name: string; dosage: string | null; frequency: string | null }[]
  aiSummary: string
}

export function VisitPrepPdfDocument({
  patient, specialty, date, symptoms, symptomDescription,
  questionsForDoctor, chronicDiseases, medications, aiSummary,
}: VisitPrepPdfProps) {
  const genderLabel =
    patient.gender === 'male' ? 'Nam' : patient.gender === 'female' ? 'Nữ' : 'Khác'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <Text style={styles.logoText}>AIVIHE</Text>
          <View style={styles.headerRight}>
            <Text style={styles.headerSubtitle}>Trợ lý AI sức khỏe cá nhân</Text>
            <Text style={styles.headerDate}>Ngày tạo: {date}</Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Gói hồ sơ chuẩn bị đi khám</Text>
          <Text style={styles.subtitle}>Chuyên khoa: {specialty}</Text>
        </View>

        {/* Patient Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin bệnh nhân</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Họ tên:</Text>
            <Text style={styles.value}>{patient.fullName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Ngày sinh:</Text>
            <Text style={styles.value}>{patient.dateOfBirth ?? 'Không rõ'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Giới tính:</Text>
            <Text style={styles.value}>{genderLabel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>SĐT:</Text>
            <Text style={styles.value}>{patient.phone}</Text>
          </View>
        </View>

        {/* Symptoms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lý do khám / Triệu chứng</Text>
          {symptoms.map((s, i) => (
            <Text key={i} style={styles.listItem}>{'•  '}{s}</Text>
          ))}
          {symptomDescription && (
            <Text style={styles.text}>{symptomDescription}</Text>
          )}
        </View>

        {/* Chronic Diseases */}
        {chronicDiseases.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bệnh nền</Text>
            {chronicDiseases.map((d, i) => (
              <Text key={i} style={styles.listItem}>
                {'•  '}{d.name} ({d.status}){d.treatment ? ` — ${d.treatment}` : ''}
              </Text>
            ))}
          </View>
        )}

        {/* Medications */}
        {medications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thuốc đang dùng</Text>
            {medications.map((m, i) => (
              <Text key={i} style={styles.listItem}>
                {'•  '}{m.name}{m.dosage ? `, ${m.dosage}` : ''}{m.frequency ? `, ${m.frequency}` : ''}
              </Text>
            ))}
          </View>
        )}

        {/* Questions */}
        {questionsForDoctor.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Câu hỏi cho bác sĩ</Text>
            {questionsForDoctor.map((q, i) => (
              <Text key={i} style={styles.listItem}>{'•  '}{q}</Text>
            ))}
          </View>
        )}

        {/* AI Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tóm tắt của AI</Text>
          {aiSummary.split('\n').filter(Boolean).map((line, i) => (
            <Text key={i} style={styles.text}>
              {line.replace(/^##\s*/, '').replace(/\*\*/g, '')}
            </Text>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>Lưu ý quan trọng</Text>
          <Text style={styles.disclaimerText}>
            Đây là bản chuẩn bị gợi ý dựa trên dữ liệu người dùng cung cấp.
            AI không chẩn đoán bệnh và không thay thế bác sĩ.
            Vui lòng mang theo tài liệu gốc khi đi khám.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Tạo bởi AIVIHE — Trợ lý AI sức khỏe cá nhân
          </Text>
          <Text style={styles.footerPage} render={({ pageNumber, totalPages }) =>
            `Trang ${pageNumber} / ${totalPages}`
          } />
        </View>
      </Page>
    </Document>
  )
}
