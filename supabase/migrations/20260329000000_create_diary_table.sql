-- ============================================================
-- MIGRATION: Personal Diary System
-- ============================================================

-- 0. Drop tabel lama jika ada
DROP TABLE IF EXISTS public.diaries CASCADE;

-- 1. Buat tabel diaries
CREATE TABLE IF NOT EXISTS public.diaries (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,
  entry_date      DATE NOT NULL,
  mood            TEXT,
  tags            TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create index untuk query berdasarkan entry_date
CREATE INDEX IF NOT EXISTS idx_diaries_entry_date ON public.diaries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_diaries_created_at ON public.diaries(created_at DESC);

-- 3. Enable RLS (Row Level Security)
ALTER TABLE public.diaries ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Semua orang bisa membaca diary (public)
DROP POLICY IF EXISTS "diaries_select_public" ON public.diaries;
CREATE POLICY "diaries_select_public"
  ON public.diaries FOR SELECT
  USING (true);

-- 5. Policy: Semua orang bisa insert diary (visitor submissions)
DROP POLICY IF EXISTS "diaries_insert_public" ON public.diaries;
CREATE POLICY "diaries_insert_public"
  ON public.diaries FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- SEED: Initial diary entry dari user request
-- ============================================================

INSERT INTO public.diaries (id, title, content, entry_date, mood, tags, created_at, updated_at)
VALUES
  (
    'diary-001',
    'Sahur, Bintang-Bintang, dan Cerita yang Tak Pernah Kehabisan Kata',
    'Di bulan puasa yang penuh keberkahan ini, ada satu momen sederhana yang begitu berkesan hingga rasanya harus saya abadikan dalam catatan ini.
Setelah sahur bersama mencari makan di luar, saya dan Tyo, teman kos saya di Pare, Kediri — yang dikenal sebagai Kampung Inggris itu — duduk berbincang seperti biasa sebelum menunaikan shalat Subuh. Tyo sendiri sedang menjalani kursus bahasa Jerman di sini, dan entah bagaimana, obrolan kami malam itu mengalir begitu deras hingga waktu pun terasa berlari tanpa permisi.
Pembicaraan kami selalu campur aduk, dari satu topik ke topik lain yang tidak pernah bisa ditebak arahnya. Dan memang begitulah kebiasaan kami, kebiasaan yang sudah terbentuk sejak kami berempat masih sering berkumpul di ruang tamu kos Funky bersama Mas Dimas dan Mas Ikhsan. Mas Ikhsan, yang berusia 25 tahun dan datang ke Pare untuk kursus bahasa Inggris, kini sudah pulang ke Lampung sejak awal Februari lalu. Sementara Mas Dimas, 26 tahun, seorang graphic designer yang tetap tinggal dan bekerja di sini, masih menemani keseharian di kos ini. Kini di bulan Ramadhan, yang tersisa hanya saya dan Tyo yang masih rutin duduk berdua melanjutkan tradisi bercerita itu.
Malam itu, saya yang mengawali pembicaraan. Saya bercerita tentang perasaan yang sudah lama saya simpan, tentang seorang wanita bernama Icha Riska Nadila, yang pertama kali saya kenal sewaktu masih MTs di Desa Cangkring, Rogojampi. Meski kami tidak selalu menjalin komunikasi, entah mengapa rasa itu tidak pernah benar-benar pergi, dari masa MTs hingga hari ini. Saya pun berkata jujur kepada Tyo, bahwa meski suatu hari nanti Icha menikah lebih dulu dengan orang lain, saya sudah mengikhlaskannya. Saya juga menceritakan bagaimana Icha begitu fanatik terhadap beberapa habib di Indonesia dengan ajaran yang menurut saya sudah jauh melenceng dari Islam yang sesungguhnya. Tyo mendengarkan dengan baik, lalu ia pun berbagi pengalamannya sendiri tentang temannya yang memiliki kefanatikan serupa.
Dari sana, obrolan kami mengalir ke mimpi-mimpi aneh yang pernah kami alami. Saya bercerita tentang mimpi yang sering kali membawa saya terbang ke ruang angkasa yang gelap dan sunyi, di mana ke mana pun memandang hanya ada warna hitam, bintang-bintang, dan planet-planet yang melayang. Ada rasa takut di sana, namun di saat yang sama ada keindahan yang sulit diungkapkan dengan kata-kata, bisa melihat bumi dari luar, dan di suatu sudut ada hamparan luas yang lebih besar dari bumi, yang dalam mimpi itu saya kira adalah kayangan. Kami juga membicarakan konspirasi alam semesta, hal-hal yang terasa terlalu besar untuk dicerna namun terlalu menarik untuk diabaikan.
Lalu obrolan kami meluncur ke masa kecil, ke kenangan-kenangan yang menyenangkan, yang menyeramkan, bahkan yang di luar nalar. Saya teringat bagaimana dulu pernah melihat panah melesat di langit, bintang jatuh, dan kejadian-kejadian aneh lainnya yang kini, di usia dewasa ini, sudah tidak pernah lagi saya jumpai. Seperti ada dunia lain yang hanya bisa diakses oleh mata kanak-kanak.
Perbincangan itu terasa sangat menyenangkan, hangat, dan ringan meski topiknya kadang berat. Dan di balik semua itu, ada satu kesadaran yang perlahan menyentuh hati, bahwa waktu kebersamaan ini hampir habis. Mas Ikhsan sudah lebih dulu pulang di bulan Februari. Tyo akan pulang di akhir Februari ini. Saya sendiri akan meninggalkan Pare pada 13 Maret mendatang. Hanya Mas Dimas yang akan tetap tinggal, melanjutkan kehidupannya di Pare dan di kos Funky ini.
Kos Funky, tempat di mana kami berempat pernah duduk bersama, bertukar cerita, dan tanpa sadar saling mengisi satu sama lain. Sebuah pertemuan singkat enam bulan yang, saya yakin, tidak akan mudah terlupakan.',
'2026-01-28'::date,
    'Reflective',
    ARRAY['Ramadhan', 'kenangan', 'teman', 'kehidupan'],
    NOW(),
    NOW()
  ),
  (
    'diary-002',
    'A Quiet Morning at the Cafe',
'Today I decided to work from a nearby cafe. The aroma of freshly brewed coffee and the soft hum of conversations in the background made it the perfect environment to focus. I managed to fix a bunch of lingering bugs in my side project, and overall it felt incredibly productive. Taking it slow sometimes yields the best results.',
    '2026-03-15'::date,
    'Inspired',
    ARRAY['work', 'cafe', 'productivity'],
    NOW(),
    NOW()
  ),
  (
    'diary-003',
    'Rainy Days and Old Books',
    'It rained heavily today. Instead of going out, I stayed indoors with a cup of hot chocolate and re-read one of my favorite classic novels. There is something profoundly comforting about reading the exact same words you read years ago and finding new meaning in them. I feel a deep sense of gratitude for these quiet moments.',
    '2026-03-20'::date,
    'Grateful',
    ARRAY['books', 'rain', 'reading'],
    NOW(),
    NOW()
  ),
  (
    'diary-004',
    'Looking Back at the Journey',
    'It’s hard to imagine how quickly time has flown. Looking at old photographs today brought back a flood of memories—some joyful, some a bit melancholic. But every single experience has charted the path to who I am now. Sometimes you just have to look back to realize how far you have walked.',
    '2026-03-22'::date,
    'Thoughtful',
    ARRAY['memories', 'growth', 'life'],
    NOW(),
    NOW()
  ),
  (
    'diary-005',
    'An Unexpected Encounter',
    'While walking in the park this evening, I ran into an old friend from high school. We spent hours catching up on the benches. It is amazing how you can pick up where you left off even after years of no contact. It made my day so much brighter.',
    '2026-04-01'::date,
    'Happy',
    ARRAY['friends', 'park', 'reunion'],
    NOW(),
    NOW()
  ),
  (
    'diary-006',
    'Overcoming the Block',
    'I had been stuck on a difficult design issue for weeks. Today, while taking a random walk, the solution just clicked in my head. I rushed back home and implemented it within an hour. It’s funny how the brain works—sometimes you just need to step away from the problem.',
    '2026-04-03'::date,
    'Inspired',
    ARRAY['design', 'problem solving', 'eureka'],
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;
