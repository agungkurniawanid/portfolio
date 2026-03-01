"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import {
  Download, Mail, MapPin, GraduationCap, Briefcase, Globe,
  Calendar, Star, Target, Rocket, Lightbulb,
  Code2, Zap, Users, MessageSquare, Clock, Brain, Palette,
  Music, Gamepad2, Camera, Coffee, BookOpen, Cat,
  Quote, ExternalLink, Award, CheckCircle2, Cpu,
} from "lucide-react";
import {
  SiReact, SiNextdotjs, SiTypescript, SiJavascript, SiTailwindcss,
  SiFramer, SiNodedotjs, SiFastapi, SiLaravel,
  SiPython, SiPhp, SiTensorflow, SiPytorch, SiScikitlearn,
  SiDocker, SiGit, SiGithub, SiLinux, SiVercel,
  SiMongodb, SiMysql, SiPostgresql, SiFirebase, SiOpenai,
  SiCplusplus, SiDjango, SiFlask, SiNestjs, SiExpress,
} from "react-icons/si";
import ProfileImg from "@/assets/SAVE_20221213_123032 (1).jpg";
import { cn } from "@/lib/Utils";

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────── helpers ─────────────────────────── */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─────────────────────────── data ─────────────────────────── */

const stats = [
  { label: "Projects Selesai", value: 50, suffix: "+", icon: <Code2 size={22} /> },
  { label: "Tahun Coding", value: 4, suffix: "+", icon: <Calendar size={22} /> },
  { label: "Teknologi Dikuasai", value: 30, suffix: "+", icon: <Cpu size={22} /> },
  { label: "Sertifikat", value: 8, suffix: "+", icon: <Award size={22} /> },
];

const timeline = [
  {
    year: "2022",
    title: "Lulus SMK & Mulai Coding",
    description: "Baru lulus SMK dan mulai serius belajar pemrograman dari nol. Memulai perjalanan dengan algoritma dan logika dasar.",
    icon: <GraduationCap size={18} />,
    color: "from-blue-500 to-cyan-500",
  },
  {
    year: "2022",
    title: "Belajar C++ Pertama Kali",
    description: "Teknologi pertama yang dipelajari adalah C++. Belajar fundamental pemrograman: variabel, loop, fungsi, dan OOP dasar.",
    icon: <SiCplusplus size={18} />,
    color: "from-cyan-500 to-teal-500",
  },
  {
    year: "2022",
    title: "Project Pertama: Aplikasi Kasir Laundry",
    description: "Berhasil membuat aplikasi kasir untuk laundry sebagai project pertama yang nyata. Pengalaman pertama membuat software yang berguna.",
    icon: <Code2 size={18} />,
    color: "from-teal-500 to-green-500",
  },
  {
    year: "2022",
    title: "Bootcamp Decoding",
    description: "Mengikuti bootcamp intensif di Decoding. Memperdalam web development modern, belajar ekosistem JavaScript secara menyeluruh.",
    icon: <Rocket size={18} />,
    color: "from-green-500 to-emerald-500",
  },
  {
    year: "2023",
    title: "Magang di Soko Financial Jogja",
    description: "Magang sebagai Full Stack Developer Remote di Soko Financial, Yogyakarta. Pengalaman profesional pertama di startup fintech.",
    icon: <Briefcase size={18} />,
    color: "from-emerald-500 to-accentColor",
  },
  {
    year: "2024",
    title: "Juara 3 Web Design Nasional",
    description: "Memenangkan Juara 3 Lomba Web Design Nasional yang diadakan oleh UKM Linux Universitas Jember. Pencapaian kompetitif yang membanggakan.",
    icon: <Star size={18} />,
    color: "from-yellow-500 to-orange-500",
  },
  {
    year: "2025",
    title: "MBKM TEFA – Web Developer",
    description: "Mengikuti program MBKM TEFA (Teaching Factory) di Jurusan Teknologi Informasi sebagai Web Developer. Mengerjakan proyek nyata berbasis web dalam lingkungan akademik industri.",
    icon: <Globe size={18} />,
    color: "from-orange-500 to-red-500",
  },
  {
    year: "2026",
    title: "Magang di PT BISI International & Charoen Pokphand",
    description: "Magang karyawan di PT BISI International Tbk dan Charoen Pokphand Group sebagai Mobile App Developer. Mengembangkan aplikasi mobile berbasis Flutter untuk mendukung operasional perusahaan enterprise.",
    icon: <Briefcase size={18} />,
    color: "from-red-500 to-pink-500",
  },
];

const experiences = [
  {
    company: "Charoen Pokphand Indonesia",
    position: "Information Communication Technology",
    period: "Oct 2025 – Present",
    location: "Kediri, East Java, Indonesia · On-site",
    description: "As an ICT Intern specialized in Mobile Development at Charoen Pokphand Indonesia, I am actively involved in the design, development, and maintenance of mobile applications that support the company's operational efficiency. I collaborate closely with the software engineering team to build user-friendly interfaces, write clean and maintainable code, and ensure seamless application performance across different devices.",
    stack: ["Flutter", "Firebase"],
    type: "Internship",
  },
  {
    company: "PT. BISI International, Tbk",
    position: "Mobile Developer",
    period: "Oct 2025 – Present",
    location: "Kediri, East Java, Indonesia · On-site",
    description: "As a Mobile Developer Intern at PT. BISI International, Tbk in Kediri, I contribute to the development of mobile applications designed to streamline agricultural operations and enhance business efficiency. I work closely with the engineering team to build scalable features, optimize application performance, and ensure a seamless user experience for field staff and internal users.",
    stack: ["Flutter", "Firebase"],
    type: "Internship",
  },
  {
    company: "CV Dharma Adi Putra",
    position: "Network Technician",
    period: "Apr 2020 – Present",
    location: "Kabupaten Banyuwangi, East Java, Indonesia · Hybrid",
    description: "As a Network Technician at CV Dharma Adi Putra, I am responsible for the comprehensive maintenance of server and network infrastructure across both office and field environments. I oversee the installation of new network systems tailored to client needs while expertly troubleshooting connectivity issues to ensure stable service. Working within a hybrid system, I manage both on-site operations and remote monitoring.",
    stack: ["Network Installation", "Network Troubleshooting", "Network Services"],
    type: "Part-time",
  },
  {
    company: "CV Dharma Adi Putra",
    position: "Full Stack Developer",
    period: "Apr 2020 – Oct 2025",
    location: "Banyuwangi, East Java, Indonesia · Remote",
    description: "As a Full Stack Developer at CV Dharma Adi Putra, I engineer web and mobile applications that are seamlessly integrated with Mikrotik network infrastructure. I focus on developing specialized solutions for financial management, including automated transaction processing and billing systems.",
    stack: ["Flutter", "Next.js", "PostgreSQL"],
    type: "Part-time",
  },
  {
    company: "JTI Innovation Center",
    position: "Web Developer",
    period: "Feb 2025 – Jul 2025",
    location: "Jember, East Java, Indonesia · On-site",
    description: "As a Web Developer at JTI Innovation Center, I play a key role in developing web-based applications that strictly adhere to client requirements and functional standards. I ensure comprehensive feature implementation across both frontend and backend layers. Leveraging the Laravel framework, I construct efficient, structured, and scalable systems.",
    stack: ["Laravel", "Next.js"],
    type: "Contract",
  },
  {
    company: "SOKO FINANCIAL",
    position: "Full Stack Developer",
    period: "Jun 2024 – Sep 2024",
    location: "Yogyakarta, Indonesia · Remote",
    description: "As a Full Stack Developer Intern at SOKO FINANCIAL, I contributed to the end-to-end development of the company's financial web platform. I was responsible for translating high-fidelity designs from the UI team into functional frontend code while managing complex backend logic on the client side.",
    stack: ["Laravel", "Tailwind CSS", "JavaScript"],
    type: "Internship",
  },
];

const techStackGroups = [
  {
    category: "Frontend",
    gradient: "from-blue-500/20 to-cyan-500/10",
    color: "text-blue-400",
    skills: [
      { name: "React", icon: <SiReact className="text-blue-400" />, level: 92 },
      { name: "Next.js", icon: <SiNextdotjs />, level: 90 },
      { name: "TypeScript", icon: <SiTypescript className="text-blue-600" />, level: 85 },
      { name: "JavaScript", icon: <SiJavascript className="text-yellow-400" />, level: 90 },
      { name: "Tailwind", icon: <SiTailwindcss className="text-sky-400" />, level: 93 },
      { name: "Framer", icon: <SiFramer className="text-pink-400" />, level: 76 },
    ],
  },
  {
    category: "Backend",
    gradient: "from-green-500/20 to-emerald-500/10",
    color: "text-green-400",
    skills: [
      { name: "Node.js", icon: <SiNodedotjs className="text-green-500" />, level: 83 },
      { name: "FastAPI", icon: <SiFastapi className="text-teal-400" />, level: 82 },
      { name: "Laravel", icon: <SiLaravel className="text-red-500" />, level: 80 },
      { name: "Python", icon: <SiPython className="text-yellow-400" />, level: 88 },
      { name: "PHP", icon: <SiPhp className="text-indigo-400" />, level: 75 },
      { name: "Django", icon: <SiDjango className="text-green-700" />, level: 74 },
      { name: "Flask", icon: <SiFlask className="text-gray-300" />, level: 72 },
      { name: "NestJS", icon: <SiNestjs className="text-red-500" />, level: 70 },
      { name: "Express", icon: <SiExpress className="text-gray-400" />, level: 78 },
    ],
  },
  {
    category: "Database",
    gradient: "from-purple-500/20 to-pink-500/10",
    color: "text-purple-400",
    skills: [
      { name: "MySQL", icon: <SiMysql className="text-blue-500" />, level: 85 },
      { name: "PostgreSQL", icon: <SiPostgresql className="text-blue-400" />, level: 80 },
      { name: "MongoDB", icon: <SiMongodb className="text-green-500" />, level: 75 },
      { name: "Firebase", icon: <SiFirebase className="text-yellow-500" />, level: 78 },
    ],
  },
  {
    category: "DevOps & Tools",
    gradient: "from-orange-500/20 to-yellow-500/10",
    color: "text-orange-400",
    skills: [
      { name: "Docker", icon: <SiDocker className="text-blue-500" />, level: 78 },
      { name: "Git", icon: <SiGit className="text-orange-500" />, level: 90 },
      { name: "GitHub", icon: <SiGithub />, level: 90 },
      { name: "Linux", icon: <SiLinux />, level: 80 },
      { name: "Vercel", icon: <SiVercel />, level: 85 },
    ],
  },
  {
    category: "AI / ML",
    gradient: "from-pink-500/20 to-rose-500/10",
    color: "text-pink-400",
    skills: [
      { name: "TensorFlow", icon: <SiTensorflow className="text-orange-500" />, level: 80 },
      { name: "PyTorch", icon: <SiPytorch className="text-orange-500" />, level: 72 },
      { name: "Scikit-Learn", icon: <SiScikitlearn className="text-yellow-500" />, level: 82 },
      { name: "OpenAI", icon: <SiOpenai />, level: 78 },
    ],
  },
];

const softSkills = [
  { icon: <Brain size={28} />, label: "Problem Solving", desc: "Mengurai masalah kompleks menjadi solusi yang efisien dan terstruktur.", color: "from-blue-500 to-cyan-500" },
  { icon: <Users size={28} />, label: "Team Collaboration", desc: "Bekerja efektif dalam tim, menghargai setiap kontribusi dan sudut pandang.", color: "from-green-500 to-emerald-500" },
  { icon: <Zap size={28} />, label: "Fast Learner", desc: "Cepat beradaptasi dengan teknologi dan konsep baru yang terus berkembang.", color: "from-yellow-500 to-orange-500" },
  { icon: <MessageSquare size={28} />, label: "Communication", desc: "Menyampaikan ide teknis dengan jelas kepada tim maupun stakeholder non-teknis.", color: "from-purple-500 to-pink-500" },
  { icon: <Palette size={28} />, label: "Creative Thinking", desc: "Menciptakan solusi inovatif dengan pendekatan kreatif di luar kebiasaan.", color: "from-pink-500 to-rose-500" },
  { icon: <Clock size={28} />, label: "Time Management", desc: "Mengelola waktu dan prioritas dengan baik untuk memenuhi deadline dengan kualitas terjaga.", color: "from-teal-500 to-cyan-500" },
];

const goals = [
  {
    type: "short",
    title: "Tujuan Jangka Pendek (1 Tahun)",
    icon: <Target size={22} />,
    color: "from-blue-500 to-cyan-500",
    items: [
      "Menguasai Bahasa Inggris hingga level conversational yang lancar",
      "Memperdalam Bahasa Jerman hingga level B1",
      "Mendapatkan sertifikasi internasional di bidang backend atau cloud",
      "Berkontribusi aktif di project open-source",
    ],
  },
  {
    type: "long",
    title: "Tujuan Jangka Panjang (3–5 Tahun)",
    icon: <Rocket size={22} />,
    color: "from-emerald-500 to-teal-500",
    items: [
      "Bekerja di luar negeri (Jerman, Jepang, Australia, Switzerland, atau Kuwait)",
      "Menjadi Senior Engineer yang diakui secara global",
      "Membangun startup atau produk digital yang berdampak nyata",
      "Menguasai bidang Mechanical Engineering sebagai lintas disiplin",
    ],
  },
  {
    type: "vision",
    title: "Visi Karir",
    icon: <Lightbulb size={22} />,
    color: "from-yellow-500 to-orange-500",
    items: [
      "Menjadi engineer yang bisa menjembatani dunia software dan hardware",
      "Mengeksplorasi transisi dari IT Engineer ke Mechanical Engineer",
      "Berkontribusi pada teknologi yang membantu kehidupan manusia",
      "Menginspirasi generasi developer muda dari Indonesia",
    ],
  },
];

const hobbies = [
  { icon: <Gamepad2 size={32} />, label: "Gaming", desc: "Menghabiskan waktu senggang dengan game strategi dan RPG.", color: "from-purple-500 to-indigo-500" },
  { icon: <Music size={32} />, label: "Music", desc: "Mendengarkan berbagai genre musik, dari lo-fi hingga metal.", color: "from-pink-500 to-rose-500" },
  { icon: <Cat size={32} />, label: "Cats", desc: "Pecinta kucing sejati, selalu menyapa kucing yang ditemui.", color: "from-orange-400 to-yellow-400" },
  { icon: <Camera size={32} />, label: "Photography", desc: "Mengabadikan momen istimewa dan estetika alam sekitar.", color: "from-teal-500 to-cyan-500" },
  { icon: <Code2 size={32} />, label: "Coding", desc: "Hobi sekaligus pekerjaan, coding tetap menyenangkan di waktu luang.", color: "from-green-500 to-emerald-500" },
  { icon: <Coffee size={32} />, label: "Coffee", desc: "Ritual pagi dengan kopi, energi utama sebelum mulai ngoding.", color: "from-amber-600 to-yellow-500" },
  { icon: <BookOpen size={32} />, label: "Reading", desc: "Membaca buku teknologi, psikologi, dan pengembangan diri.", color: "from-blue-500 to-violet-500" },
  { icon: <Brain size={32} />, label: "Explore Tech", desc: "Selalu eksplor teknologi baru dan tren industri terkini.", color: "from-cyan-500 to-blue-500" },
];

const funFacts = [
  { num: "01", fact: "Saya bisa coding sambil dengerin musik 6 jam non-stop tanpa sadar waktu berlalu." },
  { num: "02", fact: "Bahasa pertama yang dipelajari adalah C++, bukan HTML/CSS seperti kebanyakan orang." },
  { num: "03", fact: "Saya sering debug sambil ngobrol dengan kucing peliharaan — surprisingly efektif!" },
  { num: "04", fact: "Punya target untuk bisa tinggal dan kerja di minimal 2 negara berbeda sebelum umur 30." },
  { num: "05", fact: "Terminal gelap dan font monospace adalah setup coding favorit — keindahan tersendiri." },
  { num: "06", fact: "Ingin belajar Mechanical Engineering sebagai second skill — dari software ke hardware." },
  { num: "07", fact: "Kopi hitam tanpa gula adalah teman setia setiap sesi coding marathon." },
  { num: "08", fact: "Masih ingat betul perasaan excited saat program pertama berhasil dijalankan di terminal." },
];

const quotes = [
  {
    text: "The best way to predict the future is to invent it.",
    author: "Alan Kay",
    role: "Computer Scientist",
  },
  {
    text: "Code is like humor. When you have to explain it, it's bad.",
    author: "Cory House",
    role: "Software Architect",
  },
  {
    text: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
    role: "Software Developer",
  },
];

/* ─────────────────────────── sub-components ─────────────────────────── */

function SectionWrapper({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <section id={id} ref={ref} className={cn("py-20 px-[5%]", className)}>
      <div
        className={cn(
          "max-w-6xl mx-auto transition-all duration-700",
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}
      >
        {children}
      </div>
    </section>
  );
}

function SectionTitle({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-12 text-center">
      <span className="text-xs font-semibold tracking-widest uppercase text-accentColor bg-accentColor/10 px-4 py-1.5 rounded-full">
        {label}
      </span>
      <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{title}</h2>
      {subtitle && <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">{subtitle}</p>}
    </div>
  );
}

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView(0.3);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 20);
    return () => clearInterval(timer);
  }, [inView, target]);
  return (
    <div ref={ref} className="text-4xl font-bold text-accentColor">
      {count}{suffix}
    </div>
  );
}

/* ─────────────────────────── page ─────────────────────────── */

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [typedText, setTypedText] = useState("");
  const tagline = "Full Stack Developer & Backend Engineer";

  // Typing animation
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(tagline.slice(0, i + 1));
      i++;
      if (i >= tagline.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Hero entrance animation
  useEffect(() => {
    if (!heroRef.current) return;
    const q = gsap.utils.selector(heroRef.current);
    gsap.fromTo(
      q(".hero-el"),
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: "power2.out", delay: 0.3 }
    );
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white pt-[4.5rem]">
      {/* ══════════════════════════════════════════════ */}
      {/* SECTION 1 — HERO PROFILE                      */}
      {/* ══════════════════════════════════════════════ */}
      <section id="hero" className="py-16 px-[5%]">
        <div ref={heroRef} className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Profile Image */}
            <div className="hero-el flex-shrink-0 relative">
              <div className="relative w-56 h-56 md:w-72 md:h-72">
                {/* Glow rings */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accentColor/40 to-cyan-400/20 blur-2xl scale-110" />
                <div className="absolute inset-0 rounded-full border-2 border-accentColor/40 animate-pulse" />
                <div className="absolute -inset-2 rounded-full border border-accentColor/20" />
                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-accentColor/50 shadow-[0_0_40px_rgba(14,189,122,0.3)]">
                  <Image
                    src={ProfileImg}
                    alt="Agung Kurniawan"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                {/* Online badge */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white dark:bg-gray-900 text-xs font-medium px-3 py-1.5 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
                  <span className="w-2 h-2 rounded-full bg-accentColor animate-pulse" />
                  <span className="text-gray-700 dark:text-gray-300">Open to Collaboration</span>
                </div>
              </div>
            </div>

            {/* Hero Text */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4 flex-1">
              <div className="hero-el">
                <span className="text-xs font-semibold tracking-widest uppercase text-accentColor bg-accentColor/10 px-4 py-1.5 rounded-full">
                  👋 Hello, I&apos;m
                </span>
              </div>
              <h1 className="hero-el text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Agung{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accentColor to-cyan-400">
                  Kurniawan
                </span>
              </h1>
              <div className="hero-el h-8 flex items-center">
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 font-medium">
                  {typedText}
                  <span className="inline-block w-0.5 h-5 bg-accentColor ml-0.5 animate-pulse" />
                </p>
              </div>
              <p className="hero-el text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed">
                Seorang developer muda dari Banyuwangi yang passionate di dunia teknologi. 
                Spesialisasi di backend engineering dengan keingintahuan yang besar terhadap berbagai aspek teknologi modern.
              </p>

              {/* Status badges */}
              <div className="hero-el flex flex-wrap gap-2 justify-center lg:justify-start">
                <span className="flex items-center gap-1.5 text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Backend Engineer
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-full">
                  <MapPin size={11} />
                  Banyuwangi, Jawa Timur
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-full">
                  <GraduationCap size={11} />
                  D4 Teknik Informatika
                </span>
              </div>

              {/* CTA Buttons */}
              <div className="hero-el flex flex-wrap gap-3 justify-center lg:justify-start">
                <a
                  href="/resume.pdf"
                  download
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accentColor text-white font-semibold text-sm shadow-[0_0_20px_rgba(14,189,122,0.4)] hover:shadow-[0_0_30px_rgba(14,189,122,0.6)] hover:scale-105 transition-all duration-200"
                >
                  <Download size={16} />
                  Download CV
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-accentColor/40 text-accentColor font-semibold text-sm hover:bg-accentColor/10 transition-all duration-200 hover:scale-105"
                >
                  <Mail size={16} />
                  Contact Me
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* SECTION 2 — BIO & PERSONAL INFO               */}
      {/* ══════════════════════════════════════════════ */}
      <SectionWrapper id="bio">
        <SectionTitle
          label="Tentang Saya"
          title="Bio & Info Personal"
          subtitle="Mengenal lebih dekat siapa saya, background, dan apa yang mendorong saya terus berkembang."
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bio narrative */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Siapa Saya?</h3>
            <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>
                Saya adalah seorang <span className="text-accentColor font-semibold">Backend Engineer</span> muda 
                yang lahir dan besar di Banyuwangi, Jawa Timur. Perjalanan saya di dunia coding dimulai 
                setelah lulus SMK, ketika rasa penasaran terhadap teknologi mengantarkan saya ke dunia pemrograman.
              </p>
              <p>
                Dengan background pendidikan <span className="text-accentColor font-semibold">D4 Teknik Informatika</span>, 
                saya telah mengembangkan keahlian di berbagai lini teknologi — dari frontend hingga backend, 
                bahkan AI & Machine Learning. Namun passion terbesar saya tetap berada di backend engineering.
              </p>
              <p>
                Saya percaya bahwa teknologi adalah bahasa universal, dan saya sedang aktif belajar Bahasa 
                Inggris dan Jerman untuk memperluas cakrawala dan membuka peluang karir internasional.
              </p>
              <p>
                Yang membuat saya unik? Saya memiliki ketertarikan lintas disiplin — ingin menjembatani 
                dunia software engineering dengan mechanical engineering di masa depan.
              </p>
            </div>
          </div>

          {/* Personal info */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Info Detail</h3>
            <ul className="space-y-4">
              {[
                { icon: <Calendar size={18} className="text-accentColor" />, label: "Tanggal Lahir", value: "4 April 2004" },
                { icon: <MapPin size={18} className="text-accentColor" />, label: "Asal Daerah", value: "Banyuwangi, Jawa Timur" },
                { icon: <GraduationCap size={18} className="text-accentColor" />, label: "Pendidikan", value: "D4 Teknik Informatika" },
                { icon: <Briefcase size={18} className="text-accentColor" />, label: "Pekerjaan", value: "Backend Engineer" },
                { icon: <Globe size={18} className="text-accentColor" />, label: "Bahasa", value: "Indonesia (Native) • English (Learning) • Deutsch (Learning)" },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-4">
                  <span className="mt-0.5 p-2 rounded-lg bg-accentColor/10 shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{item.label}</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.value}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionWrapper>

      {/* ══════════════════════════════════════════════ */}
      {/* SECTION 3 — STATS                             */}
      {/* ══════════════════════════════════════════════ */}
      <SectionWrapper id="stats" className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900/50 dark:to-gray-950">
        <SectionTitle label="Angka Bicara" title="Stats & Pencapaian" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 text-center shadow-sm hover:border-accentColor/40 hover:shadow-[0_4px_20px_rgba(14,189,122,0.15)] transition-all duration-300 group"
            >
              <div className="flex justify-center mb-3 text-accentColor opacity-70 group-hover:opacity-100 transition-opacity">
                {stat.icon}
              </div>
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ══════════════════════════════════════════════ */}
      {/* SECTION 4 — LEARNING JOURNEY TIMELINE         */}
      {/* ══════════════════════════════════════════════ */}
      <SectionWrapper id="journey">
        <SectionTitle
          label="Perjalanan"
          title="Perjalanan Belajar Coding"
          subtitle="Dari nol hingga sekarang — setiap milestone adalah batu loncatan menuju versi yang lebih baik."
        />
        <div className="relative max-w-3xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-accentColor/60 via-accentColor/20 to-transparent hidden sm:block" />
          <div className="space-y-8">
            {timeline.map((item, idx) => (
              <div key={idx} className="flex gap-6 group">
                {/* Icon circle */}
                <div className="relative shrink-0 hidden sm:block">
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-white bg-gradient-to-br", item.color, "shadow-lg shadow-accentColor/20 group-hover:scale-110 transition-transform duration-300")}>
                    {item.icon}
                  </div>
                </div>
                {/* Content */}
                <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm group-hover:border-accentColor/30 transition-colors duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-accentColor bg-accentColor/10 px-2.5 py-1 rounded-full">{item.year}</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* ══════════════════════════════════════════════ */}
      {/* SECTION 5 — WORK EXPERIENCE                   */}
      {/* ══════════════════════════════════════════════ */}
      <SectionWrapper id="experience" className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900/50 dark:to-gray-950">
        <SectionTitle
          label="Karir"
          title="Pengalaman Kerja & Magang"
          subtitle="Jejak profesional yang membentuk keahlian dan cara pandang saya terhadap teknologi."
        />
        <div className="space-y-6 max-w-4xl mx-auto">
          {experiences.map((exp, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm hover:border-accentColor/40 hover:shadow-[0_4px_30px_rgba(14,189,122,0.12)] transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Company initial badge */}
                <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-accentColor/20 to-cyan-500/20 flex items-center justify-center text-accentColor font-bold text-xl border border-accentColor/20">
                  {exp.company[0]}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{exp.position}</h3>
                    <span className={cn(
                      "text-xs font-medium px-2.5 py-0.5 rounded-full",
                      exp.type === "Internship"
                        ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                        : exp.type === "Contract"
                        ? "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                        : exp.type === "Part-time"
                        ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                        : "bg-green-500/10 text-green-500 border border-green-500/20"
                    )}>
                      {exp.type}
                    </span>
                  </div>
                  <p className="text-accentColor font-medium text-sm mb-1">{exp.company}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400 dark:text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Calendar size={11} />{exp.period}</span>
                    <span className="flex items-center gap-1"><MapPin size={11} />{exp.location}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{exp.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {exp.stack.map((tech) => (
                      <span key={tech} className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-2.5 py-1 rounded-lg">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ══════════════════════════════════════════════ */}
      {/* SECTION 6 — TECH STACK                        */}
      {/* ══════════════════════════════════════════════ */}
      <SectionWrapper id="techstack">
        <SectionTitle
          label="Tech Stack"
          title="Teknologi & Tools Favorit"
          subtitle="Arsenal teknologi yang saya gunakan untuk membangun produk digital berkualitas tinggi."
        />
        <div className="space-y-8">
          {techStackGroups.map((group) => (
            <div key={group.category}>
              <h3 className={cn("text-sm font-semibold tracking-widest uppercase mb-4", group.color)}>{group.category}</h3>
              <div className={cn("bg-gradient-to-br rounded-2xl p-6 border border-gray-200 dark:border-gray-800", group.gradient)}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {group.skills.map((skill) => (
                    <div
                      key={skill.name}
                      className="group flex flex-col items-center gap-2 bg-white/70 dark:bg-gray-900/70 backdrop-blur rounded-xl p-3 border border-white/50 dark:border-gray-700/50 hover:border-accentColor/50 hover:scale-105 hover:shadow-[0_4px_16px_rgba(14,189,122,0.2)] transition-all duration-200 cursor-default"
                    >
                      <span className="text-2xl flex items-center justify-center w-8 h-8">{skill.icon}</span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">{skill.name}</span>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-accentColor to-cyan-400 h-1.5 rounded-full transition-all duration-1000"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400">{skill.level}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ══════════════════════════════════════════════ */}
      {/* SECTION 7 — SOFT SKILLS                       */}
      {/* ══════════════════════════════════════════════ */}
      <SectionWrapper id="softskills" className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900/50 dark:to-gray-950">
        <SectionTitle
          label="Karakter"
          title="Soft Skills & Kepribadian"
          subtitle="Kemampuan interpersonal yang melengkapi keahlian teknis dalam setiap kolaborasi dan problem-solving."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {softSkills.map((skill) => (
            <div
              key={skill.label}
              className="group bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:border-accentColor/40 hover:shadow-[0_8px_30px_rgba(14,189,122,0.15)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-4", skill.color)}>
                {skill.icon}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{skill.label}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{skill.desc}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ══════════════════════════════════════════════ */}
      {/* SECTION 8 — GOALS & VISION                    */}
      {/* ══════════════════════════════════════════════ */}
      <SectionWrapper id="goals">
        <SectionTitle
          label="Ambisi"
          title="Goals & Visi ke Depan"
          subtitle="Setiap langkah hari ini adalah investasi untuk masa depan yang ingin saya wujudkan."
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {goals.map((g) => (
            <div
              key={g.type}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:border-accentColor/40 transition-all duration-300"
            >
              <div className={cn("inline-flex items-center gap-2 text-white text-sm font-semibold bg-gradient-to-r px-4 py-2 rounded-xl mb-4", g.color)}>
                {g.icon}
                {g.title}
              </div>
              <ul className="space-y-3">
                {g.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 size={15} className="text-accentColor shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ══════════════════════════════════════════════ */}
      {/* SECTION 9 — HOBBIES                           */}
      {/* ══════════════════════════════════════════════ */}
      <SectionWrapper id="hobbies" className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900/50 dark:to-gray-950">
        <SectionTitle
          label="Di Luar Koding"
          title="Hobi & Interest"
          subtitle="Kehidupan di luar layar yang memberi energi dan inspirasi baru setiap harinya."
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {hobbies.map((h) => (
            <div
              key={h.label}
              className="group bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 text-center shadow-sm hover:border-accentColor/50 hover:-translate-y-2 hover:shadow-[0_12px_30px_rgba(14,189,122,0.2)] transition-all duration-300 cursor-default"
            >
              <div className={cn("w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform duration-300", h.color)}>
                {h.icon}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1.5">{h.label}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ══════════════════════════════════════════════ */}
      {/* SECTION 10 — FUN FACTS                        */}
      {/* ══════════════════════════════════════════════ */}
      <SectionWrapper id="funfacts">
        <SectionTitle
          label="Fun Facts"
          title="Fakta Unik Tentang Saya"
          subtitle="Beberapa hal yang mungkin membuat kamu berkata 'oh, interesting!'"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {funFacts.map((f) => (
            <div
              key={f.num}
              className="group relative bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:border-accentColor/50 hover:shadow-[0_8px_25px_rgba(14,189,122,0.18)] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <span className="absolute -top-3 -right-2 text-7xl font-black text-gray-100 dark:text-gray-800/60 select-none leading-none group-hover:text-accentColor/10 transition-colors duration-300">
                {f.num}
              </span>
              <p className="relative text-sm text-gray-600 dark:text-gray-400 leading-relaxed z-10">{f.fact}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ══════════════════════════════════════════════ */}
      {/* SECTION 11 — FAVORITE QUOTES                  */}
      {/* ══════════════════════════════════════════════ */}
      <SectionWrapper id="quotes" className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900/50 dark:to-gray-950">
        <SectionTitle
          label="Inspirasi"
          title="Quotes Favorit"
          subtitle="Kata-kata yang selalu menginspirasi saya untuk terus maju dan berkembang."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quotes.map((q, i) => (
            <div
              key={i}
              className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:border-accentColor/40 hover:shadow-[0_8px_30px_rgba(14,189,122,0.15)] transition-all duration-300 hover:-translate-y-1 overflow-hidden group"
            >
              {/* Background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-accentColor/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <Quote size={32} className="text-accentColor/20 mb-4" />
              <blockquote className="relative text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic mb-5">
                &ldquo;{q.text}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accentColor to-cyan-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {q.author[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{q.author}</p>
                  <p className="text-xs text-gray-400">{q.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── CTA Footer ── */}
      <section className="py-16 px-[5%] text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Mari Berkolaborasi! 🚀
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Tertarik untuk bekerja sama atau sekadar ngobrol tentang teknologi? Saya selalu terbuka untuk diskusi.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accentColor text-white font-semibold text-sm shadow-[0_0_20px_rgba(14,189,122,0.4)] hover:shadow-[0_0_30px_rgba(14,189,122,0.6)] hover:scale-105 transition-all duration-200"
            >
              <Mail size={16} />
              Hubungi Saya
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:border-accentColor/50 hover:text-accentColor hover:scale-105 transition-all duration-200"
            >
              <ExternalLink size={16} />
              Lihat Project
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
