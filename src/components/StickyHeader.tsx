'use client';

import { VerdictStatus } from '@/lib/types';

interface StickyHeaderProps {
  domain: string;
  score: number;
  verdict: VerdictStatus;
  isVisible: boolean;
}

const verdictConfig: Record<VerdictStatus, { icon: string; color: string }> = {
  TRUSTWORTHY: { icon: '✓', color: '#22c55e' },
  CAUTION: { icon: '⚠', color: '#f59e0b' },
  SUSPICIOUS: { icon: '⚠', color: '#f97316' },
  AVOID: { icon: '🚫', color: '#ef4444' },
};

export function StickyHeader({ domain, score, verdict, isVisible }: StickyHeaderProps) {
  const config = verdictConfig[verdict] || verdictConfig.CAUTION;

  const getScoreColor = (s: number): { color: string; bg: string } => {
    if (s <= 30) return { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.2)' };
    if (s <= 50) return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' };
    return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)' };
  };

  const scoreStyle = getScoreColor(score);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 px-3 md:px-6 py-2 md:py-3 flex items-center justify-center gap-2 md:gap-6 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <span className="text-xs md:text-sm font-semibold text-zinc-100 truncate max-w-[120px] md:max-w-none">
        {domain}
      </span>
      <span
        className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 rounded-md text-xs md:text-sm font-semibold whitespace-nowrap"
        style={{ background: scoreStyle.bg, color: scoreStyle.color }}
      >
        {score}/100
      </span>
      <span
        className="flex items-center gap-1 md:gap-1.5 text-xs md:text-sm font-semibold whitespace-nowrap"
        style={{ color: config.color }}
      >
        {config.icon} <span className="hidden sm:inline">{verdict}</span>
      </span>
    </div>
  );
}
