"use client"

import { useEffect, useRef, useState } from "react"
import navlinks from "@/lib/NavConfig"
import { useSectionStore } from "@/stores/Section"
import gsap from "gsap"
import Link from "next/link"
import { usePathname } from "next/navigation"
import ResumeBtn from "../ResumeButton"
import ThemeSwitch from "../ThemeSwitch"
import MobileNav from "./MobileNav"
import { cn } from "@/lib/Utils"
import { ChevronDown } from "lucide-react"

export default function Header() {
  const headerRef = useRef<HTMLElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { top: -120 },
      { top: 0, duration: 0.7, delay: 0.2, ease: "Power0.easeNone" }
    )
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [dropdownOpen])

  const { section } = useSectionStore()
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "#") return false
    if (href.startsWith("/") && !href.startsWith("/#")) {
      return pathname === href
    }
    return href === section
  }

  return (
    <header
      ref={headerRef}
      className="fixed z-[100] top-0 left-0 right-0 bg-transparent backdrop-blur-[6px]"
    >
      <div className="w-full h-auto bg-gray-50/90 shadow-sm dark:bg-gray-950/80 min-h-[4.5rem] flex items-center px-[5%]">
        <div className="w-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl shrink-0">
            <span
              className={cn(
                "dark:text-white hover:text-accentColor cursor-pointer transition-colors duration-200",
                section === "#project" && "dark:text-black"
              )}
            >
              AgungKurniawan
            </span>
            <span className="text-accentColor font-bold text-[#0EBD7A]">.dev</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navlinks.map((link) => {
              const Icon = link.icon

              if (link.subMenu) {
                return (
                  <div key={link.title} className="relative" ref={dropdownRef}>
                    <button
                      suppressHydrationWarning
                      onClick={() => setDropdownOpen((prev) => !prev)}
                      className={cn(
                        "group flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white",
                        "hover:bg-gray-100 dark:hover:bg-white/10",
                        dropdownOpen && "text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10"
                      )}
                    >
                      <Icon size={15} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                      <span>{link.title}</span>
                      <ChevronDown
                        size={13}
                        className={cn(
                          "opacity-60 transition-transform duration-200",
                          dropdownOpen && "rotate-180"
                        )}
                      />
                    </button>

                    {/* Dropdown */}
                    <div
                      className={cn(
                        "absolute top-full right-0 mt-2 w-72 origin-top-right",
                        "bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700/60",
                        "transition-all duration-200",
                        dropdownOpen
                          ? "opacity-100 scale-100 pointer-events-auto"
                          : "opacity-0 scale-95 pointer-events-none"
                      )}
                    >
                      <div className="p-2 grid grid-cols-2 gap-1">
                        {link.subMenu.map((sub) => {
                          const SubIcon = sub.icon
                          return (
                            <Link
                              key={sub.title}
                              href={sub.href}
                              onClick={() => setDropdownOpen(false)}
                              className={cn(
                                "group flex flex-col gap-1 p-3 rounded-lg transition-all duration-150",
                                "hover:bg-gray-100 dark:hover:bg-white/10"
                              )}
                            >
                              <span className="flex items-center gap-2">
                                <span className="p-1.5 rounded-md bg-accentColor/10 text-accentColor">
                                  <SubIcon size={14} />
                                </span>
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-100 group-hover:text-accentColor transition-colors">
                                  {sub.title}
                                </span>
                              </span>
                              <span className="text-xs text-gray-400 dark:text-gray-500 pl-[2px]">
                                {sub.description}
                              </span>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <Link
                  key={link.title}
                  href={link.href}
                  data-active={isActive(link.href)}
                  className={cn(
                    "group flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white",
                    "hover:bg-gray-100 dark:hover:bg-white/10 relative",
                    isActive(link.href) &&
                      "text-accentColor dark:text-accentColor bg-accentColor/10 hover:bg-accentColor/15 dark:hover:bg-accentColor/15 hover:text-accentColor dark:hover:text-accentColor"
                  )}
                >
                  <Icon
                    size={15}
                    className={cn(
                      "transition-opacity",
                      isActive(link.href) ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                    )}
                  />
                  <span>{link.title}</span>
                  {isActive(link.href) && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accentColor" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center justify-end gap-2 md:gap-4 shrink-0">
            <ResumeBtn />
            <ThemeSwitch />
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  )
}
