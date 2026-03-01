"use client"

import { useState } from "react"
import Image from "next/image"
import {
  X,
  Download,
  Award,
  Clock,
  FileX,
} from "lucide-react"
import { cn } from "@/lib/Utils"
import type { Certificate } from "@/types/certificate"

interface PdfViewerProps {
  certificate: Certificate
  onClose: () => void
}

const STATUS_CONFIG = {
  Valid:    { bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500", label: "Valid" },
  Expired:  { bg: "bg-red-100 dark:bg-red-900/40",         text: "text-red-700 dark:text-red-400",         dot: "bg-red-500",     label: "Expired" },
  Lifetime: { bg: "bg-blue-100 dark:bg-blue-900/40",       text: "text-blue-700 dark:text-blue-400",       dot: "bg-blue-500",    label: "Lifetime" },
}

const ID_MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getUTCDate()} ${ID_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export default function PdfViewer({ certificate, onClose }: PdfViewerProps) {
  const [thumbError, setThumbError] = useState(false)
  const statusCfg = STATUS_CONFIG[certificate.status]

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Modal */}
      <div className="relative w-full max-w-6xl h-[92vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Preview Area */}
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* Preview header */}
          <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 shrink-0">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Pratinjau Sertifikat</span>
          </div>

          {/* Preview content */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-gray-100 dark:bg-gray-950">
            {certificate.pdf_url ? (
              /* If a real PDF url exists in the future, this area can host the viewer */
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-sm text-gray-400">PDF preview</p>
              </div>
            ) : certificate.thumbnail_url && !thumbError ? (
              /* Show thumbnail preview */
              <div className="relative w-full max-w-lg rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={certificate.thumbnail_url}
                  alt={certificate.title}
                  width={800}
                  height={500}
                  className="w-full h-auto object-contain"
                  onError={() => setThumbError(true)}
                />
                {/* PDF in-progress overlay badge */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50 shadow-sm backdrop-blur-sm whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    PDF sedang diproses
                  </span>
                </div>
              </div>
            ) : (
              /* Full placeholder when no thumbnail either */
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-24 h-24 rounded-2xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <FileX className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">Pratinjau belum tersedia</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                    File PDF untuk sertifikat ini sedang dalam proses pengunggahan.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">
                  <Clock className="w-3.5 h-3.5" />
                  PDF sedang diproses
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Info Panel */}
        <div className="w-full md:w-80 flex flex-col shrink-0 overflow-y-auto">
          {/* Certificate info */}
          <div className="p-5 border-b border-gray-100 dark:border-gray-800">
            {/* Status badge */}
            <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-4", statusCfg.bg, statusCfg.text)}>
              <span className={cn("w-1.5 h-1.5 rounded-full", statusCfg.dot)} />
              {statusCfg.label}
            </span>

            {/* Category badge */}
            <span className="ml-2 inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-accentColor/10 text-accentColor">
              {certificate.category}
            </span>

            <h2 className="mt-3 font-bold text-lg text-gray-900 dark:text-white leading-snug">
              {certificate.title}
            </h2>

            <div className="mt-2 flex items-center gap-2">
              {certificate.issuer_logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={certificate.issuer_logo}
                  alt={certificate.issuer_name}
                  className="w-5 h-5 rounded object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                />
              )}
              <p className="text-sm font-medium text-accentColor">{certificate.issuer_name}</p>
            </div>
          </div>

          <div className="p-5 space-y-4 flex-1">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 font-semibold mb-1">Deskripsi</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{certificate.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Tanggal Terbit</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{formatDate(certificate.issue_date)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Berlaku Hingga</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                  {certificate.expiry_date ? formatDate(certificate.expiry_date) : "Seumur Hidup"}
                </p>
              </div>
            </div>

            {/* PDF status notice */}
            {!certificate.pdf_url && (
              <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl p-3">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">PDF belum tersedia</p>
                  <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-0.5">File sedang dalam proses pengunggahan.</p>
                </div>
              </div>
            )}
          </div>

          {/* Download button */}
          <div className="p-5 border-t border-gray-100 dark:border-gray-800 shrink-0">
            {certificate.pdf_url ? (
              <a
                href={certificate.pdf_url}
                download={`${certificate.title.replace(/\s+/g, "-").toLowerCase()}.pdf`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accentColor text-white font-semibold text-sm hover:bg-accentColor/90 active:scale-95 transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                Unduh Sertifikat
              </a>
            ) : (
              <div className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 font-semibold text-sm cursor-not-allowed select-none">
                <Award className="w-4 h-4" />
                PDF Segera Hadir
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
