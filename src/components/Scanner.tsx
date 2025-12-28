'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ScanResult, ScanResponse } from '@/lib/types';
import { AIKeySection } from './AIKeySection';

interface ScannerProps {
  onScanComplete: (result: ScanResult) => void;
  onScanStart: () => void;
  isScanning: boolean;
}

interface ServerConfig {
  geminiKeyConfigured: boolean;
  claudeKeyConfigured: boolean;
}

export function Scanner({ onScanComplete, onScanStart, isScanning }: ScannerProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [serverConfig, setServerConfig] = useState<ServerConfig>({
    geminiKeyConfigured: false,
    claudeKeyConfigured: false,
  });

  // Fetch server config on mount
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        setServerConfig({
          geminiKeyConfigured: data.geminiKeyConfigured || false,
          claudeKeyConfigured: data.claudeKeyConfigured || false,
        });
      })
      .catch(() => {
        // Ignore errors, use defaults
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    onScanStart();

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data: ScanResponse = await response.json();

      if (!data.success || !data.result) {
        setError(data.error || 'Failed to scan URL');
        return;
      }

      onScanComplete(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan URL');
    }
  };

  const handleKeyChange = useCallback((_provider: 'gemini', _key: string | null) => {
    // Key changes are handled by AIKeySection component
    // This callback can be used for logging or additional logic
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to scan (e.g., example.com)"
            disabled={isScanning}
            className="
              w-full px-6 py-4 bg-zinc-900 border-2 border-zinc-700 rounded-xl
              text-lg text-zinc-100 placeholder:text-zinc-500
              focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/20
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
          />

          <button
            type="submit"
            disabled={isScanning || !url.trim()}
            className="
              absolute right-2 top-1/2 -translate-y-1/2
              px-6 py-2.5 bg-red-600
              rounded-lg font-semibold text-white
              hover:bg-red-500
              focus:outline-none focus:ring-4 focus:ring-red-500/50
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              shadow-lg shadow-red-500/25
            "
          >
            {isScanning ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Scanning...
              </span>
            ) : (
              'Scan'
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </form>

      <AIKeySection onKeyChange={handleKeyChange} serverConfig={serverConfig} />
    </div>
  );
}
