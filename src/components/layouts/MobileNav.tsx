import { useState } from "react"
import navlinks from "@/lib/NavConfig"
import { HambergerMenu } from "iconsax-react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "../ui/button"

export default function MobileNav() {
  const [opened, setOpened] = useState<boolean>(false)
  const router = useRouter()

  return (
    <Sheet open={opened} onOpenChange={(open) => setOpened(open)}>
      <SheetTrigger asChild className="block md:hidden">
        <Button
          className="px-2 flex justify-center items-center text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300"
          variant="ghost"
          aria-label="Toggle Navbar"
        >
          <HambergerMenu 
            className="w-6 h-6"
            color="currentColor"
          />
          <span className="sr-only">Toggle Navbar</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full h-full border-0 bg-white dark:bg-gray-900">
        <div className="py-20 w-full flex flex-col absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 gap-10 items-center">
          {navlinks.map((navLink) => (
            <div
              className="text-gray-800 dark:text-white hover:text-accentColor dark:hover:text-accentColor transition-colors duration-200"
              key={navLink.title}
              onClick={(e) => {
                e.preventDefault()
                router.push(navLink.href)
                setOpened(false)
              }}
            >
              {navLink.title}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}