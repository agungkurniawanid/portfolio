import type { Metadata } from "next"
import { Jost } from "next/font/google"
import Header from "@/components/layouts/Header" 
import "./globals.css"
import Loader from "@/components/Loader"
import { ThemeProvider } from "@/providers/ThemeProvider"

const jost = Jost({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Agung Kurniawan - Portfolio",
  description: "A Software Engineer",
  applicationName: "Portfolio",
  openGraph: {
    type: "website",
    url: "https://agungkurniawandev.netlify.app/",
    title: "AgungKurniawan.dev",
    description:
      "Portfolio website developed with NextJS, TypeScript, ShadcnUI & GSAP.",
    siteName: "Portfolio website",
    images: [
      {
        url: "https://i.ibb.co/m5bYtw6/responsive-showcase.png",
      },
    ],
  },
  authors: {
    name: "Agung Kurniawan",
  },
  generator: "NextJs",
  keywords: ["NextJS", "Portfolio", "GSAP", "ShadcnUI"],
  creator: "Shin Thant",
  icons: {
    icon: "/ico.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={jost.className}>
        <Loader />

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}