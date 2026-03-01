"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Search, X, Star, ExternalLink, ChevronRight,
  ArrowUpDown, Grid3X3, Filter, Sparkles, CalendarDays,
  Heart, Zap, Layers, Tag,
} from "lucide-react"
import {
  SiAndroidstudio, SiIntellijidea, SiNeovim,
  SiFigma, SiCanva, SiAdobephotoshop, SiAdobeillustrator, SiFramer,
  SiReact, SiNextdotjs, SiTailwindcss, SiLaravel, SiFlutter,
  SiNodedotjs, SiFastapi, SiBootstrap, SiExpress,
  SiPostgresql, SiMysql, SiMongodb, SiFirebase, SiSupabase, SiRedis,
  SiGit, SiGithub, SiDocker, SiVercel, SiNetlify, SiCloudflare,
  SiGooglechrome, SiBrave, SiPostman, SiObsidian, SiNotion, SiDiscord,
  SiOpenai, SiCodepen, SiStackoverflow, SiExcalidraw, SiWappalyzer, SiUblockorigin,
  SiSpotify, SiYoutube, SiNetflix, SiSteam, SiCrunchyroll, SiBilibili,
  SiSamsung, SiTypescript, SiPython, SiDbeaver, SiRailway, SiPerplexity,
  SiGooglegemini, SiAnthropic, SiGithubcopilot, SiAsus, SiLogitech, SiRazer, SiSony,
} from "react-icons/si"
import { FaCode, FaBriefcase, FaServer, FaDatabase, FaCloud, FaGlobe, FaDesktop, FaWrench, FaFilm, FaRobot, FaMobileAlt, FaHeart, FaStar, FaRegStar, FaCog, FaTerminal, FaSearch } from "react-icons/fa"
import { cn } from "@/lib/Utils"
import {
  toolsData, ALL_TOOL_CATEGORIES, CATEGORY_META, BADGE_META,
  getStats, getAllTags,
  type ToolItem, type ToolCategory, type ToolBadge,
} from "@/data/techStackData"

/* ─────────────────────────── ICON MAP ─────────────────────────── */
type IconComp = React.ComponentType<{ className?: string; size?: number }>

const ICON_MAP: Record<string, IconComp> = {
  SiAndroidstudio, SiIntellijidea, SiNeovim,
  SiFigma, SiCanva, SiAdobephotoshop, SiAdobeillustrator, SiFramer,
  SiReact, SiNextdotjs, SiTailwindcss, SiLaravel, SiFlutter,
  SiNodedotjs, SiFastapi, SiBootstrap, SiExpress,
  SiPostgresql, SiMysql, SiMongodb, SiFirebase, SiSupabase, SiRedis,
  SiGit, SiGithub, SiDocker, SiVercel, SiNetlify, SiCloudflare,
  SiGooglechrome, SiBrave, SiPostman, SiObsidian, SiNotion, SiDiscord,
  SiOpenai, SiCodepen, SiStackoverflow, SiExcalidraw, SiWappalyzer, SiUblockorigin,
  SiSpotify, SiYoutube, SiNetflix, SiSteam, SiCrunchyroll, SiBilibili,
  SiSamsung, SiTypescript, SiPython, SiDbeaver, SiRailway, SiPerplexity,
  SiGooglegemini, SiAnthropic, SiGithubcopilot, SiAsus, SiLogitech, SiRazer, SiSony,
}

function ToolIcon({
  iconKey,
  iconColor,
  size = 28,
  className,
}: {
  iconKey: string
  iconColor: string
  size?: number
  className?: string
}) {
  const Icon = ICON_MAP[iconKey]
  if (!Icon) {
    return (
      <span className={cn("text-xl font-bold", className)} style={{ color: iconColor }}>
        {iconKey.replace(/^Si|^Fa/, "").slice(0, 2).toUpperCase()}
      </span>
    )
  }
  return (
    <span style={{ color: iconColor }} className="leading-none">
      <Icon size={size} className={className} />
    </span>
  )
}

/* ─────────────────────────── CATEGORY ICON MAP ─────────────────────────── */
const CAT_ICON: Record<ToolCategory, React.ReactNode> = {
  "Code Editor & IDE": <FaTerminal size={18} />,
  "Design & UI Tools": <FaCog size={18} />,
  "Framework & Library": <SiReact size={18} />,
  "Database & Storage": <FaDatabase size={18} />,
  "DevOps & Cloud": <FaCloud size={18} />,
  "Browser & Extensions": <FaGlobe size={18} />,
  "Software & Aplikasi Desktop": <FaDesktop size={18} />,
  "Website Tools & Online Services": <FaWrench size={18} />,
  "Streaming & Entertainment": <FaFilm size={18} />,
  "AI Tools & Productivity": <FaRobot size={18} />,
  "Hardware & Gadget": <FaMobileAlt size={18} />,
}

/* ─────────────────────────── INTERSECTION HOOK ─────────────────────────── */
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true) },
      { threshold }
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

/* ─────────────────────────── COUNTER HOOK ─────────────────────────── */
function useCounter(target: number, start: boolean, duration = 1400) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!start) return
    let s: number
    const step = (ts: number) => {
      if (!s) s = ts
      const p = Math.min((ts - s) / duration, 1)
      setV(Math.floor(p * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return v
}

/* ─────────────────────────── STAR RATING ─────────────────────────── */
function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        i < value ? (
          <FaStar key={i} size={10} className="text-yellow-400" />
        ) : (
          <FaRegStar key={i} size={10} className="text-gray-300 dark:text-gray-600" />
        )
      ))}
      <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-1">
        {["", "Pernah Dicoba", "Jarang", "Kadang-kadang", "Sering", "Setiap Hari"][value]}
      </span>
    </div>
  )
}

/* ─────────────────────────── BADGE CHIP ─────────────────────────── */
function BadgeChip({ badge }: { badge: ToolBadge }) {
  const meta = BADGE_META[badge]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border",
        meta.color, meta.bg, meta.border
      )}
    >
      {meta.emoji} {badge}
    </span>
  )
}

/* ─────────────────────────── TOOL CARD ─────────────────────────── */
function ToolCard({ tool, delay = 0 }: { tool: ToolItem; delay?: number }) {
  const { ref, inView } = useInView(0.05)

  return (
    <div
      ref={ref}
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-white dark:bg-gray-900 overflow-hidden transition-all duration-500",
        "hover:-translate-y-1 hover:shadow-xl",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      )}
      style={{
        transitionDelay: inView ? `${delay}ms` : "0ms",
        boxShadow: undefined,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.boxShadow = `0 0 0 1px ${tool.iconColor}40, 0 20px 40px -12px ${tool.iconColor}30`
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.boxShadow = ""
      }}
    >
      {/* Top color bar */}
      <div
        className="h-1 w-full"
        style={{ background: `linear-gradient(90deg, ${tool.iconColor}cc, ${tool.iconColor}44)` }}
      />

      {/* Glow overlay on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(circle at 50% 0%, ${tool.iconColor}08 0%, transparent 70%)` }}
      />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Icon + Favorite */}
        <div className="flex items-start justify-between">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${tool.iconColor}15`, border: `1px solid ${tool.iconColor}30` }}
          >
            <ToolIcon iconKey={tool.iconKey} iconColor={tool.iconColor} size={24} />
          </div>
          {tool.isFavorite && (
            <FaHeart size={13} className="text-rose-400 mt-1 shrink-0" />
          )}
        </div>

        {/* Name + Badges */}
        <div className="space-y-1.5">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">{tool.name}</h3>
          <BadgeChip badge={tool.badge} />
        </div>

        {/* Description */}
        <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed flex-1">
          {tool.description}
        </p>

        {/* Detail (hardware) */}
        {tool.detail && (
          <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">
            {tool.detail}
          </p>
        )}

        {/* Rating */}
        <StarRating value={tool.usageRating} />

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {tool.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Visit button */}
        <a
          href={tool.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-all duration-200 hover:text-white group/btn"
          style={{
            borderColor: `${tool.iconColor}50`,
            color: tool.iconColor,
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget
            el.style.background = tool.iconColor
            el.style.borderColor = tool.iconColor
            el.style.color = "#fff"
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget
            el.style.background = ""
            el.style.borderColor = `${tool.iconColor}50`
            el.style.color = tool.iconColor
          }}
        >
          <ExternalLink size={10} />
          Visit
        </a>
      </div>
    </div>
  )
}

/* ─────────────────────────── FEATURED CARD ─────────────────────────── */
function FeaturedCard({ tool, index }: { tool: ToolItem; index: number }) {
  const { ref, inView } = useInView(0.1)

  return (
    <div
      ref={ref}
      className={cn(
        "group relative rounded-2xl border bg-white dark:bg-gray-900 overflow-hidden transition-all duration-700",
        "hover:-translate-y-2 hover:shadow-2xl",
        inView ? "opacity-100 scale-100" : "opacity-0 scale-95"
      )}
      style={{ transitionDelay: inView ? `${index * 80}ms` : "0ms" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 2px ${tool.iconColor}60, 0 25px 50px -12px ${tool.iconColor}40`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = ""
      }}
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle at top left, ${tool.iconColor}, transparent 70%)` }}
      />

      {/* TOP PICK badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-50 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/60">
          ⭐ Top Pick
        </span>
      </div>

      <div className="p-6 space-y-4 relative">
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: `${tool.iconColor}15`, border: `1.5px solid ${tool.iconColor}30` }}
        >
          <ToolIcon iconKey={tool.iconKey} iconColor={tool.iconColor} size={32} />
        </div>

        {/* Name + Category */}
        <div>
          <h3 className="font-extrabold text-base text-gray-900 dark:text-white">{tool.name}</h3>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
            {CATEGORY_META[tool.category].emoji} {tool.category}
          </p>
        </div>

        {/* Badge */}
        <BadgeChip badge={tool.badge} />

        {/* Description */}
        <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed">
          {tool.description}
        </p>

        {/* Rating */}
        <StarRating value={tool.usageRating} />

        {/* Visit */}
        <a
          href={tool.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white transition-all duration-200 hover:opacity-90 hover:scale-105"
          style={{ background: tool.iconColor }}
        >
          <ExternalLink size={11} />
          Visit Website
        </a>
      </div>
    </div>
  )
}

/* ─────────────────────────── CATEGORY SECTION ─────────────────────────── */
function CategorySection({ category, items }: { category: ToolCategory; items: ToolItem[] }) {
  const [expanded, setExpanded] = useState(false)
  const { ref, inView } = useInView(0.05)
  const LIMIT = 8
  const visible = expanded ? items : items.slice(0, LIMIT)
  const meta = CATEGORY_META[category]

  return (
    <section id={`cat-${category.replace(/\s+/g, "-").toLowerCase()}`} className="space-y-5">
      {/* Header */}
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between transition-all duration-500",
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">
            {CAT_ICON[category]}
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {meta.emoji} {category}
              <span className="text-xs font-normal text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500">{meta.description}</p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {visible.map((tool, i) => (
          <ToolCard key={tool.id} tool={tool} delay={i * 50} />
        ))}
      </div>

      {/* Expand toggle */}
      {items.length > LIMIT && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-2 text-sm font-medium text-accentColor hover:underline transition-all"
          >
            {expanded ? (
              <>Sembunyikan <ChevronRight size={14} className="rotate-90" /></>
            ) : (
              <>Lihat Semua ({items.length - LIMIT} lainnya) <ChevronRight size={14} className="-rotate-90" /></>
            )}
          </button>
        </div>
      )}
    </section>
  )
}

/* ─────────────────────────── STAT CARD ─────────────────────────── */
function StatCard({ icon, value, label, start }: { icon: React.ReactNode; value: number; label: string; start: boolean }) {
  const count = useCounter(value, start)
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 min-w-[120px]">
      <div className="w-9 h-9 rounded-xl bg-accentColor/20 flex items-center justify-center text-accentColor">
        {icon}
      </div>
      <span className="text-2xl font-extrabold text-white tabular-nums">{count}</span>
      <span className="text-[11px] text-white/70 text-center">{label}</span>
    </div>
  )
}

/* ─────────────────────────── HERO ─────────────────────────── */
function HeroSection({ onScrollDown }: { onScrollDown: () => void }) {
  const [mounted, setMounted] = useState(false)
  const { ref: statsRef, inView: statsInView } = useInView(0.3)
  const s = getStats()

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="relative min-h-[65vh] flex flex-col justify-center items-center text-center overflow-hidden px-6 py-20">
      {/* BG */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-accentColor/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
        <Link href="/" className="hover:text-accentColor transition-colors">Home</Link>
        <span>•</span>
        <span className="text-accentColor font-medium">Tech & Stack</span>
      </div>

      {/* Heading */}
      <div
        className={cn(
          "space-y-4 max-w-3xl transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accentColor/10 border border-accentColor/30 text-accentColor text-sm font-medium">
          <Layers size={14} />
          Tools, Software & Platform
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
          <span className="text-white">My </span>
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, #0EBD7A 0%, #06d6a0 40%, #48cae4 100%)" }}
          >
            Tech & Stack
          </span>
        </h1>

        <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Semua tools, software, dan platform yang saya gunakan sehari-hari — dari coding hingga hiburan.
        </p>
      </div>

      {/* Stats */}
      <div ref={statsRef} className="flex flex-wrap justify-center gap-3 mt-12">
        {[
          { icon: <Grid3X3 size={18} />, value: s.total, label: "Total Tools" },
          { icon: <FaHeart size={16} />, value: s.favorites, label: "Favorites" },
          { icon: <Zap size={18} />, value: s.dailyUse, label: "Daily Use" },
          { icon: <Tag size={18} />, value: s.categories, label: "Kategori" },
        ].map((stat) => (
          <StatCard key={stat.label} {...stat} start={statsInView} />
        ))}
      </div>

      {/* Scroll cue */}
      <button
        onClick={onScrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-400 hover:text-accentColor transition-colors"
      >
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <span className="w-5 h-8 border-2 border-current rounded-full flex items-start justify-center pt-1">
          <span className="w-1 h-1.5 bg-current rounded-full animate-bounce" />
        </span>
      </button>
    </section>
  )
}

/* ─────────────────────────── TAG CLOUD ─────────────────────────── */
const TAG_COLORS = [
  "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60",
  "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60",
  "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60",
  "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/60",
  "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60",
  "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/60",
  "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-800/60",
  "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60",
]

function TagCloud({ onTagClick, activeTag }: { onTagClick: (tag: string) => void; activeTag: string | null }) {
  const allTags = useMemo(() => getAllTags(), [])
  const { ref, inView } = useInView(0.1)
  const max = allTags[0]?.count ?? 1

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2">
        <Tag size={18} className="text-accentColor" />
        <h2 className="font-bold text-gray-900 dark:text-white">Tag Cloud</h2>
        <span className="text-xs text-gray-400">— Klik tag untuk filter tools</span>
      </div>
      <div
        ref={ref}
        className="flex flex-wrap gap-2 justify-center py-4"
      >
        {allTags.map(({ tag, count }, i) => {
          const sizeScale = 0.75 + (count / max) * 0.5
          const colorClass = TAG_COLORS[i % TAG_COLORS.length]
          const isActive = activeTag === tag

          return (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className={cn(
                "inline-flex items-center gap-1 px-3 py-1 rounded-full border font-medium transition-all duration-200",
                "hover:scale-110 hover:shadow-md",
                isActive ? "ring-2 ring-accentColor ring-offset-1 scale-110" : "",
                colorClass,
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              )}
              style={{
                fontSize: `${sizeScale * 12}px`,
                transitionDelay: inView ? `${i * 20}ms` : "0ms",
              }}
            >
              {tag}
              <span className="text-[9px] opacity-60">({count})</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

/* ─────────────────────────── SORT / BADGE SORT TYPES ─────────────────────────── */
type SortMode = "A–Z" | "Z–A" | "Most Used" | "Favorite First"
type BadgeFilter = "All" | ToolBadge

const SORT_OPTIONS: SortMode[] = ["A–Z", "Z–A", "Most Used", "Favorite First"]
const BADGE_FILTERS: BadgeFilter[] = ["All", "Favorite", "Daily Use", "Recommended", "Pernah Dicoba"]

/* ─────────────────────────── MAIN PAGE ─────────────────────────── */
export default function TechStackPage() {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "All">("All")
  const [activeBadge, setActiveBadge] = useState<BadgeFilter>("All")
  const [sortMode, setSortMode] = useState<SortMode>("A–Z")
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showBadgeMenu, setShowBadgeMenu] = useState(false)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)

  const handleScrollDown = useCallback(() => {
    contentRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSortMenu(false)
      if (badgeRef.current && !badgeRef.current.contains(e.target as Node)) setShowBadgeMenu(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Filtered items
  const filtered = useMemo(() => {
    let items = [...toolsData]

    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          t.category.toLowerCase().includes(q)
      )
    }

    if (activeCategory !== "All") items = items.filter((t) => t.category === activeCategory)
    if (activeBadge !== "All") items = items.filter((t) => t.badge === activeBadge)
    if (activeTag) items = items.filter((t) => t.tags.includes(activeTag))

    switch (sortMode) {
      case "A–Z": items.sort((a, b) => a.name.localeCompare(b.name)); break
      case "Z–A": items.sort((a, b) => b.name.localeCompare(a.name)); break
      case "Most Used": items.sort((a, b) => b.usageRating - a.usageRating); break
      case "Favorite First": items.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0)); break
    }

    return items
  }, [search, activeCategory, activeBadge, sortMode, activeTag])

  // Group filtered items by category (for section view when category = "All")
  const grouped = useMemo(() => {
    if (activeCategory !== "All") return null
    const map = new Map<ToolCategory, ToolItem[]>()
    filtered.forEach((item) => {
      const arr = map.get(item.category) ?? []
      arr.push(item)
      map.set(item.category, arr)
    })
    return map
  }, [filtered, activeCategory])

  // Favorites for spotlight
  const favorites = useMemo(() => toolsData.filter((t) => t.isFavorite), [])

  const isFiltering = search || activeCategory !== "All" || activeBadge !== "All" || activeTag

  const handleTagClick = useCallback((tag: string) => {
    setActiveTag((prev) => (prev === tag ? null : tag))
    setActiveCategory("All")
  }, [])

  const clearFilters = () => {
    setSearch("")
    setActiveCategory("All")
    setActiveBadge("All")
    setActiveTag(null)
    setSortMode("A–Z")
  }

  return (
    <div className="min-h-screen bg-baseBackground">
      {/* ── HERO ── */}
      <HeroSection onScrollDown={handleScrollDown} />

      {/* ── CONTENT ── */}
      <div ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 pt-12">

        {/* ─── FAVORITES SPOTLIGHT ─── */}
        {!isFiltering && (
          <section className="mb-16 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center">
                <Sparkles size={18} className="text-yellow-500" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">Favorite Spotlight</h2>
                <p className="text-xs text-gray-400">Tools yang paling sering dan paling saya suka</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {favorites.map((tool, i) => (
                <FeaturedCard key={tool.id} tool={tool} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ─── SEARCH & FILTER TOOLBAR ─── */}
        <div className="sticky top-[4.5rem] z-40 bg-baseBackground/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 pb-4 pt-4 mb-10 space-y-3">
          {/* Row 1: Search + Sort + Badge */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <FaSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari tools, kategori, atau tag..."
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accentColor/40 focus:border-accentColor transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Badge filter dropdown */}
            <div ref={badgeRef} className="relative shrink-0">
              <button
                onClick={() => setShowBadgeMenu((v) => !v)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all",
                  activeBadge !== "All"
                    ? "bg-accentColor text-white border-accentColor"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-accentColor/50"
                )}
              >
                <Filter size={13} />
                {activeBadge}
              </button>
              {showBadgeMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl z-50 overflow-hidden">
                  {BADGE_FILTERS.map((b) => (
                    <button
                      key={b}
                      onClick={() => { setActiveBadge(b); setShowBadgeMenu(false) }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800",
                        activeBadge === b ? "text-accentColor font-semibold" : "text-gray-700 dark:text-gray-300"
                      )}
                    >
                      {b === "All" ? "🔘 All" : `${BADGE_META[b as ToolBadge].emoji} ${b}`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort dropdown */}
            <div ref={sortRef} className="relative shrink-0">
              <button
                onClick={() => setShowSortMenu((v) => !v)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-accentColor/50 transition-all"
              >
                <ArrowUpDown size={13} />
                {sortMode}
              </button>
              {showSortMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl z-50 overflow-hidden">
                  {SORT_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setSortMode(s); setShowSortMenu(false) }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800",
                        sortMode === s ? "text-accentColor font-semibold" : "text-gray-700 dark:text-gray-300"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Category tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveCategory("All")}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                activeCategory === "All"
                  ? "bg-accentColor text-white border-accentColor shadow-md shadow-accentColor/25"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-accentColor/50 hover:text-accentColor"
              )}
            >
              🌐 All
            </button>
            {ALL_TOOL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                  activeCategory === cat
                    ? "bg-accentColor text-white border-accentColor shadow-md shadow-accentColor/25"
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-accentColor/50 hover:text-accentColor"
                )}
              >
                {CATEGORY_META[cat].emoji} {cat}
              </button>
            ))}
          </div>

          {/* Active filters + counter */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Menampilkan{" "}
              <span className="font-semibold text-accentColor">{filtered.length}</span>
              {" "}dari{" "}
              <span className="font-semibold">{toolsData.length}</span> tools
            </p>
            <div className="flex items-center gap-2">
              {activeTag && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-accentColor/10 text-accentColor border border-accentColor/30">
                  <Tag size={10} />
                  {activeTag}
                  <button onClick={() => setActiveTag(null)} className="ml-1 hover:opacity-70">
                    <X size={10} />
                  </button>
                </span>
              )}
              {isFiltering && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={11} />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── TOOLS GRID ─── */}
        {isFiltering ? (
          /* Flat filtered grid */
          filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <FaSearch size={36} className="text-gray-300 dark:text-gray-700" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Tidak ada tools yang cocok dengan filter yang dipilih.
              </p>
              <button onClick={clearFilters} className="text-sm text-accentColor hover:underline">
                Reset filter
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filtered.map((tool, i) => (
                  <ToolCard key={tool.id} tool={tool} delay={i * 30} />
                ))}
              </div>
            </div>
          )
        ) : (
          /* Grouped by category */
          <div className="space-y-16">
            {ALL_TOOL_CATEGORIES.map((cat) => {
              const items = grouped?.get(cat) ?? []
              if (!items.length) return null
              return <CategorySection key={cat} category={cat} items={items} />
            })}
          </div>
        )}

        {/* ─── TAG CLOUD ─── */}
        <div className="mt-20 pt-12 border-t border-gray-200 dark:border-gray-800">
          <TagCloud onTagClick={handleTagClick} activeTag={activeTag} />
        </div>
      </div>
    </div>
  )
}
