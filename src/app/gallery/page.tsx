"use client"

import { useState, useMemo, useCallback } from "react"
import dynamic from "next/dynamic"
import Masonry from "react-masonry-css"
import {
  Search,
  X,
  LayoutGrid,
  FolderOpen,
  ChevronDown,
  SlidersHorizontal,
  Image as ImageIcon,
} from "lucide-react"
import { cn } from "@/lib/Utils"
import { GalleryPhoto, GalleryCategory, SortOption } from "@/types/gallery"
import { galleryPhotos, galleryAlbums, GALLERY_CATEGORIES } from "@/data/galleryData"

import FeaturedCarousel from "@/components/gallery/FeaturedCarousel"
import GalleryPhotoCard from "@/components/gallery/GalleryPhotoCard"
import GalleryAlbumCard from "@/components/gallery/GalleryAlbumCard"

// Dynamically import lightbox to avoid SSR issues
const GalleryLightbox = dynamic(() => import("@/components/gallery/GalleryLightbox"), {
  ssr: false,
})

const SORT_OPTIONS: SortOption[] = ["Terbaru", "Terlama", "A–Z"]
const YEARS = ["Semua", "2025", "2024", "2023", "2022"]
const INITIAL_VISIBLE = 12

const masonryBreakpoints = {
  default: 4,
  1280: 4,
  1024: 3,
  768: 2,
  480: 1,
}

export default function GalleryPage() {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("Semua")
  const [sortBy, setSortBy] = useState<SortOption>("Terbaru")
  const [activeYear, setActiveYear] = useState("Semua")
  const [viewMode, setViewMode] = useState<"grid" | "album">("grid")
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showYearMenu, setShowYearMenu] = useState(false)
  const [shareTarget, setShareTarget] = useState<GalleryPhoto | null>(null)

  // Featured photos
  const featuredPhotos = useMemo(() => galleryPhotos.filter((p) => p.isFeatured), [])

  // Filtered & sorted photos
  const filteredPhotos = useMemo(() => {
    let result = galleryPhotos.filter((p) => {
      if (activeCategory !== "Semua" && p.category !== activeCategory) return false
      if (activeYear !== "Semua" && String(p.year) !== activeYear) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return (
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        )
      }
      return true
    })

    if (sortBy === "Terbaru") result = [...result].sort((a, b) => b.date.localeCompare(a.date))
    else if (sortBy === "Terlama") result = [...result].sort((a, b) => a.date.localeCompare(b.date))
    else if (sortBy === "A–Z") result = [...result].sort((a, b) => a.title.localeCompare(b.title))

    return result
  }, [search, activeCategory, activeYear, sortBy])

  const visiblePhotos = filteredPhotos.slice(0, visibleCount)
  const hasMore = visibleCount < filteredPhotos.length

  const openLightbox = useCallback(
    (photo: GalleryPhoto) => {
      const idx = filteredPhotos.findIndex((p) => p.id === photo.id)
      if (idx !== -1) setLightboxIndex(idx)
    },
    [filteredPhotos]
  )

  const handleDownload = (photo: GalleryPhoto) => {
    const a = document.createElement("a")
    a.href = photo.imageUrl
    a.download = photo.title.replace(/\s+/g, "-").toLowerCase()
    a.target = "_blank"
    a.rel = "noopener noreferrer"
    a.click()
  }

  const handleShare = (photo: GalleryPhoto) => {
    setShareTarget(photo)
    openLightbox(photo)
  }

  const resetFilters = () => {
    setSearch("")
    setActiveCategory("Semua")
    setActiveYear("Semua")
    setSortBy("Terbaru")
    setVisibleCount(INITIAL_VISIBLE)
  }

  const hasActiveFilters =
    search || activeCategory !== "Semua" || activeYear !== "Semua" || sortBy !== "Terbaru"

  return (
    <main className="min-h-screen bg-baseBackground pt-[4.5rem]">
      {/* ────────────────────── Hero Section ────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Decorative bg */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-accentColor/5 blur-3xl" />
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-accentColor/3 blur-2xl" />
        </div>

        <div className="relative px-[5%] pt-12 pb-8 max-w-7xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-accentColor text-sm font-semibold mb-3 px-4 py-1.5 rounded-full border border-accentColor/30 bg-accentColor/5">
              <ImageIcon className="w-4 h-4" />
              Personal Gallery
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
              My Gallery
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
              Kumpulan momen, aktivitas, dan cerita dalam gambar
            </p>
          </div>

          {/* Stats bar */}
          <div className="flex items-center justify-center gap-6 mb-8 text-sm text-gray-500 dark:text-gray-400">
            {(
              [
                { n: galleryPhotos.length, label: "Total Foto" },
                { n: galleryAlbums.length, label: "Album" },
                { n: GALLERY_CATEGORIES.length - 1, label: "Kategori" },
              ] as const
            ).map(({ n, label }) => (
              <div key={label} className="flex flex-col items-center">
                <span className="text-2xl font-bold text-accentColor">{n}</span>
                <span className="text-xs">{label}</span>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-xl mx-auto mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setVisibleCount(INITIAL_VISIBLE)
              }}
              placeholder="Cari foto berdasarkan judul, lokasi, atau kategori…"
              className={cn(
                "w-full pl-12 pr-12 py-3.5 rounded-2xl text-sm",
                "bg-white dark:bg-gray-800/80",
                "border border-gray-200 dark:border-gray-700",
                "text-gray-900 dark:text-white placeholder:text-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-accentColor/40 focus:border-accentColor",
                "transition-all duration-200 shadow-sm"
              )}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-center flex-wrap">
            {GALLERY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat as GalleryCategory)
                  setVisibleCount(INITIAL_VISIBLE)
                }}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  activeCategory === cat
                    ? "bg-accentColor text-white shadow-md shadow-accentColor/30"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── Featured Carousel ─────────── */}
      {featuredPhotos.length > 0 && activeCategory === "Semua" && !search && activeYear === "Semua" && (
        <section className="px-[5%] max-w-7xl mx-auto pb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-accentColor">⭐</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Featured Highlights</h2>
          </div>
          <FeaturedCarousel photos={featuredPhotos} onPhotoClick={openLightbox} />
        </section>
      )}

      {/* ─────────── Filter Bar + View Toggle ─────────── */}
      <section className="px-[5%] max-w-7xl mx-auto py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Left: counter + reset */}
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Menampilkan{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {Math.min(visibleCount, filteredPhotos.length)}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-accentColor">{filteredPhotos.length}</span>{" "}
              foto
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-accentColor hover:text-accentColor/70 underline transition-colors"
              >
                Reset filter
              </button>
            )}
          </div>

          {/* Right: sort, year, view mode */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSortMenu((v) => !v)
                  setShowYearMenu(false)
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {sortBy}
                <ChevronDown className={cn("w-4 h-4 transition-transform", showSortMenu && "rotate-180")} />
              </button>
              {showSortMenu && (
                <div className="absolute right-0 top-full mt-1 z-50 min-w-36 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSortBy(opt)
                        setShowSortMenu(false)
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-sm transition-colors",
                        sortBy === opt
                          ? "bg-accentColor/10 text-accentColor font-semibold"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Year dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowYearMenu((v) => !v)
                  setShowSortMenu(false)
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
              >
                {activeYear === "Semua" ? "Tahun" : activeYear}
                <ChevronDown className={cn("w-4 h-4 transition-transform", showYearMenu && "rotate-180")} />
              </button>
              {showYearMenu && (
                <div className="absolute right-0 top-full mt-1 z-50 min-w-28 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  {YEARS.map((y) => (
                    <button
                      key={y}
                      onClick={() => {
                        setActiveYear(y)
                        setShowYearMenu(false)
                        setVisibleCount(INITIAL_VISIBLE)
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-sm transition-colors",
                        activeYear === y
                          ? "bg-accentColor/10 text-accentColor font-semibold"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      )}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View mode toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-md transition-all duration-200",
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-700 text-accentColor shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                )}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("album")}
                className={cn(
                  "p-2 rounded-md transition-all duration-200",
                  viewMode === "album"
                    ? "bg-white dark:bg-gray-700 text-accentColor shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                )}
                title="Album View"
              >
                <FolderOpen className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── Grid / Album View ─────────── */}
      <section
        className="px-[5%] max-w-7xl mx-auto pb-16"
        onClick={() => {
          setShowSortMenu(false)
          setShowYearMenu(false)
        }}
      >
        {viewMode === "grid" ? (
          <>
            {filteredPhotos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
                <ImageIcon className="w-16 h-16 opacity-30" />
                <p className="text-lg font-medium">Tidak ada foto yang cocok</p>
                <button
                  onClick={resetFilters}
                  className="text-accentColor text-sm underline hover:no-underline"
                >
                  Reset semua filter
                </button>
              </div>
            ) : (
              <>
                <Masonry
                  breakpointCols={masonryBreakpoints}
                  className="flex -ml-4 w-[calc(100%+1rem)]"
                  columnClassName="pl-4"
                >
                  {visiblePhotos.map((photo) => (
                    <GalleryPhotoCard
                      key={photo.id}
                      photo={photo}
                      onView={openLightbox}
                      onDownload={handleDownload}
                      onShare={handleShare}
                    />
                  ))}
                </Masonry>

                {/* Load More */}
                {hasMore && (
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={() => setVisibleCount((v) => v + INITIAL_VISIBLE)}
                      className="px-8 py-3 rounded-2xl bg-accentColor hover:bg-accentColor/80 text-white font-semibold text-sm transition-all duration-200 hover:scale-105 shadow-lg shadow-accentColor/20"
                    >
                      Muat {Math.min(INITIAL_VISIBLE, filteredPhotos.length - visibleCount)} Foto
                      Lagi
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          /* ── Album View ── */
          <>
            {galleryAlbums.filter(
              (a) =>
                activeCategory === "Semua" ||
                a.category === activeCategory
            ).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
                <FolderOpen className="w-16 h-16 opacity-30" />
                <p className="text-lg font-medium">Tidak ada album untuk kategori ini</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {galleryAlbums
                  .filter(
                    (a) =>
                      activeCategory === "Semua" ||
                      a.category === activeCategory
                  )
                  .filter((a) => {
                    if (!search.trim()) return true
                    return a.name.toLowerCase().includes(search.toLowerCase()) ||
                      a.description.toLowerCase().includes(search.toLowerCase())
                  })
                  .map((album) => (
                    <GalleryAlbumCard key={album.slug} album={album} />
                  ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* ─────────── Lightbox ─────────── */}
      {lightboxIndex !== null && filteredPhotos.length > 0 && (
        <GalleryLightbox
          photos={filteredPhotos}
          initialIndex={lightboxIndex}
          onClose={() => {
            setLightboxIndex(null)
            setShareTarget(null)
          }}
        />
      )}
    </main>
  )
}
