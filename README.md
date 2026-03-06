<div align="center">
  <h1>🌐 Agung Kurniawan — Personal Portfolio</h1>
  <p>A full-featured personal portfolio website built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.</p>

  <a href="https://gungzzleefy.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Live-gungzzleefy.vercel.app-0EBD7A?style=for-the-badge&logo=vercel" alt="Live Site" />
  </a>
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=nextdotjs" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?style=for-the-badge&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Supabase-Backend-3FCF8E?style=for-the-badge&logo=supabase" />
</div>

---

## 🎨 Design Credits & Attribution

> **Homepage Design Template**
>
> Desain dan layout halaman utama (Home / Beranda) pada portofolio ini terinspirasi dan mengambil referensi template dari karya milik [**@devshinthant**](https://github.com/devshinthant). Apresiasi sebesar-besarnya atas desain yang luar biasa tersebut.
>
> Seluruh halaman lain selain halaman beranda — termasuk Skills, Projects, Blog, Guestbook, Gallery, Certificates, Timeline, Entertainment, Tech Stack, dan Contact — merupakan **improvisasi dan pengembangan mandiri** yang dirancang dan dibangun sendiri.

---

## ✨ Overview

Portfolio personal ini dibangun sebagai representasi lengkap dari identitas, kemampuan, dan perjalanan karier seorang Software Engineer. Tidak hanya menampilkan proyek dan skill, situs ini dilengkapi dengan blog, guestbook real-time, galeri foto, daftar sertifikat, timeline karier, dan entertainment hub — semuanya dianimasikan menggunakan GSAP dan mendukung tiga bahasa (Indonesia, Inggris, Jerman).

---

## 🚀 Tech Stack

### Core

| Teknologi | Keterangan |
|---|---|
| **Next.js 15** | App Router (SSR + Client Components) |
| **React 18** | UI Library |
| **TypeScript 5** | Type Safety |
| **Tailwind CSS 3** | Utility-first Styling |

### Backend & Database

| Teknologi | Keterangan |
|---|---|
| **Supabase** | PostgreSQL backend untuk konten dinamis |
| **Next.js API Routes** | Proxy endpoints untuk Steam, Spotify, Notion, GitHub |

### Animasi & UI

| Library | Keterangan |
|---|---|
| **GSAP + ScrollTrigger** | Animasi scroll dan entrance per section |
| **SplitType** | Text character reveal effect |
| **Lottie React** | JSON animation pada hero |
| **Canvas Confetti** | Confetti burst pada guestbook |
| **react-rough-notation** | Anotasi bergaya tulisan tangan |
| **yet-another-react-lightbox** | Lightbox untuk galeri foto |
| **react-masonry-css** | Masonry grid layout |

### State & i18n

| Library | Keterangan |
|---|---|
| **Zustand 5** | Global state management |
| **next-intl 4** | Internasionalisasi (id / en / de) |

### Lainnya

| Library | Keterangan |
|---|---|
| **EmailJS** | Contact form & welcome popup |
| **TipTap** | Rich text editor untuk blog |
| **react-pdf** | PDF viewer untuk sertifikat |
| **ShadCN UI + Radix UI** | Komponen UI yang aksesibel |

---

## 📄 Halaman & Fitur

### 🏠 Homepage (`/`) *(Design template dari [@devshinthant](https://github.com/devshinthant))*

Halaman utama yang terdiri dari beberapa section:

- **Mouse Section** — efek kursor interaktif
- **Hero Section** — nama, role, tagline, dua spinning disk image, Lottie animation, CTA WhatsApp, social links, GSAP text reveal
- **About Section** — foto profil dengan dekorasi SVG, 3 animated counter (years of experience, total projects, contributions), infinite horizontal scrolling tech strip
- **Projects Section** — preview proyek unggulan
- **Blog Section** — preview artikel terbaru
- **Contact Section** — form EmailJS + social media links

---

### 🧑‍💻 Skills (`/skills`) *(Improvisasi mandiri)*

Halaman daftar kemampuan teknis yang diambil dari Supabase.

- **7 Kategori**: Frontend, Backend, AI/ML, Mobile, DevOps, Database, Cloud
- Setiap skill menampilkan ikon, nama, proficiency bar animasi (GSAP `0% → N%`), dan persentase
- Level coding: Expert (hijau ≥90%), Advanced (biru ≥80%), Proficient (kuning ≥70%), Familiar (abu)
- Stat hero: total teknologi, jumlah kategori, jumlah expert, tahun pengalaman

---

### 💼 Projects (`/projects`) *(Improvisasi mandiri)*

Halaman portofolio proyek dari tiga sumber data:

1. **GitHub Public Repos** — diambil langsung via GitHub REST API
2. **Private / Company Projects** — disimpan di Supabase (tidak dipublikasikan di GitHub)
3. **Freelance Projects** — hard-coded dengan detail lengkap

**Fitur:**
- Filter tab: All, Academic, Freelance, Web, Mobile, AI/ML, Company + jumlah per kategori
- Search bar realtime (nama, deskripsi, topik, bahasa)
- Modal detail per proyek (`GitHubRepoDetailModal` / `PrivateProjectDetailModal`)
- Language color dots, star, fork count
- Sticky filter bar

---

### 📝 Blog (`/blogs`, `/blogs/[id]`) *(Improvisasi mandiri)*

Blog lengkap dengan editor TipTap.

- **Kategori**: Technology, Tutorial, Tips & Tricks, Programming, Design, General, News, Career
- Search bar, toggle tampilan grid/list, pagination (9 artikel per halaman)
- Artikel dibuka dalam modal (`ArticleModal`) dengan fitur terjemahan
- Admin dapat menulis artikel baru via write modal (gated dengan `ShieldCheck`)
- State dikelola via Zustand `BlogStore`

---

### 📓 Guestbook (`/guestbook`) *(Improvisasi mandiri)*

Buku tamu digital dengan pembaruan real-time.

- **Real-time** via Supabase subscription — pesan baru langsung muncul tanpa refresh
- Anti-spam menggunakan browser fingerprinting + localStorage check
- **Canvas confetti** setelah berhasil submit
- Masonry grid layout
- Filter: mood, rating bintang (1–5), kota; sort: terbaru/terlama/rating/nama
- Animated stat counter: total tamu, kota, rata-rata rating, tamu terakhir
- `GuestbookFormModal` dengan validasi form

---

### 🖼️ Gallery (`/gallery`, `/gallery/album/[slug]`) *(Improvisasi mandiri)*

Galeri foto personal dan tamu.

- **Dua seksi**: foto personal (dari Supabase) + Guest Gallery (foto yang diunggah pengunjung)
- Featured carousel di bagian atas
- Masonry grid dengan lightbox (yet-another-react-lightbox)
- Filter berdasarkan kategori, tahun, dan sort options
- Pengunjung dapat mendaftar sebagai tamu dan mengunggah foto sendiri via API

---

### 🏆 Certificates (`/certificate`) *(Improvisasi mandiri)*

Daftar sertifikat profesional dengan fitur preview PDF.

- Data dari Supabase
- **react-pdf** viewer untuk membuka sertifikat langsung di browser
- Filter berdasarkan kategori, status (Valid/Expired/Lifetime), tahun
- Toggle tampilan grid / list
- Tombol download dan preview per sertifikat
- TranslateWidget per kartu sertifikat

---

### 🗓️ Timeline (`/timeline`) *(Improvisasi mandiri)*

Perjalanan karier dan pendidikan secara kronologis.

- Data dari Supabase `timelines` table
- **5 Kategori**: Education, Career & Internship, Course & Bootcamp, Achievement & Award, Organization & Community
- Layout alternating kiri-kanan di desktop, single column di mobile
- **Animated vertical line** yang terisi saat scroll
- Efek typing di hero (4 frasa bergantian dengan backspace animation)
- Animated stat counter di hero
- Grid foto dengan lightbox per item timeline
- TranslateWidget per kartu untuk terjemahan on-the-fly
- Sort ascending/descending, filter pills per kategori dengan jumlah item
- Pulsing badge "Sedang Berlangsung" untuk item yang masih aktif

---

### 🎮 Entertainment (`/entertainment`) *(Improvisasi mandiri)*

Hub hiburan personal.

- **Tab**: Dashboard, Games, Watch/Read, Music, Books
- **Lazy loaded** per tab untuk performa optimal
- Integrasi dengan:
  - **Steam API** — daftar game PC
  - **Spotify** — musik favorit
  - **Notion** — daftar tontonan/bacaan
  - **Mobile Games API** — game mobile
  - **Books API** — daftar buku
- Global search lintas tab

---

### 🛠️ Tech Stack Page (`/tech-stack`) *(Improvisasi mandiri)*

Katalog personal tools dan teknologi yang digunakan.

- **66 item tools** yang dikelompokkan dalam **11 kategori**: IDE, Design, Frameworks, Databases, DevOps, Browsers, Desktop Apps, Online Services, Entertainment, AI, Hardware
- Setiap item: nama, ikon berwarna, deskripsi, usage rating (1–5), badge (Favorite/Daily Use/Recommended/Pernah Dicoba), tags
- Computed stats: total tools, favorites, daily use count, jumlah kategori

---

### 📬 Contact (`/contact`) *(Improvisasi mandiri)*

Halaman kontak dengan form dan semua social media.

- Form lengkap terintegrasi dengan **EmailJS**
- Link ke: YouTube, TikTok, Spotify, Instagram, LinkedIn, WhatsApp, Telegram, Steam, Pinterest, Facebook, Gmail, Twitter/X

---

## 🌍 Internasionalisasi (i18n)

Mendukung **3 bahasa** menggunakan `next-intl`:

| Kode | Bahasa |
|---|---|
| `id` | Indonesia (default) |
| `en` | English |
| `de` | Deutsch (German) |

Preferensi bahasa disimpan di `localStorage` dan dikelola via Zustand `LanguageStore`. Language switcher tersedia di header. Halaman Timeline dan Certificate juga memiliki **TranslateWidget** untuk menerjemahkan konten kartu secara langsung via `/api/translate`.

---

## 🎨 Desain & Animasi

| Fitur | Detail |
|---|---|
| **Brand Color** | `#0EBD7A` / `#0acf83` (accent green) |
| **Font** | Jost (Google Fonts) |
| **Theme** | Dark mode default, toggle ke light mode |
| **GSAP ScrollTrigger** | Entrance animation di setiap section utama |
| **SplitType** | Character-by-character text reveal pada About section |
| **Lottie** | JSON animation di hero (layar xl) |
| **Spinning Disks** | Dua gambar webp berputar dengan GSAP infinite rotation |
| **Infinite Scroll Strip** | Banner tech logos di About section |
| **Skill Bars** | Animasi `width: 0% → N%` dipicu saat scroll |
| **Timeline Fill Line** | Garis vertikal aksen yang memanjang saat scroll |
| **Toast Notifications** | GSAP slide-up toast untuk form feedback |

---

## 🧩 Komponen Global

- **Header** — fixed navbar dengan backdrop blur, active link indicator, dropdown "Lainnya", hamburger mobile nav, resume download, theme toggle, language switcher
- **GuestbookBanner** — dismissible banner di atas header dengan shimmer animation, tinggi dikelola Zustand
- **WelcomePopup** — muncul saat kunjungan pertama, berisi star rating + form pesan via EmailJS, dengan fingerprint deduplication

---

## 🗄️ Database (Supabase Tables)

| Tabel | Konten |
|---|---|
| `guestbook` | Pesan tamu dengan realtime subscription |
| `timelines` | Item timeline karier/pendidikan |
| `skills` | Data skill dengan kategori, level, ikon |
| `projects` | Proyek private/company |
| `portfolio_stats` | Stats (years exp, contributions, project count) |
| `gallery` / `gallery_albums` / `gallery_guests` | Manajemen galeri foto |
| `certificates` | Data sertifikat dengan URL PDF |

---

## 📁 Struktur Project

```
portfolio/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── page.tsx          # Homepage
│   │   ├── skills/
│   │   ├── projects/
│   │   ├── blogs/
│   │   ├── guestbook/
│   │   ├── gallery/
│   │   ├── certificate/
│   │   ├── timeline/
│   │   ├── entertainment/
│   │   ├── tech-stack/
│   │   ├── contact/
│   │   └── api/              # API Routes (Steam, Spotify, GitHub, dll)
│   ├── components/           # Reusable UI components
│   ├── stores/               # Zustand stores
│   ├── lib/                  # Utilities & Supabase client
│   └── messages/             # i18n translations (id/en/de)
├── public/                   # Static assets
└── ...config files
```

---

## ⚙️ Menjalankan Secara Lokal

```bash
# 1. Clone repository
git clone https://github.com/agungkurniawanid/portfolio.git
cd portfolio

# 2. Install dependencies
npm install

# 3. Salin dan isi environment variables
cp .env.example .env.local

# 4. Jalankan development server
npm run dev
```

Buka `http://localhost:3000` di browser.

### Environment Variables yang Dibutuhkan

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# EmailJS
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=

# GitHub
GITHUB_TOKEN=

# Steam
STEAM_API_KEY=
STEAM_USER_ID=

# Spotify
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=

# Notion
NOTION_API_KEY=
NOTION_DATABASE_ID=
```

---

## 📜 License

MIT License — bebas digunakan sebagai referensi atau template portofolio Anda sendiri.

---

<div align="center">
  <p>Built with ❤️ by <strong>Agung Kurniawan</strong></p>
  <a href="https://gungzzleefy.vercel.app/">gungzzleefy.vercel.app</a>
  <br/><br/>
  <sub>Homepage design inspired by <a href="https://github.com/devshinthant">@devshinthant</a></sub>
</div>