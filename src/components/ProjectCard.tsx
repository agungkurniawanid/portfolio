"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { Project } from "./sections/ProjectSection";
import { MonitorSmartphone } from "lucide-react";
import ProjectDetailModal from "./ProjectDetailModal";

interface Props {
  item: Project;
}

export default function ProjectCard({ item }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [starCount, setStarCount] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: cardRef.current,
        start: `70% bottom`,
      },
    });

    tl.fromTo(
      cardRef.current,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, ease: "power1.inOut", duration: 0.4 }
    );
  }, []);

  useEffect(() => {
    let ignore = false;
    if (!item.githubApi) return;
    async function fetchData() {
      const response = await fetch(item.githubApi);
      const data = await response.json();
      const stargazersCount = data.stargazers_count;
      if (stargazersCount && !ignore) setStarCount(stargazersCount);
    }
    fetchData();
    return () => { ignore = true; };
  }, [item.githubApi]);

  return (
    <>
      <div
        ref={cardRef}
        className="relative col-span-1 w-full flex flex-col shadow-shadow0 border rounded-2xl overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300"
      >
        {/* Thumbnail */}
        <div className="relative w-full aspect-video overflow-hidden">
          <Image
            priority
            alt={item.title}
            src={item.image}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-2 p-4 flex-1">
          <h3 className="text-accentColor font-semibold text-sm leading-snug line-clamp-2">
            {item.title}
          </h3>

          <p className="text-xs text-gray-600 line-clamp-2">
            {item.description}
          </p>

          {/* Platform badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <MonitorSmartphone size={13} className="text-black shrink-0" />
            {item.platformApp.map((p, i) => (
              <span
                key={i}
                className={`px-2 py-[2px] rounded-full text-[10px] font-medium ${
                  i % 2 === 0
                    ? "border border-accentColor text-black"
                    : "bg-accentColor text-white"
                }`}
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
            </svg>
            <span>{starCount}</span>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-1.5 rounded-full bg-accentColor text-white text-xs font-semibold hover:opacity-90 transition-all hover:scale-105 shadow-md"
          >
            Detail
          </button>
        </div>
      </div>

      {showModal && (
        <ProjectDetailModal item={item} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
