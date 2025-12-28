'use client';

import React from 'react';
import { AIProvider } from '@/lib/types';
import { PROVIDER_INFO } from '@/lib/ai';

interface ProviderSelectorProps {
  selectedProvider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
  geminiServerKey?: boolean;
  claudeServerKey?: boolean;
}

export function ProviderSelector({
  selectedProvider,
  onProviderChange,
  geminiServerKey = false,
  claudeServerKey = false,
}: ProviderSelectorProps) {
  const providers: AIProvider[] = ['gemini', 'claude'];

  return (
    <div className="flex gap-2">
      {providers.map((provider) => {
        const info = PROVIDER_INFO[provider];
        const isSelected = selectedProvider === provider;
        const hasServerKey = provider === 'gemini' ? geminiServerKey : claudeServerKey;

        return (
          <button
            key={provider}
            onClick={() => onProviderChange(provider)}
            className={`
              flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
              border
              ${
                isSelected
                  ? 'bg-red-500/20 border-red-500/50 text-red-400'
                  : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
              }
            `}
          >
            <div className="flex items-center justify-center gap-2">
              <span>{info.name}</span>
              {hasServerKey && (
                <span className="px-1.5 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 rounded">
                  Server
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
