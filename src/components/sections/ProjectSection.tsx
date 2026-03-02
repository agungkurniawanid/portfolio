"use client";

import { useEffect, useRef, useState } from "react";
import useOnScreen from "@/hooks/UseOnScreen";
import useScrollActive from "@/hooks/UseScrollActive";
import { useSectionStore } from "@/stores/Section";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { StaticImageData } from "next/image";
import Link from "next/link";
import { RoughNotation } from "react-rough-notation";
import ProjectCard from "../ProjectCard";
import { useTranslations } from "next-intl";
import { fetchPopularProjects } from "@/lib/projectsApi";
import ThumbGreenhouse from "@/assets/thumbnails/Intelligence-Quality-Air-Control-System-Greenhouse-Kopi-Nrsery-App.jpeg";
import ThumbEmotional from "@/assets/thumbnails/Emotional-Faces-Classification.jpeg";
import ThumbKampSewa from "@/assets/thumbnails/Marketplace-KampSewa_-Jual-Beli,-Sewa-dan-Menyewakan-Alat-Kamping-App.jpeg";
import ThumbSpeech from "@/assets/thumbnails/Speech-to-Speech-With-AI-ElevenLabs-App.jpeg";
import ThumbDapnetwork from "@/assets/thumbnails/Dapnetwork-(Old-Version)-App.jpeg";
import ThumbClock from "@/assets/thumbnails/Clock-App.jpeg";
import ThumbElectroMart from "@/assets/thumbnails/Electro-Mart-App.jpeg";
import ThumbQRCode from "@/assets/thumbnails/QR-Code-Reader-App.jpeg";
import ThumbHandyCraft from "@/assets/thumbnails/HandyCraft-App.jpeg";

// ─── Skeleton card shown while Supabase data is loading ──────────────────────
function ProjectCardSkeleton() {
  return (
    <div className="relative col-span-1 w-full flex flex-col shadow-shadow0 border rounded-2xl overflow-hidden bg-white animate-pulse">
      <div className="w-full aspect-video bg-gray-200" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-3 w-3/4 rounded bg-gray-200" />
        <div className="h-2.5 w-full rounded bg-gray-100" />
        <div className="h-2.5 w-2/3 rounded bg-gray-100" />
        <div className="flex gap-1.5 mt-1">
          <div className="h-4 w-14 rounded-full bg-gray-200" />
          <div className="h-4 w-14 rounded-full bg-gray-200" />
        </div>
      </div>
      <div className="px-4 pb-4 flex justify-between">
        <div className="h-3 w-8 rounded bg-gray-200" />
        <div className="h-6 w-16 rounded-full bg-gray-200" />
      </div>
    </div>
  );
}

export default function ProjectSection() {
  gsap.registerPlugin(ScrollTrigger);
  const t = useTranslations("projects");

  const sectionRef = useRef<HTMLElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(elementRef as React.RefObject<HTMLElement>);

  // ─── Supabase data state ────────────────────────────────────────────────────
  const [displayProjects, setDisplayProjects] = useState<Project[]>(staticProjects);
  const [loading, setLoading] = useState(true);

  // ─── Fetch popular projects from Supabase ─────────────────────────────────
  useEffect(() => {
    fetchPopularProjects().then((rows) => {
      if (rows.length > 0) {
        // Map ProjectCardItem → Project (image comes as a URL string from Supabase)
        setDisplayProjects(rows as Project[]);
      }
      // If Supabase returns empty (DB not seeded yet), staticProjects stay as fallback
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const q = gsap.utils.selector(sectionRef);
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        scrub: true,
        onEnter: () => {
          gsap.fromTo(
            q(".qoutes-animation"),
            {
              y: "-200%",
            },
            {
              y: 0,
            }
          );
        },
      },
    });
    return () => {
      timeline.kill();
    };
  }, []);
  const projectSectionOnView = useScrollActive(
    sectionRef as React.RefObject<HTMLElement>
  );
  const { setSection } = useSectionStore();

  useEffect(() => {
    if (projectSectionOnView) {
      setSection("#project");
    }
  }, [projectSectionOnView, setSection]);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative h-full bg-gray-50 overflow-hidden py-14 px-10 lg:px-[5%]"
    >
      <div className="w-full max-w-[1100px] h-full m-auto flex flex-col items-center gap-14">
        <div className="w-[80%] md:w-full flex absolute left-1/2 -translate-x-1/2 flex-col gap-8 items-center">
          <RoughNotation
            type="underline"
            strokeWidth={2}
            color="hsl(157, 87%, 41%)"
            order={1}
            show={isOnScreen}
          >
            <div className="text-xl md:text-4xl tracking-tight font-medium w-fit text-black">
              {t("title")}
            </div>
          </RoughNotation>
          <div ref={elementRef} className="overflow-hidden ">
            <div className="qoutes-animation md:w-full text-center font-medium flex flex-col items-center text-black">
              <div>{t("quote_line1")}</div>
              <div>{t("quote_line2")}</div>
            </div>
          </div>
        </div>
        <div className="w-full pt-40 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {loading
            ? Array.from({ length: 9 }).map((_, i) => (
                <ProjectCardSkeleton key={i} />
              ))
            : displayProjects.map((project) => (
                <ProjectCard key={project.id} item={project} />
              ))}
        </div>

        <div className="font-medium text-black">
          {t("see_more")}{" "}
          <Link
            href="https://github.com/agungkurniawanid"
            target="_blank"
            aria-label="Expore more in my github profile"
            rel="noopener noreferrer"
            className="text-accentColor navlink hover:text-accentColor"
          >
            my github profile
          </Link>
        </div>
      </div>
    </section>
  );
}

export interface Project {
  id: number | string;
  title: string;
  description: string;
  platformApp: string[];
  /** Accepts a Next.js StaticImageData import OR a Supabase CDN URL string. */
  image: StaticImageData | string;
  githubURL: {
    [key: string]: string;
  };
  githubApi: string;
  liveURL: string;
  technologies: string[];
}

/**
 * staticProjects — used as:
 *   1. The initial render value (zero layout shift before Supabase responds)
 *   2. A fallback when Supabase is unreachable or the DB has not been seeded yet
 */
const staticProjects: Project[] = [
  {
    id: 1,
    title: "Intelligence Quality Air Control System Greenhouse Kopi Nrsery App",
    description:
      "Menggabungkan Situs Web, Aplikasi Seluler, dan IoT. Proyek ini merupakan sistem kontrol kualitas udara berbasis kecerdasan buatan yang dirancang khusus untuk pembibitan kopi. Sistem ini bertujuan untuk memantau, menganalisis, dan mengontrol udara serta mendiagnosis penyakit kopi melalui aplikasi seluler dengan deep learning CNN.",
    platformApp: ["Web App", "Mobile App", "IoT Device"],
    image: ThumbGreenhouse,
    githubURL: {
      web: "https://github.com/agungkurniawanid/kopi_greenhouse_aircontrol_web",
      mobile:
        "https://github.com/agungkurniawanid/kopi_greenhouse_aircontrol_app",
      "model AI":
        "https://github.com/agungkurniawanid/kopi_greenhouse_aircontrol_coffee_leaf_model",
      iot: "https://github.com/agungkurniawanid/kopi_greenhouse_aircontrol_iot",
    },
    liveURL: "#",
    githubApi: "",
    technologies: [
      "Laravel",
      "Flutter",
      "Python",
      "Tensorflow",
      "FastAPI",
      "Convolusional Neural Network",
      "Deep Learning",
    ],
  },
  {
    id: 4,
    title: "Emotional Faces Classification",
    description:
      "Sebuah aplikasi yang dibuat untuk memberikan kesimpulan pada foto yang diupload dengan beberapa ekspresi yang akan didapatkan seperti marah, sedih dan lain-lain. Aplikasi ini dibuat dengan Flutter untuk App, Nextjs dan Fast API untuk backend, dan metode deep learning yaitu Convolutional Neural Network.",
    platformApp: ["Web App", "Mobile App"],
    image: ThumbEmotional,
    githubURL: {
      web: "https://github.com/agungkurniawanid/emotional_faces_classification_web",
      mobile:
        "https://github.com/agungkurniawanid/emotional_faces_classification_app",
    },
    liveURL: "#",
    githubApi: "",
    technologies: [
      "Flutter",
      "Laravel",
      "FastAPI",
      "TailwindCSS",
      "MySQL",
      "Python",
      "Convolutional Neural Network",
      "Deep Learning",
      "Tensorflow",
    ],
  },
  {
    id: 2,
    title:
      "Marketplace KampSewa: Jual Beli, Sewa dan Menyewakan Alat Kamping App",
    description:
      "Aplikasi yang menyediakan penyewaan & penyewaan peralatan berkemah ke seluruh wilayah yang memungkinkan pengguna untuk saling menyewakan dan menyewakan peralatan berkemah mereka.",
    platformApp: ["Web App", "Mobile App"],
    image: ThumbKampSewa,
    githubURL: {
      web: "https://github.com/agungkurniawanid/marketplace_kampsewa_web",
      mobile: "https://github.com/agungkurniawanid/marketplace_kampsewa_app",
    },
    liveURL: "#",
    githubApi: "",
    technologies: ["Laravel", "Flutter", "TailwindCSS", "MySQL", "Midtrans"],
  },
  {
    id: 3,
    title: "Speech to Speech With AI ElevenLabs App",
    description:
      "Sebuah aplikasi di mana pengguna dapat melakukan percakapan dua arah dengan AI, speech to speech dalam aplikasi ini dilakukan secara Real-Time. Dibangun dengan API Gemini dan ElevenLabs AI.",
    platformApp: ["Mobile App"],
    image: ThumbSpeech,
    githubURL: {
      mobile:
        "https://github.com/agungkurniawanid/speech_to_speech_ai_evenlabs_app",
    },
    liveURL: "#",
    githubApi: "",
    technologies: ["Flutter", "Gemini API", "ElevenLabs AI"],
  },
  {
    id: 8,
    title: "Dapnetwork (Old Version) App",
    description:
      "Aplikasi DAPNetwork, yang dikembangkan oleh DAPNetwork, membuat manajemen jaringan internet menjadi mudah. Aplikasi ini mencakup platform seluler bagi staf untuk menangani penagihan dan pemasangan pelanggan baru, dan situs web bagi admin untuk mengelola operasi melalui dasbor yang komprehensif.",
    platformApp: ["Web App", "Mobile App"],
    image: ThumbDapnetwork,
    githubURL: {
      webs: "https://github.com/agungkurniawanid/dapnetwork_web",
      mobile: "https://github.com/agungkurniawanid/dapnetwork_old_app",
    },
    liveURL: "#",
    githubApi: "",
    technologies: ["Java Native", "PHP Native", "TailwindCSS", "MySQL"],
  },
  {
    id: 5,
    title: "Clock App",
    description:
      "Clock App adalah aplikasi canggih yang dirancang untuk memberikan pengalaman pengguna terbaik dalam mengelola waktu.",
    platformApp: ["Mobile App"],
    image: ThumbClock,
    githubURL: {
      mobile: "https://github.com/agungkurniawanid/clock_app",
    },
    liveURL: "#",
    githubApi: "",
    technologies: ["Flutter"],
  },
  {
    id: 6,
    title: "Electro Mart App",
    description:
      "Aplikasi E-Commerce untuk menjual peralatan elektronik seperti Laptop, Komputer, TV dan lain-lain. Dibuat dengan Flutter untuk aplikasi mobile dan Nextjs untuk aplikasi website.",
    platformApp: ["Web App", "Mobile App"],
    image: ThumbElectroMart,
    githubURL: {
      web: "https://github.com/agungkurniawanid/electro_mart_web",
      mobile: "https://github.com/agungkurniawanid/electro_mart_app",
    },
    liveURL: "#",
    githubApi: "",
    technologies: ["Flutter", "Next.js", "MySQL", "TailwindCSS"],
  },
  {
    id: 7,
    title: "QR Code Reader App",
    description:
      "QRCode Reader adalah aplikasi yang memungkinkan pengguna untuk memindai dan membaca kode QR dengan cepat dan efisien. Aplikasi ini mendukung berbagai jenis konten yang dikodekan dalam QR, seperti URL, teks, kontak, dan informasi lainnya.",
    platformApp: ["Mobile App"],
    image: ThumbQRCode,
    githubURL: {
      mobile: "https://github.com/agungkurniawanid/qrcode_reader_app",
    },
    liveURL: "#",
    githubApi: "",
    technologies: ["Flutter"],
  },
    {
    id: 9,
    title: "HandyCraft App",
    description:
      "Aplikasi untuk UMKM yang bergerak di bidang usaha kerajinan dan perkakas, aplikasi ini berisi sistem yang dapat mengatur transaksi, keuangan seperti pemasukan dan pengeluaran serta pemasukan dari supplier. Dan integrasi Firebase",
    platformApp: ["Mobile App"],
    image: ThumbHandyCraft,
    githubURL: {
      mobile: "https://github.com/agungkurniawanid/handycraft_app",
    },
    liveURL: "#",
    githubApi: "",
    technologies: ["Flutter"],
  },
];
