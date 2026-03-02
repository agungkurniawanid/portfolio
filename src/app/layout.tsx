import type { Metadata } from "next"
import { Jost } from "next/font/google"
import Header from "@/components/layouts/Header" 
import GuestbookBanner from "@/components/GuestbookBanner"
import "./globals.css"
import { ThemeProvider } from "@/providers/ThemeProvider"
import IntlProvider from "@/providers/IntlProvider"
import WelcomePopup from "@/components/WelcomePopup"
import ThemeColorSync from "@/components/ThemeColorSync"

const jost = Jost({ subsets: ["latin"] })

export const metadata: Metadata = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#111c20" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  title: "Agung Kurniawan - Portfolio",
  description: "A Software Engineer",
  applicationName: "Portfolio",
  openGraph: {
    type: "website",
    url: "https://gungzzleefy.vercel.app/",
    title: "Gungzzleefy",
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

        <IntlProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ThemeColorSync />
            <GuestbookBanner />
            <Header />
            <WelcomePopup />
            {children}
          </ThemeProvider>
        </IntlProvider>
      </body>
    </html>
  )
}