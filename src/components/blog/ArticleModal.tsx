"use client"

import { useState, useRef } from "react"
import { X, Upload, Eye, Send, AlertCircle, User, Mail, Phone, FileText, Tag, Image as ImageIcon } from "lucide-react"
import { Blog, BlogCategory } from "@/types/blog"
import { useBlogStore } from "@/stores/BlogStore"
import { cn } from "@/lib/Utils"
import dynamic from "next/dynamic"

const RichTextEditor = dynamic(() => import("./RichTextEditor"), { ssr: false })

const CATEGORIES: BlogCategory[] = [
  "Technology",
  "General",
  "Tutorial",
  "Tips & Tricks",
  "News",
  "Programming",
  "Design",
  "Career",
]

interface ArticleModalProps {
  isOpen: boolean
  onClose: () => void
}

function generateId(): string {
  return `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ")
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

type Step = "form" | "preview"

export default function ArticleModal({ isOpen, onClose }: ArticleModalProps) {
  const { addBlog } = useBlogStore()
  const [step, setStep] = useState<Step>("form")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const [authorName, setAuthorName] = useState("")
  const [authorEmail, setAuthorEmail] = useState("")
  const [authorPhone, setAuthorPhone] = useState("")
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<BlogCategory>("General")
  const [content, setContent] = useState("")
  const [thumbnail, setThumbnail] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fileInputRef = useRef<HTMLInputElement>(null)

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!authorName.trim()) newErrors.authorName = "Nama lengkap wajib diisi"
    if (!authorEmail.trim()) newErrors.authorEmail = "Email wajib diisi"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail))
      newErrors.authorEmail = "Format email tidak valid"
    if (!title.trim()) newErrors.title = "Judul artikel wajib diisi"
    if (!content || content === "<p></p>") newErrors.content = "Konten artikel wajib diisi"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setThumbnail(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handlePreview = () => {
    if (validate()) setStep("preview")
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 600))

    const blog: Blog = {
      id: generateId(),
      title: title.trim(),
      excerpt: content.replace(/<[^>]+>/g, " ").trim().slice(0, 180) + "...",
      content,
      thumbnail:
        thumbnail ||
        `https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80`,
      category,
      author: {
        name: authorName.trim(),
        email: authorEmail.trim(),
        phone: authorPhone.trim() || undefined,
        type: "visitor",
      },
      publishedAt: new Date().toISOString(),
      readingTime: estimateReadingTime(content),
    }

    addBlog(blog)
    setIsSubmitting(false)
    setSuccess(true)

    setTimeout(() => {
      setSuccess(false)
      onClose()
      resetForm()
    }, 2000)
  }

  const resetForm = () => {
    setAuthorName("")
    setAuthorEmail("")
    setAuthorPhone("")
    setTitle("")
    setCategory("General")
    setContent("")
    setThumbnail("")
    setErrors({})
    setStep("form")
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-[#0f1a1a] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700/60 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700/60 bg-gray-50 dark:bg-[#0d1616] shrink-0">
          <div>
            <h2 className="text-lg font-semibold dark:text-white">
              {step === "form" ? "✍️ Tulis Artikel Baru" : "👀 Preview Artikel"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {step === "form"
                ? "Isi informasi penulis dan konten artikel"
                : "Pastikan artikel sudah sesuai sebelum dipublikasikan"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={18} className="dark:text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {step === "form" ? (
            <div className="p-6 space-y-6">
              {/* Disclaimer */}
              <div className="flex gap-3 p-3.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-lg text-sm">
                <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
                  <strong>Perhatian:</strong> Informasi yang Anda isi akan ditampilkan publik bersama artikel Anda sebagai identitas penulis. Pastikan data yang Anda masukkan benar.
                </p>
              </div>

              {/* Author Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <User size={15} /> Informasi Penulis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="John Doe"
                      className={cn(
                        "w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-800 dark:text-white outline-none transition-colors",
                        "focus:border-accentColor dark:focus:border-accentColor",
                        errors.authorName
                          ? "border-red-400"
                          : "border-gray-200 dark:border-gray-600"
                      )}
                    />
                    {errors.authorName && (
                      <p className="text-red-500 text-xs mt-1">{errors.authorName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={authorEmail}
                        onChange={(e) => setAuthorEmail(e.target.value)}
                        placeholder="john@example.com"
                        className={cn(
                          "w-full pl-8 pr-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-800 dark:text-white outline-none transition-colors",
                          "focus:border-accentColor",
                          errors.authorEmail
                            ? "border-red-400"
                            : "border-gray-200 dark:border-gray-600"
                        )}
                      />
                    </div>
                    {errors.authorEmail && (
                      <p className="text-red-500 text-xs mt-1">{errors.authorEmail}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Nomor Telepon <span className="text-gray-400">(opsional)</span>
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={authorPhone}
                        onChange={(e) => setAuthorPhone(e.target.value)}
                        placeholder="+62 812 3456 7890"
                        className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-accentColor transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Article Content Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <FileText size={15} /> Konten Artikel
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Judul Artikel <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Masukkan judul artikel yang menarik..."
                      className={cn(
                        "w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-800 dark:text-white outline-none transition-colors",
                        "focus:border-accentColor",
                        errors.title
                          ? "border-red-400"
                          : "border-gray-200 dark:border-gray-600"
                      )}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      <span className="flex items-center gap-1.5"><Tag size={13} /> Kategori</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as BlogCategory)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-accentColor transition-colors"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      <span className="flex items-center gap-1.5"><ImageIcon size={13} /> Thumbnail / Cover Image</span>
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-accentColor transition-colors"
                    >
                      {thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumbnail}
                          alt="thumbnail preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <>
                          <Upload size={22} className="text-gray-400" />
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            Klik untuk upload gambar cover artikel
                            <br />
                            <span className="text-gray-400">PNG, JPG, WebP (max 5MB)</span>
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Atau masukkan URL gambar:{" "}
                      <input
                        type="url"
                        value={thumbnail.startsWith("data:") ? "" : thumbnail}
                        onChange={(e) => setThumbnail(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="ml-1 px-2 py-0.5 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-accentColor"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Konten Artikel <span className="text-red-500">*</span>
                    </label>
                    <RichTextEditor
                      content={content}
                      onChange={setContent}
                    />
                    {errors.content && (
                      <p className="text-red-500 text-xs mt-1">{errors.content}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Preview */
            <div className="p-6">
              <div className="max-w-2xl mx-auto">
                {thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbnail}
                    alt={title}
                    className="w-full h-48 object-cover rounded-xl mb-5"
                  />
                )}
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 bg-accentColor/10 text-accentColor text-xs font-medium rounded-full">
                    {category}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {estimateReadingTime(content)} min read
                  </span>
                </div>
                <h1 className="text-2xl font-bold dark:text-white mb-3">{title}</h1>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold dark:text-white">
                    {authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium dark:text-white">{authorName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}</p>
                  </div>
                </div>
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700/60 bg-gray-50 dark:bg-[#0d1616] shrink-0">
          <div className="flex gap-2">
            {step === "preview" && (
              <button
                type="button"
                onClick={() => setStep("form")}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-gray-300"
              >
                ← Edit
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-gray-300"
            >
              Batal
            </button>
            {step === "form" ? (
              <button
                type="button"
                onClick={handlePreview}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-accentColor text-accentColor hover:bg-accentColor/10 transition-colors"
              >
                <Eye size={15} /> Preview
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || success}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 text-sm rounded-lg font-medium transition-all",
                  success
                    ? "bg-green-500 text-white"
                    : "bg-accentColor text-white hover:bg-accentColor/90",
                  isSubmitting && "opacity-70 cursor-not-allowed"
                )}
              >
                {success ? (
                  "✓ Artikel Dipublikasikan!"
                ) : isSubmitting ? (
                  <>
                    <span className="animate-spin inline-block w-3 h-3 border-2 border-white/60 border-t-white rounded-full" />
                    Mempublikasikan...
                  </>
                ) : (
                  <>
                    <Send size={15} /> Publikasikan
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
