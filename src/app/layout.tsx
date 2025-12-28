import type { Metadata, Viewport } from "next";
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

// Viewport configuration for mobile optimization
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#18181b' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://trustscan.aibuilds.com'),
  title: {
    default: `${BRAND.name} - Free URL Scanner for AI Builders | AIBuilds`,
    template: `%s | ${BRAND.name}`,
  },
  description: `${BRAND.name} by AIBuilds - Free URL trust scanner for indie developers and AI builders. Check if websites are legit before connecting your API keys. Scam detection, domain verification, and AI-powered analysis.`,
  keywords: [
    // Primary keywords (target ranking)
    "trust scan",
    "aibuilds",
    "trustscan",
    "ai builds",
    // Feature keywords
    "url scanner",
    "website trust checker",
    "scam detector",
    "domain verification",
    "phishing detector",
    "website safety checker",
    // Audience keywords
    "ai builder tools",
    "indie developer security",
    "api key security",
    "developer security tools",
    // Long-tail keywords
    "check if website is legit",
    "is this website safe",
    "website legitimacy checker",
    "free url scanner",
    "online scam checker",
    // Brand association
    "undeadlist",
    "trust scanner",
  ],
  authors: [{ name: BRAND.builtBy, url: BRAND.builtByUrl }],
  creator: BRAND.builtBy,
  publisher: 'AIBuilds',
  category: 'Security Tools',
  classification: 'Web Application',
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: `${BRAND.name} - Free URL Scanner for AI Builders`,
    description: `Check if websites are legit before connecting your API keys. Free scam detection and domain verification by AIBuilds.`,
    type: "website",
    siteName: `${BRAND.name} by AIBuilds`,
    url: 'https://trustscan.aibuilds.com',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${BRAND.name} - Free URL Scanner for AI Builders by AIBuilds`,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: '@undeadlistshop',
    creator: '@undeadlistshop',
    title: `${BRAND.name} - Free URL Scanner`,
    description: `Check if websites are legit before handing over your API keys. Free and open source by AIBuilds.`,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://trustscan.aibuilds.com',
  },
  verification: {
    // Add your Google Search Console verification code here
    // google: 'your-google-verification-code',
  },
  other: {
    'msapplication-TileColor': '#09090b',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};

// JSON-LD Structured Data for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://trustscan.aibuilds.com/#website',
      url: 'https://trustscan.aibuilds.com',
      name: 'Trust Scan',
      description: 'Free URL scanner for AI builders. Check if websites are legit before connecting your API keys.',
      publisher: {
        '@id': 'https://trustscan.aibuilds.com/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://trustscan.aibuilds.com/?url={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://trustscan.aibuilds.com/#organization',
      name: 'AIBuilds',
      alternateName: 'UndeadList',
      url: 'https://aibuilds.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://trustscan.aibuilds.com/logo.png',
        width: 512,
        height: 512,
      },
      sameAs: [
        'https://x.com/undeadlistshop',
        'https://github.com/undeadlist/trust-scan',
        'https://undeadlist.com',
      ],
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://trustscan.aibuilds.com/#application',
      name: 'Trust Scan',
      description: 'Free URL trust scanner for developers. Detect scams, verify domains, and check website legitimacy with AI-powered analysis.',
      url: 'https://trustscan.aibuilds.com',
      applicationCategory: 'SecurityApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      creator: {
        '@id': 'https://trustscan.aibuilds.com/#organization',
      },
      featureList: [
        'URL scanning',
        'Domain age verification',
        'SSL certificate checking',
        'Scam pattern detection',
        'AI-powered analysis',
        'Threat intelligence',
        'GitHub presence verification',
      ],
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://trustscan.aibuilds.com/#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://trustscan.aibuilds.com',
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950`}
      >
        {children}
      </body>
    </html>
  );
}
