"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import Image from "next/image"
import { X, Upload, ChevronLeft, Check, FolderPlus, ImagePlus, User, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/Utils"
import { supabase } from "@/lib/supabase"
import { generateFingerprint } from "@/lib/fingerprint"
import { GALLERY_CATEGORIES } from "@/data/galleryData"
import { GalleryGuest } from "@/types/gallery"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileForm {
  name: string
  avatarFile: File | null
  avatarPreview: string | null
}

interface AlbumForm {
  name: string
  category: string
  description: string
}

interface PhotoItem {
  file: File
  preview: string
  title: string
  location: string
  date: string
  width: number
  height: number
}

type Step = "checking" | "profile" | "album" | "photos" | "success"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (guest: GalleryGuest) => void
}

// ─── Local Storage Key ────────────────────────────────────────────────────────
const LS_KEY = "gallery_guest_profile"

function loadLocalGuest(): GalleryGuest | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as GalleryGuest) : null
  } catch {
    return null
  }
}

function saveLocalGuest(guest: GalleryGuest) {
  localStorage.setItem(LS_KEY, JSON.stringify(guest))
}

// ─── Initials Avatar ─────────────────────────────────────────────────────────

function InitialsAvatar({ name, size = 64 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join("")

  const colors = [
    "bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-rose-500",
    "bg-amber-500", "bg-cyan-500", "bg-pink-500", "bg-indigo-500",
  ]
  const colorIdx = name.charCodeAt(0) % colors.length

  return (
    <div
      className={cn("rounded-full flex items-center justify-center text-white font-bold", colors[colorIdx])}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials || <User size={size * 0.4} />}
    </div>
  )
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepDots({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-full transition-all duration-300",
            i + 1 === currentStep
              ? "w-6 h-2.5 bg-accentColor"
              : i + 1 < currentStep
              ? "w-2.5 h-2.5 bg-accentColor/50"
              : "w-2.5 h-2.5 bg-gray-200 dark:bg-gray-700"
          )}
        />
      ))}
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function GuestRegistrationModal({ isOpen, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>("checking")
  const [guest, setGuest] = useState<GalleryGuest | null>(null)

  // Step 1 — Profile
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: "",
    avatarFile: null,
    avatarPreview: null,
  })
  const [profileErrors, setProfileErrors] = useState<{ name?: string }>({})

  // Step 2 — Album
  const [albumForm, setAlbumForm] = useState<AlbumForm>({
    name: "",
    category: "",
    description: "",
  })
  const [albumErrors, setAlbumErrors] = useState<{ name?: string; category?: string }>({})
  const [createdAlbum, setCreatedAlbum] = useState<{ slug: string; name: string; category: string } | null>(null)

  // Step 3 — Photos
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [photoError, setPhotoError] = useState("")

  // Misc
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [isVisible, setIsVisible] = useState(false)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  // ─── Open/Close animation ──────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      requestAnimationFrame(() => setIsVisible(true))
      initCheck()
    } else {
      setIsVisible(false)
      document.body.style.overflow = ""
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // ─── Initial check ────────────────────────────────────────────────────────
  const initCheck = useCallback(async () => {
    setStep("checking")
    setSubmitError("")

    // 1. Check localStorage
    const local = loadLocalGuest()
    if (local) {
      setGuest(local)
      setStep("album")
      return
    }

    // 2. Generate fingerprint & check API
    try {
      const fp = await generateFingerprint()
      const res = await fetch(`/api/gallery/guest/check?fp=${fp}`)
      const data = await res.json()
      if (data.guest) {
        setGuest(data.guest)
        saveLocalGuest(data.guest)
        setStep("album")
        return
      }
    } catch {
      // ignore, show registration
    }

    setStep("profile")
  }, [])

  const handleClose = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
      // Reset state
      setStep("checking")
      setGuest(null)
      setProfileForm({ name: "", avatarFile: null, avatarPreview: null })
      setAlbumForm({ name: "", category: "", description: "" })
      setCreatedAlbum(null)
      setPhotos([])
      setProfileErrors({})
      setAlbumErrors({})
      setSubmitError("")
      setPhotoError("")
    }, 250)
  }, [onClose])

  // ─── Step 1: Handle profile ────────────────────────────────────────────────
  const handleAvatarFile = useCallback((file: File) => {
    const preview = URL.createObjectURL(file)
    setProfileForm((prev) => ({ ...prev, avatarFile: file, avatarPreview: preview }))
  }, [])

  const validateProfile = () => {
    const errs: typeof profileErrors = {}
    if (!profileForm.name.trim()) errs.name = "Nama wajib diisi"
    setProfileErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleProfileSubmit = useCallback(async () => {
    if (!validateProfile()) return
    setIsSubmitting(true)
    setSubmitError("")

    try {
      const fp = await generateFingerprint()

      // Upload avatar jika ada
      let avatarUrl: string | null = null
      if (profileForm.avatarFile) {
        const ext = profileForm.avatarFile.name.split(".").pop()
        const path = `avatar/${fp.slice(0, 16)}-${Date.now()}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from("gallery-guests")
          .upload(path, profileForm.avatarFile, { contentType: profileForm.avatarFile.type, upsert: false })

        if (!uploadErr) {
          const { data } = supabase.storage.from("gallery-guests").getPublicUrl(path)
          avatarUrl = data.publicUrl
        }
      }

      // Register ke API
      const res = await fetch("/api/gallery/guest/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileForm.name.trim(),
          fingerprint: fp,
          avatarUrl,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal mendaftar")

      setGuest(data.guest)
      saveLocalGuest(data.guest)
      setStep("album")
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Terjadi kesalahan")
    } finally {
      setIsSubmitting(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileForm])

  // ─── Step 2: Handle album ──────────────────────────────────────────────────
  const validateAlbum = () => {
    const errs: typeof albumErrors = {}
    if (!albumForm.name.trim()) errs.name = "Nama album wajib diisi"
    if (!albumForm.category) errs.category = "Pilih kategori terlebih dahulu"
    setAlbumErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleAlbumSubmit = useCallback(async () => {
    if (!validateAlbum() || !guest) return
    setIsSubmitting(true)
    setSubmitError("")

    try {
      const res = await fetch("/api/gallery/guest/album", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId: guest.id,
          guestName: guest.name,
          name: albumForm.name.trim(),
          category: albumForm.category,
          description: albumForm.description.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal membuat album")

      setCreatedAlbum({ slug: data.album.slug, name: data.album.name, category: data.album.category })
      setStep("photos")
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Terjadi kesalahan")
    } finally {
      setIsSubmitting(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumForm, guest])

  // ─── Step 3: Handle photos ────────────────────────────────────────────────
  const handlePhotoFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) =>
      ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(f.type)
    )
    const items: PhotoItem[] = arr.map((file) => {
      const titleFromName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
      return {
        file,
        preview: URL.createObjectURL(file),
        title: titleFromName,
        location: "",
        date: new Date().toISOString().split("T")[0],
        width: 1200,
        height: 800,
      }
    })
    if (items.length === 0) {
      setPhotoError("Format yang didukung: JPG, PNG, WebP, GIF")
      return
    }
    setPhotoError("")
    setPhotos((prev) => [...prev, ...items])
  }, [])

  const removePhoto = useCallback((idx: number) => {
    setPhotos((prev) => {
      const copy = [...prev]
      URL.revokeObjectURL(copy[idx].preview)
      copy.splice(idx, 1)
      return copy
    })
  }, [])

  const updatePhotoField = useCallback((idx: number, field: keyof PhotoItem, value: string) => {
    setPhotos((prev) => {
      const copy = [...prev]
      const item = { ...copy[idx], [field]: value }
      copy[idx] = item as PhotoItem
      return copy
    })
  }, [])

  const handlePhotosSubmit = useCallback(async () => {
    if (!photos.length) {
      setPhotoError("Tambahkan setidaknya 1 foto")
      return
    }
    if (!guest || !createdAlbum) return
    setIsSubmitting(true)
    setSubmitError("")

    try {
      // Upload setiap foto ke Supabase Storage
      const uploaded: { imageUrl: string; thumbnailUrl: string; title: string; description: string; location: string; date: string; width: number; height: number }[] = []

      for (const photo of photos) {
        const ext = photo.file.name.split(".").pop()
        const path = `photos/${guest.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

        const { error: uploadErr } = await supabase.storage
          .from("gallery-photos")
          .upload(path, photo.file, {
            contentType: photo.file.type,
            upsert: false,
          })

        if (uploadErr) {
          console.error("Upload error:", uploadErr.message)
          continue
        }

        const { data } = supabase.storage.from("gallery-photos").getPublicUrl(path)
        uploaded.push({
          imageUrl: data.publicUrl,
          thumbnailUrl: data.publicUrl,
          title: photo.title,
          description: "",
          location: photo.location,
          date: photo.date,
          width: photo.width,
          height: photo.height,
        })
      }

      if (!uploaded.length) throw new Error("Tidak ada foto yang berhasil diupload")

      // Simpan ke database via API
      const res = await fetch("/api/gallery/guest/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId: guest.id,
          guestName: guest.name,
          albumSlug: createdAlbum.slug,
          albumName: createdAlbum.name,
          albumCategory: createdAlbum.category,
          photos: uploaded,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan foto")

      // Update local guest counts
      const updatedGuest: GalleryGuest = {
        ...guest,
        albumCount: (guest.albumCount || 0) + 1,
        photoCount: (guest.photoCount || 0) + uploaded.length,
      }
      setGuest(updatedGuest)
      saveLocalGuest(updatedGuest)
      onSuccess?.(updatedGuest)

      setStep("success")
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Terjadi kesalahan")
    } finally {
      setIsSubmitting(false)
    }
  }, [photos, guest, createdAlbum, onSuccess])

  if (!isOpen) return null

  const stepNum = step === "profile" ? 1 : step === "album" ? 2 : step === "photos" ? 3 : 0
  const totalSteps = guest ? 2 : 3 // If already registered, only 2 steps

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9000] flex items-end sm:items-center justify-center p-0 sm:p-4",
        "transition-all duration-250",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto",
          "bg-white dark:bg-gray-900",
          "rounded-t-3xl sm:rounded-2xl shadow-2xl",
          "transition-transform duration-250",
          isVisible ? "translate-y-0 scale-100" : "translate-y-8 scale-95"
        )}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* ── Checking ── */}
          {step === "checking" && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <Loader2 className="w-10 h-10 text-accentColor animate-spin" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">Memeriksa status tamu...</p>
            </div>
          )}

          {/* ── STEP 1: Profile ── */}
          {step === "profile" && (
            <>
              <StepDots currentStep={1} totalSteps={3} />
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accentColor/10 mb-3">
                  <User className="w-6 h-6 text-accentColor" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Buat Profil Tamu</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Daftarkan dirimu untuk mulai berbagi foto
                </p>
              </div>

              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Nama <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => {
                    setProfileForm((p) => ({ ...p, name: e.target.value }))
                    setProfileErrors((p) => ({ ...p, name: "" }))
                  }}
                  placeholder="Masukkan nama kamu..."
                  className={cn(
                    "w-full px-4 py-3 rounded-xl text-sm",
                    "bg-gray-50 dark:bg-gray-800",
                    "border transition-all",
                    profileErrors.name
                      ? "border-red-400 focus:ring-red-400/30"
                      : "border-gray-200 dark:border-gray-700 focus:border-accentColor focus:ring-accentColor/20",
                    "text-gray-900 dark:text-white placeholder:text-gray-400",
                    "outline-none focus:ring-2"
                  )}
                />
                {profileErrors.name && (
                  <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {profileErrors.name}
                  </p>
                )}
              </div>

              {/* Avatar (optional) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Foto Profil <span className="text-gray-400 font-normal">(opsional)</span>
                </label>

                {profileForm.avatarPreview ? (
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-accentColor ring-offset-2 dark:ring-offset-gray-900">
                      <Image src={profileForm.avatarPreview} alt="Preview" fill className="object-cover" sizes="64px" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Foto dipilih</p>
                      <button
                        type="button"
                        onClick={() => {
                          URL.revokeObjectURL(profileForm.avatarPreview!)
                          setProfileForm((p) => ({ ...p, avatarFile: null, avatarPreview: null }))
                        }}
                        className="text-xs text-red-400 hover:text-red-500 underline mt-0.5"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-accentColor hover:text-accentColor transition-colors w-full justify-center"
                    >
                      <Upload className="w-4 h-4" />
                      Upload foto profil
                    </button>
                    <p className="text-xs text-gray-400 mt-1.5 text-center">
                      Jika kosong, akan menggunakan inisial nama · JPG, PNG, WebP maksimal 5MB
                    </p>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleAvatarFile(file)
                      }}
                    />
                  </div>
                )}
              </div>

              {submitError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {submitError}
                </div>
              )}

              <button
                onClick={handleProfileSubmit}
                disabled={isSubmitting}
                className={cn(
                  "w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                  "bg-accentColor hover:bg-accentColor/80 text-white",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  "flex items-center justify-center gap-2"
                )}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Mendaftarkan...</>
                ) : (
                  "Selanjutnya →"
                )}
              </button>
            </>
          )}

          {/* ── STEP 2: Album ── */}
          {step === "album" && (
            <>
              <StepDots currentStep={guest?.albumCount !== undefined && guest.albumCount > 0 ? 1 : 2} totalSteps={totalSteps === 3 ? 3 : 2} />

              {/* Welcome back banner if already registered */}
              {guest && (
                <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-accentColor/5 border border-accentColor/20">
                  {guest.avatarUrl ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                      <Image src={guest.avatarUrl} alt={guest.name} fill className="object-cover" sizes="40px" />
                    </div>
                  ) : (
                    <InitialsAvatar name={guest.name} size={40} />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Selamat datang, {guest.name}!
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {guest.albumCount} album · {guest.photoCount} foto
                    </p>
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accentColor/10 mb-3">
                  <FolderPlus className="w-6 h-6 text-accentColor" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Buat Album Baru</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Beri nama album dan pilih kategori
                </p>
              </div>

              {/* Album name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Nama Album <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={albumForm.name}
                  onChange={(e) => {
                    setAlbumForm((p) => ({ ...p, name: e.target.value }))
                    setAlbumErrors((p) => ({ ...p, name: "" }))
                  }}
                  placeholder="Contoh: Bali Trip, Ulang Tahun, Lebaran..."
                  className={cn(
                    "w-full px-4 py-3 rounded-xl text-sm",
                    "bg-gray-50 dark:bg-gray-800",
                    "border transition-all",
                    albumErrors.name
                      ? "border-red-400 focus:ring-red-400/30"
                      : "border-gray-200 dark:border-gray-700 focus:border-accentColor focus:ring-accentColor/20",
                    "text-gray-900 dark:text-white placeholder:text-gray-400",
                    "outline-none focus:ring-2"
                  )}
                />
                {albumErrors.name && (
                  <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {albumErrors.name}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Kategori <span className="text-red-400">*</span>
                </label>
                <select
                  value={albumForm.category}
                  onChange={(e) => {
                    setAlbumForm((p) => ({ ...p, category: e.target.value }))
                    setAlbumErrors((p) => ({ ...p, category: "" }))
                  }}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl text-sm",
                    "bg-gray-50 dark:bg-gray-800",
                    "border transition-all",
                    albumErrors.category
                      ? "border-red-400"
                      : "border-gray-200 dark:border-gray-700 focus:border-accentColor",
                    "text-gray-900 dark:text-white",
                    "outline-none focus:ring-2 focus:ring-accentColor/20"
                  )}
                >
                  <option value="">Pilih kategori...</option>
                  {GALLERY_CATEGORIES.filter((c) => c !== "Semua").map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {albumErrors.category && (
                  <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {albumErrors.category}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Deskripsi <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <textarea
                  value={albumForm.description}
                  onChange={(e) => setAlbumForm((p) => ({ ...p, description: e.target.value }))}
                  rows={2}
                  placeholder="Ceritakan sedikit tentang album ini..."
                  className={cn(
                    "w-full px-4 py-3 rounded-xl text-sm resize-none",
                    "bg-gray-50 dark:bg-gray-800",
                    "border border-gray-200 dark:border-gray-700 focus:border-accentColor",
                    "text-gray-900 dark:text-white placeholder:text-gray-400",
                    "outline-none focus:ring-2 focus:ring-accentColor/20 transition-all"
                  )}
                />
              </div>

              {submitError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {submitError}
                </div>
              )}

              <button
                onClick={handleAlbumSubmit}
                disabled={isSubmitting}
                className={cn(
                  "w-full py-3 rounded-xl text-sm font-semibold transition-all",
                  "bg-accentColor hover:bg-accentColor/80 text-white",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  "flex items-center justify-center gap-2"
                )}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Membuat album...</>
                ) : (
                  "Selanjutnya: Upload Foto →"
                )}
              </button>
            </>
          )}

          {/* ── STEP 3: Photos ── */}
          {step === "photos" && (
            <>
              <StepDots currentStep={guest?.albumCount !== undefined ? 2 : 3} totalSteps={totalSteps === 3 ? 3 : 2} />

              <div className="flex items-center gap-3 mb-5">
                <button
                  onClick={() => setStep("album")}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Foto</h2>
                  {createdAlbum && (
                    <p className="text-xs text-gray-400">Album: <span className="font-medium text-accentColor">{createdAlbum.name}</span></p>
                  )}
                </div>
              </div>

              {/* Drop Zone */}
              <PhotoDropZone onFiles={handlePhotoFiles} inputRef={photoInputRef} />

              {/* Selected photos list */}
              {photos.length > 0 && (
                <div className="mt-4 space-y-3 max-h-56 overflow-y-auto pr-1">
                  {photos.map((photo, idx) => (
                    <PhotoRow
                      key={photo.preview}
                      photo={photo}
                      idx={idx}
                      onRemove={removePhoto}
                      onUpdate={updatePhotoField}
                    />
                  ))}
                </div>
              )}

              {photoError && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {photoError}
                </p>
              )}

              {submitError && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {submitError}
                </div>
              )}

              <button
                onClick={handlePhotosSubmit}
                disabled={isSubmitting || photos.length === 0}
                className={cn(
                  "w-full mt-5 py-3 rounded-xl text-sm font-semibold transition-all",
                  "bg-accentColor hover:bg-accentColor/80 text-white",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  "flex items-center justify-center gap-2"
                )}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Mengupload {photos.length} foto...</>
                ) : (
                  `Kirim ${photos.length} Foto`
                )}
              </button>
            </>
          )}

          {/* ── STEP 4: Success ── */}
          {step === "success" && (
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Foto Berhasil Dikirim!
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {photos.length} foto di album <span className="font-semibold text-accentColor">{createdAlbum?.name}</span> sudah terkirim.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                Foto akan ditampilkan setelah disetujui admin. Terima kasih!
              </p>
              <button
                onClick={handleClose}
                className="px-8 py-3 rounded-xl bg-accentColor hover:bg-accentColor/80 text-white text-sm font-semibold transition-all"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Photo Drop Zone ──────────────────────────────────────────────────────────

function PhotoDropZone({
  onFiles,
  inputRef,
}: {
  onFiles: (files: FileList | File[]) => void
  inputRef: React.RefObject<HTMLInputElement | null>
}) {
  const [isDragging, setIsDragging] = useState(false)

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          onFiles(e.dataTransfer.files)
        }}
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
          isDragging
            ? "border-accentColor bg-accentColor/5"
            : "border-gray-200 dark:border-gray-700 hover:border-accentColor/60 hover:bg-gray-50 dark:hover:bg-gray-800/40"
        )}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
            <ImagePlus className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Seret foto atau{" "}
              <span className="text-accentColor underline">pilih dari perangkat</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              JPG, PNG, WebP, GIF · maks 15MB per foto · bisa pilih banyak
            </p>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) onFiles(e.target.files)
          }}
        />
      </div>
    </div>
  )
}

// ─── Photo Row ────────────────────────────────────────────────────────────────

function PhotoRow({
  photo,
  idx,
  onRemove,
  onUpdate,
}: {
  photo: PhotoItem
  idx: number
  onRemove: (idx: number) => void
  onUpdate: (idx: number, field: keyof PhotoItem, value: string) => void
}) {
  return (
    <div className="flex gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
      {/* Thumbnail */}
      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
        <Image src={photo.preview} alt={photo.title} fill className="object-cover" sizes="64px" />
      </div>

      {/* Fields */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <input
          type="text"
          value={photo.title}
          onChange={(e) => onUpdate(idx, "title", e.target.value)}
          placeholder="Judul foto..."
          className="w-full px-2 py-1 text-xs rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none focus:border-accentColor"
        />
        <div className="flex gap-1.5">
          <input
            type="text"
            value={photo.location}
            onChange={(e) => onUpdate(idx, "location", e.target.value)}
            placeholder="Lokasi (opsional)"
            className="flex-1 px-2 py-1 text-xs rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none focus:border-accentColor"
          />
          <input
            type="date"
            value={photo.date}
            onChange={(e) => onUpdate(idx, "date", e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="px-2 py-1 text-xs rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none focus:border-accentColor"
          />
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(idx)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0 self-start"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
