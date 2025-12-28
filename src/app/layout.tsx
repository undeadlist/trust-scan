import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/design-system";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${BRAND.name} - Trust Scanner for AI Builders`,
  description: `${BRAND.tagline}. Check if that shiny new service is legit before you hand over your API keys. Free and open source.`,
  keywords: [
    "url scanner",
    "trust check",
    "scam detector",
    "domain verification",
    "security",
    "ai builder",
    "indie dev",
    "api security",
    "vibe check",
  ],
  authors: [{ name: BRAND.builtBy, url: BRAND.builtByUrl }],
  creator: BRAND.builtBy,
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  openGraph: {
    title: `${BRAND.name} - Trust Scanner for AI Builders`,
    description: `${BRAND.tagline}. Check if that shiny new service is legit before you hand over your API keys.`,
    type: "website",
    siteName: BRAND.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} - Trust Scanner`,
    description: `${BRAND.tagline}. Free and open source trust scanner.`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950`}
      >
        {children}
      </body>
    </html>
  );
}
