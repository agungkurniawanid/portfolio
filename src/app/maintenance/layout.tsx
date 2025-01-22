import type { Metadata } from "next";
import { Jost } from "next/font/google";
const jost = Jost({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Oops...",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={jost.className}>{children}</body>
    </html>
  );
}
