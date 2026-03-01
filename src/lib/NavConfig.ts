import { Home, User, Zap, FolderKanban, Newspaper, Mail, MoreHorizontal, ImageIcon, Award, Gamepad2, History, Wrench, BookOpen } from "lucide-react"
import { ComponentType } from "react"

export interface SubMenuItem {
  title: string
  href: string
  icon: ComponentType<{ className?: string; size?: number }>
  description: string
}

export interface NavLink {
  title: string
  href: string
  icon: ComponentType<{ className?: string; size?: number }>
  subMenu?: SubMenuItem[]
}

const navlinks: NavLink[] = [
  { title: "Home", href: "/", icon: Home },
  { title: "About", href: "/about", icon: User },
  { title: "Skills", href: "/skills", icon: Zap },
  { title: "Projects", href: "/projects", icon: FolderKanban },
  { title: "Blog", href: "/blogs", icon: Newspaper },
  { title: "Contact & Media", href: "/contact", icon: Mail },
  {
    title: "Lainnya",
    href: "#",
    icon: MoreHorizontal,
    subMenu: [
      { title: "Gallery", href: "/gallery", icon: ImageIcon, description: "Koleksi foto & media" },
      { title: "Guestbook", href: "/guestbook", icon: BookOpen, description: "Buku tamu pengunjung" },
      { title: "Certificate", href: "/certificate", icon: Award, description: "Sertifikat & pencapaian" },
      { title: "Entertainment", href: "/entertainment", icon: Gamepad2, description: "Movie, Game, Hiburan" },
      { title: "Timeline", href: "/timeline", icon: History, description: "Perjalanan karir & pendidikan" },
      { title: "Tools & Stack", href: "/tech-stack", icon: Wrench, description: "Tech stack favorit" },
    ],
  },
]

export default navlinks