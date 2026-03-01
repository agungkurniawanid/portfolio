export type CertificateCategory =
  | "Semua"
  | "Magang / Internship"
  | "Bootcamp"
  | "Course Online"
  | "Webinar / Seminar"
  | "Sertifikasi Resmi"
  | "Kompetisi / Lomba"

export type CertificateStatus = "Valid" | "Expired" | "Lifetime"

export type SortOption = "Terbaru" | "Terlama" | "A–Z" | "Z–A"

export interface Certificate {
  id: number
  title: string
  description: string
  category: Exclude<CertificateCategory, "Semua">
  issuer_name: string
  issuer_logo?: string
  issue_date: string
  expiry_date: string | null
  status: CertificateStatus
  pdf_url: string | null
  thumbnail_url: string | null
}
