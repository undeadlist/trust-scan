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
  metadataBase: new URL('https://trustscanpro.com'),
  title: {
    default: `${BRAND.name} - Free URL Scanner for AI Builders | UndeadList`,
    template: `%s | ${BRAND.name}`,
  },
  description: `${BRAND.name} by UndeadList - Free URL trust scanner for indie developers and AI builders. Check if websites are legit before connecting your API keys. Scam detection, domain verification, and AI-powered analysis.`,
  keywords: [
    // Primary keywords (target ranking)
    "trust scan",
    "trustscanpro",
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
  publisher: 'UndeadList',
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
    description: `Check if websites are legit before connecting your API keys. Free scam detection and domain verification by UndeadList.`,
    type: "website",
    siteName: `${BRAND.name} by UndeadList`,
    url: 'https://trustscanpro.com',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${BRAND.name} - Free URL Scanner for AI Builders by UndeadList`,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: '@undeadlistshop',
    creator: '@undeadlistshop',
    title: `${BRAND.name} - Free URL Scanner`,
    description: `Check if websites are legit before handing over your API keys. Free and open source by UndeadList.`,
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
    canonical: 'https://trustscanpro.com',
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
      '@id': 'https://trustscanpro.com/#website',
      url: 'https://trustscanpro.com',
      name: 'Trust Scan',
      description: 'Free URL scanner for AI builders. Check if websites are legit before connecting your API keys.',
      publisher: {
        '@id': 'https://trustscanpro.com/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://trustscanpro.com/?url={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://trustscanpro.com/#organization',
      name: 'UndeadList',
      alternateName: 'Trust Scan',
      url: 'https://undeadlist.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://trustscanpro.com/logo.png',
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
      '@id': 'https://trustscanpro.com/#application',
      name: 'Trust Scan',
      description: 'Free URL trust scanner for developers. Detect scams, verify domains, and check website legitimacy with AI-powered analysis.',
      url: 'https://trustscanpro.com',
      applicationCategory: 'SecurityApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      creator: {
        '@id': 'https://trustscanpro.com/#organization',
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
      '@id': 'https://trustscanpro.com/#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://trustscanpro.com',
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
