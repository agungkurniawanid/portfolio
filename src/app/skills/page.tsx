"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Link from "next/link";
import {
  SiReact, SiNextdotjs, SiTypescript, SiJavascript, SiTailwindcss,
  SiHtml5, SiCss3, SiFramer, SiNodedotjs, SiFastapi, SiLaravel,
  SiPython, SiPhp, SiTensorflow, SiKeras, SiPytorch, SiScikitlearn,
  SiOpencv, SiFlutter, SiDocker, SiGit, SiGithub, SiLinux, SiVercel,
  SiMongodb, SiMysql, SiPostgresql, SiFirebase, SiAmazon, SiGooglecloud,
  SiRedux, SiOpenai,
} from "react-icons/si";
import { FaMicrochip, FaBrain } from "react-icons/fa";
import { ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────── data ─────────────────────────── */

type Skill = { name: string; icon: ReactNode; level: number };
type Category = {
  id: string;
  title: string;
  description: string;
  gradient: string;
  icon: ReactNode;
  skills: Skill[];
};

const categories: Category[] = [
  {
    id: "frontend",
    title: "Frontend",
    description: "Crafting pixel-perfect, performant user interfaces",
    gradient: "from-blue-500/20 to-cyan-500/10",
    icon: <SiReact className="text-blue-400" size={22} />,
    skills: [
      { name: "React", icon: <SiReact className="text-blue-400" />, level: 92 },
      { name: "Next.js", icon: <SiNextdotjs className="text-black dark:text-white" />, level: 90 },
      { name: "TypeScript", icon: <SiTypescript className="text-blue-600" />, level: 85 },
      { name: "JavaScript", icon: <SiJavascript className="text-yellow-400" />, level: 90 },
      { name: "TailwindCSS", icon: <SiTailwindcss className="text-sky-400" />, level: 93 },
      { name: "HTML5", icon: <SiHtml5 className="text-orange-500" />, level: 95 },
      { name: "CSS3", icon: <SiCss3 className="text-blue-500" />, level: 90 },
      { name: "Framer Motion", icon: <SiFramer className="text-pink-400" />, level: 76 },
      { name: "Redux", icon: <SiRedux className="text-purple-500" />, level: 78 },
    ],
  },
  {
    id: "backend",
    title: "Backend",
    description: "Building robust APIs and server-side applications",
    gradient: "from-green-500/20 to-emerald-500/10",
    icon: <SiNodedotjs className="text-green-500" size={22} />,
    skills: [
      { name: "Node.js", icon: <SiNodedotjs className="text-green-500" />, level: 83 },
      { name: "FastAPI", icon: <SiFastapi className="text-teal-400" />, level: 82 },
      { name: "Laravel", icon: <SiLaravel className="text-red-500" />, level: 80 },
      { name: "Python", icon: <SiPython className="text-yellow-400" />, level: 88 },
      { name: "PHP", icon: <SiPhp className="text-indigo-400" />, level: 75 },
    ],
  },
  {
    id: "ai-ml",
    title: "AI / Machine Learning",
    description: "Designing intelligent models and data pipelines",
    gradient: "from-purple-500/20 to-pink-500/10",
    icon: <FaBrain className="text-purple-400" size={22} />,
    skills: [
      { name: "TensorFlow", icon: <SiTensorflow className="text-orange-500" />, level: 80 },
      { name: "Keras", icon: <SiKeras className="text-red-400" />, level: 80 },
      { name: "PyTorch", icon: <SiPytorch className="text-orange-500" />, level: 72 },
      { name: "Scikit-Learn", icon: <SiScikitlearn className="text-yellow-500" />, level: 82 },
      { name: "OpenCV", icon: <SiOpencv className="text-cyan-400" />, level: 75 },
      { name: "OpenAI API", icon: <SiOpenai className="text-gray-400" />, level: 78 },
      { name: "Deep Learning", icon: <FaMicrochip className="text-indigo-400" />, level: 74 },
    ],
  },
  {
    id: "mobile",
    title: "Mobile",
    description: "Delivering smooth cross-platform mobile experiences",
    gradient: "from-teal-500/20 to-cyan-500/10",
    icon: <SiFlutter className="text-blue-400" size={22} />,
    skills: [
      { name: "Flutter", icon: <SiFlutter className="text-blue-400" />, level: 78 },
    ],
  },
  {
    id: "devops",
    title: "DevOps & Tools",
    description: "Streamlining workflows and deployment pipelines",
    gradient: "from-orange-500/20 to-yellow-500/10",
    icon: <SiDocker className="text-blue-500" size={22} />,
    skills: [
      { name: "Docker", icon: <SiDocker className="text-blue-500" />, level: 78 },
      { name: "Git", icon: <SiGit className="text-orange-500" />, level: 90 },
      { name: "GitHub", icon: <SiGithub className="text-black dark:text-white" />, level: 90 },
      { name: "Linux", icon: <SiLinux className="text-black dark:text-white" />, level: 76 },
      { name: "Vercel", icon: <SiVercel className="text-black dark:text-white" />, level: 88 },
    ],
  },
  {
    id: "database",
    title: "Database",
    description: "Structuring and optimising data storage solutions",
    gradient: "from-red-500/20 to-pink-500/10",
    icon: <SiPostgresql className="text-blue-400" size={22} />,
    skills: [
      { name: "MongoDB", icon: <SiMongodb className="text-green-500" />, level: 80 },
      { name: "MySQL", icon: <SiMysql className="text-blue-500" />, level: 82 },
      { name: "PostgreSQL", icon: <SiPostgresql className="text-blue-400" />, level: 78 },
      { name: "Firebase", icon: <SiFirebase className="text-yellow-500" />, level: 80 },
    ],
  },
  {
    id: "cloud",
    title: "Cloud & Platforms",
    description: "Scaling applications on cloud infrastructure",
    gradient: "from-sky-500/20 to-blue-500/10",
    icon: <SiGooglecloud className="text-blue-400" size={22} />,
    skills: [
      { name: "AWS", icon: <SiAmazon className="text-orange-400" />, level: 68 },
      { name: "GCP", icon: <SiGooglecloud className="text-blue-400" />, level: 70 },
      { name: "Firebase", icon: <SiFirebase className="text-yellow-500" />, level: 80 },
      { name: "Vercel", icon: <SiVercel className="text-black dark:text-white" />, level: 88 },
    ],
  },
];

const getLevelLabel = (level: number) => {
  if (level >= 90) return "Expert";
  if (level >= 80) return "Advanced";
  if (level >= 70) return "Proficient";
  return "Familiar";
};

const getLevelColor = (level: number) => {
  if (level >= 90) return "text-[#0acf83]";
  if (level >= 80) return "text-blue-400";
  if (level >= 70) return "text-yellow-400";
  return "text-gray-400";
};

/* ─────────────────────────── components ─────────────────────── */

function SkillBar({ level, delay }: { level: number; delay: number }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barRef.current) return;
    gsap.fromTo(
      barRef.current,
      { width: "0%" },
      {
        width: `${level}%`,
        duration: 1.2,
        ease: "power2.out",
        delay,
        scrollTrigger: {
          trigger: barRef.current,
          start: "top 90%",
          once: true,
        },
      }
    );
  }, [level, delay]);

  return (
    <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
      <div
        ref={barRef}
        style={{ width: 0 }}
        className="h-full rounded-full bg-gradient-to-r from-[#0acf83] to-[#05a265]"
      />
    </div>
  );
}

function SkillCard({ skill, index }: { skill: Skill; index: number }) {
  return (
    <div
      className="skill-card group flex flex-col gap-3 p-4 rounded-xl
        bg-white dark:bg-white/5
        border border-gray-100 dark:border-white/10
        hover:border-[#0acf83]/40 dark:hover:border-[#0acf83]/40
        hover:shadow-md hover:shadow-[#0acf83]/10
        transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{skill.icon}</span>
          <span className="text-sm font-medium text-gray-800 dark:text-white">
            {skill.name}
          </span>
        </div>
        <span className={`text-[11px] font-semibold ${getLevelColor(skill.level)}`}>
          {getLevelLabel(skill.level)}
        </span>
      </div>
      <SkillBar level={skill.level} delay={index * 0.05} />
      <span className="text-[11px] text-gray-400 dark:text-white/40 self-end">
        {skill.level}%
      </span>
    </div>
  );
}

function CategorySection({ cat }: { cat: Category; index?: number }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.fromTo(
      sectionRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          once: true,
        },
      }
    );
  }, []);

  return (
    <div ref={sectionRef} className="opacity-0">
      {/* Category header */}
      <div className="flex items-start gap-4 mb-6">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center
            bg-gradient-to-br ${cat.gradient}
            border border-white/10 dark:border-white/5 shrink-0`}
        >
          {cat.icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {cat.title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-white/50 mt-0.5">
            {cat.description}
          </p>
        </div>
      </div>

      {/* Skill cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cat.skills.map((skill, i) => (
          <SkillCard key={skill.name} skill={skill} index={i} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── page ───────────────────────────── */

export default function SkillsPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero entrance
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-title span",
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" }
      );
      gsap.fromTo(
        ".hero-sub",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, delay: 0.4, ease: "power2.out" }
      );
      gsap.fromTo(
        ".back-btn",
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, delay: 0.2, ease: "power2.out" }
      );
      // stat counters
      document.querySelectorAll(".stat-num").forEach((el) => {
        const target = parseInt((el as HTMLElement).dataset.target || "0", 10);
        gsap.fromTo(
          el,
          { innerText: 0 },
          {
            innerText: target,
            duration: 1.5,
            delay: 0.6,
            snap: { innerText: 1 },
            ease: "power2.out",
          }
        );
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const totalSkills = categories.reduce((a, c) => a + c.skills.length, 0);
  const expertCount = categories
    .flatMap((c) => c.skills)
    .filter((s) => s.level >= 90).length;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0d1417] pt-[4.5rem]">
      {/* ── Hero ── */}
      <div
        ref={heroRef}
        className="relative overflow-hidden bg-white dark:bg-[#111a1d] border-b border-gray-100 dark:border-white/5"
      >
        {/* background decoration */}
        <div className="pointer-events-none select-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-[#0acf83]/10 blur-[80px]" />
          <div className="absolute bottom-0 -left-20 w-[20rem] h-[20rem] rounded-full bg-[#0acf83]/8 blur-[60px]" />
        </div>

        <div className="relative max-w-[1100px] mx-auto px-[5%] py-16">
          {/* title */}
          <div className="hero-title overflow-hidden flex flex-wrap gap-x-3 text-4xl md:text-5xl lg:text-[3.4rem] font-semibold tracking-tight text-gray-900 dark:text-white leading-tight mb-5">
            <span className="inline-block">My</span>
            <span className="inline-block text-[#0acf83]">Skills</span>
            <span className="inline-block">&amp;</span>
            <span className="inline-block">Expertise</span>
          </div>

          <p className="hero-sub max-w-xl text-gray-500 dark:text-white/50 text-base md:text-lg leading-relaxed mb-10">
            A curated overview of the technologies and tools I use to design,
            build, and ship high-quality software — from pixel-perfect UIs to
            intelligent ML pipelines.
          </p>

          {/* quick stats */}
          <div
            ref={statsRef}
            className="flex flex-wrap gap-6 sm:gap-10"
          >
            {[
              { label: "Technologies", value: totalSkills },
              { label: "Skill Categories", value: categories.length },
              { label: "Expert Level", value: expertCount },
              { label: "Years Experience", value: 4 },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  <span
                    className="stat-num"
                    data-target={stat.value}
                  >
                    0
                  </span>
                  <span className="text-[#0acf83]">+</span>
                </span>
                <span className="text-xs text-gray-400 dark:text-white/40 mt-0.5 font-medium tracking-wide uppercase">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="max-w-[1100px] mx-auto px-[5%] pt-10 pb-2">
        <div className="flex flex-wrap gap-4">
          {[
            { label: "Expert", color: "bg-[#0acf83]", min: "90%+" },
            { label: "Advanced", color: "bg-blue-400", min: "80%+" },
            { label: "Proficient", color: "bg-yellow-400", min: "70%+" },
            { label: "Familiar", color: "bg-gray-400", min: "<70%" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10"
            >
              <span className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="text-xs font-medium text-gray-600 dark:text-white/60">
                {item.label}
              </span>
              <span className="text-xs text-gray-400 dark:text-white/30">
                {item.min}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Category sections ── */}
      <div className="max-w-[1100px] mx-auto px-[5%] py-12 flex flex-col gap-14">
        {categories.map((cat, i) => (
          <CategorySection key={cat.id} cat={cat} index={i} />
        ))}
      </div>

      {/* ── CTA footer ── */}
      <div className="border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#111a1d]">
        <div className="max-w-[1100px] mx-auto px-[5%] py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Interested in working together?
            </h3>
            <p className="text-sm text-gray-500 dark:text-white/50 mt-1">
              Let&apos;s build something great — reach out anytime.
            </p>
          </div>
          <Link
            href="/#contact"
            className="contact_me_btn relative px-7 py-3 text-white text-sm font-semibold rounded-md shrink-0"
          >
            <div className="contact_me_btn_overlay" />
            <span className="relative z-10">Contact Me</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
