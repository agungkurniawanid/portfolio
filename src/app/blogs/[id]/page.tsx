"use client"

import { useBlogStore } from "@/stores/BlogStore"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Clock,
  Calendar,
  Tag,
  Share2,
  Twitter,
  Facebook,
  Link as LinkIcon,
} from "lucide-react"
import { useMemo, useState, useEffect, use, useCallback } from "react"
import BlogPageCard from "@/components/blog/BlogPageCard"
import { cn } from "@/lib/Utils"
import { useTranslate } from "@/hooks/useTranslate"
import TranslateButton from "@/components/blog/TranslateButton"

const ID_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]
function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()} ${ID_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export default function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { blogs, getBlogById, fetchBlogs } = useBlogStore()
  const [mounted, setMounted] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    fetchBlogs().then(() => setMounted(true))
  }, [])

  const blog = useMemo(() => getBlogById(id), [id, getBlogById])

  const related = useMemo(() => {
    if (!blog) return []
    return blogs
      .filter((b) => b.id !== blog.id && b.category === blog.category)
      .slice(0, 3)
  }, [blog, blogs])

  // ── Translation state ──────────────────────────────────────────────────────
  const { translate, revert, translating, isTranslated, targetLang, targetLangLabel, error } =
    useTranslate()
  const [translatedTitle, setTranslatedTitle]     = useState<string | null>(null)
  const [translatedContent, setTranslatedContent] = useState<string | null>(null)

  const displayTitle   = translatedTitle   ?? blog?.title   ?? ""
  const displayContent = translatedContent ?? blog?.content ?? ""

  const handleTranslate = useCallback(async () => {
    if (!blog) return
    try {
      const out = await translate(
        { title: blog.title, content: blog.content },
        { content: "html" }
      )
      setTranslatedTitle(out.title)
      setTranslatedContent(out.content)
    } catch {
      // error state managed by hook
    }
  }, [translate, blog])

  const handleRevert = useCallback(() => {
    revert()
    setTranslatedTitle(null)
    setTranslatedContent(null)
  }, [revert])

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-baseBackground flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accentColor border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!blog) {
    notFound()
  }

  const isDeveloper = blog.author.type === "developer"
  const shareUrl = typeof window !== "undefined" ? window.location.href : ""
  const shareTitle = encodeURIComponent(blog.title)

  return (
    <div className="min-h-screen bg-baseBackground">
      {/* Hero thumbnail */}
      <div className="relative w-full h-56 md:h-80 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={blog.thumbnail}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        {/* Back btn overlay */}
        <div className="absolute top-6 left-[5%]">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors backdrop-blur-sm bg-black/20 px-3 py-1.5 rounded-lg mt-14 md:mt-0"
          >
            <ArrowLeft size={14} /> Kembali ke Blog
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="px-[5%] max-w-[820px] mx-auto -mt-10 relative z-10 pb-16">
        {/* Card */}
        <div className="bg-white dark:bg-[#0f1a1a] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
          <div className="p-6 md:p-10">
            {/* Category + meta */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-accentColor/10 text-accentColor rounded-full font-medium">
                <Tag size={10} /> {blog.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Calendar size={11} /> {formatDate(blog.publishedAt)}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock size={11} /> {blog.readingTime} menit baca
              </span>
            </div>

            {/* Title + Translate */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
              <h1 className="flex-1 text-2xl md:text-3xl font-bold dark:text-white leading-snug">
                {displayTitle || blog.title}
              </h1>
              <div className="shrink-0 mt-1">
                <TranslateButton
                  onTranslate={handleTranslate}
                  onRevert={handleRevert}
                  translating={translating}
                  isTranslated={isTranslated}
                  targetLang={targetLang}
                  targetLangLabel={targetLangLabel}
                  error={error}
                  size="md"
                />
              </div>
            </div>

            {/* Author */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-8 border border-gray-100 dark:border-gray-700/40">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden",
                  !blog.author.avatar && (isDeveloper
                    ? "bg-accentColor text-white"
                    : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200")
                )}
              >
                {blog.author.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={blog.author.avatar} alt={blog.author.name} className="w-full h-full object-cover" />
                ) : (
                  blog.author.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold dark:text-white">{blog.author.name}</p>
                  {isDeveloper && (
                    <span className="text-[10px] px-2 py-0.5 bg-accentColor/15 text-accentColor rounded font-bold">
                      DEVELOPER / AUTHOR
                    </span>
                  )}
                  {!isDeveloper && (
                    <span className="text-[10px] px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded font-medium">
                      Visitor
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Dipublikasikan {formatDate(blog.publishedAt)}
                </p>
              </div>
              {/* Share buttons */}
              <div className="flex items-center gap-1.5">
                <a
                  href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Share to Twitter"
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-accentColor text-gray-500 dark:text-gray-400 hover:text-accentColor transition-colors"
                >
                  <Twitter size={14} />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Share to Facebook"
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-accentColor text-gray-500 dark:text-gray-400 hover:text-accentColor transition-colors"
                >
                  <Facebook size={14} />
                </a>
                <button
                  onClick={handleCopyLink}
                  title="Copy link"
                  className={cn(
                    "p-2 rounded-lg border transition-colors text-sm",
                    copySuccess
                      ? "border-green-400 text-green-500"
                      : "border-gray-200 dark:border-gray-700 hover:border-accentColor text-gray-500 dark:text-gray-400 hover:text-accentColor"
                  )}
                >
                  {copySuccess ? "✓" : <LinkIcon size={14} />}
                </button>
              </div>
            </div>

            {/* Article Body */}
            <div
              className="prose prose-sm md:prose-base max-w-none dark:prose-invert
                prose-headings:font-bold prose-headings:dark:text-white
                prose-p:text-gray-700 prose-p:dark:text-gray-300 prose-p:leading-relaxed
                prose-a:text-accentColor prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-l-accentColor prose-blockquote:bg-accentColor/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                prose-code:text-accentColor prose-code:bg-accentColor/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700
                prose-img:rounded-xl prose-img:shadow-md
                prose-strong:dark:text-white
                prose-ul:list-disc prose-ol:list-decimal
                prose-li:text-gray-700 prose-li:dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: displayContent || blog.content }}
            />

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700/50">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-400 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold dark:text-white mb-5 flex items-center gap-2">
              <Share2 size={16} className="text-accentColor" />
              Artikel Terkait
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {related.map((b) => (
                <BlogPageCard key={b.id} blog={b} view="grid" />
              ))}
            </div>
          </div>
        )}

        {/* Back CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm font-medium dark:text-gray-300 hover:border-accentColor hover:text-accentColor transition-all"
          >
            <ArrowLeft size={15} /> Lihat semua artikel
          </Link>
        </div>
      </div>
    </div>
  )
}
