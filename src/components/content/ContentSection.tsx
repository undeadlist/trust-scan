'use client';

import { ReactNode } from 'react';

interface ContentSectionProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  id?: string;
}

export function ContentSection({
  title,
  subtitle,
  children,
  className = '',
  id,
}: ContentSectionProps) {
  return (
    <section id={id} className={`py-8 md:py-12 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-8">
          {title && (
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-zinc-400">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
