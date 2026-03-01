"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import Image from "next/image";
import { Code2, FileCode, MonitorSmartphone, X } from "lucide-react";
import { Github } from "lucide-react";
import { FaYoutube } from "react-icons/fa";
import { getTechIcon } from "./TechIcon";
import { Project } from "./sections/ProjectSection";

interface Props {
  item: Project;
  onClose: () => void;
}

export default function ProjectDetailModal({ item, onClose }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Open animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "power2.out" }
      );
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, scale: 0.85, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "back.out(1.5)" }
      );
    });
    return () => ctx.revert();
  }, []);

  // Close animation then call onClose
  const handleClose = () => {
    gsap.to(contentRef.current, {
      opacity: 0,
      scale: 0.85,
      y: 30,
      duration: 0.25,
      ease: "power2.in",
    });
    gsap.to(backdropRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: onClose,
    });
  };

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) handleClose();
  };

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div
        ref={contentRef}
        className="modal-scroll relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header image */}
        <div className="relative w-full aspect-video">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover rounded-t-2xl"
            priority
          />
          <button
            onClick={handleClose}
            aria-label="Close modal"
            className="absolute top-3 right-3 bg-white/80 hover:bg-white rounded-full p-1.5 transition shadow-md"
          >
            <X size={18} className="text-black" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5">
          {/* Title */}
          <h2 className="text-accentColor font-semibold text-lg leading-snug">
            {item.title}
          </h2>

          {/* Description */}
          <p className="text-sm text-gray-700 leading-relaxed">
            {item.description}
          </p>

          {/* Platform */}
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-black mb-2">
              <MonitorSmartphone size={15} />
              <span>Platform Aplikasi :</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {item.platformApp.map((p, i) => (
                <span
                  key={i}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium shadow-sm ${
                    i % 2 === 0
                      ? "border border-accentColor text-black bg-white"
                      : "bg-accentColor text-white"
                  }`}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-black mb-2">
              <Code2 size={15} />
              <span>Tag & Tech Development :</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {item.technologies.map((tech, i) => (
                <div
                  key={i}
                  className="px-2.5 py-1 shadow-md bg-[#f1f1f1] rounded-xl text-xs flex items-center gap-1"
                >
                  {getTechIcon(tech)}
                  <span className="text-black">{tech}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-black mb-2">
              <FileCode size={15} />
              <span>Src Code & Demo App :</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={item.liveURL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 flex items-center gap-2 bg-accentColor text-white rounded-md text-xs font-medium shadow-md hover:opacity-90 transition"
              >
                <FaYoutube size={15} />
                <span>Live Demo</span>
              </a>
              {item.githubURL &&
                Object.entries(item.githubURL).map(([key, url], i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 flex items-center gap-2 bg-black text-white rounded-md text-xs font-medium shadow-md hover:opacity-90 transition"
                  >
                    <Github size={15} />
                    <span>
                      GitHub {key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                  </a>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
