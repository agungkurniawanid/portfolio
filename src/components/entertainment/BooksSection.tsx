"use client";

import { useEffect, useState, useRef } from "react";
import { BookOpen, Search, X, Star, SlidersHorizontal, ChevronDown } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/Utils";
import { fetchGoogleBook } from "@/lib/entertainmentApi";
import { LocalBook, BookStatus } from "@/types/entertainment";
import { BOOKS_DATA } from "@/data/entertainmentData";
import { BookCardSkeleton } from "./EntertainmentSkeletons";

const STATUS_LABEL: Record<BookStatus, string> = {
  finished: "✅ Selesai Dibaca",
  reading: "📖 Sedang Dibaca",
  wishlist: "📋 Wishlist",
};
const STATUS_COLOR: Record<BookStatus, string> = {
  finished: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  reading: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  wishlist: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

type SortOption = "rating_high" | "az" | "pages";

interface EnrichedBook extends LocalBook {
  loading?: boolean;
}

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} size={11} className={i < value ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"} />
      ))}
    </div>
  );
}

export default function BooksSection({ globalSearch }: { globalSearch?: string }) {
  const [books, setBooks] = useState<EnrichedBook[]>(
    BOOKS_DATA.map((b) => ({ ...b, loading: true }))
  );
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<BookStatus | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("rating_high");
  const [showSort, setShowSort] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    BOOKS_DATA.forEach(async (b, i) => {
      const data = await fetchGoogleBook(b.title, b.author).catch(() => null);
      setBooks((prev) =>
        prev.map((item, idx) =>
          idx === i
            ? {
                ...item,
                loading: false,
                cover_url: data?.thumbnail ?? item.cover_url,
                pages: item.pages ?? data?.pages,
                year: item.year ?? data?.year,
                google_books_id: data?.google_books_id,
              }
            : item
        )
      );
    });
  }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSort(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeSearch = globalSearch || search;

  const filtered = books
    .filter((b) => {
      if (filterStatus !== "all" && b.status !== filterStatus) return false;
      if (activeSearch.trim()) {
        return (
          b.title.toLowerCase().includes(activeSearch.toLowerCase()) ||
          b.author.toLowerCase().includes(activeSearch.toLowerCase())
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "rating_high") return b.personal_rating - a.personal_rating;
      if (sortBy === "pages") return (b.pages ?? 0) - (a.pages ?? 0);
      return a.title.localeCompare(b.title);
    });

  const totalFinished = books.filter((b) => b.status === "finished").length;
  const avgRating =
    books.filter((b) => b.personal_rating > 0).reduce((s, b) => s + b.personal_rating, 0) /
    (books.filter((b) => b.personal_rating > 0).length || 1);
  const totalPages = books.filter((b) => b.status === "finished").reduce((s, b) => s + (b.pages ?? 0), 0);

  const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: "rating_high", label: "Rating Tertinggi" },
    { value: "pages", label: "Terbanyak Halaman" },
    { value: "az", label: "A–Z" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: "📚", label: "Selesai Dibaca", value: totalFinished, color: "text-green-500" },
          { icon: "📄", label: "Total Halaman", value: totalPages.toLocaleString(), color: "text-blue-500" },
          { icon: "⭐", label: "Rata-rata Rating", value: avgRating.toFixed(1), color: "text-yellow-500" },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className="rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/40 p-4 flex items-center gap-3">
            <span className={cn("text-xl", color)}>{icon}</span>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className="font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari judul buku atau penulis..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accentColor/40 transition" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14} /></button>}
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "finished", "reading", "wishlist"] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={cn("px-3 py-2 rounded-xl text-xs font-medium border transition-all", filterStatus === s ? "bg-accentColor text-white border-accentColor" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 text-gray-600 dark:text-gray-400 hover:border-accentColor/60")}>
              {s === "all" ? "Semua" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
        <div className="relative" ref={sortRef}>
          <button onClick={() => setShowSort((v) => !v)} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 text-sm text-gray-700 dark:text-gray-300 hover:border-accentColor/60 transition">
            <SlidersHorizontal size={14} />{SORT_OPTIONS.find((o) => o.value === sortBy)?.label}<ChevronDown size={13} />
          </button>
          {showSort && (
            <div className="absolute right-0 top-full mt-1 w-52 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl z-20 overflow-hidden">
              {SORT_OPTIONS.map((o) => (
                <button key={o.value} onClick={() => { setSortBy(o.value); setShowSort(false); }} className={cn("block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition", sortBy === o.value ? "text-accentColor font-medium" : "text-gray-700 dark:text-gray-300")}>{o.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
          <p>Tidak ada buku ditemukan.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b, i) =>
            b.loading ? <BookCardSkeleton key={b.id} /> : <BookCard key={b.id} book={b} />
          )}
        </div>
      )}
    </div>
  );
}

function BookCard({ book }: { book: EnrichedBook }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <div className="flex gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/40 hover:border-accentColor/60 hover:shadow-md transition-all">
      {/* Cover */}
      <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 shadow-md">
        {book.cover_url && !imgErr ? (
          <Image src={book.cover_url} alt={book.title} fill className="object-cover" onError={() => setImgErr(true)} unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={22} className="text-amber-600 dark:text-amber-400" />
          </div>
        )}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">{book.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{book.author}{book.year ? ` · ${book.year}` : ""}</p>
        <div className="flex flex-wrap gap-1 mt-1.5">
          <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", STATUS_COLOR[book.status])}>{STATUS_LABEL[book.status]}</span>
          {book.genre.slice(0, 1).map((g) => (
            <span key={g} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400">{g}</span>
          ))}
        </div>
        {book.pages ? <p className="text-[10px] text-gray-400 mt-1">{book.pages} halaman</p> : null}
        {book.personal_rating > 0 && <StarRating value={book.personal_rating} />}
        {book.review && <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 italic">&ldquo;{book.review}&rdquo;</p>}
      </div>
    </div>
  );
}
