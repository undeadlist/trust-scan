'use client';

import React, { useState } from 'react';
import { KeyInput } from './KeyInput';

interface AIKeySectionProps {
  onKeyChange: (provider: 'gemini', key: string | null) => void;
  serverConfig: { geminiKeyConfigured: boolean; claudeKeyConfigured: boolean };
}

export function AIKeySection({ onKeyChange, serverConfig }: AIKeySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleKeyChange = (key: string | null) => {
    onKeyChange('gemini', key);
  };

  // Check if server has any AI key configured (Gemini or Claude)
  const serverAIAvailable = serverConfig.geminiKeyConfigured || serverConfig.claudeKeyConfigured;

  // If server has AI configured, show simplified message
  if (serverAIAvailable) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="font-medium">AI Analysis</span>
          <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs rounded">
            Enabled
          </span>
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          AI-powered analysis is automatically included with your scan.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
      >
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-medium">AI Analysis (Optional)</span>
      </button>

      {isExpanded && (
        <div className="mt-3">
          <KeyInput
            provider="gemini"
            onKeyChange={handleKeyChange}
            serverKeyAvailable={false}
          />
        </div>
      )}
    </div>
  );
}
