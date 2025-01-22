"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"

export default function MouseSection() {
  const cursorRef = useRef(null)

  useEffect(() => {
    document.addEventListener("mousemove", (e) => {
      const mouseX = e.clientX
      const mouseY = e.clientY
      gsap.to(cursorRef.current, {
        x: mouseX,
        y: mouseY,
        opacity: 1,
        delay: 0,
      })
    })

    const hideCursor = () => {
      gsap.to(cursorRef.current, { opacity: 0 })
    }

    const showCursor = () => {
      gsap.to(cursorRef.current, { opacity: 1 })
    }

    document.addEventListener("mouseleave", hideCursor)
    document.addEventListener("mousedown", hideCursor)
    document.addEventListener("mouseup", showCursor)

    return () => {
      // Cleanup event listeners on component unmount
      document.removeEventListener("mousemove", () => {})
      document.removeEventListener("mouseleave", hideCursor)
      document.removeEventListener("mousedown", hideCursor)
      document.removeEventListener("mouseup", showCursor)
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      className="hidden lg:block w-4 h-4 opacity-0 pointer-events-none rounded-full border-2 border-[#0EC47E] border-transparent z-[9999] fixed -translate-x-1/2 -translate-y-1/2"
    />
  )
}
