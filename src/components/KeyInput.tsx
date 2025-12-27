'use client';

import { useState, useSyncExternalStore, useRef, useEffect } from 'react';
import { isValidGeminiKey } from '@/lib/gemini';

interface KeyInputProps {
  onKeyChange: (key: string | null) => void;
  serverKeyAvailable?: boolean;
}

const STORAGE_KEY = 'vibecheck_gemini_key';

// Subscribe to localStorage changes
function subscribeToStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

// Get current value from localStorage
function getStorageSnapshot() {
  return localStorage.getItem(STORAGE_KEY);
}

// Server snapshot (always null during SSR)
function getServerSnapshot() {
  return null;
}

export function KeyInput({ onKeyChange, serverKeyAvailable = false }: KeyInputProps) {
  // Use useSyncExternalStore for hydration-safe localStorage access
  const storedKey = useSyncExternalStore(
    subscribeToStorage,
    getStorageSnapshot,
    getServerSnapshot
  );

  // Track if we're editing (typing a new key) vs displaying stored key
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Use ref to track if we've notified parent of stored key
  const notifiedRef = useRef(false);

  // The displayed key is either the editing key or the stored key
  const displayKey = editingKey ?? storedKey ?? '';
  const isSaved = storedKey !== null && editingKey === null;

  // Notify parent of stored key on mount (only once)
  useEffect(() => {
    if (serverKeyAvailable) return;
    if (storedKey && !notifiedRef.current) {
      notifiedRef.current = true;
      onKeyChange(storedKey);
    }
  }, [storedKey, serverKeyAvailable, onKeyChange]);

  const handleSave = () => {
    const trimmedKey = displayKey.trim();
    if (trimmedKey && isValidGeminiKey(trimmedKey)) {
      localStorage.setItem(STORAGE_KEY, trimmedKey);
      setEditingKey(null); // Clear editing state, will show stored key
      onKeyChange(trimmedKey);
      // Dispatch storage event to trigger useSyncExternalStore update
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    }
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setEditingKey(null);
    notifiedRef.current = false;
    onKeyChange(null);
    // Dispatch storage event to trigger useSyncExternalStore update
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  };

  const handleChange = (value: string) => {
    setEditingKey(value);
  };

  const isValid = displayKey.trim() ? isValidGeminiKey(displayKey.trim()) : true;

  // If server key is available, show simplified UI
  if (serverKeyAvailable) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs rounded">
            AI Enabled
          </span>
          <span>Server API key configured - AI analysis is automatic</span>
        </div>
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
        {isSaved && (
          <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs rounded">
            Key Saved
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg space-y-3">
          <p className="text-sm text-zinc-400">
            Add your Gemini API key for AI-powered analysis. Your key is stored locally in your browser.
          </p>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                value={displayKey}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Enter your Gemini API key"
                className={`
                  w-full px-3 py-2 bg-zinc-800 border rounded-lg text-sm
                  placeholder:text-zinc-600 text-zinc-200
                  focus:outline-none focus:ring-2 focus:ring-red-500/50
                  ${!isValid ? 'border-red-500/50' : 'border-zinc-700'}
                `}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showKey ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {isSaved ? (
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
              >
                Clear
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={!displayKey.trim() || !isValid}
                className="px-4 py-2 bg-indigo-500/20 border border-indigo-500/50 text-indigo-400 rounded-lg text-sm font-medium hover:bg-indigo-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            )}
          </div>

          {!isValid && (
            <p className="text-xs text-red-400">Invalid API key format</p>
          )}

          <p className="text-xs text-zinc-500">
            Get your API key at{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Google AI Studio
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
