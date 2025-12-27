import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIBuilds.net - Trust Scanner for AI Builders",
  description: "For AI Builders, By AI Builders. Check if that shiny new service is legit before you hand over your API keys. Free and open source.",
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
  authors: [{ name: "UndeadList.com", url: "https://undeadlist.com" }],
  creator: "UndeadList.com",
  openGraph: {
    title: "AIBuilds.net - Trust Scanner for AI Builders",
    description: "For AI Builders, By AI Builders. Check if that shiny new service is legit before you hand over your API keys.",
    type: "website",
    siteName: "AIBuilds.net",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIBuilds.net - Trust Scanner",
    description: "For AI Builders, By AI Builders. Free and open source trust scanner.",
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
