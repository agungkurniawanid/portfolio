import type { Metadata } from "next"
import { Jost } from "next/font/google"
import Header from "@/components/layouts/Header" 
import "./globals.css"
import { ThemeProvider } from "@/providers/ThemeProvider"
import WelcomePopup from "@/components/WelcomePopup"

const jost = Jost({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Agung Kurniawan - Portfolio",
  description: "A Software Engineer",
  applicationName: "Portfolio",
  openGraph: {
    type: "website",
    url: "https://gungzzleefy.vercel.app/",
    title: "AgungKurniawan.dev",
    description:
      "Portfolio website developed with NextJS, TypeScript, ShadcnUI & GSAP.",
    siteName: "Portfolio website",
    images: [
      {
        url: "https://gungzzleefy.vercel.app/thumbnail-url-share.jpeg",
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
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={jost.className} suppressHydrationWarning>
        {/* <Loader /> */}
        {/* Loading animation (0–12 counter) — uncomment to re-enable */}

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <WelcomePopup />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}