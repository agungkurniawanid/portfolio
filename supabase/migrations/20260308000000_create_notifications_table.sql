-- MIGRATION: Create Notifications Table
-- Jalankan: node scripts/migrate-notifications.mjs

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'guestbook_entry', 'gallery_photo', dll.
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    target_url VARCHAR(500) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk pencarian yang sering dipakai
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Hanya Admin (Service Role) yang biasanya mengelola, tapi kita buka akses full untuk dev di dashboard jika dibutuhkan
-- Jika dashboard dijalankan dengan service role, RLS ini di bypass otomatis.
-- Tambahkan policy standar untuk Admin jika butuh akses anon/authenticated.
CREATE POLICY "Enable all for authenticated/anon for now" ON public.notifications
    FOR ALL USING (true) WITH CHECK (true);

-- Aktifkan Realtime di tabel ini
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;
