'use client';

import React from 'react';

interface RiskBadgeProps {
  level: 'low' | 'medium' | 'high' | 'critical';
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

const levelConfig = {
  low: {
    bg: 'bg-zinc-700/50',
    border: 'border-zinc-600',
    text: 'text-zinc-300',
    glow: 'shadow-zinc-500/10',
    label: 'LOW RISK',
    icon: '✓',
  },
  medium: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/50',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/20',
    label: 'MEDIUM RISK',
    icon: '⚠',
  },
  high: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/50',
    text: 'text-orange-400',
    glow: 'shadow-orange-500/20',
    label: 'HIGH RISK',
    icon: '⚠',
  },
  critical: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/50',
    text: 'text-red-400',
    glow: 'shadow-red-500/20',
    label: 'CRITICAL',
    icon: '✕',
  },
};

const sizeConfig = {
  sm: {
    padding: 'px-2 py-1',
    text: 'text-xs',
    score: 'text-sm',
  },
  md: {
    padding: 'px-3 py-1.5',
    text: 'text-sm',
    score: 'text-base',
  },
  lg: {
    padding: 'px-4 py-2',
    text: 'text-base',
    score: 'text-xl',
  },
};

export function RiskBadge({ level, score, size = 'md' }: RiskBadgeProps) {
  const config = levelConfig[level];
  const sizeStyles = sizeConfig[size];

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-lg border
        ${config.bg} ${config.border} ${sizeStyles.padding}
        shadow-lg ${config.glow}
      `}
    >
      <span className={`${config.text} ${sizeStyles.text} font-bold`}>
        {config.icon}
      </span>
      <span className={`${config.text} ${sizeStyles.text} font-semibold uppercase tracking-wide`}>
        {config.label}
      </span>
      {score !== undefined && (
        <span className={`${config.text} ${sizeStyles.score} font-mono font-bold ml-1`}>
          {score}/100
        </span>
      )}
    </div>
  );
}

interface SeverityBadgeProps {
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const config = levelConfig[severity];

  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase
        ${config.bg} ${config.border} ${config.text} border
      `}
    >
      {severity}
    </span>
  );
}
