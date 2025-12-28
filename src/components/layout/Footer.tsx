'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BRAND, NAV_LINKS } from '@/lib/design-system';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-16 border-t border-zinc-800/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.png"
                alt={BRAND.name}
                width={72}
                height={72}
                className="rounded-xl"
              />
              <div>
                <span className="text-lg font-bold text-zinc-100">{BRAND.name}</span>
                <p className="text-xs text-indigo-400">{BRAND.taglineJp}</p>
              </div>
            </div>
            <p className="text-sm text-zinc-500 mb-4 max-w-md">
              {BRAND.tagline}. Free. Open source. Helping indie devs stay safe.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-600">Built by</span>
              <a
                href={BRAND.builtByUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Image
                  src="/undeadlist-logo.png"
                  alt={BRAND.builtBy}
                  width={54}
                  height={54}
                  className="rounded"
                />
                <span className="text-sm font-medium">{BRAND.builtBy}</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {NAV_LINKS.slice(0, 4).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <a
                  href={BRAND.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1"
                >
                  GitHub
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href={BRAND.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1"
                >
                  Twitter/X
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${BRAND.contact}`}
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-800/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-600">
              &copy; {currentYear} {BRAND.name}. Free and open source.
            </p>
            <p className="text-xs text-zinc-600 text-center md:text-right max-w-lg">
              Results are informational only and provided without warranty. Always do your own research
              before connecting to any service. See our{' '}
              <Link href="/terms" className="text-zinc-500 hover:text-zinc-400 underline">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-zinc-500 hover:text-zinc-400 underline">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
