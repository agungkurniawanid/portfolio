"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Image from "next/image";
import { Project } from "./sections/ProjectSection";
import { Code2, FileCode, Github, MonitorSmartphone } from "lucide-react";
import { getTechIcon } from "./TechIcon";
import { Youtube } from "iconsax-react";
import { FaYoutube } from "react-icons/fa";

interface Props {
  item: Project;
}

export default function ProjectCard({ item }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [starCount, setStarCount] = useState<number>(0);

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
      {
        scale: 0,
      },
      {
        scale: 1,
        ease: "power1.inOut",
      }
    );
  }, []);

  useEffect(() => {
    let ignore = false;
    if (!item.githubApi) return;
    async function fetchData() {
      const response = await fetch(item.githubApi);
      const data = await response.json();
      const stargazersCount = data.stargazers_count;
      const stargazersUrl = data.stargazers_url;

      if (stargazersCount && stargazersUrl && !ignore) {
        setStarCount(stargazersCount);
      }
    }

    fetchData();
    return () => {
      ignore = true;
    };
  }, [item.githubApi]);

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden col-span-1 w-full flex flex-col shadow-shadow0 border rounded-[0.75rem]"
    >
      <div className="w-full aspect-video relative">
        <Image
          priority
          alt={item.title}
          src={item.image}
          className="object-cover aspect-square"
        />
      </div>

      <div className="flex-1 group relative p-4 flex flex-col gap-4 after:content-[''] after:rounded-full after:absolute after:z-[10] after:w-[32px] after:h-[32px] after:bg-accentColor after:scale-[1] after:bottom-[-24px] after:right-[-24px] after:origin-center after:transition-transform after:duration-500 after:ease-out hover:after:scale-[50] overflow-hidden">
        <div className="z-20 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h3 className="text-accentColor group-hover:text-white font-medium">
              {item.title}
            </h3>
            <div className="flex items-center group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="scale-[0.7] group-hover:-rotate-12"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="#000000"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
              </svg>
              <div className="font-medium text-sm">{starCount}</div>
            </div>
          </div>
          <p className="text-black text-sm group-hover:text-white line-clamp-3">
            {item.description}
          </p>
        </div>

        {/* Platform Section */}
        <div className="z-20">
          <div className="flex items-center gap-2 text-black group-hover:text-white text-[14px] font-medium mb-2">
            <MonitorSmartphone size={16} />
            <p>Platform Aplikasi :</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {item.platformApp.map((tech, index) => (
              <div
                key={index}
                className={`px-2 py-[3px] whitespace-nowrap shadow-sm rounded-xl text-sm flex justify-center items-center ${
                  index % 2 === 0
                    ? "border border-accentColor bg-white text-black"
                    : "bg-accentColor group-hover:border-[0.01px] text-white"
                }`}
              >
                {tech}
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className="z-20">
          <div className="flex items-center gap-2 text-black group-hover:text-white text-[14px] font-medium mb-2">
            <Code2 size={16} />
            <p>Tag & Tech Development :</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {item.technologies.map((tech, index) => (
              <div
                key={index}
                className="px-2 py-[3px] whitespace-nowrap shadow-md bg-[#f1f1f1] rounded-xl text-sm flex items-center gap-1"
              >
                {getTechIcon(tech)}
                <span>{tech}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Visit & Code Source Button */}
        <div className="z-20">
          <div className="flex items-center gap-2 text-black group-hover:text-white text-[14px] font-medium mb-2">
            <FileCode size={16} />
            <p>Src Code & Demo App :</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={item.liveURL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 flex items-center gap-2 group-hover:bg-[#f1f1f1] bg-accentColor group-hover:text-black text-white rounded-md text-sm font-medium shadow-md hover:opacity-90 transition"
            >
              <FaYoutube size={16} />
              <span>Live Demo</span>
            </a>

            {item.githubURL &&
              Object.entries(item.githubURL).map(([key, url], index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 flex items-center gap-2 bg-black text-white rounded-md text-sm font-medium shadow-md hover:opacity-90 transition"
                >
                  <Github size={16} />
                  <span>
                    GitHub {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                </a>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
