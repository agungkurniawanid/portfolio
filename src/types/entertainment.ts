// ─── Steam / Games ────────────────────────────────────────────────────────────
export type GameStatus = "playing" | "completed" | "wishlist" | "never_played";

export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number; // minutes
  img_icon_url: string;
  img_logo_url?: string;
  // manual overrides
  status?: GameStatus;
  achievements_done?: number;
  achievements_total?: number;
}

export interface SteamGamesResponse {
  response: {
    game_count: number;
    games: SteamGame[];
  };
}

// ─── Movies ───────────────────────────────────────────────────────────────────
export type MovieStatus = "watched" | "watching" | "wishlist";

export interface LocalMovie {
  title: string;
  status: MovieStatus;
  personal_rating: number; // 1–5
  review?: string;
  watched_date?: string;
}

export interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
}

export interface EnrichedMovie extends LocalMovie {
  tmdb?: TMDBMovie;
  loading?: boolean;
  error?: boolean;
}

// ─── Anime / Series ───────────────────────────────────────────────────────────
export type SeriesStatus = "completed" | "ongoing" | "wishlist";

export interface AnimeSeries {
  id: number;
  title: string;
  original_title?: string;
  type: "anime" | "series";
  total_episodes?: number;
  total_seasons?: number;
  status: SeriesStatus;
  personal_rating: number; // 1–5
  review?: string;
  genres: string[];
  studio?: string;
  network?: string;
  poster_path?: string | null;
  tmdb_id?: number;
}

// ─── Music / Spotify ─────────────────────────────────────────────────────────
export interface SpotifyPlaylist {
  id: string;
  name: string;
  description?: string;
  track_count: number;
  mood_labels: string[];
  cover_url?: string;
  embed_url: string;
}

// ─── Books ────────────────────────────────────────────────────────────────────
export type BookStatus = "finished" | "reading" | "wishlist";

export interface LocalBook {
  id: number;
  title: string;
  author: string;
  year?: number;
  genre: string[];
  status: BookStatus;
  personal_rating: number; // 1–5
  review?: string;
  pages?: number;
  cover_url?: string; // fetched from Google Books
  google_books_id?: string;
}

// ─── Collections ─────────────────────────────────────────────────────────────
export type CollectionCondition = "mint" | "good" | "used";
export type CollectionCategory =
  | "Action Figure"
  | "Board Game"
  | "Merchandise"
  | "Funko Pop"
  | "Trading Card"
  | "Lainnya";

export interface CollectionItem {
  id: number;
  name: string;
  category: CollectionCategory;
  year_acquired: number;
  condition: CollectionCondition;
  description: string;
  estimated_value?: string;
  image_url?: string;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
export interface EntertainmentStats {
  total_games: number;
  total_hours: number;
  total_movies_watched: number;
  total_anime_completed: number;
  total_playlists: number;
  total_books_read: number;
  total_collections: number;
}

// ─── Tab navigation ──────────────────────────────────────────────────────────
export type EntertainmentTab =
  | "dashboard"
  | "games"
  | "movies"
  | "anime"
  | "music"
  | "books"
  | "collections";
