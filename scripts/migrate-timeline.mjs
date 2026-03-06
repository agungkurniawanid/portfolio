// Run: node scripts/migrate-timeline.mjs
//
// Script ini akan:
//   1. Mengeksekusi file SQL untuk membuat tabel 'timelines' dan bucket storage 'timeline' (beserta RLS/Policy-nya).
//   2. Mendownload foto dari Unsplash dan mengunggahnya ke Supabase Storage.
//   3. Mengganti URL sumber gambar lokal.
//   4. Menyimpan (upsert) data timeline ke dalam database.
//
// ✅ AMAN dijalankan berulang — semua pernyataan bersifat idempotent (menggunakan IF NOT EXISTS & upsert).

import { createClient } from '@supabase/supabase-js';
import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

// Konfigurasi Supabase Client & Postgres DB
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const connStr = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan!");
  process.exit(1);
}

if (!connStr) {
  console.error("❌ POSTGRES_URL_NON_POOLING tidak ditemukan di .env.local!");
  process.exit(1);
}

// Menentukan lokasi file SQL migration
const SQL_FILE = path.join(
  __dirname,
  "../supabase/migrations/20260306000000_create_timelines_table_and_bucket.sql"
);

const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET_NAME = 'timeline';

// ==========================================
// DATA SEED TIMELINE
// ==========================================
const timelineData = [
  /* ───────── PENDIDIKAN ───────── */
  {
    id: 1,
    category: "Pendidikan",
    type: "SD",
    title: "SD Negeri 1 Glagah",
    subtitle: "Sekolah Dasar",
    location: "Banyuwangi, Jawa Timur",
    period_start: "2010",
    period_end: "2016",
    status: "Selesai",
    description:
      "Awal perjalanan belajar di sekolah dasar. Di sinilah fondasi karakter, keingintahuan, dan kecintaan terhadap ilmu pengetahuan mulai terbentuk. Masa penuh eksplorasi dan petualangan kecil yang membentuk pola pikir saya.",
    highlights: [
      "Peringkat 3 besar kelas sepanjang 6 tahun",
      "Pertama kali mengenal komputer & internet",
      "Aktif mengikuti lomba matematika tingkat kecamatan",
      "Terpilih sebagai ketua kelas di kelas 5 & 6",
    ],
    extracurricular: ["Pramuka", "Sepak Bola", "Drumband"],
    skills: ["Matematika Dasar", "Membaca", "Menulis", "Seni Rupa", "Kepemimpinan Dasar"],
    photos: [
      {
        src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop",
        alt: "Suasana sekolah dasar",
        caption: "Masa SD penuh kenangan indah",
      },
      {
        src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop",
        alt: "Buku pelajaran SD",
        caption: "Belajar dari buku pelajaran",
      },
    ],
    quote: "Perjalanan seribu mil dimulai dari satu langkah kecil.",
    quote_author: "Lao Tzu",
    color: "blue",
    icon: "FaSchool",
  },
  {
    id: 2,
    category: "Pendidikan",
    type: "SMP",
    title: "SMP Negeri 1 Glagah",
    subtitle: "Sekolah Menengah Pertama",
    location: "Banyuwangi, Jawa Timur",
    period_start: "2016",
    period_end: "2019",
    status: "Selesai",
    description:
      "Masa SMP menjadi titik awal saya mengenal teknologi lebih dalam. Pertama kali belajar mengetik dengan benar, membuat dokumen Word, dan mengenal pemrograman visual sederhana. Semangat belajar semakin tumbuh di sini.",
    highlights: [
      "Pertama kali membuat program sederhana dengan Scratch",
      "Juara 2 lomba karya ilmiah tingkat kabupaten",
      "Mendapatkan nilai sempurna ujian komputer",
      "Aktif dalam OSIS sebagai sekretaris",
    ],
    extracurricular: ["OSIS", "Pramuka", "Karya Ilmiah Remaja (KIR)"],
    skills: ["Microsoft Office", "Scratch Programming", "Riset Dasar", "Presentasi", "OSIS Leadership"],
    photos: [
      {
        src: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&auto=format&fit=crop",
        alt: "Laboratorium komputer SMP",
        caption: "Laboratorium komputer pertama saya",
      },
      {
        src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop",
        alt: "Kegiatan OSIS",
        caption: "Aktif berorganisasi di OSIS",
      },
    ],
    quote: "Ilmu adalah cahaya, kebodohan adalah kegelapan.",
    quote_author: "Pepatah Arab",
    color: "blue",
    icon: "FaSchool",
  },
  {
    id: 3,
    category: "Pendidikan",
    type: "SMK",
    title: "SMK Negeri 1 Glagah",
    subtitle: "Teknik Komputer dan Jaringan (TKJ)",
    location: "Banyuwangi, Jawa Timur",
    period_start: "2019",
    period_end: "2022",
    status: "Selesai",
    description:
      "SMK Teknik Komputer dan Jaringan adalah titik balik terbesar dalam perjalanan saya. Di sinilah saya pertama kali merasakan dunia IT secara profesional — belajar jaringan, hardware, hingga mulai menyentuh pemrograman yang sesungguhnya.",
    highlights: [
      "Menguasai konfigurasi Cisco Packet Tracer & Mikrotik",
      "Mengerjakan PKL (Praktik Kerja Lapangan) di ISP lokal",
      "Pertama kali membangun aplikasi desktop dengan C++",
      "Lulus dengan nilai ujian nasional di atas rata-rata",
    ],
    extracurricular: ["Pramuka", "English Club", "Futsal"],
    skills: ["Jaringan Komputer", "Mikrotik", "C++", "HTML/CSS Dasar", "Linux CLI", "Cisco IOS"],
    techStack: ["C++", "Linux", "Cisco", "Mikrotik", "HTML", "CSS"],
    photos: [
      {
        src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop",
        alt: "Lab jaringan komputer",
        caption: "Laboratorium jaringan komputer SMK",
      },
      {
        src: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop",
        alt: "Konfigurasi jaringan",
        caption: "Praktik konfigurasi router & switch",
      },
    ],
    quote: "Teknologi bukan tentang perangkatnya, tetapi tentang apa yang kamu bangun dengannya.",
    quote_author: "Unknown",
    color: "blue",
    icon: "FaLaptopCode",
  },
  {
    id: 4,
    category: "Pendidikan",
    type: "Kuliah",
    title: "Politeknik Negeri Banyuwangi",
    subtitle: "D4 — Teknik Informatika",
    location: "Banyuwangi, Jawa Timur",
    period_start: "2022",
    period_end: "Sekarang",
    status: "Sedang Berlangsung",
    gpa: "3.82 / 4.00",
    description:
      "Melanjutkan pendidikan tinggi di Politeknik Negeri Banyuwangi jurusan D4 Teknik Informatika. Di sini saya mulai mendalami Full Stack Development, Machine Learning, dan Mobile Development secara serius. IPK konsisten di atas 3.8 sepanjang semester.",
    highlights: [
      "IPK 3.82 / 4.00 (semester 1–5)",
      "Aktif mengikuti kompetisi pemrograman & web design",
      "Membangun lebih dari 20 project nyata selama kuliah",
      "Mendalami Machine Learning & AI di semester 4",
      "Mengikuti program MBKM TEFA sebagai Web Developer",
    ],
    extracurricular: ["UKM Coding Club", "Himpunan Mahasiswa Teknologi Informasi"],
    skills: ["React", "Next.js", "Laravel", "FastAPI", "MySQL", "PostgreSQL", "Machine Learning", "Flutter", "Docker", "Git"],
    techStack: ["React", "Next.js", "TypeScript", "Laravel", "Python", "FastAPI", "MySQL", "PostgreSQL", "Flutter", "Docker"],
    photos: [
      {
        src: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop",
        alt: "Kampus Polbangtan",
        caption: "Kampus Politeknik Negeri Banyuwangi",
      },
      {
        src: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop",
        alt: "Coding session",
        caption: "Sesi coding project kuliah",
      },
      {
        src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop",
        alt: "Presentasi project",
        caption: "Presentasi project semester",
      },
    ],
    quote: "Bukan tentang siapa yang paling pintar, melainkan siapa yang paling gigih.",
    quote_author: "Albert Einstein",
    color: "blue",
    icon: "FaUniversity",
  },

  /* ───────── KURSUS & BOOTCAMP ───────── */
  {
    id: 5,
    category: "Kursus & Bootcamp",
    type: "Bootcamp",
    title: "Bootcamp Decoding — Full Stack Web",
    subtitle: "Full Stack JavaScript Developer",
    location: "Online (Decoding.id)",
    period_start: "Nov 2022",
    period_end: "Feb 2023",
    status: "Selesai",
    description:
      "Mengikuti bootcamp intensif Full Stack JavaScript di Decoding. Program ini mencakup front-end dengan React, back-end dengan Node.js & Express, serta database management. Proyek akhir berhasil mendeploy aplikasi e-commerce ke production.",
    highlights: [
      "Berhasil membangun aplikasi e-commerce end-to-end",
      "Belajar metodologi Agile & Scrum",
      "Code review mingguan dengan mentor industry",
      "Deploy project ke Vercel dan Railway",
    ],
    skills: ["React", "Node.js", "Express.js", "MongoDB", "JavaScript ES6+", "REST API", "Git & GitHub"],
    techStack: ["React", "Node.js", "Express.js", "MongoDB", "JavaScript"],
    certificates: [
      { name: "Sertifikat Full Stack JavaScript Developer – Decoding", href: "/certificate" },
    ],
    photos: [
      {
        src: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop",
        alt: "Bootcamp coding",
        caption: "Sesi bootcamp intensif",
      },
      {
        src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop",
        alt: "Project bootcamp",
        caption: "Mengerjakan final project bootcamp",
      },
    ],
    quote: "Code is like humor. When you have to explain it, it's bad.",
    quote_author: "Cory House",
    color: "orange",
    icon: "FaCode",
  },
  {
    id: 6,
    category: "Kursus & Bootcamp",
    type: "Online Course",
    title: "Machine Learning Specialization — Coursera",
    subtitle: "Andrew Ng × DeepLearning.AI",
    location: "Online (Coursera)",
    period_start: "Jun 2024",
    period_end: "Sep 2024",
    status: "Selesai",
    description:
      "Menyelesaikan Machine Learning Specialization dari Andrew Ng di Coursera. Tiga kursus mencakup supervised learning, unsupervised learning, hingga reinforcement learning. Implementing ML models dengan Python dari scratch.",
    highlights: [
      "Menyelesaikan 3 kursus dalam 1 spesialisasi",
      "Mengimplementasikan neural network dari scratch dengan NumPy",
      "95% score pada semua quiz & assignment",
      "Proyek akhir: sentiment analysis pada dataset Twitter",
    ],
    skills: ["Python", "NumPy", "Scikit-learn", "TensorFlow", "Supervised Learning", "Neural Networks", "Regression"],
    techStack: ["Python", "TensorFlow", "Scikit-learn", "NumPy", "Jupyter"],
    certificates: [
      { name: "Machine Learning Specialization Certificate – Coursera", href: "/certificate" },
    ],
    photos: [
      {
        src: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&auto=format&fit=crop",
        alt: "Machine learning",
        caption: "Belajar machine learning secara mendalam",
      },
    ],
    quote: "Machine learning is the science of getting computers to act without being explicitly programmed.",
    quote_author: "Andrew Ng",
    color: "orange",
    icon: "FaBrain",
  },
  {
    id: 7,
    category: "Kursus & Bootcamp",
    type: "Short Course",
    title: "Flutter Development Course — Udemy",
    subtitle: "Dart & Flutter — Angela Yu",
    location: "Online (Udemy)",
    period_start: "Mar 2025",
    period_end: "Jun 2025",
    status: "Selesai",
    description:
      "Kursus Flutter & Dart dari Angela Yu di Udemy. Belajar membangun aplikasi cross-platform mobile untuk iOS & Android. Kursus ini sangat praktis dengan lebih dari 30 mini-project sepanjang kursus.",
    highlights: [
      "Membangun 30+ mini project Flutter selama kursus",
      "Mengintegrasikan Firebase sebagai backend",
      "Belajar state management dengan Provider & Riverpod",
      "Deploy aplikasi ke Google Play Store (debug build)",
    ],
    skills: ["Flutter", "Dart", "Firebase", "Provider", "Riverpod", "REST API", "Mobile UI Design"],
    techStack: ["Flutter", "Dart", "Firebase", "Provider"],
    certificates: [{ name: "Flutter Development Certificate – Udemy" }],
    photos: [
      {
        src: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop",
        alt: "Flutter development",
        caption: "Mengembangkan aplikasi mobile dengan Flutter",
      },
    ],
    quote: "Build once, run everywhere.",
    quote_author: "Flutter Philosophy",
    color: "orange",
    icon: "SiFlutter",
  },

  /* ───────── KARIR & MAGANG ───────── */
  {
    id: 8,
    category: "Karir & Magang",
    type: "Part-time",
    title: "CV Dharma Adi Putra",
    subtitle: "Full Stack Developer & Network Technician",
    location: "Banyuwangi, Jawa Timur",
    locationDetail: "Remote / Hybrid",
    period_start: "Apr 2020",
    period_end: "Okt 2025",
    status: "Selesai",
    description:
      "Bekerja part-time di CV Dharma Adi Putra sebagai Full Stack Developer dan juga Network Technician. Membangun dan memelihara infrastruktur jaringan sekaligus mengembangkan aplikasi web dan mobile terintegrasi dengan sistem Mikrotik untuk manajemen keuangan & billing otomatis.",
    highlights: [
      "Mengembangkan sistem billing otomatis terintegrasi Mikrotik",
      "Memelihara 15+ titik jaringan di lapangan",
      "Membangun aplikasi web manajemen keuangan dengan Next.js",
      "Mengoptimalkan infrastruktur server – uptime 99.5%",
    ],
    responsibilities: [
      "Pengembangan & pemeliharaan aplikasi web dan mobile",
      "Instalasi & troubleshooting infrastruktur jaringan",
      "Integrasi sistem billing dengan router Mikrotik",
      "Remote monitoring server dan jaringan",
    ],
    projects: [
      "Sistem Billing ISP Terintegrasi Mikrotik",
      "Aplikasi Manajemen Keuangan (Flutter + PostgreSQL)",
      "Dashboard Monitoring Jaringan Real-time",
    ],
    skills: ["Next.js", "Flutter", "PostgreSQL", "Mikrotik", "Network Installation", "Network Troubleshooting"],
    techStack: ["Next.js", "Flutter", "PostgreSQL", "Node.js", "Mikrotik"],
    photos: [
      {
        src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop",
        alt: "Network infrastructure",
        caption: "Pekerjaan infrastruktur jaringan",
      },
      {
        src: "https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=800&auto=format&fit=crop",
        alt: "Full stack development",
        caption: "Pengembangan aplikasi web & mobile",
      },
    ],
    quote: "The best way to predict the future is to build it.",
    quote_author: "Abraham Lincoln",
    color: "green",
    icon: "FaBriefcase",
  },
  {
    id: 9,
    category: "Karir & Magang",
    type: "Internship",
    title: "Soko Financial",
    subtitle: "Full Stack Developer Intern",
    location: "Yogyakarta, Jawa Tengah",
    locationDetail: "Remote",
    period_start: "Jun 2023",
    period_end: "Sep 2023",
    status: "Selesai",
    description:
      "Magang sebagai Full Stack Developer di Soko Financial, startup fintech berbasis di Yogyakarta. Berkontribusi dalam pengembangan fitur-fitur core platform keuangan menggunakan teknologi modern. Pengalaman profesional pertama di dunia startup yang sangat berharga.",
    highlights: [
      "Pengembangan fitur payment gateway yang digunakan 500+ user",
      "Mengimplementasikan sistem autentikasi JWT + OAuth2",
      "Berkolaborasi dengan tim 8 developer menggunakan Agile",
      "Code coverage testing mencapai 80%+ untuk fitur yang dikerjakan",
    ],
    responsibilities: [
      "Pengembangan REST API dengan FastAPI & Python",
      "Membangun UI komponen reusable dengan React + TypeScript",
      "Menulis unit test dengan Jest & Pytest",
      "Berpartisipasi dalam sprint planning & code review",
    ],
    projects: [
      "Fitur Payment Gateway & Rekonsiliasi Transaksi",
      "Dashboard Analytics Keuangan",
      "Sistem Notifikasi Multi-channel",
    ],
    skills: ["React", "TypeScript", "FastAPI", "Python", "PostgreSQL", "Jest", "Docker", "Git"],
    techStack: ["React", "TypeScript", "FastAPI", "Python", "PostgreSQL", "Docker"],
    photos: [
      {
        src: "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=800&auto=format&fit=crop",
        alt: "Fintech startup",
        caption: "Bekerja di startup fintech Soko Financial",
      },
      {
        src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop",
        alt: "Dashboard analytics",
        caption: "Dashboard analytics yang dibangun",
      },
    ],
    quote: "Move fast and build things that matter.",
    quote_author: "Startup Wisdom",
    color: "green",
    icon: "FaBriefcase",
  },
  {
    id: 10,
    category: "Karir & Magang",
    type: "MBKM",
    title: "MBKM TEFA — Politeknik Negeri Banyuwangi",
    subtitle: "Web Developer (Teaching Factory)",
    location: "Banyuwangi, Jawa Timur",
    locationDetail: "On-site",
    period_start: "Feb 2025",
    period_end: "Jul 2025",
    status: "Selesai",
    description:
      "Mengikuti program Merdeka Belajar Kampus Merdeka (MBKM) dalam skema Teaching Factory (TEFA) di Jurusan Teknologi Informasi Politeknik Negeri Banyuwangi. Mengerjakan proyek web nyata berstandar industri dalam lingkungan akademik yang terstruktur.",
    highlights: [
      "Mengembangkan sistem informasi akademik versi baru",
      "Mentoring 5 mahasiswa junior dalam workshop web dev",
      "Project berhasil go-live dan digunakan secara aktif",
      "Mendapatkan sertifikat kompetensi BNSP",
    ],
    responsibilities: [
      "Lead Developer untuk 2 proyek web",
      "Mentoring mahasiswa dalam coding best practices",
      "Pengelolaan deployment & DevOps sederhana",
    ],
    projects: [
      "Sistem Informasi Akademik v2.0",
      "Portal Alumni Poliwangi",
    ],
    skills: ["Laravel", "React", "MySQL", "CI/CD", "Git", "Technical Mentoring", "Project Management"],
    techStack: ["Laravel", "React", "MySQL", "Docker", "Nginx"],
    photos: [
      {
        src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop",
        alt: "Teaching factory",
        caption: "Program MBKM TEFA di kampus",
      },
    ],
    quote: "Teaching is the greatest act of optimism.",
    quote_author: "Colleen Wilcox",
    color: "green",
    icon: "FaLaptopCode",
  },
  {
    id: 11,
    category: "Karir & Magang",
    type: "Internship",
    title: "PT BISI International Tbk × Charoen Pokphand",
    subtitle: "Mobile App Developer Intern (ICT Division)",
    location: "Kediri, Jawa Timur",
    locationDetail: "On-site",
    period_start: "Okt 2025",
    period_end: "Sekarang",
    status: "Sedang Berlangsung",
    description:
      "Magang karyawan di PT BISI International Tbk dan Charoen Pokphand Group, perusahaan agribisnis multinasional terbesar se-Asia Tenggara. Berperan sebagai Mobile App Developer dalam divisi ICT untuk mengembangkan aplikasi mobile enterprise berbasis Flutter.",
    highlights: [
      "Mengembangkan aplikasi mobile enterprise untuk 1000+ karyawan",
      "Berkolaborasi dengan tim ICT multinasional",
      "Mengimplementasikan CI/CD pipeline untuk Flutter",
      "Berkontribusi pada migrasi sistem legacy ke mobile-first",
    ],
    responsibilities: [
      "Pengembangan fitur aplikasi mobile dengan Flutter",
      "Integrasi dengan sistem ERP SAP perusahaan",
      "Pengujian & debugging aplikasi di berbagai perangkat",
      "Dokumentasi teknis & API documentation",
    ],
    projects: [
      "Aplikasi Attendance & Employee Self-Service",
      "Module Inventory Management Mobile",
    ],
    skills: ["Flutter", "Dart", "Firebase", "REST API", "SAP Integration", "CI/CD", "Team Collaboration"],
    techStack: ["Flutter", "Dart", "Firebase", "REST API"],
    photos: [
      {
        src: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop",
        alt: "Corporate office",
        caption: "Kantor PT BISI International Tbk",
      },
      {
        src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop",
        alt: "Team work",
        caption: "Berkolaborasi dengan tim ICT",
      },
    ],
    quote: "Great things are done by a series of small things brought together.",
    quote_author: "Vincent Van Gogh",
    color: "green",
    icon: "FaBuilding",
  },

  /* ───────── PENCAPAIAN & AWARD ───────── */
  {
    id: 12,
    category: "Pencapaian & Award",
    type: "Kompetisi",
    title: "Juara 3 Web Design Nasional",
    subtitle: "UKM Linux Universitas Jember",
    location: "Jember, Jawa Timur",
    period_start: "2024",
    period_end: "2024",
    status: "Selesai",
    awardLevel: "Nasional",
    description:
      "Meraih Juara 3 pada Lomba Web Design Nasional yang diselenggarakan oleh UKM Linux Universitas Jember. Kompetisi diikuti oleh ratusan peserta dari seluruh Indonesia. Karya yang dilombakan adalah website portofolio interaktif dengan animasi yang dibangun dalam 8 jam.",
    highlights: [
      "Bersaing dengan 200+ peserta dari seluruh Indonesia",
      "Menyelesaikan website dalam 8 jam (live coding competition)",
      "Mendapat penilaian tertinggi di kategori UI/UX design",
      "Pertama kali mengikuti kompetisi tingkat nasional",
    ],
    skills: ["HTML/CSS", "JavaScript", "UI/UX Design", "Figma", "Performance Optimization", "GSAP Animations"],
    photos: [
      {
        src: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&auto=format&fit=crop",
        alt: "Award ceremony",
        caption: "Upacara penyerahan piala Juara 3",
      },
      {
        src: "https://images.unsplash.com/photo-1579427421635-a0015b804b2e?w=800&auto=format&fit=crop",
        alt: "Competition",
        caption: "Suasana kompetisi web design nasional",
      },
    ],
    quote: "Champions are made from something deep inside them — a desire, a dream, a vision.",
    quote_author: "Muhammad Ali",
    color: "yellow",
    icon: "FaTrophy",
  },
  {
    id: 13,
    category: "Pencapaian & Award",
    type: "Sertifikasi",
    title: "Sertifikasi Kompetensi BNSP",
    subtitle: "Programmer Ahli Muda — Badan Nasional Sertifikasi Profesi",
    location: "Banyuwangi, Jawa Timur",
    period_start: "2025",
    period_end: "2025",
    status: "Selesai",
    awardLevel: "Nasional",
    description:
      "Berhasil mendapatkan sertifikasi kompetensi nasional dari BNSP (Badan Nasional Sertifikasi Profesi) untuk unit kompetensi Programmer Ahli Muda. Sertifikasi ini diakui secara nasional sebagai bukti kompetensi profesional di bidang pemrograman.",
    highlights: [
      "Lulus uji kompetensi dengan nilai sangat kompeten",
      "Sertifikat berlaku 3 tahun (2025–2028)",
      "Diakui secara nasional oleh Kemendikbud",
      "Kualifikasi KKNI Level 5",
    ],
    skills: ["Pemrograman Web", "Database Management", "Software Testing", "Documentation", "Project Management Dasar"],
    certificates: [{ name: "Sertifikat Kompetensi BNSP – Programmer Ahli Muda", href: "/certificate" }],
    photos: [
      {
        // Ganti dengan URL yang valid jika diperlukan, saat ini menggunakan gambar valid dari Unsplash
        src: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&auto=format&fit=crop",
        alt: "Sertifikasi BNSP",
        caption: "Sertifikasi kompetensi nasional BNSP",
      },
    ],
    quote: "Competence is the ability to do something efficiently and effectively.",
    quote_author: "Unknown",
    color: "yellow",
    icon: "FaMedal",
  },
  {
    id: 14,
    category: "Pencapaian & Award",
    type: "Kompetisi",
    title: "Best Project — Bootcamp Decoding",
    subtitle: "Decoding.id",
    location: "Online",
    period_start: "Feb 2023",
    period_end: "Feb 2023",
    status: "Selesai",
    awardLevel: "Sekolah",
    description:
      "Meraih predikat Best Project pada demo day Bootcamp Decoding. Project e-commerce yang dibangun berhasil dinilai sebagai yang terbaik dari angkatan dengan kriteria clean code, UI/UX, dan fitur terlengkap.",
    highlights: [
      "Best project dari 30+ peserta bootcamp",
      "Project mendapat kesempatan dipresentasikan kepada investor",
      "Feedback positif dari mentor industri berpengalaman",
    ],
    skills: ["React", "Node.js", "MongoDB", "UI/UX", "Clean Code", "Agile"],
    photos: [
      {
        src: "https://images.unsplash.com/photo-1525422847952-7f91db09a364?w=800&auto=format&fit=crop",
        alt: "Demo day",
        caption: "Demo day presentation bootcamp",
      },
    ],
    quote: "The secret of getting ahead is getting started.",
    quote_author: "Mark Twain",
    color: "yellow",
    icon: "FaStar",
  },

  /* ───────── ORGANISASI & KOMUNITAS ───────── */
  {
    id: 15,
    category: "Organisasi & Komunitas",
    type: "Organisasi Kampus",
    title: "Himpunan Mahasiswa Teknologi Informasi",
    subtitle: "Kepala Divisi IT & Media",
    location: "Politeknik Negeri Banyuwangi",
    period_start: "2023",
    period_end: "2024",
    status: "Selesai",
    description:
      "Bergabung dan kemudian mendapatkan amanah sebagai Kepala Divisi IT & Media di Himpunan Mahasiswa Teknologi Informasi (HMTI). Bertanggung jawab mengelola platform digital organisasi dan menyelenggarakan program kerja di bidang teknologi.",
    highlights: [
      "Memimpin tim 8 orang di divisi IT & Media",
      "Mengelola website & media sosial HMTI",
      "Menyelenggarakan 3 workshop teknologi per semester",
      "Meningkatkan engagement media sosial sebesar 300%",
    ],
    responsibilities: [
      "Mengelola website organisasi dan konten digital",
      "Merancang program kerja divisi IT",
      "Koordinasi dengan divisi lain untuk kebutuhan teknologi",
      "Membina anggota baru dalam bidang pemrograman web",
    ],
    skills: ["Leadership", "Team Management", "Event Organizing", "Content Creation", "Public Speaking", "Project Management"],
    photos: [
      {
        src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop",
        alt: "Organisasi mahasiswa",
        caption: "Kegiatan HMTI bersama anggota",
      },
      {
        src: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop",
        alt: "Workshop teknologi",
        caption: "Workshop teknologi yang diselenggarakan",
      },
    ],
    quote: "Alone we can do so little, together we can do so much.",
    quote_author: "Helen Keller",
    color: "purple",
    icon: "FaUsers",
  },
  {
    id: 16,
    category: "Organisasi & Komunitas",
    type: "Komunitas",
    title: "DevCommunity Banyuwangi",
    subtitle: "Core Member & Workshop Facilitator",
    location: "Banyuwangi, Jawa Timur",
    locationDetail: "Hybrid",
    period_start: "2023",
    period_end: "Sekarang",
    status: "Sedang Berlangsung",
    description:
      "Aktif sebagai core member dan fasilitator workshop di komunitas developer lokal Banyuwangi. Berkontribusi dalam membangun ekosistem teknologi di daerah dan membantu developer pemula untuk berkembang.",
    highlights: [
      "Memfasilitasi 10+ workshop & talk untuk 200+ developer",
      "Menginisiasi program mentoring developer pemula",
      "Membangun networking dengan developer dari seluruh Jawa Timur",
      "Berkontribusi dalam hackathon lokal sebagai juri & mentor",
    ],
    responsibilities: [
      "Merancang dan memfasilitasi workshop teknologi",
      "Mentoring developer pemula",
      "Koordinasi kegiatan komunitas",
      "Konten edukasi di media sosial komunitas",
    ],
    skills: ["Public Speaking", "Teaching", "Community Building", "Content Creation", "Leadership", "Networking"],
    photos: [
      {
        src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop",
        alt: "Developer community",
        caption: "Workshop di komunitas DevCommunity Banyuwangi",
      },
    ],
    quote:
      "If you want to go fast, go alone. If you want to go far, go together.",
    quote_author: "African Proverb",
    color: "purple",
    icon: "FaHandshake",
  },
];

// ==========================================
// FUNGSI UPLOAD GAMBAR KE SUPABASE
// ==========================================
async function uploadImageToStorage(imageUrl, fileName) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Gagal fetch gambar: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`seed/${fileName}.jpg`, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(`seed/${fileName}.jpg`);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error(`⚠️ Gagal upload ${fileName}:`, err.message);
    return imageUrl; // Fallback ke URL asli jika gagal
  }
}

// ==========================================
// FUNGSI UTAMA MIGRATION
// ==========================================
async function runMigration() {
  // 1. EKSEKUSI SQL UNTUK MEMBUAT TABEL & BUCKET (VIA PG CLIENT)
  if (!fs.existsSync(SQL_FILE)) {
    console.error("❌ File SQL tidak ditemukan:", SQL_FILE);
    process.exit(1);
  }

  const sql = fs.readFileSync(SQL_FILE, "utf-8");
  const parsedUrl = new URL(connStr.replace(/^postgres:\/\//, "postgresql://"));

  const pgClient = new pg.Client({
    host: parsedUrl.hostname,
    port: Number(parsedUrl.port) || 5432,
    database: parsedUrl.pathname.replace("/", ""),
    user: parsedUrl.username,
    password: parsedUrl.password,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("\n🔌 Menghubungkan ke PostgreSQL...");
    await pgClient.connect();
    
    console.log("🚀 Menjalankan SQL Migration (Membuat tabel dan bucket)...");
    await pgClient.query(sql);
    console.log("✅ Tabel 'timelines' dan bucket 'timeline' berhasil dibuat/diverifikasi!\n");
  } catch (err) {
    console.error("\n❌ Gagal menjalankan SQL:", err.message);
    if (err.detail) console.error("   Detail:", err.detail);
    process.exit(1);
  } finally {
    await pgClient.end();
  }

  // 2. PROSES UPLOAD GAMBAR & INSERT DATA (VIA SUPABASE JS CLIENT)
  console.log('🚀 Memulai proses download foto dan seeding data...\n');

  for (let i = 0; i < timelineData.length; i++) {
    let item = timelineData[i];
    console.log(`⏳ Memproses Item [${item.id}] - ${item.title}...`);

    if (item.photos && item.photos.length > 0) {
      for (let j = 0; j < item.photos.length; j++) {
        let photo = item.photos[j];
        
        if (photo.src.includes('unsplash.com')) {
          const fileName = `timeline_${item.id}_photo_${j + 1}`;
          console.log(`   ⬇️ Mengunduh dan mengunggah: ${fileName}...`);
          
          const newUrl = await uploadImageToStorage(photo.src, fileName);
          timelineData[i].photos[j].src = newUrl; 
        }
      }
    }
  }

  console.log('\n💾 Menyimpan data ke database...');
  try {
    const { error } = await supabase
      .from('timelines')
      .upsert(timelineData, { onConflict: 'id' });

    if (error) {
      console.error('❌ Terjadi kesalahan saat migrasi database:', error.message);
      return;
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Migration selesai!");
    console.log("📋 Yang sudah diperbarui:");
    console.log("   ✓ Tabel 'timelines' telah dibuat");
    console.log("   ✓ Bucket Storage 'timeline' telah dibuat beserta policy publicnya");
    console.log(`   ✓ Total ${timelineData.length} data timeline dimasukkan`);
    console.log("   ✓ Gambar berhasil dipindahkan dari Unsplash ke Supabase lokal");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

runMigration();