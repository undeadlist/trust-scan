'use client';

import { RiskCalculationData } from '@/lib/types';

interface RiskCalculationDisplayProps {
  calculation: RiskCalculationData;
}

export function RiskCalculationDisplay({ calculation }: RiskCalculationDisplayProps) {
  const maxAdjustment = 30; // Max single adjustment for bar scaling

  const getBarWidth = (value: number): string => {
    return `${Math.min((Math.abs(value) / maxAdjustment) * 100, 100)}%`;
  };

  const getScoreColor = (score: number): string => {
    if (score <= 30) return '#4ade80'; // green
    if (score <= 50) return '#fbbf24'; // amber
    return '#f87171'; // red
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
      <h2 className="text-base font-semibold text-zinc-100 mb-5">
        Risk Calculation
      </h2>

      {/* Base Score */}
      <div className="flex items-center gap-4 mb-3">
        <div className="w-40 text-sm text-zinc-400">Base Score</div>
        <div className="flex-1 flex items-center gap-3">
          <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-zinc-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: '50%' }}
            />
          </div>
          <div className="w-12 text-right text-sm font-mono font-semibold text-zinc-400">
            {calculation.baseScore}
          </div>
        </div>
      </div>

      {/* Adjustments */}
      {calculation.adjustments.map((adj, i) => (
        <div key={i} className="flex items-center gap-4 mb-3">
          <div className="w-40 text-sm text-zinc-400 truncate" title={adj.label}>
            {adj.label}
          </div>
          <div className="flex-1 flex items-center gap-3">
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  adj.type === 'positive'
                    ? 'bg-gradient-to-r from-green-500 to-green-400'
                    : 'bg-gradient-to-r from-red-500 to-red-400'
                }`}
                style={{ width: getBarWidth(adj.value) }}
              />
            </div>
            <div
              className={`w-12 text-right text-sm font-mono font-semibold ${
                adj.type === 'positive' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {adj.value > 0 ? '+' : '−'}{Math.abs(adj.value)}
            </div>
          </div>
        </div>
      ))}

      {/* Divider */}
      <div className="h-px bg-zinc-700 my-4" />

      {/* Final Score */}
      <div className="flex items-center gap-4">
        <div className="w-40 text-sm font-semibold text-zinc-100">Final Score</div>
        <div className="flex-1 flex items-center gap-3">
          <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${calculation.finalScore}%`,
                background: 'linear-gradient(90deg, #22c55e 0%, #4ade80 30%, #fbbf24 50%, #f59e0b 60%, #ef4444 100%)',
              }}
            />
          </div>
          <div
            className="w-16 text-right text-lg font-mono font-bold"
            style={{ color: getScoreColor(calculation.finalScore) }}
          >
            {calculation.finalScore}/100
          </div>
        </div>
      </div>
    </div>
  );
}
