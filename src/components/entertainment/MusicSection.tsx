"use client";

import { useState } from "react";
import { Music, Play, Headphones, ExternalLink } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/Utils";
import { SpotifyPlaylist } from "@/types/entertainment";
import { SPOTIFY_PLAYLISTS } from "@/data/entertainmentData";

export default function MusicSection() {
  const [activePlaylist, setActivePlaylist] = useState<SpotifyPlaylist>(SPOTIFY_PLAYLISTS[0]);

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { icon: "🎵", label: "Total Playlist", value: SPOTIFY_PLAYLISTS.length },
          { icon: "🎧", label: "Total Lagu (est.)", value: SPOTIFY_PLAYLISTS.reduce((s, p) => s + p.track_count, 0) },
          { icon: "🎼", label: "Genre", value: [...new Set(SPOTIFY_PLAYLISTS.flatMap((p) => p.mood_labels))].length },
        ].map(({ icon, label, value }) => (
          <div key={label} className="rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/40 p-4 flex items-center gap-3">
            <span className="text-xl">{icon}</span>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className="font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Playlist list */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Headphones size={16} className="text-accentColor" />
            Playlist Saya
          </h3>
          {SPOTIFY_PLAYLISTS.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePlaylist(p)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                activePlaylist.id === p.id
                  ? "border-accentColor/60 bg-accentColor/5 dark:bg-accentColor/10"
                  : "border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/40 hover:border-accentColor/40"
              )}
            >
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-green-500 to-green-800 flex-shrink-0">
                {p.cover_url ? (
                  <Image src={p.cover_url} alt={p.name} fill className="object-cover" unoptimized onError={() => {}} />
                ) : (
                  <Music size={20} className="absolute inset-0 m-auto text-white/80" />
                )}
                {activePlaylist.id === p.id && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play size={16} className="text-white fill-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{p.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{p.track_count} lagu</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {p.mood_labels.slice(0, 3).map((l) => (
                    <span key={l} className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">{l}</span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Embed player */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{activePlaylist.name}</h3>
              {activePlaylist.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{activePlaylist.description}</p>
              )}
            </div>
            <a
              href={`https://open.spotify.com/playlist/${activePlaylist.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 hover:underline"
            >
              <ExternalLink size={13} /> Buka di Spotify
            </a>
          </div>
          <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700/50 shadow-sm">
            <iframe
              src={activePlaylist.embed_url}
              width="100%"
              height="380"
              frameBorder="0"
              allowTransparency
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={activePlaylist.name}
              className="block"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {activePlaylist.mood_labels.map((l) => (
              <span key={l} className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                🎵 {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
