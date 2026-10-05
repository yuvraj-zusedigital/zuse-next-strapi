import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSiteSettings } from "@/lib/site-settings";
import NotFoundContent from "@/components/NotFoundContent";
import "./styles/globals.css";
import "./styles/out.css";
import "./styles/components/header.css";
import "./styles/components/footer.css";
import "./styles/components/not-found.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Unmatched-URL 404 — owns the full HTML document (no root layout wrap),
 * so only one <title> is emitted.
 */
export const metadata: Metadata = {
  title: "Page Not Found | Zuse Digital",
  description: "The page you are looking for does not exist.",
  // Next already injects noindex on 404 — don't set robots here or you get two meta tags.
};

export default async function GlobalNotFound() {
  const settings = await getSiteSettings();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface-0 text-ink-900">
        <Header settings={settings} />
        <main className="relative flex-1 py-24 px-6">
          <NotFoundContent className="mx-auto mt-16" />
        </main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
