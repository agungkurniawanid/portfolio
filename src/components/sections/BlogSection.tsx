"use client"

import { useEffect, useRef } from "react"
import useOnScreen from "@/hooks/UseOnScreen"
import useScrollActive from "@/hooks/UseScrollActive"
import ComingSoon1 from "@/assets/blog/2.jpeg"
import ComingSoon2 from "@/assets/blog/3.jpeg"
import SpaceCat from "@/assets/blog/1.jpeg"
import { useSectionStore } from "@/stores/Section"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/dist/ScrollTrigger"
import { ArrowRight } from "iconsax-react"
import { StaticImageData } from "next/image"
import Link from "next/link"
import { RoughNotation } from "react-rough-notation"
import BlogCard from "../BlogCard"

export default function BlogSection() {
  gsap.registerPlugin(ScrollTrigger);

  // Fix: Properly type the refs
  const sectionRef = useRef<HTMLElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  
  // Fix: Type assertion for useOnScreen
  const isOnScreen = useOnScreen(elementRef as React.RefObject<HTMLElement>);

  useEffect(() => {
    if (!sectionRef.current) return;

    const q = gsap.utils.selector(sectionRef);
    
    // Create and store the timeline
    const tl = gsap.timeline({
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

    // Cleanup function
    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  // Fix: Type assertion for useScrollActive
  const aboutSectionOnView = useScrollActive(sectionRef as React.RefObject<HTMLElement>);
  const { setSection } = useSectionStore();

  useEffect(() => {
    if (aboutSectionOnView) {
      setSection("#blog");
    }
  }, [aboutSectionOnView, setSection]);

  return (
    <section
      ref={sectionRef}
      id="blog"
      className="h-full bg-baseBackground py-14 px-10 lg:px-[5%]"
    >
      <div className="w-full max-w-[1100px] h-full m-auto flex flex-col items-center gap-14">
        <div className="w-[80%] md:w-full flex flex-col gap-8 items-center">
          <RoughNotation
            type="underline"
            strokeWidth={2}
            color="hsl(157, 87%, 41%)"
            order={1}
            show={isOnScreen}
          >
            <div className="text-xl md:text-4xl tracking-tight font-medium w-fit dark:text-accentColor">
              Blog
            </div>
          </RoughNotation>
          <div ref={elementRef} className="overflow-hidden flex flex-col gap-1">
            <div className="qoutes-animation mx-auto text-center text-sm dark:text-white flex flex-col items-center font-normal">
            Saya mendokumentasikan perjalanan saya dengan menulis postingan blog tentang proyek dan pengalaman saya.
            </div>
            <div className="qoutes-animation mx-auto text-center text-sm dark:text-white flex flex-col items-center font-normal">
              <div>Beberapa blog yang saya buat masih progress. 🚀</div>
            </div>
          </div>
        </div>

        <div className="md:w-full pt-4 pb-10 flex flex-col items-start gap-6">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} item={blog} />
          ))}
        </div>

        <Link
          href='https://www.tiktok.com/@agungkurniawan.id?_t=ZS-8t6x1wpm4z2&_r=1'
          target="_blank"
          aria-label="Follow up on my medium account"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <div className="text-accentColor navlink text-sm italic">
            Follow saya di TikTok
          </div>
          <ArrowRight color="white" size={15} />
        </Link>
      </div>
    </section>
  )
}

export interface Blog {
  id: number
  title: string
  description: string
  image: StaticImageData
  publishAt: string
  link: string
}

const blogs: Blog[] = [
  {
    id: 1,
    title: "Mengupas Tuntas Teknologi Blockchain: Lebih dari Sekadar Cryptocurrency",
    description:
      "Blockchain sering kali dikaitkan dengan cryptocurrency seperti Bitcoin atau Ethereum. Namun, tahukah Anda bahwa teknologi ini memiliki potensi besar di luar dunia keuangan? Dalam artikel ini, kita akan membahas berbagai aplikasi blockchain di dunia nyata, seperti keamanan data, supply chain, hingga voting elektronik.",
    image: SpaceCat,
    publishAt: "2025, Januari 22",
    link: "/maintenance",
  },
  {
    id: 2,
    title: "Kecerdasan Buatan dalam Kehidupan Sehari-hari: Peluang dan Tantangan",
    description:
      "Kecerdasan buatan (AI) bukan lagi sekadar konsep di film fiksi ilmiah. Dari asisten virtual seperti Siri dan Alexa hingga algoritma rekomendasi di Netflix, AI telah menjadi bagian tak terpisahkan dari kehidupan kita. Artikel ini mengeksplorasi bagaimana AI membantu mempermudah aktivitas sehari-hari dan tantangan yang mungkin timbul di masa depan.",
    image: ComingSoon1,
    publishAt: "2025, Januari 22",
    link: "/maintenance",
  },
  {
    id: 2,
    title: "Masa Depan Internet: Apa itu Web 3.0 dan Bagaimana Ini Akan Mengubah Dunia Digital?",
    description:
      "Web 3.0 adalah evolusi internet yang menjanjikan lebih banyak desentralisasi, keamanan, dan kebebasan bagi penggunanya. Dalam artikel ini, Anda akan mempelajari apa itu Web 3.0, perbedaannya dengan Web 2.0, serta teknologi di baliknya seperti blockchain dan decentralized apps (dApps).",
    image: ComingSoon2,
    publishAt: "2025, Januari 22",
    link: "/maintenance",
  },
]