'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { AIProvider } from '@/lib/types';
import { STORAGE_KEYS } from '@/lib/ai';
import { ProviderSelector } from './ProviderSelector';
import { KeyInput } from './KeyInput';

interface AIKeySectionProps {
  onKeyChange: (provider: AIProvider, key: string | null) => void;
  serverConfig: { geminiKeyConfigured: boolean; claudeKeyConfigured: boolean };
}

// Subscribe to localStorage changes
function subscribeToStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getServerSnapshot(): AIProvider {
  return 'gemini';
}

export function AIKeySection({ onKeyChange, serverConfig }: AIKeySectionProps) {
  // Get provider from localStorage with SSR-safe approach
  const getProviderSnapshot = (): AIProvider => {
    const stored = localStorage.getItem(STORAGE_KEYS.provider);
    return (stored === 'claude' ? 'claude' : 'gemini') as AIProvider;
  };

  const storedProvider = useSyncExternalStore(
    subscribeToStorage,
    getProviderSnapshot,
    getServerSnapshot
  );

  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(storedProvider);
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync selectedProvider with stored value when it changes
  useEffect(() => {
    setSelectedProvider(storedProvider);
  }, [storedProvider]);

  const handleProviderChange = (provider: AIProvider) => {
    setSelectedProvider(provider);
    localStorage.setItem(STORAGE_KEYS.provider, provider);
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEYS.provider }));
  };

  const handleKeyChange = (key: string | null) => {
    onKeyChange(selectedProvider, key);
  };

  // Check if either server key is available
  const anyServerKeyAvailable = serverConfig.geminiKeyConfigured || serverConfig.claudeKeyConfigured;
  const currentServerKeyAvailable = selectedProvider === 'claude'
    ? serverConfig.claudeKeyConfigured
    : serverConfig.geminiKeyConfigured;

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
        {anyServerKeyAvailable && (
          <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs rounded">
            AI Enabled
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-4">
          {/* Provider Selector */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Choose AI Provider</label>
            <ProviderSelector
              selectedProvider={selectedProvider}
              onProviderChange={handleProviderChange}
              geminiServerKey={serverConfig.geminiKeyConfigured}
              claudeServerKey={serverConfig.claudeKeyConfigured}
            />
          </div>

          {/* Key Input */}
          <KeyInput
            provider={selectedProvider}
            onKeyChange={handleKeyChange}
            serverKeyAvailable={currentServerKeyAvailable}
          />
        </div>
      )}
    </div>
  );
}
