import Link from 'next/link';
import Image from 'next/image';
import { PageLayout } from '@/components';
import { BRAND } from '@/lib/design-system';

export default function NotFound() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="/logo.png"
              alt={BRAND.name}
              width={120}
              height={120}
              className="rounded-xl"
            />
          </div>

          {/* Error Code */}
          <h1 className="text-8xl font-bold bg-gradient-to-r from-red-500 to-indigo-500 bg-clip-text text-transparent mb-4">
            404
          </h1>

          {/* Message */}
          <h2 className="text-2xl font-semibold text-zinc-200 mb-4">
            Page Not Found
          </h2>
          <p className="text-zinc-400 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 rounded-lg transition-colors text-white font-medium"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Scan a URL
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors text-zinc-200"
            >
              Learn About {BRAND.name}
            </Link>
          </div>

          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t border-zinc-800">
            <p className="text-sm text-zinc-500 mb-4">Or try one of these:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/how-it-works" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                How It Works
              </Link>
              <Link href="/faq" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                FAQ
              </Link>
              <Link href="/best-practices" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                Best Practices
              </Link>
              <Link href="/site-owners" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                For Site Owners
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
