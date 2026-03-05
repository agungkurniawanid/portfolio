-- Hapus semua tabel, view, dan relasi secara paksa
DROP SCHEMA public CASCADE;
-- Buat ulang schema kosong
CREATE SCHEMA public;
-- Kembalikan hak akses default
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;