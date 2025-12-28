'use client';

import React from 'react';

interface AIKeySectionProps {
  serverConfig: { trustScanAvailable: boolean };
}

export function AIKeySection({ serverConfig }: AIKeySectionProps) {
  // Trust Scan AI is available - show enabled badge
  if (serverConfig.trustScanAvailable) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="font-medium">AI Analysis</span>
          <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs rounded">
            Enabled
          </span>
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          Powered by Trust Scan LLM - AI analysis is automatically included.
        </p>
      </div>
    );
  }

  // No AI available - show disabled message
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <span className="font-medium">AI Analysis</span>
        <span className="px-2 py-0.5 bg-zinc-700 border border-zinc-600 text-zinc-400 text-xs rounded">
          Unavailable
        </span>
      </div>
      <p className="text-xs text-zinc-500 mt-1">
        AI-powered analysis is not currently available.
      </p>
    </div>
  );
}
