import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme";
import { cookies } from "next/headers";
import { ACCENT_COOKIE, isAccent } from "@/lib/accents";
import { Toaster } from "@/components/ui/sonner";
import { HoverHints } from "@/components/hover-hints";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Zuse CMS", template: "%s · Zuse CMS" },
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Colour theme (saved on the account, mirrored in a cookie), rendered on the server: no flash.
  const accent = (await cookies()).get(ACCENT_COOKIE)?.value;
  return (
    <html
      data-accent={isAccent(accent) && accent !== "zuse" ? accent : undefined}
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // next-themes sets the theme class before React hydrates.
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
          <Toaster position="bottom-right" richColors />
          <HoverHints />
        </ThemeProvider>
      </body>
    </html>
  );
}
