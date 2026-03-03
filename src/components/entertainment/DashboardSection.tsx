"use client";

import { useEffect, useRef, useState } from "react";
import { Gamepad2, Film, Tv, Music, BookOpen, Package, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/Utils";
import { EntertainmentTab } from "@/types/entertainment";
import { BOOKS_DATA, COLLECTIONS_DATA, ANIME_SERIES_DATA, SPOTIFY_PLAYLISTS, STEAM_GAMES_FALLBACK, LOCAL_MOVIES } from "@/data/entertainmentData";
import { StatCardSkeleton } from "./EntertainmentSkeletons";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  color: string;
  bgColor: string;
  tab: EntertainmentTab;
  description?: string;
  onTabClick: (tab: EntertainmentTab) => void;
}

function useCountUp(target: number, duration = 1500, inView: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, inView]);
  return count;
}

function StatCard({ icon, label, value, suffix = "", color, bgColor, tab, description, onTabClick }: StatCardProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [inView, setInView] = useState(false);
  const count = useCountUp(value, 1200, inView);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <button
      ref={ref}
      onClick={() => onTabClick(tab)}
      className={cn(
        "group relative rounded-2xl border bg-white dark:bg-gray-800/40 p-5 text-left transition-all duration-300 w-full",
        "hover:shadow-xl hover:-translate-y-1",
        "border-gray-200 dark:border-gray-700/50 hover:border-opacity-80"
      )}
      style={{ borderColor: inView ? undefined : undefined }}
    >
      {/* Glow bg */}
      <div className={cn("absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300", bgColor)} />
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2.5 rounded-xl", bgColor, "bg-opacity-15 dark:bg-opacity-20")}>
          <span className={cn(color)}>{icon}</span>
        </div>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">{description ?? "Click to view"} →</span>
      </div>
      <p className={cn("text-3xl font-extrabold tracking-tight", color)}>
        {count.toLocaleString()}<span className="text-lg ml-0.5">{suffix}</span>
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">{label}</p>
    </button>
  );
}

export default function DashboardSection({ onTabClick }: { onTabClick: (tab: EntertainmentTab) => void }) {
  const t = useTranslations("entertainment");
  const [steamLoaded, setSteamLoaded] = useState(false);
  const [totalGames, setTotalGames] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    fetch("/api/steam-games")
      .then((r) => r.json())
      .then((data) => {
        const games = data.response?.games ?? STEAM_GAMES_FALLBACK;
        setTotalGames(games.length || STEAM_GAMES_FALLBACK.length);
        setTotalHours(Math.floor(games.reduce((s: number, g: { playtime_forever: number }) => s + g.playtime_forever, 0) / 60) || Math.floor(STEAM_GAMES_FALLBACK.reduce((s, g) => s + g.playtime_forever, 0) / 60));
      })
      .catch(() => {
        setTotalGames(STEAM_GAMES_FALLBACK.length);
        setTotalHours(Math.floor(STEAM_GAMES_FALLBACK.reduce((s, g) => s + g.playtime_forever, 0) / 60));
      })
      .finally(() => setSteamLoaded(true));
  }, []);

  const stats: Omit<StatCardProps, "onTabClick">[] = [
    {
      icon: <Gamepad2 size={20} />, label: t("stat_total_games"), value: totalGames,
      color: "text-blue-500", bgColor: "bg-blue-500", tab: "games",
      description: t("desc_game_collection"),
    },
    {
      icon: <Clock size={20} />, label: t("stat_play_hours"), value: totalHours, suffix: "j",
      color: "text-cyan-500", bgColor: "bg-cyan-500", tab: "games",
      description: t("desc_game_stats"),
    },
    {
      icon: <Film size={20} />, label: t("stat_movies_watched"), value: LOCAL_MOVIES.filter((m) => m.status === "watched").length,
      color: "text-rose-500", bgColor: "bg-rose-500", tab: "movies",
      description: t("desc_movies"),
    },
    {
      icon: <Tv size={20} />, label: t("stat_anime_completed"), value: ANIME_SERIES_DATA.filter((s) => s.status === "completed").length,
      color: "text-purple-500", bgColor: "bg-purple-500", tab: "anime",
      description: t("desc_anime"),
    },
    {
      icon: <Music size={20} />, label: t("stat_playlists"), value: SPOTIFY_PLAYLISTS.length,
      color: "text-green-500", bgColor: "bg-green-500", tab: "music",
      description: t("desc_music"),
    },
    {
      icon: <BookOpen size={20} />, label: t("stat_books_read"), value: BOOKS_DATA.filter((b) => b.status === "finished").length,
      color: "text-amber-500", bgColor: "bg-amber-500", tab: "books",
      description: t("desc_books"),
    },
    {
      icon: <Package size={20} />, label: t("stat_collections"), value: COLLECTIONS_DATA.length,
      color: "text-pink-500", bgColor: "bg-pink-500", tab: "collections",
      description: t("desc_collections"),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero text */}
      <div className="rounded-2xl bg-gradient-to-br from-accentColor/10 via-transparent to-purple-500/10 border border-accentColor/20 dark:border-accentColor/10 p-6 md:p-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("dash_world_title")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {t("dash_world_desc")}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          {t("dash_stats_heading")}
        </h3>
        {!steamLoaded ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 7 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <StatCard key={s.label} {...s} onTabClick={onTabClick} />
            ))}
          </div>
        )}
      </div>

      {/* Activity highlights */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          {t("dash_highlights_heading")}
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {/* Last watched movie */}
          {(() => {
            const last = [...LOCAL_MOVIES].filter(m => m.watched_date).sort((a, b) => (b.watched_date ?? "").localeCompare(a.watched_date ?? ""))[0];
            return last ? (
              <HighlightCard
                emoji="🎬"
                category={t("hl_last_movie")}
                title={last.title}
                sub={last.watched_date ? new Date(last.watched_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : ""}
                rating={last.personal_rating}
                color="text-rose-500"
                bg="bg-rose-500/10 dark:bg-rose-500/5"
                borderColor="border-rose-200 dark:border-rose-800/30"
                onClick={() => onTabClick("movies")}
              />
            ) : null;
          })()}
          {/* Top rated anime */}
          {(() => {
            const top = [...ANIME_SERIES_DATA].filter(s => s.personal_rating > 0).sort((a, b) => b.personal_rating - a.personal_rating)[0];
            return top ? (
              <HighlightCard
                emoji="🎌"
                category={t("hl_fav_anime")}
                title={top.title}
                sub={top.status === "completed" ? t("hl_completed") : top.status === "ongoing" ? t("hl_watching") : t("hl_wishlisted")}
                rating={top.personal_rating}
                color="text-purple-500"
                bg="bg-purple-500/10 dark:bg-purple-500/5"
                borderColor="border-purple-200 dark:border-purple-800/30"
                onClick={() => onTabClick("anime")}
              />
            ) : null;
          })()}
          {/* Top book */}
          {(() => {
            const top = [...BOOKS_DATA].filter(b => b.status === "reading")[0] ?? [...BOOKS_DATA].filter(b => b.personal_rating > 0).sort((a, b) => b.personal_rating - a.personal_rating)[0];
            return top ? (
              <HighlightCard
                emoji="📚"
                category={top.status === "reading" ? t("hl_reading") : t("hl_top_book")}
                title={top.title}
                sub={top.author}
                rating={top.personal_rating}
                color="text-amber-500"
                bg="bg-amber-500/10 dark:bg-amber-500/5"
                borderColor="border-amber-200 dark:border-amber-800/30"
                onClick={() => onTabClick("books")}
              />
            ) : null;
          })()}
        </div>
      </div>
    </div>
  );
}

function HighlightCard({ emoji, category, title, sub, rating, color, bg, borderColor, onClick }: {
  emoji: string; category: string; title: string; sub?: string; rating?: number;
  color: string; bg: string; borderColor: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className={cn("rounded-xl border p-4 text-left hover:shadow-md transition-all w-full", bg, borderColor)}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{emoji}</span>
        <span className={cn("text-xs font-semibold uppercase tracking-wide", color)}>{category}</span>
      </div>
      <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">{title}</p>
      {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>}
      {rating && rating > 0 ? (
        <div className="flex gap-0.5 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < rating ? "text-yellow-400 text-sm" : "text-gray-300 dark:text-gray-600 text-sm"}>★</span>
          ))}
        </div>
      ) : null}
    </button>
  );
}
