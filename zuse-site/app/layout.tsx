import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import "./styles/out.css";
import "./styles/components/header.css";
import "./styles/components/hero.css";
import "./styles/components/logos.css";
import "./styles/components/stats.css";
import "./styles/components/footer.css";
import "./styles/components/manifesto.css";
import "./styles/components/services.css";
import "./styles/components/service-banner.css";
import "./styles/components/digital-products.css";
import "./styles/components/process.css";
import "./styles/components/leaders.css";
import "./styles/components/blog.css";
import "./styles/components/blog-detail.css";
import "./styles/components/contact.css";
import "./styles/components/testimonials.css";
import "./styles/components/awards.css";
import "./styles/components/zanyar.css";
import "./styles/components/work.css";
import "./styles/components/casestudy.css";
import "./styles/components/not-found.css";
import "./styles/components/webapplication.css";
import "./styles/components/mobiledesign.css";
import "./styles/components/webdesign.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VisitTracker from "@/components/VisitTracker";
import WebVitals from "@/components/WebVitals";
import { getSiteUrl } from "@/lib/config/site";
import { getSiteSettings } from "@/lib/site-settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title:
    "Australian Website Design, Software Development & AI Agency | Zuse Digital",
  description:
    "Award-winning Australian software agency delivering AI-powered websites, web apps, and mobile apps with world-class design.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Header & footer menus from Strapi (falls back to the built-in links).
  const settings = await getSiteSettings();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Degular (Adobe Fonts / Typekit). preconnect speeds up the blocking CSS+font fetch. */}
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://p.typekit.net" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://use.typekit.net/ebo3tac.css" />
      </head>
      <body className="min-h-full flex flex-col">
        <Header settings={settings} />

        {children}
        <Footer settings={settings} />
        <VisitTracker />
        <WebVitals />
      </body>
    </html>
  );
}
