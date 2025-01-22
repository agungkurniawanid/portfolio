import { ArrowRightIcon } from "@radix-ui/react-icons"
import { ArrowDown2, Mouse } from "iconsax-react"
import Link from "next/link"

export default function SocialLinks() {
  return (
    <>
      <div className="fixed z-10 right-4 bottom-[5%] md:bottom-[20%]">
        <div className="flex flex-col gap-6 items-center">
          {socialLinks.map((link) => (
            <Link
              key={link.id}
              title={link.title}
              target="_blank"
              aria-label={link.title}
              rel="noopener noreferrer"
              href={link.link}
              className="scale-110 rounded link-outline"
            >
              {link.svg}
            </Link>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 group flex flex-col gap-2 items-center left-4">
        <Link
          href='https://wa.me/6281331640909'
          style={{
            writingMode: "vertical-lr",
          }}
          aria-label="blog"
          className="flex text-xs group-hover:text-accentColor font-light tracking-[0.3em] items-center gap-2 dark:text-gray-400"
        >
          Contact me
        </Link>
        <div className="h-24 w-[0.4px] bg-gray-400 group-hover:bg-accentColor "></div>
      </div>

      <div className="hidden md:block absolute bottom-4 right-4">
        <Link
          href="/maintenance"
          aria-label="project"
          className="flex items-center gap-2 dark:text-gray-400"
        >
          <span className="text-sm tracking-widest">View Project</span>
          <ArrowRightIcon />
        </Link>
      </div>

      <Link
        href="#about"
        aria-label="about"
        className="absolute animate-bounce text-gray-600 dark:text-gray-400 hover:text-accentColor cursor-pointer bottom-4 left-[50%] -translate-x-1/2"
      >
        <div className="flex flex-col gap-1 items-center">
          <Mouse size={24} />
          <ArrowDown2 size={14} />
        </div>
      </Link>
    </>
  )
}

const socialLinks = [
  {
    id: 1,
    title: "Agung Kurniawan Github Profile",
    link: "https://github.com/agungkurniawanid",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        className="dark:fill-gray-400 hover:fill-accentColor dark:hover:fill-accentColor"
      >
        <path d="M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z"></path>
      </svg>
    ),
  },
  {
    id: 2,
    title: "Agung Kurniawan LinkedIn Profile",
    link: "https://www.linkedin.com/in/agung-k-74530028b",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        className="dark:fill-gray-400  hover:fill-accentColor dark:hover:fill-accentColor"
      >
        <path d="M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM8.339 18.337H5.667v-8.59h2.672v8.59zM7.003 8.574a1.548 1.548 0 1 1 0-3.096 1.548 1.548 0 0 1 0 3.096zm11.335 9.763h-2.669V14.16c0-.996-.018-2.277-1.388-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248h-2.667v-8.59h2.56v1.174h.037c.355-.675 1.227-1.387 2.524-1.387 2.704 0 3.203 1.778 3.203 4.092v4.71z"></path>
      </svg>
    ),
  },
  {
    id: 3,
    title: "Check Agung Kurniawan on Instagram",
    link: "https://www.instagram.com/agungkurniawan.id?igsh=MWJ5Z3k4d2MzOGl2cg==",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        className="dark:fill-gray-400 hover:fill-accentColor dark:hover:fill-accentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2 0 2.4.4 3.2 1.1.8.8 1.1 2 1.1 3.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.4 2.4-1.1 3.2-.8.8-2 1.1-3.2 1.1-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-2.4-.4-3.2-1.1-.8-.8-1.1-2-1.1-3.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c0-1.2.4-2.4 1.1-3.2.8-.8 2-1.1 3.2-1.1zm0-2C8.8 0 8.4 0 7.2.1 5.4.1 3.8.5 2.5 1.8.2 3 .1 4.8.1 7.6 0 8.8 0 9.2 0 12c0 2.8 0 3.2.1 4.4.1 2.8.5 4.4 1.8 5.7 1.2 1.2 2.8 1.7 5.7 1.8 1.2 0 .8.1 4.9.1 2.8 0 3.6 0 4.9-.1 2.9-.1 4.5-.5 5.7-1.8 1.2-1.2 1.7-2.8 1.8-5.7.1-1.2.1-1.6.1-4.4s0-3.2-.1-4.4c-.1-2.9-.5-4.5-1.8-5.7-1.2-1.2-2.8-1.7-5.7-1.8C15.6 0 15.2 0 12 0z" />
        <path d="M12 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zm0 10.1a3.9 3.9 0 1 1 0-7.8 3.9 3.9 0 0 1 0 7.8zm6.7-10.5a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z" />
      </svg>
    ),
}

]