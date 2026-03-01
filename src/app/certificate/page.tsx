"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import {
  Award,
  Search,
  X,
  LayoutGrid,
  AlignLeft,
  Download,
  Eye,
  ChevronDown,
  Building2,
  Calendar,
  Clock,
  Filter,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/Utils"
import { certificates, CERTIFICATE_CATEGORIES, CERT_YEARS } from "@/data/certificateData"
import type { Certificate, CertificateCategory, CertificateStatus, SortOption } from "@/types/certificate"

// Dynamically import PDF components to avoid SSR issues
const PdfViewer = dynamic(() => import("./PdfViewer"), { ssr: false })
const PdfThumbnailComponent = dynamic(() => import("./PdfThumbnail"), { ssr: false })

// ─────────────────────────── helpers ──────────────────────────

const ID_MONTHS_LONG = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]
const ID_MONTHS_SHORT = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${ID_MONTHS_LONG[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getUTCDate()} ${ID_MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

function getYear(dateStr: string) {
  return new Date(dateStr).getFullYear().toString()
}

function getLatestDate(certs: Certificate[]) {
  if (!certs.length) return "—"
  const sorted = [...certs].sort((a, b) => b.issue_date.localeCompare(a.issue_date))
  return formatDate(sorted[0].issue_date)
}

const STATUS_STYLES: Record<CertificateStatus, { bg: string; text: string; dot: string; label: string }> = {
  Valid:    { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500", label: "✅ Valid" },
  Expired:  { bg: "bg-red-100 dark:bg-red-900/30",       text: "text-red-700 dark:text-red-400",       dot: "bg-red-500",     label: "🔴 Expired" },
  Lifetime: { bg: "bg-blue-100 dark:bg-blue-900/30",     text: "text-blue-700 dark:text-blue-400",     dot: "bg-blue-500",    label: "🔵 Lifetime" },
}

const CATEGORY_COLORS: Record<Exclude<CertificateCategory, "Semua">, string> = {
  "Magang / Internship": "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  "Bootcamp":            "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
  "Course Online":       "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400",
  "Webinar / Seminar":   "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  "Sertifikasi Resmi":   "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  "Kompetisi / Lomba":   "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400",
}

// ─────────────────────────── Animated Counter ─────────────────

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        obs.disconnect()
        let start = 0
        const duration = 1200
        const step = Math.ceil(target / (duration / 16))
        const timer = setInterval(() => {
          start = Math.min(start + step, target)
          setCount(start)
          if (start >= target) clearInterval(timer)
        }, 16)
      },
      { threshold: 0.5 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}

// ─────────────────────────── Certificate Card ─────────────────

function CertCard({ cert, onPreview, index }: { cert: Certificate; onPreview: () => void; index: number }) {
  const statusCfg = STATUS_STYLES[cert.status]
  const categoryCls = CATEGORY_COLORS[cert.category as Exclude<CertificateCategory, "Semua">] ?? ""

  return (
    <div
      className="group relative bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 hover:border-accentColor/30 shadow-sm hover:shadow-lg hover:shadow-accentColor/5 overflow-hidden transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
    >
      {/* Thumbnail */}
      <PdfThumbnailComponent cert={cert} onClick={onPreview} />

      {/* Status badge overlay */}
      <div className="absolute top-3 right-3">
        <span className={cn("inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm", statusCfg.bg, statusCfg.text)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", statusCfg.dot)} />
          {cert.status}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <span className={cn("inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2", categoryCls)}>
          {cert.category}
        </span>

        {/* Title */}
        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug text-sm mb-2">
          {cert.title}
        </h3>

        {/* Issuer */}
        <div className="flex items-center gap-2 mb-3">
          {cert.issuer_logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cert.issuer_logo}
              alt={cert.issuer_name}
              className="w-5 h-5 rounded object-contain shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).replaceWith(
                  Object.assign(document.createElement("span"), {
                    className: "text-accentColor",
                    innerHTML: `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`,
                  })
                )
              }}
            />
          ) : (
            <Building2 className="w-4 h-4 text-accentColor shrink-0" />
          )}
          <span className="text-xs font-medium text-accentColor truncate">{cert.issuer_name}</span>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDateShort(cert.issue_date)}
          </span>
          {cert.expiry_date && (
            <>
              <span className="text-gray-300 dark:text-gray-600">→</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDateShort(cert.expiry_date)}
              </span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onPreview}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-accentColor/10 text-accentColor hover:bg-accentColor hover:text-white text-xs font-semibold transition-all duration-200"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
          {cert.pdf_url ? (
            <a
              href={cert.pdf_url}
              download={`${cert.title.replace(/\s+/g, "-").toLowerCase()}.pdf`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-semibold transition-all duration-200"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>
          ) : (
            <div
              title="PDF belum tersedia"
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700/40 text-gray-400 dark:text-gray-600 text-xs font-semibold cursor-not-allowed select-none"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────── Timeline Item ────────────────────

function TimelineItem({ cert, onPreview, isLeft }: { cert: Certificate; onPreview: () => void; isLeft: boolean }) {
  const statusCfg = STATUS_STYLES[cert.status]
  const categoryCls = CATEGORY_COLORS[cert.category as Exclude<CertificateCategory, "Semua">] ?? ""
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.2 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex items-start gap-4 md:gap-8 transition-all duration-700",
        isLeft ? "md:flex-row" : "md:flex-row-reverse",
        visible ? "opacity-100 translate-x-0" : isLeft ? "opacity-0 -translate-x-8" : "opacity-0 translate-x-8"
      )}
    >
      {/* Card */}
      <div className={cn("flex-1", isLeft ? "md:text-right" : "md:text-left")}>
        <div
          className={cn(
            "inline-block bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm hover:shadow-md hover:border-accentColor/30 p-4 transition-all duration-300 text-left max-w-sm w-full",
            isLeft ? "" : ""
          )}
        >
          <div className="flex items-start gap-3">
            {/* Mini thumbnail */}
            <div className="w-14 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-700 relative">
              {cert.thumbnail_url ? (
                <Image src={cert.thumbnail_url} alt={cert.title} fill className="object-cover" sizes="56px" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Award className="w-6 h-6 text-accentColor/40" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", categoryCls)}>{cert.category}</span>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1", statusCfg.bg, statusCfg.text)}>
                  <span className={cn("w-1 h-1 rounded-full", statusCfg.dot)} />
                  {cert.status}
                </span>
              </div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug">{cert.title}</h4>
              <p className="text-xs text-accentColor font-medium mt-1">{cert.issuer_name}</p>
            </div>
          </div>

          <button
            onClick={onPreview}
            className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-accentColor/10 text-accentColor hover:bg-accentColor hover:text-white text-xs font-semibold transition-all duration-200"
          >
            <Eye className="w-3 h-3" />
            Lihat Sertifikat
          </button>
        </div>
      </div>

      {/* Center dot */}
      <div className="hidden md:flex flex-col items-center shrink-0 w-8 pt-4">
        <div className="w-4 h-4 rounded-full bg-accentColor border-4 border-white dark:border-gray-900 shadow-md z-10" />
        <div className="flex-1 w-0.5 bg-gradient-to-b from-accentColor/40 to-transparent mt-1" />
      </div>

      {/* Date */}
      <div className={cn("flex-1 pt-4", isLeft ? "" : "md:hidden")}>
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {formatDateShort(cert.issue_date)}
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────── Main Page ────────────────────────

export default function CertificatePage() {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<CertificateCategory>("Semua")
  const [activeStatus, setActiveStatus] = useState<CertificateStatus | "All">("All")
  const [sortBy, setSortBy] = useState<SortOption>("Terbaru")
  const [activeYear, setActiveYear] = useState("Semua")
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid")
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [showYearMenu, setShowYearMenu] = useState(false)
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function close() {
      setShowSortMenu(false)
      setShowStatusMenu(false)
      setShowYearMenu(false)
    }
    document.addEventListener("click", close)
    return () => document.removeEventListener("click", close)
  }, [])

  // Close lightbox on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPreviewCert(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // ─── computed stats ───
  const totalCerts = certificates.length
  const validCerts = certificates.filter((c) => c.status === "Valid").length
  const uniqueIssuers = new Set(certificates.map((c) => c.issuer_name)).size
  const latestDate = getLatestDate(certificates)

  // ─── filtered & sorted ───
  const filtered = useMemo(() => {
    let result = certificates.filter((c) => {
      if (activeCategory !== "Semua" && c.category !== activeCategory) return false
      if (activeStatus !== "All" && c.status !== activeStatus) return false
      if (activeYear !== "Semua" && getYear(c.issue_date) !== activeYear) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return (
          c.title.toLowerCase().includes(q) ||
          c.issuer_name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
        )
      }
      return true
    })

    if (sortBy === "Terbaru") result = [...result].sort((a, b) => b.issue_date.localeCompare(a.issue_date))
    else if (sortBy === "Terlama") result = [...result].sort((a, b) => a.issue_date.localeCompare(b.issue_date))
    else if (sortBy === "A–Z") result = [...result].sort((a, b) => a.title.localeCompare(b.title))
    else if (sortBy === "Z–A") result = [...result].sort((a, b) => b.title.localeCompare(a.title))

    return result
  }, [search, activeCategory, activeStatus, activeYear, sortBy])

  // ─── timeline grouped by year ───
  const timelineByYear = useMemo(() => {
    const byYear: Record<string, Certificate[]> = {}
    ;[...filtered].sort((a, b) => b.issue_date.localeCompare(a.issue_date)).forEach((c) => {
      const y = getYear(c.issue_date)
      if (!byYear[y]) byYear[y] = []
      byYear[y].push(c)
    })
    return Object.entries(byYear).sort(([a], [b]) => Number(b) - Number(a))
  }, [filtered])

  const hasFilters = search || activeCategory !== "Semua" || activeStatus !== "All" || activeYear !== "Semua"

  const resetFilters = () => {
    setSearch("")
    setActiveCategory("Semua")
    setActiveStatus("All")
    setSortBy("Terbaru")
    setActiveYear("Semua")
  }

  return (
    <main className="min-h-screen bg-baseBackground pt-[4.5rem]" suppressHydrationWarning>

      {/* ──────────────────── HERO SECTION ──────────────────── */}
      <section className="relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none select-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-accentColor/5 blur-3xl" />
          <div className="absolute top-20 right-10 w-48 h-48 rounded-full bg-accentColor/3 blur-2xl" />
          <div className="absolute bottom-0 left-10 w-64 h-64 rounded-full bg-blue-500/3 blur-2xl" />
        </div>

        <div className="relative px-[5%] pt-14 pb-10 max-w-7xl mx-auto text-center">
          {/* Label */}
          <div className="inline-flex items-center gap-2 text-accentColor text-sm font-semibold mb-4 px-4 py-1.5 rounded-full border border-accentColor/30 bg-accentColor/5">
            <Award className="w-4 h-4" />
            Sertifikat & Pencapaian
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            My{" "}
            <span className="text-accentColor">Certificates</span>
          </h1>

          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Kumpulan sertifikat, pencapaian, dan bukti perjalanan belajar saya
          </p>

          {/* Animated Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { icon: "📜", label: "Total Sertifikat", value: totalCerts, suffix: "", raw: totalCerts },
              { icon: "✅", label: "Masih Berlaku", value: validCerts, suffix: "", raw: validCerts },
              { icon: "🏢", label: "Lembaga Penerbit", value: uniqueIssuers, suffix: "", raw: uniqueIssuers },
              { icon: "🗓️", label: "Terbaru Diraih", value: null, raw: null, text: latestDate },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-700/60 p-4 shadow-sm"
              >
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl md:text-3xl font-bold text-accentColor">
                  {stat.raw !== null ? (
                    <AnimatedCounter target={stat.raw} suffix={stat.suffix} />
                  ) : (
                    <span className="text-base md:text-lg font-bold">{stat.text}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── SEARCH & FILTER ─────────────────── */}
      <section className="px-[5%] py-6 max-w-7xl mx-auto">
        <div className="bg-white/70 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-700/60 p-5 shadow-sm space-y-5">

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan judul, lembaga, atau deskripsi…"
              suppressHydrationWarning
              className={cn(
                "w-full pl-12 pr-12 py-3.5 rounded-xl text-sm",
                "bg-gray-50 dark:bg-gray-900/60",
                "border border-gray-200 dark:border-gray-700",
                "text-gray-900 dark:text-white placeholder:text-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-accentColor/40 focus:border-accentColor",
                "transition-all duration-200"
              )}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
            {CERTIFICATE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                suppressHydrationWarning
                onClick={() => setActiveCategory(cat as CertificateCategory)}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  activeCategory === cat
                    ? "bg-accentColor text-white shadow-md shadow-accentColor/30"
                    : "bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Filter row */}
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />

            {/* Status dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => { setShowStatusMenu(!showStatusMenu); setShowSortMenu(false); setShowYearMenu(false) }}
                suppressHydrationWarning
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200",
                  activeStatus !== "All"
                    ? "border-accentColor/40 bg-accentColor/10 text-accentColor"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                Status: {activeStatus}
                <ChevronDown className={cn("w-4 h-4 transition-transform", showStatusMenu && "rotate-180")} />
              </button>
              {showStatusMenu && (
                <div className="absolute top-full mt-1 left-0 z-50 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg py-1 min-w-[140px] animate-in fade-in zoom-in-95 duration-150">
                  {(["All", "Valid", "Expired", "Lifetime"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => { setActiveStatus(s); setShowStatusMenu(false) }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                        activeStatus === s ? "text-accentColor font-semibold" : "text-gray-700 dark:text-gray-300"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => { setShowSortMenu(!showSortMenu); setShowStatusMenu(false); setShowYearMenu(false) }}
                suppressHydrationWarning
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200",
                  sortBy !== "Terbaru"
                    ? "border-accentColor/40 bg-accentColor/10 text-accentColor"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                Urutkan: {sortBy}
                <ChevronDown className={cn("w-4 h-4 transition-transform", showSortMenu && "rotate-180")} />
              </button>
              {showSortMenu && (
                <div className="absolute top-full mt-1 left-0 z-50 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg py-1 min-w-[130px] animate-in fade-in zoom-in-95 duration-150">
                  {(["Terbaru", "Terlama", "A–Z", "Z–A"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => { setSortBy(s); setShowSortMenu(false) }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                        sortBy === s ? "text-accentColor font-semibold" : "text-gray-700 dark:text-gray-300"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Year dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => { setShowYearMenu(!showYearMenu); setShowSortMenu(false); setShowStatusMenu(false) }}
                suppressHydrationWarning
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200",
                  activeYear !== "Semua"
                    ? "border-accentColor/40 bg-accentColor/10 text-accentColor"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                Tahun: {activeYear}
                <ChevronDown className={cn("w-4 h-4 transition-transform", showYearMenu && "rotate-180")} />
              </button>
              {showYearMenu && (
                <div className="absolute top-full mt-1 left-0 z-50 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg py-1 min-w-[120px] animate-in fade-in zoom-in-95 duration-150">
                  {CERT_YEARS.map((y) => (
                    <button
                      key={y}
                      onClick={() => { setActiveYear(y); setShowYearMenu(false) }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                        activeYear === y ? "text-accentColor font-semibold" : "text-gray-700 dark:text-gray-300"
                      )}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset */}
            {hasFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
            )}

            {/* Result counter */}
            <span className="ml-auto text-sm text-gray-500 dark:text-gray-400 font-medium shrink-0">
              Menampilkan{" "}
              <span className="text-accentColor font-bold">{filtered.length}</span>
              {" "}dari{" "}
              <span className="font-bold text-gray-700 dark:text-gray-300">{totalCerts}</span>
              {" "}sertifikat
            </span>
          </div>
        </div>
      </section>

      {/* ─────────────── VIEW TOGGLE & GRID/TIMELINE ─────────────── */}
      <section className="px-[5%] pb-16 max-w-7xl mx-auto">
        {/* View toggle */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {viewMode === "grid" ? "Grid Sertifikat" : "Timeline Pencapaian"}
          </h2>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                viewMode === "grid"
                  ? "bg-white dark:bg-gray-700 text-accentColor shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              Grid
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                viewMode === "timeline"
                  ? "bg-white dark:bg-gray-700 text-accentColor shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              )}
            >
              <AlignLeft className="w-4 h-4" />
              Timeline
            </button>
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-gray-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-200 text-lg">Tidak ada hasil</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Coba ubah filter atau kata kunci pencarian</p>
            </div>
            <button
              onClick={resetFilters}
              className="px-5 py-2.5 rounded-xl bg-accentColor text-white text-sm font-semibold hover:bg-accentColor/90 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* ── GRID VIEW ── */}
        {viewMode === "grid" && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((cert, i) => (
              <CertCard
                key={cert.id}
                cert={cert}
                index={i}
                onPreview={() => setPreviewCert(cert)}
              />
            ))}
          </div>
        )}

        {/* ── TIMELINE VIEW ── */}
        {viewMode === "timeline" && filtered.length > 0 && (
          <div className="space-y-12">
            {timelineByYear.map(([year, certs]) => (
              <div key={year}>
                {/* Year marker */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-accentColor/10 border-2 border-accentColor/30 flex items-center justify-center shrink-0">
                    <span className="font-black text-accentColor text-sm">{year}</span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-accentColor/30 to-transparent" />
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500 shrink-0">{certs.length} sertifikat</span>
                </div>

                {/* Center line */}
                <div className="relative">
                  <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accentColor/20 via-accentColor/10 to-transparent" />

                  <div className="space-y-6">
                    {certs.map((cert, i) => (
                      <TimelineItem
                        key={cert.id}
                        cert={cert}
                        onPreview={() => setPreviewCert(cert)}
                        isLeft={i % 2 === 0}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─────────────────── PDF LIGHTBOX ─────────────────── */}
      {previewCert && (
        <PdfViewer
          certificate={previewCert}
          onClose={() => setPreviewCert(null)}
        />
      )}
    </main>
  )
}
