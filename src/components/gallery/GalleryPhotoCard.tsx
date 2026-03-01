"use client"

import Image from "next/image"
import { GalleryPhoto } from "@/types/gallery"
import { MapPin, Search, Download, Share2, Tag } from "lucide-react"
import { cn } from "@/lib/Utils"

interface GalleryPhotoCardProps {
  photo: GalleryPhoto
  onView: (photo: GalleryPhoto) => void
  onDownload: (photo: GalleryPhoto) => void
  onShare: (photo: GalleryPhoto) => void
}

export default function GalleryPhotoCard({
  photo,
  onView,
  onDownload,
  onShare,
}: GalleryPhotoCardProps) {
  return (
    <div
      className={cn(
        "relative group rounded-xl overflow-hidden cursor-pointer",
        "bg-gray-100 dark:bg-gray-800",
        "ring-1 ring-black/5 dark:ring-white/5",
        "transition-all duration-300 hover:ring-accentColor/40 hover:shadow-xl hover:shadow-accentColor/10",
        "mb-4 break-inside-avoid"
      )}
      onClick={() => onView(photo)}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <Image
          src={photo.thumbnailUrl}
          alt={photo.title}
          width={photo.width}
          height={photo.height}
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PC9zdmc+"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDownload(photo)
            }}
            className="w-8 h-8 rounded-full bg-black/50 hover:bg-accentColor backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200 hover:scale-110 border border-white/20"
            title="Download"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onShare(photo)
            }}
            className="w-8 h-8 rounded-full bg-black/50 hover:bg-accentColor backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200 hover:scale-110 border border-white/20"
            title="Share"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onView(photo)
            }}
            className="w-8 h-8 rounded-full bg-black/50 hover:bg-accentColor backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200 hover:scale-110 border border-white/20"
            title="Lihat"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom overlay info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <p className="text-white font-semibold text-sm line-clamp-1 mb-1">{photo.title}</p>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-white/80 text-xs min-w-0">
              <MapPin className="w-3 h-3 shrink-0 text-accentColor" />
              <span className="truncate">{photo.location}</span>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accentColor/90 text-white font-medium">
              <Tag className="w-2.5 h-2.5" />
              {photo.category.split(" & ")[0]}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
