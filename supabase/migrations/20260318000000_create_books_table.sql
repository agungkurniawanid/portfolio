-- ============================================================
-- Books table — Supabase as data trigger for Open Library
-- ============================================================
create table if not exists public.books (
  id               bigserial    primary key,
  title            text         not null,
  author           text         not null,
  isbn             text,
  open_library_key text,                       -- e.g. /works/OL45804W
  status           text         not null default 'wishlist'
                                check (status in ('finished','wishlist','favorite')),
  personal_rating  int          check (personal_rating between 1 and 5),
  review           text,
  genre            text[]       not null default '{}',
  year             int,
  pages            int,
  created_at       timestamptz  not null default now(),
  updated_at       timestamptz  not null default now()
);

alter table public.books enable row level security;
create policy "Public read books" on public.books
  for select using (true);

create or replace function public.handle_books_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger books_updated_at
  before update on public.books
  for each row execute procedure public.handle_books_updated_at();

-- Seed
insert into public.books (title, author, status, personal_rating, review, genre, year) values
  ('Clean Code',                          'Robert C. Martin', 'finished',  5, 'Wajib baca setiap programmer.', array['Programming','Software Engineering'], 2008),
  ('The Pragmatic Programmer',            'David Thomas & Andrew Hunt', 'finished', 5, 'Buku career-defining untuk developer.', array['Programming','Career'], 1999),
  ('Atomic Habits',                       'James Clear',      'finished',  5, 'Buku terbaik soal pembentukan kebiasaan.', array['Self Help','Psychology'], 2018),
  ('Design Patterns',                     'Gang of Four',     'finished',  4, 'Referensi pola desain OOP klasik.', array['Programming','Architecture'], 1994),
  ('Deep Work',                           'Cal Newport',      'finished',  4, 'Fokus mendalam = produktivitas tinggi.', array['Self Help','Productivity'], 2016),
  ('You Don''t Know JS',                   'Kyle Simpson',     'wishlist',  null, null, array['Programming','JavaScript'], 2015),
  ('System Design Interview',             'Alex Xu',          'wishlist',  null, null, array['Programming','Architecture'], 2020),
  ('The Psychology of Money',             'Morgan Housel',    'favorite',  5, 'Perspektif baru soal uang dan keputusan finansial.', array['Finance','Psychology'], 2020),
  ('Sapiens',                             'Yuval Noah Harari','favorite',  5, 'Perjalanan sejarah manusia yang luar biasa.', array['History','Science'], 2011),
  ('Zero to One',                         'Peter Thiel',      'finished',  4, 'Startup thinking dari investor Silicon Valley.', array['Business','Startup'], 2014)
on conflict do nothing;
