'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumb?: {
    label: string;
    href: string;
  };
  logo?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  children?: ReactNode;
}

export function PageHero({
  title,
  subtitle,
  description,
  breadcrumb,
  logo,
  children,
}: PageHeroProps) {
  return (
    <div className="text-center py-12 md:py-16">
      {breadcrumb && (
        <Link
          href={breadcrumb.href}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {breadcrumb.label}
        </Link>
      )}

      {logo && (
        <div className="flex justify-center mb-6">
          <Image
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            className="rounded-xl"
          />
        </div>
      )}

      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-500 via-red-400 to-indigo-500 bg-clip-text text-transparent mb-4">
        {title}
      </h1>

      {subtitle && (
        <p className="text-xl md:text-2xl text-zinc-300 mb-4">
          {subtitle}
        </p>
      )}

      {description && (
        <p className="text-zinc-400 max-w-2xl mx-auto">
          {description}
        </p>
      )}

      {children}
    </div>
  );
}
