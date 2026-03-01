export type GalleryCategory =
  | "Semua"
  | "Aktivitas & Daily Life"
  | "Travel & Wisata"
  | "Coding & Workspace"
  | "Kuliner & Food"
  | "Kucing & Hewan Peliharaan"
  | "Event & Komunitas"

export type SortOption = "Terbaru" | "Terlama" | "A–Z"

export interface GalleryPhoto {
  id: number
  title: string
  description: string
  location: string
  date: string
  year: number
  category: Exclude<GalleryCategory, "Semua">
  album: string
  albumSlug: string
  device: string
  imageUrl: string
  thumbnailUrl: string
  width: number
  height: number
  isFeatured: boolean
  tags: string[]
}

export interface GalleryAlbum {
  slug: string
  name: string
  description: string
  category: Exclude<GalleryCategory, "Semua">
  coverUrl: string
  period: string
  photoCount: number
}
