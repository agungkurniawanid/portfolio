-- ============================================================
-- Mobile & Non-Steam Games
-- ============================================================
create table if not exists public.mobile_games (
  id           bigserial primary key,
  title        text        not null,
  platform     text        not null default 'Mobile',     -- e.g. Mobile, Switch, PS5
  genre        text[]      not null default '{}',
  status       text        not null default 'playing'
                           check (status in ('playing','completed','wishlist')),
  cover_url    text,
  description  text,
  developer    text,
  release_year int,
  personal_rating int      check (personal_rating between 1 and 5),
  review       text,
  hours_played int         default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- RLS
alter table public.mobile_games enable row level security;
create policy "Public read access" on public.mobile_games
  for select using (true);

-- Updated-at trigger
create or replace function public.handle_mobile_games_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger mobile_games_updated_at
  before update on public.mobile_games
  for each row execute procedure public.handle_mobile_games_updated_at();

-- Seed data — common mobile / non-Steam games
insert into public.mobile_games (title, platform, genre, status, developer, release_year, personal_rating, review, hours_played) values
  ('Mobile Legends: Bang Bang', 'Mobile', array['MOBA','Action'], 'playing', 'Moonton', 2016, 4, 'Game MOBA mobile paling populer di SEA.', 500),
  ('Genshin Impact',            'Mobile', array['RPG','Open World','Gacha'], 'playing', 'HoYoverse', 2020, 4, 'Gacha tapi open world-nya sangat bagus.', 300),
  ('PUBG Mobile',               'Mobile', array['Battle Royale','Shooter'], 'playing', 'Tencent', 2018, 3, 'BR yang solid di mobile.', 200),
  ('Honkai: Star Rail',         'Mobile', array['RPG','Turn-based','Gacha'], 'playing', 'HoYoverse', 2023, 5, 'Turn-based RPG gacha terbaik saat ini.', 250),
  ('Minecraft',                 'Mobile', array['Sandbox','Survival'], 'completed', 'Mojang', 2011, 5, 'Game legendaris, endless creativity.', 400)
on conflict do nothing;
