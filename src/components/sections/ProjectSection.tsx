"use client";

import { useEffect, useRef } from "react";
import useOnScreen from "@/hooks/UseOnScreen";
import useScrollActive from "@/hooks/UseScrollActive";
import { useSectionStore } from "@/stores/Section";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { StaticImageData } from "next/image";
import Link from "next/link";
import { RoughNotation } from "react-rough-notation";
import ProjectCard from "../ProjectCard";
import ImageOne from "@/assets/projects/1.jpeg";
import ImageTwo from "@/assets/projects/2.jpeg";
import ImageTree from "@/assets/projects/3.jpeg";
import ImageFour from "@/assets/projects/4.jpeg";
import ImageFive from "@/assets/projects/5.jpeg";
import ImageSix from "@/assets/projects/6.jpeg";

export default function ProjectSection() {
  gsap.registerPlugin(ScrollTrigger);

  // Fix 1: Properly type the refs
  const sectionRef = useRef<HTMLElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  // Fix 2: Make sure useOnScreen accepts the correct type
  const isOnScreen = useOnScreen(elementRef as React.RefObject<HTMLElement>);

  useEffect(() => {
    const q = gsap.utils.selector(sectionRef);

    // Fix 3: Add proper type checking for the timeline
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

    // Optional: Clean up the timeline on component unmount
    return () => {
      timeline.kill();
    };
  }, []);

  // Set Active Session
  const projectSectionOnView = useScrollActive(sectionRef as React.RefObject<HTMLElement>);
  const { setSection } = useSectionStore();

  useEffect(() => {
    if (projectSectionOnView) {
      setSection("#project");
    }
  }, [projectSectionOnView, setSection]);

  return (
    <section
      ref={sectionRef}
      id="project"
      className="relative h-full bg-gray-50 dark:bg-gray-100 overflow-hidden py-14 px-10 lg:px-[5%]"
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
            <div className="text-xl md:text-4xl tracking-tight font-medium w-fit dark:text-accentColor">
              Popular Projects
            </div>
          </RoughNotation>
          <div ref={elementRef} className="overflow-hidden ">
            <div className="qoutes-animation  md:w-full text-center font-medium flex flex-col items-center">
              <div>
                Desain yang baik itu terlihat jelas. Desain yang hebat itu
                transparan.
              </div>
              <div>Desain bukan untuk filosofi, melainkan untuk kehidupan.</div>
            </div>
          </div>
        </div>
        <div className="w-full pt-40 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {projects.map((project) => (
            <ProjectCard key={project.id} item={project} />
          ))}
        </div>

        <div className="font-medium">
          Lihat project lainnya di{" "}
          <Link
            href="https://github.com/agungkurniawanid"
            target="_blank"
            aria-label="Expore more in my github profile"
            rel="noopener noreferrer"
            className="text-accentColor navlink dark:hover:text-black"
          >
            my github profile
          </Link>
        </div>
      </div>
    </section>
  );
}

export interface Project {
  id: number;
  title: string;
  description: string;
  techStacks: string[];
  image: StaticImageData;
  githubURL: string;
  githubApi: string;
  liveURL: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: "Intelligence Quality Air Control System Greenhouse Kopi Nrsery App",
    description:
      "Menggabungkan Website, Mobile App dan IoT. Proyek ini adalah sebuah sistem kontrol kualitas udara berbasis kecerdasan buatan yang dirancang khusus untuk nursery kopi. Sistem ini bertujuan untuk memonitor, menganalisis, dan mengontrol udara juga diagnosa penyakit kopi melalui mobile app dengan deep learning CNN.",
    techStacks: ["Laravel", "Flutter"],
    image: ImageOne,
    githubURL:
      "https://github.com/agungkurniawanid/mobileapp-intelligence-quality-air-control-system-greenhouse-kopi-nursery-app",
    liveURL: "/maintenance",
    githubApi: "",
  },
  {
    id: 2,
    title: "Ecommerce Electro Mart App",
    description:
      "Aplikasi E-Commerce untuk penjualan sebuah peralatan elektronik seperti Laptop, Komputer, TV dan lain-lain. Dibuat dengan Flutter untuk mobile app dan Nextjs untuk website app.",
    techStacks: ["Nextjs", "Flutter"],
    image: ImageFour,
    githubURL: "https://github.com/agungkurniawanid/webapp-electro-mart-app",
    liveURL: "/maintenance",
    githubApi: "",
  },
  {
    id: 3,
    title: "Emotional Facecs Classification App",
    description:
      "90% Accurate. Sebuah Classification Faces atau wajah dengan membedakan 6 kelas yang didefinisikan pada data dengan menggunakan metode CNN (Convolutional Neural Network)",
    techStacks: ["Flutter"],
    image: ImageSix,
    githubURL:
      "https://github.com/agungkurniawanid/notebook-cnn-emotional-faces-classification",
    liveURL: "/maintenance",
    githubApi: "",
  },
  {
    id: 4,
    title: "Marketplace KampSewa: Tempat Sewa & Menyewakan Alat Kamping",
    description:
      "Sebuah aplikasi yang menyediakan tempat penyewaan & sewa peralatan kamping kepada seluruh wilayah yang memungkinkan user dapat saling menyewa dan menyewakan barang campig mereka.",
    techStacks: ["Laravel", "Flutter"],
    image: ImageTwo,
    githubURL:
      "https://github.com/agungkurniawanid/mobileapp-marketplace-kampsewa",
    liveURL: "/maintenance",
    githubApi: "",
  },
  {
    id: 5,
    title: "Dapnetwork App",
    description:
      "Dapnetwork App, yang dikembangkan oleh DAPNetwork, memudahkan manajemen jaringan internet. Ini mencakup platform mobile untuk pegawai yang menangani penagihan dan pemasangan pelanggan baru, serta website untuk admin mengelola operasional melalui dashboard komprehensif.",
    techStacks: ["PHP", "Java"],
    image: ImageTree,
    githubURL:
      "https://github.com/agungkurniawanid/mobileapp-dapnetwork-app-old",
    liveURL: "/maintenance",
    githubApi: "",
  },
  {
    id: 6,
    title: "Digital Library App",
    description:
      "DigitalLibrary adalah platform perpustakaan digital yang dirancang untuk memberikan akses mudah ke berbagai e-book dari berbagai genre dan kategori. Dengan antarmuka yang ramah pengguna dan fitur canggih, DigitalLibrary memungkinkan pengguna untuk menjelajahi, membaca, dan mengelola koleksi buku elektronik mereka di satu tempat.",
    techStacks: ["Nextjs", "Flutter"],
    image: ImageFive,
    githubURL: "https://github.com/agungkurniawanid/webapp-digital-library",
    liveURL: "/maintenance",
    githubApi: "",
  },
];
