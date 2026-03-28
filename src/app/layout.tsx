import type { Metadata } from "next"
import { Jost } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/providers/ThemeProvider"
import IntlProvider from "@/providers/IntlProvider"
import ThemeColorSync from "@/components/ThemeColorSync"
import PublicLayout from "@/components/layouts/PublicLayout"
import { Toaster } from "sonner"

const jost = Jost({ subsets: ["latin"] })

export const metadata: Metadata = {
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
      {/*
       * Inline script runs synchronously before first paint.
       * Reads localStorage (next-themes key = "theme") or falls back to
       * prefers-color-scheme, then sets:
       *   - <meta name="theme-color">   → Android browser chrome color
       *   - <meta name="color-scheme">  → browser scrollbar / input style
       *   - html backgroundColor        → prevents white flash under chrome
       */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  try{
    var t=localStorage.getItem('theme');
    var dark=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches);
    var c=dark?'#111c20':'#ffffff';
    var cs=dark?'dark':'light';
    var m=document.createElement('meta');m.name='theme-color';m.content=c;
    document.head.appendChild(m);
    var s=document.createElement('meta');s.name='color-scheme';s.content=cs;
    document.head.appendChild(s);
    document.documentElement.style.backgroundColor=c;
    document.documentElement.style.colorScheme=cs;
  }catch(e){}
})();`,
          }}
        />
      </head>
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
            <Toaster richColors />
            <ThemeColorSync />
            <PublicLayout>
              {children}
            </PublicLayout>
          </ThemeProvider>
        </IntlProvider>
      </body>
    </html>
  )
}
