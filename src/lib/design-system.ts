// Trust Scan Design System Constants

export const BRAND = {
  name: 'Trust Scan',
  tagline: 'For AI Builders, By AI Builders',
  taglineJp: 'トラストスキャナー',
  description: 'The same tools that let you ship in a weekend let scammers ship honeypots in an hour. Trust Scan helps you check if that shiny new service is legit before you hand over your API keys.',
  builtBy: 'UndeadList.com',
  builtByUrl: 'https://undeadlist.com',
  github: 'https://github.com/undeadlist/aibuilds',
  contact: 'contact@aibuilds.net',
} as const;

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/best-practices', label: 'Best Practices' },
  { href: '/site-owners', label: 'For Site Owners' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
] as const;

export const COLORS = {
  primary: {
    red: '#dc2626',        // Main brand red (matches logo circle)
    redLight: '#ef4444',
    redDark: '#b91c1c',
    indigo: '#3730a3',     // Deep indigo (matches katakana vibe)
    indigoLight: '#4f46e5',
    indigoDark: '#312e81',
    slate: '#1e293b',      // Dark slate for contrast
  },
  risk: {
    low: '#10b981',      // emerald-500
    medium: '#f59e0b',   // amber-500
    high: '#f97316',     // orange-500
    critical: '#ef4444', // red-500
  },
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
} as const;

export const RISK_CONFIG = {
  low: {
    label: 'Low Risk',
    color: 'emerald',
    bgClass: 'bg-emerald-500/20',
    borderClass: 'border-emerald-500/50',
    textClass: 'text-emerald-400',
    range: '0-25',
    meaning: 'Looks legitimate',
  },
  medium: {
    label: 'Medium Risk',
    color: 'amber',
    bgClass: 'bg-amber-500/20',
    borderClass: 'border-amber-500/50',
    textClass: 'text-amber-400',
    range: '26-50',
    meaning: 'Some concerns, check manually',
  },
  high: {
    label: 'High Risk',
    color: 'orange',
    bgClass: 'bg-orange-500/20',
    borderClass: 'border-orange-500/50',
    textClass: 'text-orange-400',
    range: '51-75',
    meaning: 'Multiple red flags',
  },
  critical: {
    label: 'Critical Risk',
    color: 'red',
    bgClass: 'bg-red-500/20',
    borderClass: 'border-red-500/50',
    textClass: 'text-red-400',
    range: '76-100',
    meaning: 'Strong scam indicators',
  },
} as const;

export const CHECKS_INFO = [
  {
    name: 'Domain Age',
    description: 'WHOIS registration date',
    icon: 'calendar',
  },
  {
    name: 'SSL Certificate',
    description: 'Valid? Issuer? Expiration?',
    icon: 'lock',
  },
  {
    name: 'Hosting',
    description: 'Provider, free tier detection',
    icon: 'server',
  },
  {
    name: 'Required Pages',
    description: 'Privacy, Terms, Contact',
    icon: 'file-text',
  },
  {
    name: 'Archive History',
    description: 'Wayback Machine snapshots',
    icon: 'archive',
  },
  {
    name: 'GitHub Presence',
    description: 'Public repos/org',
    icon: 'github',
  },
  {
    name: 'Pattern Matching',
    description: 'Suspicious claims detection',
    icon: 'search',
  },
] as const;

export type RiskLevel = keyof typeof RISK_CONFIG;
