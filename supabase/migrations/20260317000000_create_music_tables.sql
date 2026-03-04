-- ============================================================
-- Music: Tracks + Custom Albums
-- ============================================================

-- Tracks table (data trigger for Spotify search)
create table if not exists public.music_tracks (
  id                bigserial    primary key,
  title             text         not null,
  artist            text         not null,
  spotify_track_id  text,                    -- pre-stored Spotify track ID (optional)
  notes             text,
  created_at        timestamptz  not null default now()
);

alter table public.music_tracks enable row level security;
create policy "Public read music_tracks" on public.music_tracks
  for select using (true);

-- Custom albums table
create table if not exists public.custom_albums (
  id           bigserial    primary key,
  name         text         not null,
  description  text,
  cover_url    text,
  created_at   timestamptz  not null default now()
);

alter table public.custom_albums enable row level security;
create policy "Public read custom_albums" on public.custom_albums
  for select using (true);

-- Junction: album ↔ track
create table if not exists public.custom_album_tracks (
  id         bigserial    primary key,
  album_id   bigint       not null references public.custom_albums (id) on delete cascade,
  track_id   bigint       not null references public.music_tracks    (id) on delete cascade,
  position   int          not null default 0,
  unique (album_id, track_id)
);

alter table public.custom_album_tracks enable row level security;
create policy "Public read custom_album_tracks" on public.custom_album_tracks
  for select using (true);

-- Indexes
create index if not exists music_tracks_spotify_idx on public.music_tracks (spotify_track_id);
create index if not exists cat_album_id_idx          on public.custom_album_tracks (album_id);

-- ─── Seed Data ────────────────────────────────────────────────────────────────
insert into public.music_tracks (title, artist, spotify_track_id, notes) values
  ('Fik Kol Ma Ara Hasan',      'Hasan Al-Rashid',      null, 'Sering didengar saat coding'),
  ('Blinding Lights',           'The Weeknd',           '0VjIjW4GlUZAMYd2vXMi3b', null),
  ('As It Was',                 'Harry Styles',         '4LRPiXqCikLlN15c3yImP7', null),
  ('Mockingbird',               'Eminem',               '5Bz3bVMFxQGpApXkSoGEDP', null),
  ('Resonance',                 'HOME',                 '3cfOd4CMv2snFaKAnMdnvK', null),
  ('Snowfall',                  'Øneheart & reidenshi', null, 'Lo-fi favorit'),
  ('Gece',                      'Semicenk',             null, 'Turki vibes'),
  ('Lemon',                     'Kenshi Yonezu',        null, 'Dari anime Your Lie in April'),
  ('Gurenge',                   'LiSA',                 null, 'OP Demon Slayer'),
  ('Ashes on the Fire',         'Linked Horizon',       null, 'OP Attack on Titan')
on conflict do nothing;

insert into public.custom_albums (name, description, cover_url) values
  ('Coding Playlist 🎧',       'Koleksi lagu favorit saat ngoding — lo-fi, chill, dan fokus.', null),
  ('Anime OST Favs 🎌',         'Lagu-lagu opening/ending anime yang selalu bikin semangat.', null),
  ('Mood Booster 🔥',           'Lagu dengan energi tinggi untuk workout atau sesi produktif.', null)
on conflict do nothing;

-- Link tracks to albums (by position)
insert into public.custom_album_tracks (album_id, track_id, position)
select a.id, t.id, row_number() over (partition by a.id order by t.id)
from public.custom_albums a
cross join public.music_tracks t
where
  (a.name = 'Coding Playlist 🎧'  and t.title in ('Resonance','Snowfall','Fik Kol Ma Ara Hasan', 'Blinding Lights'))
  or
  (a.name = 'Anime OST Favs 🎌'   and t.title in ('Lemon','Gurenge','Ashes on the Fire'))
  or
  (a.name = 'Mood Booster 🔥'      and t.title in ('Blinding Lights','As It Was','Mockingbird'))
on conflict do nothing;
