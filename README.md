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
> The design and layout of the homepage (Home / Landing Page) on this portfolio was inspired by and references the template created by [**@devshinthant**](https://github.com/devshinthant). Huge appreciation for the incredible design work.
>
> All pages other than the homepage — including Skills, Projects, Blog, Guestbook, Gallery, Certificates, Timeline, Entertainment, Tech Stack, and Contact — are **independently improvised and developed** from scratch.

---

## ✨ Overview

This personal portfolio was built as a complete representation of a Software Engineer's identity, skills, and career journey. Beyond showcasing projects and skills, the site features a blog, real-time guestbook, photo gallery, certificate list, career timeline, and entertainment hub — all animated with GSAP and supporting three languages (Indonesian, English, German).

---

## 🚀 Tech Stack

### Core

| Technology | Description |
|---|---|
| **Next.js 15** | App Router (SSR + Client Components) |
| **React 18** | UI Library |
| **TypeScript 5** | Type Safety |
| **Tailwind CSS 3** | Utility-first Styling |

### Backend & Database

| Technology | Description |
|---|---|
| **Supabase** | PostgreSQL backend for dynamic content |
| **Next.js API Routes** | Proxy endpoints for Steam, Spotify, Notion, GitHub |

### Animation & UI

| Library | Description |
|---|---|
| **GSAP + ScrollTrigger** | Scroll and entrance animations per section |
| **SplitType** | Text character reveal effect |
| **Lottie React** | JSON animation on hero section |
| **Canvas Confetti** | Confetti burst on guestbook submission |
| **react-rough-notation** | Handwriting-style annotations |
| **yet-another-react-lightbox** | Lightbox for photo gallery |
| **react-masonry-css** | Masonry grid layout |

### State & i18n

| Library | Description |
|---|---|
| **Zustand 5** | Global state management |
| **next-intl 4** | Internationalization (id / en / de) |

### Others

| Library | Description |
|---|---|
| **EmailJS** | Contact form & welcome popup |
| **TipTap** | Rich text editor for blog |
| **react-pdf** | PDF viewer for certificates |
| **ShadCN UI + Radix UI** | Accessible UI components |

---

## 📄 Pages & Features

### 🏠 Homepage (`/`) *(Design template by [@devshinthant](https://github.com/devshinthant))*

The main landing page consisting of several sections:

- **Mouse Section** — interactive cursor effect
- **Hero Section** — name, role, tagline, two spinning disk images, Lottie animation, WhatsApp CTA, social links, GSAP text reveal
- **About Section** — profile photo with SVG decorations, 3 animated counters (years of experience, total projects, contributions), infinite horizontal scrolling tech strip
- **Projects Section** — featured project previews
- **Blog Section** — latest article previews
- **Contact Section** — EmailJS form + social media links

---

### 🧑‍💻 Skills (`/skills`) *(Independently developed)*

A page listing technical skills fetched from Supabase.

- **7 Categories**: Frontend, Backend, AI/ML, Mobile, DevOps, Database, Cloud
- Each skill displays an icon, name, animated proficiency bar (GSAP `0% → N%`), and percentage
- Proficiency levels: Expert (green ≥90%), Advanced (blue ≥80%), Proficient (yellow ≥70%), Familiar (gray)
- Hero stats: total technologies, number of categories, expert count, years of experience

---

### 💼 Projects (`/projects`) *(Independently developed)*

A portfolio page pulling data from three sources:

1. **GitHub Public Repos** — fetched directly via the GitHub REST API
2. **Private / Company Projects** — stored in Supabase (not published on GitHub)
3. **Freelance Projects** — hard-coded with full details

**Features:**
- Filter tabs: All, Academic, Freelance, Web, Mobile, AI/ML, Company + count per category
- Real-time search bar (name, description, topics, language)
- Per-project detail modal (`GitHubRepoDetailModal` / `PrivateProjectDetailModal`)
- Language color dots, star count, fork count
- Sticky filter bar

---

### 📝 Blog (`/blogs`, `/blogs/[id]`) *(Independently developed)*

A full-featured blog powered by TipTap editor.

- **Categories**: Technology, Tutorial, Tips & Tricks, Programming, Design, General, News, Career
- Search bar, grid/list view toggle, pagination (9 articles per page)
- Articles open in a modal (`ArticleModal`) with translation support
- Admin can write new articles via a write modal (gated with `ShieldCheck`)
- State managed via Zustand `BlogStore`

---

### 📓 Guestbook (`/guestbook`) *(Independently developed)*

A digital guestbook with real-time updates.

- **Real-time** via Supabase subscription — new messages appear instantly without page refresh
- Anti-spam using browser fingerprinting + localStorage check
- **Canvas confetti** on successful submission
- Masonry grid layout
- Filters: mood, star rating (1–5), city; sort: newest/oldest/rating/name
- Animated stat counters: total guests, cities, average rating, latest guest
- `GuestbookFormModal` with form validation

---

### 🖼️ Gallery (`/gallery`, `/gallery/album/[slug]`) *(Independently developed)*

A personal and guest photo gallery.

- **Two sections**: personal photos (from Supabase) + Guest Gallery (photos uploaded by visitors)
- Featured carousel at the top
- Masonry grid with lightbox (yet-another-react-lightbox)
- Filter by category, year, and sort options
- Visitors can register as guests and upload their own photos via API

---

### 🏆 Certificates (`/certificate`) *(Independently developed)*

A professional certificate list with PDF preview functionality.

- Data from Supabase
- **react-pdf** viewer to open certificates directly in the browser
- Filter by category, status (Valid/Expired/Lifetime), year
- Grid / list view toggle
- Download and preview button per certificate
- TranslateWidget per certificate card

---

### 🗓️ Timeline (`/timeline`) *(Independently developed)*

A chronological view of career and educational journey.

- Data from Supabase `timelines` table
- **5 Categories**: Education, Career & Internship, Course & Bootcamp, Achievement & Award, Organization & Community
- Alternating left-right layout on desktop, single column on mobile
- **Animated vertical fill line** triggered on scroll
- Typing effect in hero (4 alternating phrases with backspace animation)
- Animated stat counters in hero
- Photo grid with lightbox per timeline item
- TranslateWidget per card for on-the-fly translation
- Ascending/descending sort, filter pills per category with item count
- Pulsing "In Progress" badge for currently active items

---

### 🎮 Entertainment (`/entertainment`) *(Independently developed)*

A personal entertainment hub.

- **Tabs**: Dashboard, Games, Watch/Read, Music, Books
- **Lazy loaded** per tab for optimal performance
- Integrations with:
  - **Steam API** — PC games list
  - **Spotify** — favorite music
  - **Notion** — watch/reading list
  - **Mobile Games API** — mobile games
  - **Books API** — book list
- Global search across all tabs

---

### 🛠️ Tech Stack Page (`/tech-stack`) *(Independently developed)*

A personal catalog of tools and technologies used.

- **66 tools** grouped into **11 categories**: IDE, Design, Frameworks, Databases, DevOps, Browsers, Desktop Apps, Online Services, Entertainment, AI, Hardware
- Each item: name, colored icon, description, usage rating (1–5), badge (Favorite/Daily Use/Recommended/Tried), tags
- Computed stats: total tools, favorites, daily use count, number of categories

---

### 📬 Contact (`/contact`) *(Independently developed)*

A contact page with a form and all social media links.

- Full form integrated with **EmailJS**
- Links to: YouTube, TikTok, Spotify, Instagram, LinkedIn, WhatsApp, Telegram, Steam, Pinterest, Facebook, Gmail, Twitter/X

---

## 🌍 Internationalization (i18n)

Supports **3 languages** using `next-intl`:

| Code | Language |
|---|---|
| `id` | Indonesian (default) |
| `en` | English |
| `de` | Deutsch (German) |

Language preference is stored in `localStorage` and managed via Zustand `LanguageStore`. A language switcher is available in the header. The Timeline and Certificate pages also include a **TranslateWidget** for on-the-fly card content translation via `/api/translate`.

---

## 🎨 Design & Animation

| Feature | Details |
|---|---|
| **Brand Color** | `#0EBD7A` / `#0acf83` (accent green) |
| **Font** | Jost (Google Fonts) |
| **Theme** | Dark mode by default, toggleable to light mode |
| **GSAP ScrollTrigger** | Entrance animations for every main section |
| **SplitType** | Character-by-character text reveal on About section |
| **Lottie** | JSON animation in hero (xl screens) |
| **Spinning Disks** | Two webp images rotating infinitely via GSAP |
| **Infinite Scroll Strip** | Tech logo banner in About section |
| **Skill Bars** | `width: 0% → N%` animation triggered on scroll |
| **Timeline Fill Line** | Accent vertical line that extends on scroll |
| **Toast Notifications** | GSAP slide-up toast for form feedback |

---

## 🧩 Global Components

- **Header** — fixed navbar with backdrop blur, active link indicator, "More" dropdown, hamburger mobile nav, resume download, theme toggle, language switcher
- **GuestbookBanner** — dismissible banner above the header with shimmer animation, height managed by Zustand
- **WelcomePopup** — appears on first visit, contains a star rating + EmailJS message form, with fingerprint deduplication

---

## 🗄️ Database (Supabase Tables)

| Table | Content |
|---|---|
| `guestbook` | Guest messages with real-time subscription |
| `timelines` | Career/education timeline items |
| `skills` | Skill data with category, level, icon |
| `projects` | Private/company projects |
| `portfolio_stats` | Stats (years of experience, contributions, project count) |
| `gallery` / `gallery_albums` / `gallery_guests` | Photo gallery management |
| `certificates` | Certificate data with PDF URLs |

---

## 📁 Project Structure

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
│   │   └── api/              # API Routes (Steam, Spotify, GitHub, etc.)
│   ├── components/           # Reusable UI components
│   ├── stores/               # Zustand stores
│   ├── lib/                  # Utilities & Supabase client
│   └── messages/             # i18n translations (id/en/de)
├── public/                   # Static assets
└── ...config files
```

---

## ⚙️ Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/agungkurniawanid/portfolio.git
cd portfolio

# 2. Install dependencies
npm install

# 3. Copy and fill in environment variables
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

Open `http://localhost:3000` in your browser.

### Required Environment Variables

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

MIT License — feel free to use this as a reference or template for your own portfolio.

---

<div align="center">
  <p>Built with ❤️ by <strong>Agung Kurniawan</strong></p>
  <a href="https://gungzzleefy.vercel.app/">gungzzleefy.vercel.app</a>
  <br/><br/>
  <sub>Homepage design inspired by <a href="https://github.com/devshinthant">@devshinthant</a></sub>
</div>