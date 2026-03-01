"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  GraduationCap, Briefcase, BookOpen, Trophy, Users,
  MapPin, CheckCircle2, Star, Quote as QuoteIcon,
  ChevronDown, ArrowUpDown, CalendarDays, Award,
  Building2, Layers, ExternalLink, X, ZoomIn,
} from "lucide-react"
import {
  FaSchool, FaLaptopCode, FaUniversity, FaCode, FaBrain,
  FaBriefcase, FaBuilding, FaTrophy, FaMedal, FaStar, FaUsers,
  FaHandshake,
} from "react-icons/fa"
import { SiFlutter } from "react-icons/si"
import { cn } from "@/lib/Utils"
import {
  timelineData,
  ALL_CATEGORIES,
  categoryMeta,
  colorMap,
  computeStats,
  type TimelineItem,
  type TimelineCategory,
  type TimelineColor,
} from "@/data/timelineData"
import "yet-another-react-lightbox/styles.css"

const Lightbox = dynamic(() => import("yet-another-react-lightbox"), { ssr: false })

/* ─────────────────────────── ICON REGISTRY ─────────────────────────── */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FaSchool, FaLaptopCode, FaUniversity, FaCode, FaBrain,
  FaBriefcase, FaBuilding, FaTrophy, FaMedal, FaStar,
  FaUsers, FaHandshake, SiFlutter,
}

function TimelineIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] ?? FaCode
  return <Icon className={className} />
}

/* ─────────────────────────── TYPING HOOK ─────────────────────────── */
function useTyping(texts: string[], speed = 60, pause = 1800) {
  const [display, setDisplay] = useState("")
  const [textIndex, setTextIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = texts[textIndex]
    let timeout: ReturnType<typeof setTimeout>

    if (!deleting && charIndex < current.length) {
      timeout = setTimeout(() => setCharIndex((c) => c + 1), speed)
    } else if (!deleting && charIndex === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex((c) => c - 1), speed / 2)
    } else {
      setDeleting(false)
      setTextIndex((i) => (i + 1) % texts.length)
    }

    setDisplay(current.slice(0, charIndex))
    return () => clearTimeout(timeout)
  }, [charIndex, deleting, textIndex, texts, speed, pause])

  return display
}

/* ─────────────────────────── COUNTER HOOK ─────────────────────────── */
function useCounter(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTs: number
    const step = (ts: number) => {
      if (!startTs) startTs = ts
      const progress = Math.min((ts - startTs) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return count
}

/* ─────────────────────────── INTERSECTION HOOK ─────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold }
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

/* ─────────────────────────── STAT CARD ─────────────────────────── */
interface StatCardProps {
  icon: React.ReactNode
  value: number
  suffix: string
  label: string
  start: boolean
}

function StatCard({ icon, value, suffix, label, start }: StatCardProps) {
  const count = useCounter(value, 1600, start)
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 min-w-[130px]">
      <div className="w-10 h-10 rounded-xl bg-accentColor/20 flex items-center justify-center text-accentColor">
        {icon}
      </div>
      <span className="text-2xl font-bold text-white tabular-nums">
        {count}{suffix}
      </span>
      <span className="text-xs text-white/70 text-center leading-tight">{label}</span>
    </div>
  )
}

/* ─────────────────────────── SKILL BADGE ─────────────────────────── */
function SkillBadge({ label, color }: { label: string; color: TimelineColor }) {
  const c = colorMap[color]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full",
        c.badge, c.badgeDark
      )}
    >
      {label}
    </span>
  )
}

/* ─────────────────────────── PHOTO GRID ─────────────────────────── */
function PhotoGrid({
  photos,
  onOpen,
}: {
  photos: TimelineItem["photos"]
  onOpen: (idx: number) => void
}) {
  if (!photos.length) return null
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {photos.map((p, i) => (
        <button
          key={i}
          onClick={() => onOpen(i)}
          className="relative group w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-accentColor/60 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accentColor"
          aria-label={`Lihat foto: ${p.alt}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.src}
            alt={p.alt}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
            <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" size={16} />
          </div>
        </button>
      ))}
    </div>
  )
}

/* ─────────────────────────── TIMELINE CARD ─────────────────────────── */
function TimelineCard({ item, side }: { item: TimelineItem; side: "left" | "right" }) {
  const { ref, inView } = useInView(0.1)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const c = colorMap[item.color]

  const slides = item.photos.map((p) => ({ src: p.src, description: p.caption }))

  const periodLabel =
    item.period_start === item.period_end
      ? item.period_start
      : `${item.period_start} – ${item.period_end}`

  return (
    <div
      id={`timeline-${item.id}`}
      ref={ref}
      className={cn(
        "transition-all duration-700",
        inView
          ? "opacity-100 translate-x-0"
          : side === "left"
          ? "opacity-0 -translate-x-16"
          : "opacity-0 translate-x-16"
      )}
    >
      {/* ── Card ── */}
      <div
        className={cn(
          "group relative rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300",
          "hover:-translate-y-1 hover:shadow-2xl",
          "bg-white dark:bg-gray-900",
          c.border, c.borderDark,
          `hover:${c.glow}`
        )}
      >
        {/* Top accent line */}
        <div className={cn("h-1 rounded-t-2xl w-full", c.iconBg, c.iconBgDark)} />

        <div className="p-5 space-y-4">
          {/* ── Header ── */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className={cn(
                  "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm",
                  c.iconBg, c.iconBgDark
                )}
              >
                <TimelineIcon name={item.icon} className="text-base" />
              </div>
              {/* Title block */}
              <div>
                <p className={cn("text-[11px] font-semibold uppercase tracking-wider mb-0.5", c.text, c.textDark)}>
                  {item.type}
                </p>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.subtitle}</p>
                )}
              </div>
            </div>
            {/* Status badge */}
            <span
              className={cn(
                "shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full",
                item.status === "Sedang Berlangsung"
                  ? "bg-accentColor/15 text-accentColor"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              )}
            >
              {item.status === "Sedang Berlangsung" ? (
                <span className="w-1.5 h-1.5 rounded-full bg-accentColor animate-pulse" />
              ) : (
                <CheckCircle2 size={10} />
              )}
              {item.status}
            </span>
          </div>

          {/* ── Meta row ── */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <CalendarDays size={11} className={cn(c.text, c.textDark)} />
              {periodLabel}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={11} className={cn(c.text, c.textDark)} />
              {item.location}
              {item.locationDetail && <span className="text-gray-400">· {item.locationDetail}</span>}
            </span>
            {item.gpa && (
              <span className="flex items-center gap-1">
                <Award size={11} className={cn(c.text, c.textDark)} />
                IPK {item.gpa}
              </span>
            )}
            {item.awardLevel && (
              <span className={cn("flex items-center gap-1 font-semibold", c.text, c.textDark)}>
                <Trophy size={11} />
                {item.awardLevel}
              </span>
            )}
          </div>

          {/* ── Category badge ── */}
          <div>
            <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full", c.badge, c.badgeDark)}>
              {categoryMeta[item.category].emoji} {item.category}
            </span>
          </div>

          {/* ── Description ── */}
          <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed">
            {item.description}
          </p>

          {/* ── Photos ── */}
          {item.photos.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Dokumentasi
              </p>
              <PhotoGrid photos={item.photos} onOpen={(i) => setLightboxIdx(i)} />
            </div>
          )}

          {/* ── Highlights ── */}
          {item.highlights.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                Highlight Momen
              </p>
              <ul className="space-y-1.5">
                {item.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-gray-700 dark:text-gray-300">
                    <Star
                      size={12}
                      className={cn("mt-0.5 shrink-0 fill-current", c.text, c.textDark)}
                    />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Responsibilities ── */}
          {item.responsibilities && item.responsibilities.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                Tanggung Jawab
              </p>
              <ul className="space-y-1.5">
                {item.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-gray-700 dark:text-gray-300">
                    <CheckCircle2 size={12} className={cn("mt-0.5 shrink-0", c.text, c.textDark)} />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Projects ── */}
          {item.projects && item.projects.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                Proyek
              </p>
              <div className="flex flex-wrap gap-1.5">
                {item.projects.map((p, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  >
                    <Layers size={10} />
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Skills ── */}
          {item.skills.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                Skill yang Dipelajari
              </p>
              <div className="flex flex-wrap gap-1.5">
                {item.skills.map((s) => (
                  <SkillBadge key={s} label={s} color={item.color} />
                ))}
              </div>
            </div>
          )}

          {/* ── Certificates ── */}
          {item.certificates && item.certificates.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.certificates.map((cert, i) => (
                cert.href ? (
                  <Link
                    key={i}
                    href={cert.href}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border hover:opacity-80 transition-opacity",
                      c.badge, c.badgeDark, c.border, c.borderDark
                    )}
                  >
                    <Award size={10} />
                    {cert.name}
                    <ExternalLink size={9} />
                  </Link>
                ) : (
                  <span
                    key={i}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border",
                      c.badge, c.badgeDark, c.border, c.borderDark
                    )}
                  >
                    <Award size={10} />
                    {cert.name}
                  </span>
                )
              ))}
            </div>
          )}

          {/* ── Quote ── */}
          {item.quote && (
            <blockquote
              className={cn(
                "relative mt-2 pl-4 py-2 border-l-[3px] rounded-r-lg",
                c.border, c.borderDark,
                c.bg, c.bgDark
              )}
            >
              <QuoteIcon size={14} className={cn("absolute -top-1 -left-1 opacity-50", c.text, c.textDark)} />
              <p className="text-[12px] italic text-gray-600 dark:text-gray-300 leading-relaxed">
                &ldquo;{item.quote}&rdquo;
              </p>
              {item.quote_author && (
                <cite className={cn("text-[11px] font-semibold not-italic mt-1 block", c.text, c.textDark)}>
                  — {item.quote_author}
                </cite>
              )}
            </blockquote>
          )}

          {/* ── External link ── */}
          {item.externalLink && (
            <div className="pt-1">
              <Link
                href={item.externalLink.href}
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs font-semibold hover:underline transition-colors",
                  c.text, c.textDark
                )}
              >
                <ExternalLink size={11} />
                {item.externalLink.label}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <Lightbox
          open
          close={() => setLightboxIdx(null)}
          index={lightboxIdx}
          slides={slides}
        />
      )}
    </div>
  )
}

/* ─────────────────────────── YEAR LABEL ─────────────────────────── */
function YearLabel({ year, color }: { year: string; color: TimelineColor }) {
  const c = colorMap[color]
  return (
    <div className="flex justify-center my-2 z-10 relative">
      <div
        className={cn(
          "px-4 py-1 rounded-full text-xs font-bold border shadow-sm",
          c.badge, c.badgeDark, c.border, c.borderDark
        )}
      >
        {year}
      </div>
    </div>
  )
}

/* ─────────────────────────── TIMELINE SECTION ─────────────────────────── */
function TimelineSection({ items }: { items: TimelineItem[] }) {
  const lineRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Animate the vertical line on scroll
  useEffect(() => {
    const line = lineRef.current
    const container = containerRef.current
    if (!line || !container) return

    const update = () => {
      const rect = container.getBoundingClientRect()
      const visibleTop = Math.max(0, -rect.top)
      const total = rect.height
      const progress = Math.min(1, Math.max(0, visibleTop / (total - window.innerHeight / 2)))
      line.style.height = `${progress * 100}%`
    }

    window.addEventListener("scroll", update, { passive: true })
    update()
    return () => window.removeEventListener("scroll", update)
  }, [items])

  // Group consecutive items – detect year changes to show year labels
  const rows: Array<{ type: "year"; label: string; color: TimelineColor } | { type: "item"; item: TimelineItem; side: "left" | "right"; globalIndex: number }> = []
  let sideIndex = 0
  let prevYear = ""

  items.forEach((item) => {
    const year = item.period_start.split(" ").pop() ?? item.period_start
    if (year !== prevYear) {
      rows.push({ type: "year", label: year, color: item.color })
      prevYear = year
    }
    rows.push({ type: "item", item, side: sideIndex % 2 === 0 ? "left" : "right", globalIndex: sideIndex })
    sideIndex++
  })

  return (
    <div ref={containerRef} className="relative">
      {/* ── Vertical line track ── */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800 hidden md:block" />
      {/* ── Progress fill ── */}
      <div
        ref={lineRef}
        className="absolute left-1/2 -translate-x-1/2 top-0 w-0.5 bg-accentColor hidden md:block transition-all duration-100"
        style={{ height: "0%" }}
      />

      {/* ── Mobile line (left side) ── */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800 md:hidden" />

      <div className="space-y-8">
        {rows.map((row, i) => {
          if (row.type === "year") {
            return <YearLabel key={`year-${row.label}-${i}`} year={row.label} color={row.color} />
          }

          const { item, side } = row
          const c = colorMap[item.color]

          return (
            <div key={item.id} className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-0 md:gap-6 items-start">
              {/* ── Left card or empty ── */}
              <div className={cn("md:flex md:justify-end pl-10 md:pl-0", side === "right" ? "md:block" : "")}>
                {side === "left" ? (
                  <div className="md:max-w-[480px] w-full">
                    <TimelineCard item={item} side="left" />
                  </div>
                ) : (
                  <div className="hidden md:block" />
                )}
              </div>

              {/* ── Center dot ── */}
              <div className="hidden md:flex flex-col items-center justify-start pt-6">
                <div
                  className={cn(
                    "relative w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 shadow-md z-10",
                    c.dot, c.dotDark
                  )}
                >
                  <span className={cn("absolute inset-0 rounded-full animate-ping opacity-40", c.dot, c.dotDark)} />
                </div>
              </div>

              {/* ── Mobile dot ── */}
              <div
                className={cn(
                  "absolute left-3.5 top-6 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 shadow z-10 md:hidden",
                  c.dot, c.dotDark
                )}
              />

              {/* ── Right card or empty ── */}
              <div className={cn("hidden md:flex md:justify-start pl-10 md:pl-0")}>
                {side === "right" ? (
                  <div className="md:max-w-[480px] w-full">
                    <TimelineCard item={item} side="right" />
                  </div>
                ) : (
                  <div className="hidden md:block" />
                )}
              </div>

              {/* Mobile always shows the card (regardless of side logic, mobile is single col) */}
              {side === "right" && (
                <div className="md:hidden pl-10 -mt-[10px]">
                  <TimelineCard item={item} side="left" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────── FILTER PILLS ─────────────────────────── */
function FilterPills({
  active,
  onChange,
  counts,
}: {
  active: TimelineCategory
  onChange: (c: TimelineCategory) => void
  counts: Record<TimelineCategory, number>
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto scrollbar-none pb-1"
    >
      {ALL_CATEGORIES.map((cat) => {
        const meta = categoryMeta[cat]
        const isActive = active === cat

        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
              isActive
                ? "bg-accentColor text-white border-accentColor shadow-md shadow-accentColor/25"
                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-accentColor/50 hover:text-accentColor"
            )}
          >
            <span>{meta.emoji}</span>
            <span>{meta.label}</span>
            <span
              className={cn(
                "text-[11px] px-1.5 py-0.5 rounded-full font-bold",
                isActive ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              )}
            >
              {counts[cat]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ─────────────────────────── EMPTY STATE ─────────────────────────── */
function EmptyState({ category }: { category: TimelineCategory }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="text-5xl">{categoryMeta[category]?.emoji ?? "📭"}</div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        Belum ada data untuk kategori <strong>{category}</strong>
      </p>
    </div>
  )
}

/* ─────────────────────────── HERO SECTION ─────────────────────────── */
function HeroSection({ onScrollDown }: { onScrollDown: () => void }) {
  const heroRef = useRef<HTMLDivElement>(null)
  const { ref: statsRef, inView: statsInView } = useInView(0.3)
  const typed = useTyping(["My Journey", "Perjalananku", "My Story", "Jejak Langkahku"], 70, 2000)
  const stats = useMemo(() => computeStats(), [])

  const statCards = [
    { icon: <GraduationCap size={20} />, value: stats.learnYears, suffix: " Tahun", label: "Tahun Belajar" },
    { icon: <Briefcase size={20} />, value: typeof stats.workYears === "string" ? parseInt(stats.workYears) : stats.workYears, suffix: typeof stats.workYears === "string" && stats.workYears.includes("Tahun") ? " Tahun" : " Bulan", label: "Pengalaman Kerja" },
    { icon: <Trophy size={20} />, value: stats.achievements, suffix: "", label: "Pencapaian" },
    { icon: <Users size={20} />, value: stats.orgs, suffix: "", label: "Organisasi" },
  ]

  return (
    <section
      ref={heroRef}
      className="relative min-h-[70vh] flex flex-col justify-center items-center text-center overflow-hidden px-6 py-20"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-accentColor/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
        <Link href="/" className="hover:text-accentColor transition-colors">Home</Link>
        <span>•</span>
        <span className="text-accentColor font-medium">Timeline</span>
      </div>

      {/* Heading */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accentColor/10 border border-accentColor/30 text-accentColor text-sm font-medium">
          <CalendarDays size={14} />
          Perjalanan Hidup
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight">
          <span>{typed}</span>
          <span className="inline-block w-0.5 h-[1em] bg-accentColor ml-1 align-middle animate-pulse" />
        </h1>

        <p className="text-gray-300 dark:text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Dari bangku sekolah dasar hingga dunia profesional — setiap langkah membentuk siapa saya hari ini.
        </p>
      </div>

      {/* Stat cards */}
      <div ref={statsRef} className="flex flex-wrap justify-center gap-3 mt-12">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} start={statsInView} />
        ))}
      </div>

      {/* Scroll indicator */}
      <button
        onClick={onScrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-400 hover:text-accentColor transition-colors group"
        aria-label="Scroll ke bawah"
      >
        <span className="text-[11px] uppercase tracking-widest">Scroll</span>
        <ChevronDown
          size={20}
          className="animate-bounce group-hover:text-accentColor"
        />
      </button>
    </section>
  )
}

/* ─────────────────────────── MAIN PAGE ─────────────────────────── */
export default function TimelinePage() {
  const [activeCategory, setActiveCategory] = useState<TimelineCategory>("Semua")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const contentRef = useRef<HTMLDivElement>(null)

  const handleScrollDown = useCallback(() => {
    contentRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // Filtered + sorted items
  const filteredItems = useMemo(() => {
    let items =
      activeCategory === "Semua"
        ? [...timelineData]
        : timelineData.filter((item) => item.category === activeCategory)

    items = items.slice().sort((a, b) => {
      const ya = parseInt(a.period_start.split(" ").pop() ?? a.period_start)
      const yb = parseInt(b.period_start.split(" ").pop() ?? b.period_start)
      return sortOrder === "asc" ? ya - yb : yb - ya
    })

    return items
  }, [activeCategory, sortOrder])

  // Count per category
  const counts = useMemo(() => {
    const result = {} as Record<TimelineCategory, number>
    ALL_CATEGORIES.forEach((cat) => {
      result[cat] = cat === "Semua" ? timelineData.length : timelineData.filter((d) => d.category === cat).length
    })
    return result
  }, [])

  return (
    <div className="min-h-screen bg-baseBackground">
      {/* ── Hero ── */}
      <HeroSection onScrollDown={handleScrollDown} />

      {/* ── Main Content ── */}
      <div ref={contentRef} className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 pt-12">
        {/* ── Filter + Sort toolbar ── */}
        <div className="sticky top-[4.5rem] z-40 bg-baseBackground/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 pb-4 pt-4 mb-10">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <FilterPills
              active={activeCategory}
              onChange={(cat) => setActiveCategory(cat)}
              counts={counts}
            />
            {/* Sort toggle */}
            <button
              onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-accentColor/50 hover:text-accentColor transition-all duration-200"
            >
              <ArrowUpDown size={14} />
              {sortOrder === "asc" ? "Terlama → Terbaru" : "Terbaru → Terlama"}
            </button>
          </div>
        </div>

        {/* ── Timeline ── */}
        {filteredItems.length === 0 ? (
          <EmptyState category={activeCategory} />
        ) : (
          <TimelineSection items={filteredItems} />
        )}
      </div>
    </div>
  )
}
