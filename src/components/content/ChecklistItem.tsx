'use client';

import { ReactNode } from 'react';

interface ChecklistItemProps {
  children: ReactNode;
  checked?: boolean;
  className?: string;
}

export function ChecklistItem({ children, checked = false, className = '' }: ChecklistItemProps) {
  return (
    <div className={`flex items-start gap-3 py-2 ${className}`}>
      <div
        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
          checked
            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
            : 'border-zinc-600 text-transparent'
        }`}
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="text-zinc-300 text-sm">{children}</span>
    </div>
  );
}

interface ChecklistProps {
  children: ReactNode;
  className?: string;
}

export function Checklist({ children, className = '' }: ChecklistProps) {
  return (
    <div className={`bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 ${className}`}>
      {children}
    </div>
  );
}
