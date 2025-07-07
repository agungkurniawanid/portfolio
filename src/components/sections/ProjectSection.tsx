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
import ImageOne from "@/assets/projects/thumbnail_in_progress2.png";

export default function ProjectSection() {
  gsap.registerPlugin(ScrollTrigger);

  const sectionRef = useRef<HTMLElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(elementRef as React.RefObject<HTMLElement>);

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
                &quot;Desain yang baik itu terlihat jelas. Desain yang hebat itu
                transparan.
              </div>
              <div>Desain bukan untuk filosofi, melainkan untuk kehidupan.&quot;</div>
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
  platformApp: string[];
  image: StaticImageData;
  githubURL: {
    [key: string]: string;
  };
  githubApi: string;
  liveURL: string;
  technologies: string[];
}

const projects: Project[] = [
  {
    id: 1,
    title: "Intelligence Quality Air Control System Greenhouse Kopi Nrsery App",
    description:
      "Menggabungkan Situs Web, Aplikasi Seluler, dan IoT. Proyek ini merupakan sistem kontrol kualitas udara berbasis kecerdasan buatan yang dirancang khusus untuk pembibitan kopi. Sistem ini bertujuan untuk memantau, menganalisis, dan mengontrol udara serta mendiagnosis penyakit kopi melalui aplikasi seluler dengan deep learning CNN.",
    platformApp: ["Web App", "Mobile App", "IoT Device"],
    image: ImageOne,
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
    image: ImageOne,
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
    image: ImageOne,
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
    image: ImageOne,
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
    image: ImageOne,
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
    image: ImageOne,
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
    image: ImageOne,
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
    image: ImageOne,
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
    image: ImageOne,
    githubURL: {
      mobile: "https://github.com/agungkurniawanid/handycraft_app",
    },
    liveURL: "#",
    githubApi: "",
    technologies: ["Flutter"],
  },
];
