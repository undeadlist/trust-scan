'use client';

import { useState, useEffect } from 'react';

interface RiskGaugeProps {
  score: number;
  size?: number;
}

export function RiskGauge({ score, size = 180 }: RiskGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getScoreColor = (s: number): string => {
    if (s <= 30) return '#22c55e'; // green
    if (s <= 50) return '#f59e0b'; // amber
    if (s <= 70) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const getRiskLabel = (s: number): string => {
    if (s <= 30) return 'LOW RISK';
    if (s <= 50) return 'MEDIUM RISK';
    if (s <= 70) return 'HIGH RISK';
    return 'CRITICAL';
  };

  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;
  const color = getScoreColor(animatedScore);
  const markers = [0, 25, 50, 75, 100];

  return (
    <div className="relative" style={{ width: size, height: size / 2 + 30 }}>
      <svg
        width={size}
        height={size / 2 + 10}
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Colored arc */}
        <path
          d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
        {/* Score markers */}
        {markers.map((mark) => {
          const angle = Math.PI - (mark / 100) * Math.PI;
          const x = size / 2 + (radius + 20) * Math.cos(angle);
          const y = size / 2 - (radius + 20) * Math.sin(angle);
          const label = mark === 0 ? 'Low' : mark === 100 ? 'High' : mark.toString();
          return (
            <text
              key={mark}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-zinc-500 text-[10px] font-sans"
            >
              {label}
            </text>
          );
        })}
      </svg>
      {/* Center score display */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <div
          className="text-4xl font-extrabold font-mono leading-none transition-colors duration-500"
          style={{ color }}
        >
          {animatedScore}
        </div>
        <div
          className="text-[11px] font-semibold tracking-widest mt-1 transition-colors duration-500"
          style={{ color }}
        >
          {getRiskLabel(animatedScore)}
        </div>
      </div>
    </div>
  );
}
