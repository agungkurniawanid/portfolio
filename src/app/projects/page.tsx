"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Link from "next/link";
import {
  FaArrowLeft, FaStar, FaCodeBranch, FaExternalLinkAlt, FaGithub,
  FaLock, FaBriefcase, FaGraduationCap, FaRocket, FaMobileAlt,
  FaGlobe, FaBrain, FaBuilding,
} from "react-icons/fa";
import { SiGithub } from "react-icons/si";

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────── types ─────────────────────────── */

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  topics: string[];
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  updated_at: string;
  visibility: string;
}

type Category =
  | "all"
  | "academic"
  | "freelance"
  | "web"
  | "mobile"
  | "aiml"
  | "company";

interface ManualProject {
  id: string;
  title: string;
  description: string;
  tech: string[];
  category: "company" | "freelance";
  type: string;
  year: string;
  confidential?: boolean;
  liveUrl?: string;
}

/* ─────────────────────────── static data ───────────────────── */

const COMPANY_PROJECTS: ManualProject[] = [
  {
    id: "c1",
    title: "Sistem Informasi Manajemen Kepegawaian",
    description:
      "Internal HR management system for a government institution — handles employee attendance, payroll, performance evaluation, and document management.",
    tech: ["Laravel", "MySQL", "Bootstrap", "REST API"],
    category: "company",
    type: "Web App",
    year: "2024",
    confidential: true,
  },
  {
    id: "c2",
    title: "Dashboard Monitoring IoT Pabrik",
    description:
      "Real-time factory floor dashboard integrating sensor data streams, showing machine status, temperature, humidity, and production metrics.",
    tech: ["Next.js", "Node.js", "MQTT", "PostgreSQL", "Chart.js"],
    category: "company",
    type: "Web App",
    year: "2024",
    confidential: true,
  },
  {
    id: "c3",
    title: "Aplikasi POS untuk Retail",
    description:
      "Point-of-sale application for a retail chain with inventory management, cashier workflow, daily report generation, and multi-branch support.",
    tech: ["Flutter", "Firebase", "Dart"],
    category: "company",
    type: "Mobile App",
    year: "2023",
    confidential: true,
  },
  {
    id: "c4",
    title: "Platform E-Learning Internal",
    description:
      "Internal corporate e-learning platform featuring course management, video streaming, quiz engine, employee progress tracking, and certificate generation.",
    tech: ["Next.js", "TypeScript", "PostgreSQL", "AWS S3"],
    category: "company",
    type: "Web App",
    year: "2024",
    confidential: true,
  },
];

const OTHER_FREELANCE: ManualProject[] = [
  {
    id: "f1",
    title: "Website Profil Sekolah",
    description:
      "Informational website for a private school featuring news, announcement board, gallery, academic calendar, and admin CMS.",
    tech: ["Laravel", "MySQL", "TailwindCSS"],
    category: "freelance",
    type: "Web App",
    year: "2023",
    liveUrl: undefined,
  },
  {
    id: "f2",
    title: "Toko Online UMKM",
    description:
      "Simple online shop for a local UMKM business with product catalogue, WhatsApp order integration, and inventory dashboard.",
    tech: ["Next.js", "Firebase", "TailwindCSS"],
    category: "freelance",
    type: "Web App",
    year: "2024",
    liveUrl: undefined,
  },
  {
    id: "f3",
    title: "Sistem Absensi QR Code",
    description:
      "QR-code based attendance system for an educational institution with teacher/student roles, daily reports, and real-time admin panel.",
    tech: ["Flutter", "Laravel", "MySQL"],
    category: "freelance",
    type: "Mobile + Web",
    year: "2024",
    liveUrl: undefined,
  },
];

/* ─────────────────────────── helpers ───────────────────────── */

const LANG_COLOR: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Dart: "bg-blue-400",
  Python: "bg-yellow-500",
  Blade: "bg-red-400",
  "Jupyter Notebook": "bg-orange-400",
  PHP: "bg-indigo-500",
  HTML: "bg-orange-500",
};

const getLangColor = (lang: string | null) =>
  lang ? (LANG_COLOR[lang] ?? "bg-gray-400") : "bg-gray-400";

/** Map repo to an internal category */
const classifyRepo = (repo: GitHubRepo): Category => {
  const topics = repo.topics ?? [];
  const name = repo.name.toLowerCase();

  if (name === "agungkurniawanid" || name === "portfolio") return "all";  // skip profile/portfolio repo from category lists

  if (
    topics.includes("sign-language") ||
    topics.includes("lstm") ||
    name.includes("sibi") ||
    name.includes("skripsi") ||
    name.includes("thesis")
  )
    return "academic";

  if (topics.includes("paid-project") || topics.includes("freelance"))
    return "freelance";

  if (topics.includes("iot") || topics.includes("arduino")) return "aiml";

  if (
    topics.includes("deep-learning") ||
    topics.includes("cnn") ||
    topics.includes("lstm") ||
    topics.includes("machine-learning") ||
    repo.language === "Jupyter Notebook" ||
    name.includes("model") ||
    name.includes("classification")
  )
    return "aiml";

  if (
    repo.language === "Dart" ||
    topics.includes("flutter") ||
    name.includes("app") ||
    name.includes("mobile")
  )
    return "mobile";

  if (
    topics.includes("nextjs") ||
    topics.includes("laravel") ||
    topics.includes("ecommerce") ||
    topics.includes("marketplace") ||
    repo.language === "TypeScript" ||
    repo.language === "JavaScript" ||
    repo.language === "Blade" ||
    repo.language === "PHP" ||
    name.includes("web")
  )
    return "web";

  return "web";
};

const CATEGORY_META: Record<
  Exclude<Category, "all">,
  { label: string; icon: React.ReactNode; color: string; desc: string }
> = {
  academic: {
    label: "Academic / Thesis",
    icon: <FaGraduationCap size={14} />,
    color: "text-violet-400",
    desc: "Research & final thesis projects",
  },
  freelance: {
    label: "Freelance",
    icon: <FaBriefcase size={14} />,
    color: "text-yellow-400",
    desc: "Client & paid projects",
  },
  web: {
    label: "Web Projects",
    icon: <FaGlobe size={14} />,
    color: "text-blue-400",
    desc: "Frontend, backend & full-stack web",
  },
  mobile: {
    label: "Mobile Apps",
    icon: <FaMobileAlt size={14} />,
    color: "text-teal-400",
    desc: "Flutter & cross-platform apps",
  },
  aiml: {
    label: "AI / ML",
    icon: <FaBrain size={14} />,
    color: "text-pink-400",
    desc: "Machine learning, IoT & deep learning",
  },
  company: {
    label: "Company",
    icon: <FaBuilding size={14} />,
    color: "text-green-400",
    desc: "Professional / enterprise work",
  },
};

/* ─────────────────────────── sub-components ─────────────────── */

function RepoCard({ repo }: { repo: GitHubRepo }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 92%",
          once: true,
        },
      }
    );
  }, []);

  const cat = classifyRepo(repo);
  const meta = cat !== "all" ? CATEGORY_META[cat] : null;
  const updated = new Date(repo.updated_at).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
  });

  return (
    <div
      ref={ref}
      className="opacity-0 group flex flex-col gap-3 p-5 rounded-xl
        bg-white dark:bg-white/5
        border border-gray-100 dark:border-white/10
        hover:border-[#0acf83]/40 dark:hover:border-[#0acf83]/40
        hover:shadow-lg hover:shadow-[#0acf83]/10
        transition-all duration-300"
    >
      {/* header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <SiGithub
            size={14}
            className="text-gray-400 dark:text-white/40 shrink-0"
          />
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-gray-900 dark:text-white
              hover:text-[#0acf83] dark:hover:text-[#0acf83]
              transition-colors truncate"
          >
            {repo.name}
          </a>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {meta && (
            <span
              className={`hidden sm:flex items-center gap-1 text-[10px] font-medium px-2 py-0.5
              rounded-full bg-gray-100 dark:bg-white/10 ${meta.color}`}
            >
              {meta.icon}
              {meta.label}
            </span>
          )}
          {repo.homepage && (
            <a
              href={repo.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/10
                hover:bg-[#0acf83]/20 transition-colors"
              title="Live Demo"
            >
              <FaExternalLinkAlt
                size={10}
                className="text-gray-500 dark:text-white/60"
              />
            </a>
          )}
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/10
              hover:bg-[#0acf83]/20 transition-colors"
            title="GitHub"
          >
            <FaGithub
              size={10}
              className="text-gray-500 dark:text-white/60"
            />
          </a>
        </div>
      </div>

      {/* description */}
      <p className="text-xs text-gray-500 dark:text-white/50 line-clamp-2 flex-1">
        {repo.description ?? "No description provided."}
      </p>

      {/* topics */}
      {repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {repo.topics.slice(0, 4).map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium
                bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60"
            >
              {t}
            </span>
          ))}
          {repo.topics.length > 4 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-white/40">
              +{repo.topics.length - 4}
            </span>
          )}
        </div>
      )}

      {/* footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-3">
          {repo.language && (
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${getLangColor(
                  repo.language
                )}`}
              />
              <span className="text-[11px] text-gray-400 dark:text-white/40">
                {repo.language}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-white/40">
            <FaStar size={10} />
            <span>{repo.stargazers_count}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-white/40">
            <FaCodeBranch size={10} />
            <span>{repo.forks_count}</span>
          </div>
        </div>
        <span className="text-[10px] text-gray-300 dark:text-white/30">
          {updated}
        </span>
      </div>
    </div>
  );
}

function ManualProjectCard({ project }: { project: ManualProject }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 92%",
          once: true,
        },
      }
    );
  }, []);

  return (
    <div
      ref={ref}
      className="opacity-0 group flex flex-col gap-3 p-5 rounded-xl
        bg-white dark:bg-white/5
        border border-gray-100 dark:border-white/10
        hover:border-[#0acf83]/40 dark:hover:border-[#0acf83]/40
        hover:shadow-lg hover:shadow-[#0acf83]/10
        transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {project.confidential ? (
            <FaLock
              size={12}
              className="text-gray-400 dark:text-white/40 shrink-0"
            />
          ) : (
            <FaBriefcase
              size={12}
              className="text-yellow-400 shrink-0"
            />
          )}
          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {project.title}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`hidden sm:flex items-center gap-1 text-[10px] font-medium px-2 py-0.5
            rounded-full ${
              project.confidential
                ? "bg-red-50 dark:bg-red-900/20 text-red-400"
                : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500"
            }`}
          >
            {project.confidential ? (
              <>
                <FaLock size={9} /> Confidential
              </>
            ) : (
              <>
                <FaBriefcase size={9} /> Freelance
              </>
            )}
          </span>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/10
                hover:bg-[#0acf83]/20 transition-colors"
            >
              <FaExternalLinkAlt
                size={10}
                className="text-gray-500 dark:text-white/60"
              />
            </a>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-white/50 line-clamp-3 flex-1">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-1">
        {project.tech.map((t) => (
          <span
            key={t}
            className="px-2 py-0.5 rounded-full text-[10px] font-medium
              bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-white/10">
        <span className="text-[11px] text-gray-400 dark:text-white/40">
          {project.type}
        </span>
        <span className="text-[10px] text-gray-300 dark:text-white/30">
          {project.year}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────── loading skeleton ──────────────── */

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 animate-pulse">
      <div className="flex gap-2">
        <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-white/10" />
        <div className="h-3 w-40 rounded bg-gray-200 dark:bg-white/10" />
      </div>
      <div className="h-2.5 w-full rounded bg-gray-100 dark:bg-white/5" />
      <div className="h-2.5 w-3/4 rounded bg-gray-100 dark:bg-white/5" />
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-4 w-12 rounded-full bg-gray-100 dark:bg-white/5"
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── page ───────────────────────────── */

const CATEGORY_TABS: { id: Category; label: string; icon: React.ReactNode }[] =
  [
    { id: "all", label: "All Projects", icon: <FaRocket size={12} /> },
    {
      id: "academic",
      label: "Academic",
      icon: <FaGraduationCap size={12} />,
    },
    { id: "freelance", label: "Freelance", icon: <FaBriefcase size={12} /> },
    { id: "web", label: "Web", icon: <FaGlobe size={12} /> },
    { id: "mobile", label: "Mobile", icon: <FaMobileAlt size={12} /> },
    { id: "aiml", label: "AI / ML", icon: <FaBrain size={12} /> },
    { id: "company", label: "Company", icon: <FaBuilding size={12} /> },
  ];

export default function ProjectsPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Category>("all");
  const [search, setSearch] = useState("");

  /* fetch GitHub */
  useEffect(() => {
    const IGNORE_NAMES = ["agungkurniawanid", "portfolio"];

    fetch(
      "https://api.github.com/users/agungkurniawanid/repos?per_page=100&sort=updated&type=public"
    )
      .then((r) => r.json())
      .then((data: GitHubRepo[]) => {
        setRepos(data.filter((r) => !IGNORE_NAMES.includes(r.name)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* hero entrance */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-word",
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: "power3.out" }
      );
      gsap.fromTo(
        ".hero-sub",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, delay: 0.45, ease: "power2.out" }
      );
      gsap.fromTo(
        ".back-btn",
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, delay: 0.15, ease: "power2.out" }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  /* derived state */
  const classifiedRepos = repos.filter(
    (r) => classifyRepo(r) !== ("all" as Category)
  );

  const filteredRepos = classifiedRepos.filter((r) => {
    const matchCat =
      activeTab === "all" || classifyRepo(r) === activeTab;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      (r.description ?? "").toLowerCase().includes(q) ||
      r.topics.some((t) => t.includes(q)) ||
      (r.language ?? "").toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const filteredCompany = (
    activeTab === "all" || activeTab === "company"
      ? COMPANY_PROJECTS
      : []
  ).filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tech.some((t) => t.toLowerCase().includes(q))
    );
  });

  const filteredFreelance = (
    activeTab === "all" || activeTab === "freelance"
      ? OTHER_FREELANCE
      : []
  ).filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tech.some((t) => t.toLowerCase().includes(q))
    );
  });

  const totalVisible =
    filteredRepos.length + filteredCompany.length + filteredFreelance.length;

  /* count per tab */
  const tabCounts: Partial<Record<Category, number>> = {
    all: classifiedRepos.length + COMPANY_PROJECTS.length + OTHER_FREELANCE.length,
    academic: classifiedRepos.filter((r) => classifyRepo(r) === "academic").length,
    freelance:
      classifiedRepos.filter((r) => classifyRepo(r) === "freelance").length +
      OTHER_FREELANCE.length,
    web: classifiedRepos.filter((r) => classifyRepo(r) === "web").length,
    mobile: classifiedRepos.filter((r) => classifyRepo(r) === "mobile").length,
    aiml: classifiedRepos.filter((r) => classifyRepo(r) === "aiml").length,
    company: COMPANY_PROJECTS.length,
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0d1417] pt-[4.5rem]">
      {/* ── Hero ── */}
      <div
        ref={heroRef}
        className="relative overflow-hidden bg-white dark:bg-[#111a1d] border-b border-gray-100 dark:border-white/5"
      >
        {/* bg blobs */}
        <div className="pointer-events-none select-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-[#0acf83]/10 blur-[80px]" />
          <div className="absolute bottom-0 -left-20 w-[20rem] h-[20rem] rounded-full bg-[#0acf83]/8 blur-[60px]" />
        </div>

        <div className="relative max-w-[1100px] mx-auto px-[5%] py-16">
          <div className="overflow-hidden flex flex-wrap gap-x-3 text-4xl md:text-5xl lg:text-[3.4rem] font-semibold tracking-tight text-gray-900 dark:text-white leading-tight mb-5">
            {["All", "My", "Projects"].map((w, i) => (
              <span
                key={i}
                className={`hero-word inline-block ${
                  i === 0 ? "text-[#0acf83]" : ""
                }`}
              >
                {w}
              </span>
            ))}
          </div>

          <p className="hero-sub max-w-xl text-gray-500 dark:text-white/50 text-base md:text-lg leading-relaxed mb-8">
            A comprehensive list of everything I&apos;ve built — from open-source GitHub
            repositories to freelance client work, company projects, and academic research.
          </p>

          {/* stats row */}
          <div className="hero-sub flex flex-wrap gap-8">
            {[
              { v: classifiedRepos.length, l: "GitHub Repos" },
              { v: COMPANY_PROJECTS.length, l: "Company Projects" },
              { v: OTHER_FREELANCE.length + classifiedRepos.filter(r => r.topics.includes("paid-project")).length, l: "Freelance Projects" },
              { v: classifiedRepos.filter(r => classifyRepo(r) === "aiml").length, l: "AI/ML Projects" },
            ].map((s) => (
              <div key={s.l} className="flex flex-col">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {s.v}
                  <span className="text-[#0acf83]">+</span>
                </span>
                <span className="text-xs text-gray-400 dark:text-white/40 mt-0.5 font-medium tracking-wide uppercase">
                  {s.l}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="sticky top-[4.5rem] z-40 bg-gray-50/80 dark:bg-[#0d1417]/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5">
        <div className="max-w-[1100px] mx-auto px-[5%]">
          {/* category tabs — horizontal scroll on mobile */}
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-none">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium
                  whitespace-nowrap transition-all duration-200 shrink-0
                  ${
                    activeTab === tab.id
                      ? "bg-[#0acf83] text-white shadow-md"
                      : "bg-white dark:bg-white/5 text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-100 dark:border-white/10"
                  }`}
              >
                {tab.icon}
                {tab.label}
                {tabCounts[tab.id] !== undefined && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] leading-none font-bold
                    ${
                      activeTab === tab.id
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/40"
                    }`}
                  >
                    {tabCounts[tab.id]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* search */}
          <div className="pb-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, language, or topic…"
              className="w-full max-w-md text-sm px-4 py-2 rounded-lg
                bg-white dark:bg-white/5
                border border-gray-200 dark:border-white/10
                text-gray-700 dark:text-white/80
                placeholder-gray-400 dark:placeholder-white/30
                focus:outline-none focus:border-[#0acf83]/60 focus:ring-1 focus:ring-[#0acf83]/30
                transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-[1100px] mx-auto px-[5%] py-10 space-y-14">

        {/* Section: GitHub Repos */}
        {(activeTab !== "company") && (
          <div>
            <SectionHeader
              icon={<SiGithub size={18} />}
              title="GitHub Open Source"
              count={filteredRepos.length}
              description="Public repositories from my GitHub profile"
              colorClass="text-gray-900 dark:text-white"
            />
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredRepos.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRepos.map((repo) => (
                  <RepoCard key={repo.id} repo={repo} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Section: Company Projects */}
        {filteredCompany.length > 0 && (
          <div>
            <SectionHeader
              icon={<FaBuilding size={16} />}
              title="Company Projects"
              count={filteredCompany.length}
              description="Professional enterprise work — confidential & not published on GitHub"
              colorClass="text-green-500 dark:text-green-400"
              badge={{ label: "Confidential", color: "bg-red-50 dark:bg-red-900/20 text-red-400" }}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompany.map((p) => (
                <ManualProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        )}

        {/* Section: Other Freelance */}
        {filteredFreelance.length > 0 && (
          <div>
            <SectionHeader
              icon={<FaBriefcase size={16} />}
              title="Freelance Projects"
              count={filteredFreelance.length}
              description="Client work & paid projects not published on GitHub"
              colorClass="text-yellow-500 dark:text-yellow-400"
              badge={{ label: "Paid Work", color: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500" }}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFreelance.map((p) => (
                <ManualProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        )}

        {/* empty overall */}
        {!loading && totalVisible === 0 && <EmptyState />}
      </div>

      {/* ── CTA footer ── */}
      <div className="border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#111a1d]">
        <div className="max-w-[1100px] mx-auto px-[5%] py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Want to collaborate on a project?
            </h3>
            <p className="text-sm text-gray-500 dark:text-white/50 mt-1">
              I&apos;m open to freelance work and new opportunities.
            </p>
          </div>
          <Link
            href="/#contact"
            className="contact_me_btn relative px-7 py-3 text-white text-sm font-semibold rounded-md shrink-0"
          >
            <div className="contact_me_btn_overlay" />
            <span className="relative z-10">Let&apos;s Talk</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

/* ── helpers ── */

function SectionHeader({
  icon, title, count, description, colorClass, badge,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  description: string;
  colorClass: string;
  badge?: { label: string; color: string };
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className={`mt-0.5 ${colorClass}`}>{icon}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className={`text-lg font-semibold ${colorClass}`}>{title}</h2>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/40">
            {count}
          </span>
          {badge && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>
              {badge.label}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 dark:text-white/40 mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <SiGithub size={32} className="text-gray-200 dark:text-white/10" />
      <p className="text-gray-400 dark:text-white/30 text-sm">
        No projects found for this filter.
      </p>
    </div>
  );
}
