'use client';

import { useState } from 'react';

type SectionStatus = 'clean' | 'warning' | 'critical' | 'unknown';

interface TechnicalSectionProps {
  title: string;
  status: SectionStatus;
  data: {
    label: string;
    value: string;
    assessment?: string;
  }[];
  summary?: string;
  defaultOpen?: boolean;
}

const statusConfig: Record<SectionStatus, { icon: string; color: string; bg: string }> = {
  clean: { icon: '✓', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
  warning: { icon: '⚠', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  critical: { icon: '✗', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  unknown: { icon: '?', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' },
};

export function TechnicalSection({
  title,
  status,
  data,
  summary,
  defaultOpen = false,
}: TechnicalSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const config = statusConfig[status] || statusConfig.unknown;

  return (
    <div className="bg-zinc-900/30 rounded-lg overflow-hidden border border-zinc-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-zinc-800/30 transition-colors"
      >
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
          style={{ background: config.bg, color: config.color }}
        >
          {config.icon}
        </span>
        <span className="flex-1 text-left text-sm font-medium text-zinc-100">
          {title}
        </span>
        <span
          className="text-[10px] px-2 py-0.5 rounded uppercase font-semibold tracking-wider"
          style={{ background: config.bg, color: config.color }}
        >
          {status}
        </span>
        <span
          className={`text-zinc-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <table className="w-full">
            <tbody>
              {data.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-zinc-800 last:border-0"
                >
                  <td className="py-2.5 text-sm text-zinc-500 w-2/5">
                    {row.label}
                  </td>
                  <td className="py-2.5 text-sm text-zinc-100">
                    {row.value}
                  </td>
                  <td className="py-2.5 text-xs text-zinc-500 text-right">
                    {row.assessment}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {summary && (
            <div className="mt-3 p-3 bg-zinc-950/50 rounded-md text-sm text-zinc-400 leading-relaxed">
              {summary}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
