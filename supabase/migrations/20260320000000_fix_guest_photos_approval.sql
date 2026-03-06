-- ============================================================
-- MIGRATION: Auto-approve semua foto tamu (gallery_tamu)
-- Tanggal: 2026-03-20
-- Masalah: Foto tamu di-upload dengan is_approved=FALSE sehingga
--          tidak muncul di gallery (RLS hanya izinkan is_approved=TRUE).
--          Sekarang foto tamu langsung disetujui otomatis.
-- ============================================================

-- 1. Auto-approve semua foto tamu yang masih pending
UPDATE public.gallery_photos
SET is_approved = TRUE
WHERE owner_type = 'guest'
  AND is_approved = FALSE;

-- 2. Sinkronisasi photo_count di gallery_albums
--    (sebelumnya hitungan bisa salah karena foto tidak approved tidak terhitung)
UPDATE public.gallery_albums a
SET photo_count = (
  SELECT COUNT(*)
  FROM public.gallery_photos p
  WHERE p.album_slug = a.slug
    AND p.is_approved = TRUE
)
WHERE a.owner_type = 'guest';

-- 3. Sinkronisasi photo_count di gallery_guests
UPDATE public.gallery_guests g
SET photo_count = (
  SELECT COUNT(*)
  FROM public.gallery_photos p
  WHERE p.guest_id = g.id
    AND p.is_approved = TRUE
);

-- 4. Update RLS policy gallery_photos agar foto tamu selalu visible
--    (tidak memerlukan is_approved karena sekarang auto-approve)
DROP POLICY IF EXISTS "gallery_photos_public_read" ON public.gallery_photos;
CREATE POLICY "gallery_photos_public_read"
  ON public.gallery_photos FOR SELECT
  USING (is_approved = TRUE OR owner_type = 'guest');

-- Done!
-- Verifikasi:
--   SELECT COUNT(*) FROM gallery_photos WHERE owner_type='guest' AND is_approved=FALSE;
--   -- Harusnya: 0
