'use client';

import { useState } from 'react';
import { VerdictStatus } from '@/lib/types';

interface Recommendation {
  action: string;
  priority: 'High' | 'Medium' | 'Low';
  reason?: string;
}

interface VerdictCardProps {
  status: VerdictStatus;
  bottomLine: string;
  whatWeKnow: string[];
  whatWeDontKnow: string[];
  recommendations: Recommendation[];
  storageKey?: string;
}

const verdictConfig: Record<VerdictStatus, {
  icon: string;
  color: string;
  bg: string;
  border: string;
}> = {
  TRUSTWORTHY: {
    icon: '✓',
    color: '#22c55e',
    bg: 'linear-gradient(135deg, rgba(34, 197, 94, 0.22) 0%, rgba(34, 197, 94, 0.08) 100%)',
    border: '#22c55e',
  },
  CAUTION: {
    icon: '⚠',
    color: '#f59e0b',
    bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(245, 158, 11, 0.08) 100%)',
    border: '#f59e0b',
  },
  SUSPICIOUS: {
    icon: '⚠',
    color: '#f97316',
    bg: 'linear-gradient(135deg, rgba(249, 115, 22, 0.22) 0%, rgba(249, 115, 22, 0.08) 100%)',
    border: '#f97316',
  },
  AVOID: {
    icon: '🚫',
    color: '#ef4444',
    bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.22) 0%, rgba(239, 68, 68, 0.08) 100%)',
    border: '#ef4444',
  },
};

const priorityConfig: Record<string, { color: string; bg: string }> = {
  High: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)' },
  Medium: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' },
  Low: { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.2)' },
};

function RecommendationItem({
  rec,
  checked,
  onToggle,
}: {
  rec: Recommendation;
  checked: boolean;
  onToggle: () => void;
}) {
  const [showReason, setShowReason] = useState(false);
  const priority = priorityConfig[rec.priority] || priorityConfig.Medium;

  return (
    <div
      className={`rounded-lg border transition-all duration-200 ${
        checked
          ? 'bg-green-500/5 border-green-500/20'
          : 'bg-zinc-900/30 border-zinc-800'
      }`}
    >
      <div className="p-3.5 flex items-center gap-3">
        <button
          onClick={onToggle}
          className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold transition-all duration-200 ${
            checked
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-2 border-zinc-600 bg-transparent'
          }`}
        >
          {checked && '✓'}
        </button>
        <span
          className={`flex-1 text-sm transition-all duration-200 ${
            checked ? 'text-zinc-500 line-through' : 'text-zinc-100'
          }`}
        >
          {rec.action}
        </span>
        <span
          className="text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase"
          style={{ background: priority.bg, color: priority.color }}
        >
          {rec.priority}
        </span>
        {rec.reason && (
          <button
            onClick={() => setShowReason(!showReason)}
            className="text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1 transition-colors"
          >
            {showReason ? 'Hide' : 'Why?'}
          </button>
        )}
      </div>
      {showReason && rec.reason && (
        <div className="px-3.5 pb-3.5 pl-11 text-sm text-zinc-500 leading-relaxed">
          ↳ {rec.reason}
        </div>
      )}
    </div>
  );
}

export function VerdictCard({
  status,
  bottomLine,
  whatWeKnow,
  whatWeDontKnow,
  recommendations,
  storageKey,
}: VerdictCardProps) {
  const localStorageKey = storageKey ? `trustscan-recs-${storageKey}` : null;

  // Use lazy state initialization to load from localStorage (SSR-safe)
  const [checkedRecs, setCheckedRecs] = useState<Record<number, boolean>>(() => {
    if (typeof window === 'undefined' || !localStorageKey) return {};
    try {
      const saved = localStorage.getItem(localStorageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const config = verdictConfig[status] || verdictConfig.CAUTION;

  const toggleRec = (index: number) => {
    setCheckedRecs((prev) => {
      const next = { ...prev, [index]: !prev[index] };
      // Save to localStorage
      if (localStorageKey && typeof window !== 'undefined') {
        try {
          localStorage.setItem(localStorageKey, JSON.stringify(next));
        } catch {
          // Ignore localStorage errors
        }
      }
      return next;
    });
  };

  return (
    <section
      className="rounded-2xl p-7 mb-6 animate-in fade-in slide-in-from-top-4 duration-500"
      style={{
        background: config.bg,
        borderLeft: `4px solid ${config.border}`,
      }}
    >
      {/* Verdict Header */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-4xl">{config.icon}</span>
        <span
          className="text-3xl font-extrabold tracking-tight"
          style={{ color: config.color }}
        >
          {status}
        </span>
      </div>

      {/* Bottom Line */}
      <div
        className="bg-white/5 p-5 rounded-xl mb-6 border-l-[3px]"
        style={{ borderLeftColor: config.border }}
      >
        <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
          Bottom Line
        </div>
        <p className="text-base text-zinc-100 leading-relaxed">
          {bottomLine}
        </p>
      </div>

      {/* What We Know / Don't Know */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-xs font-semibold text-green-500 mb-2.5 flex items-center gap-1.5">
            <span>✓</span> WHAT WE KNOW
          </div>
          <ul className="space-y-1.5 text-sm text-zinc-400">
            {whatWeKnow.map((item, i) => (
              <li key={i} className="leading-relaxed">• {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold text-amber-500 mb-2.5 flex items-center gap-1.5">
            <span>?</span> {`WHAT WE DON'T KNOW`}
          </div>
          <ul className="space-y-1.5 text-sm text-zinc-400">
            {whatWeDontKnow.map((item, i) => (
              <li key={i} className="leading-relaxed">• {item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Recommendations
          </div>
          <div className="flex flex-col gap-2">
            {recommendations.map((rec, i) => (
              <RecommendationItem
                key={i}
                rec={rec}
                checked={!!checkedRecs[i]}
                onToggle={() => toggleRec(i)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
