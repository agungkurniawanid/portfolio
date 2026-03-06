// Run: node scripts/migrate-deployed-projects.mjs

import { createClient } from '@supabase/supabase-js';
import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const connStr = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || "";

if (!supabaseUrl || !supabaseKey || !connStr) {
  console.error("❌ Pastikan SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, dan POSTGRES_URL_NON_POOLING tersedia di .env.local!");
  process.exit(1);
}

const SQL_FILE = path.join(__dirname, "../supabase/migrations/20260306000002_create_deployed_projects_table.sql");
const supabase = createClient(supabaseUrl, supabaseKey);

const dummyProjects = [
  {
    title: "E-Commerce Web App",
    slug: "ecommerce-web-app",
    summary: "Aplikasi toko online dengan fitur keranjang dan payment gateway.",
    description: "Ini adalah deskripsi lengkap dari E-Commerce Web App. Dibangun menggunakan Next.js dan Tailwind CSS dengan integrasi Midtrans untuk pembayaran. Mendukung manajemen stok, notifikasi real-time, dan dashboard admin yang responsif.",
    thumbnail_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    gallery_urls: [
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80",
      "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=800&q=80"
    ],
    platform: "Web",
    web_url: "https://example-ecommerce.com",
    play_store_url: null,
    apk_file_path: null,
    external_apk_url: null,
    update_notes: "### Versi 1.2.0\n- Penambahan fitur Wishlist.\n- Optimalisasi kecepatan load gambar.\n- Perbaikan bug pada saat checkout.",
    tags: ["Next.js", "Tailwind", "Supabase", "Midtrans"]
  },
  {
    title: "Task Manager Mobile",
    slug: "task-manager-mobile",
    summary: "Aplikasi manajemen tugas harian yang intuitif untuk Android.",
    description: "Aplikasi produktivitas berbasis mobile untuk mengatur rutinitas harian. Fiturnya meliputi timer pomodoro, kategori task, grafik statistik performa, dan sinkronisasi cloud.",
    thumbnail_url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
    gallery_urls: [
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80"
    ],
    platform: "Android",
    web_url: null,
    play_store_url: "https://play.google.com/store/apps/details?id=com.example.taskmanager",
    apk_file_path: null,
    external_apk_url: "https://drive.google.com/file/d/1xxxx/view?usp=sharing", // Contoh External URL
    update_notes: "### Versi 2.0.1\n- Dark mode support.\n- Penambahan fitur Pomodoro Timer.\n- Bug fixes pada kalender.",
    tags: ["Flutter", "Firebase", "Mobile"]
  }
];

async function runMigration() {
  const sql = fs.readFileSync(SQL_FILE, "utf-8");
  const parsedUrl = new URL(connStr.replace(/^postgres:\/\//, "postgresql://"));
  const pgClient = new pg.Client({
    host: parsedUrl.hostname, port: Number(parsedUrl.port) || 5432,
    database: parsedUrl.pathname.replace("/", ""), user: parsedUrl.username, password: parsedUrl.password,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("🔌 Menghubungkan ke PostgreSQL...");
    await pgClient.connect();
    console.log("🚀 Menjalankan SQL Migration...");
    await pgClient.query(sql);
    console.log("✅ Tabel 'deployed_projects' berhasil dibuat/diverifikasi!");

    // Pastikan Bucket dibuat melalui API
    await supabase.storage.createBucket('project-files', { public: true });
    
    console.log("🌱 Menyimpan data Seed Projects...");
    const { error } = await supabase.from('deployed_projects').upsert(dummyProjects, { onConflict: 'slug' });
    if (error) throw error;
    
    console.log("✅ Migration & Seeding Selesai!");
  } catch (err) {
    console.error("❌ Gagal:", err.message);
  } finally {
    await pgClient.end();
  }
}

runMigration();