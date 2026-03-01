"use client";

import { useEffect, useState, useRef } from "react";
import { Gamepad2, Clock, Trophy, Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/Utils";
import {
  fetchSteamGames,
  steamHeaderUrl,
  steamLogoUrl,
  formatPlaytime,
} from "@/lib/entertainmentApi";
import { SteamGame, GameStatus } from "@/types/entertainment";
import {
  GAME_MANUAL_DATA,
  STEAM_GAMES_FALLBACK,
} from "@/data/entertainmentData";
import { GameCardSkeleton } from "./EntertainmentSkeletons";

type SortOption = "most_played" | "recently_played" | "az";

const STATUS_LABELS: Record<GameStatus, string> = {
  playing: "🎮 Playing",
  completed: "✅ Selesai",
  wishlist: "📋 Wishlist",
  never_played: "💤 Belum Dimainkan",
};

const STATUS_COLORS: Record<GameStatus, string> = {
  playing: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  wishlist: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  never_played: "bg-gray-100 text-gray-500 dark:bg-gray-700/40 dark:text-gray-400",
};

function deriveStatus(game: SteamGame): GameStatus {
  if (game.status) return game.status;
  if (game.playtime_forever === 0) return "never_played";
  return "never_played";
}

function enrichGame(game: SteamGame): SteamGame {
  const manual = GAME_MANUAL_DATA[game.appid];
  return {
    ...game,
    ...(manual ?? {}),
    status: manual?.status ?? deriveStatus(game),
    achievements_done: manual?.achievements_done ?? game.achievements_done,
    achievements_total: manual?.achievements_total ?? game.achievements_total,
  };
}

export default function GamesSection({ globalSearch }: { globalSearch?: string }) {
  const [games, setGames] = useState<SteamGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<GameStatus | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("most_played");
  const [showSort, setShowSort] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSteamGames()
      .then((data) => {
        const enriched = (data.length > 0 ? data : STEAM_GAMES_FALLBACK).map(enrichGame);
        setGames(enriched);
      })
      .catch(() => {
        setGames(STEAM_GAMES_FALLBACK.map(enrichGame));
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  // Close sort menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node))
        setShowSort(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeSearch = globalSearch || search;

  const filtered = games
    .filter((g) => {
      if (filterStatus !== "all" && g.status !== filterStatus) return false;
      if (activeSearch.trim()) {
        return g.name.toLowerCase().includes(activeSearch.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "most_played") return b.playtime_forever - a.playtime_forever;
      if (sortBy === "az") return a.name.localeCompare(b.name);
      return b.playtime_forever - a.playtime_forever;
    });

  const totalHours = Math.floor(games.reduce((s, g) => s + g.playtime_forever, 0) / 60);
  const totalCompleted = games.filter((g) => g.status === "completed").length;

  const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: "most_played", label: "Paling Banyak Dimainkan" },
    { value: "az", label: "A–Z" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Gamepad2 size={16} />, label: "Total Games", value: games.length, color: "text-blue-500" },
          { icon: <Clock size={16} />, label: "Total Jam", value: `${totalHours}j`, color: "text-green-500" },
          { icon: <Trophy size={16} />, label: "Selesai", value: totalCompleted, color: "text-yellow-500" },
        ].map(({ icon, label, value, color }) => (
          <div
            key={label}
            className="rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/40 p-4 flex items-center gap-3"
          >
            <span className={cn("p-2 rounded-lg bg-gray-100 dark:bg-gray-700/60", color)}>{icon}</span>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className="font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama game..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accentColor/40 transition"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          {(["all", "playing", "completed", "wishlist", "never_played"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-medium border transition-all",
                filterStatus === s
                  ? "bg-accentColor text-white border-accentColor"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 text-gray-600 dark:text-gray-400 hover:border-accentColor/60"
              )}
            >
              {s === "all" ? "Semua" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => setShowSort((v) => !v)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 text-sm text-gray-700 dark:text-gray-300 hover:border-accentColor/60 transition"
          >
            <SlidersHorizontal size={15} />
            {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
            <ChevronDown size={14} />
          </button>
          {showSort && (
            <div className="absolute right-0 top-full mt-1 w-52 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl z-20 overflow-hidden">
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => { setSortBy(o.value); setShowSort(false); }}
                  className={cn(
                    "block w-full text-left px-4 py-2.5 text-sm transition hover:bg-gray-50 dark:hover:bg-gray-800",
                    sortBy === o.value ? "text-accentColor font-medium" : "text-gray-700 dark:text-gray-300"
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-yellow-200 dark:border-yellow-800/50 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-300">
          ⚠️ Tidak bisa terhubung ke Steam API. Menampilkan data sampel.
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 15 }).map((_, i) => <GameCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <Gamepad2 size={48} className="mx-auto mb-3 opacity-30" />
          <p>Tidak ada game ditemukan.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.slice(0, visibleCount).map((game) => (
              <GameCard key={game.appid} game={game} />
            ))}
          </div>
          {visibleCount < filtered.length && (
            <div className="text-center">
              <button
                onClick={() => setVisibleCount((v) => v + 20)}
                className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 text-sm text-gray-700 dark:text-gray-300 hover:border-accentColor hover:text-accentColor transition"
              >
                Muat lebih banyak ({filtered.length - visibleCount} tersisa)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function GameCard({ game }: { game: SteamGame }) {
  const [imgError, setImgError] = useState(false);
  const status = game.status ?? "never_played";
  const hours = Math.floor(game.playtime_forever / 60);

  return (
    <div className="group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/40 hover:border-accentColor/60 hover:shadow-lg transition-all duration-300">
      <div className="relative w-full aspect-[46/21] bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {!imgError ? (
          <Image
            src={steamHeaderUrl(game.appid)}
            alt={game.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
            <Gamepad2 size={28} className="text-gray-500" />
          </div>
        )}
        {/* Status badge */}
        <span
          className={cn(
            "absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full",
            STATUS_COLORS[status]
          )}
        >
          {status === "playing" ? "🎮" : status === "completed" ? "✅" : status === "wishlist" ? "📋" : "💤"}
        </span>
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2 mb-1">
          {game.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {game.playtime_forever > 0 ? `⏱ ${formatPlaytime(game.playtime_forever)}` : "Belum dimainkan"}
        </p>
        {game.achievements_total && game.achievements_total > 0 && (
          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
              <span>Achievement</span>
              <span>{game.achievements_done ?? 0}/{game.achievements_total}</span>
            </div>
            <div className="h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-accentColor transition-all"
                style={{ width: `${((game.achievements_done ?? 0) / game.achievements_total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
