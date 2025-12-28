'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Scanner, Report, PageLayout } from '@/components';
import { ScanResult } from '@/lib/types';
import { BRAND, CHECKS_INFO } from '@/lib/design-system';

export default function Home() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScanComplete = (result: ScanResult) => {
    setScanResult(result);
    setIsScanning(false);
  };

  const handleScanStart = () => {
    setIsScanning(true);
    setScanResult(null);
  };

  const handleNewScan = () => {
    setScanResult(null);
    setIsScanning(false);
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        {!scanResult && !isScanning && (
          <header className="text-center mb-12">
            <div className="flex flex-col items-center mb-6">
              <Image
                src="/logo.png"
                alt={BRAND.name}
                width={300}
                height={300}
                className="rounded-2xl"
              />
              <h1 className="mt-6 text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-500 via-red-400 to-indigo-500 bg-clip-text text-transparent">
                {BRAND.name}
              </h1>
            </div>

            <p className="text-xl md:text-2xl text-zinc-300 mb-2">
              {BRAND.tagline}
            </p>
            <p className="text-base text-indigo-400 mb-6">
              {BRAND.taglineJp}
            </p>

            <p className="text-zinc-400 max-w-2xl mx-auto">
              The same tools that let you ship in a weekend let scammers ship honeypots in an hour.
              <span className="text-zinc-300"> Check if that shiny new service is legit before you hand over your API keys.</span>
            </p>
          </header>
        )}

        {/* Compact header when scanning or showing results */}
        {(scanResult || isScanning) && (
          <header className="text-center mb-8">
            <div className="inline-flex items-center gap-3">
              <Image
                src="/logo.png"
                alt={BRAND.name}
                width={56}
                height={56}
                className="rounded-xl"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-indigo-500 bg-clip-text text-transparent">
                {BRAND.name}
              </span>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className="space-y-8">
          {!scanResult && (
            <>
              <Scanner
                onScanComplete={handleScanComplete}
                onScanStart={handleScanStart}
                isScanning={isScanning}
              />

              {/* Features when no result and not scanning */}
              {!isScanning && (
                <div className="max-w-4xl mx-auto mt-16">
                  <h2 className="text-center text-lg font-medium text-zinc-500 mb-8">
                    What we check
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FeatureCard
                      icon={
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      }
                      title="Domain Trust"
                      description="WHOIS age, SSL validity, hosting provider analysis"
                    />
                    <FeatureCard
                      icon={
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      }
                      title="Red Flags"
                      description="Pattern matching for scams, impossible claims, suspicious patterns"
                    />
                    <FeatureCard
                      icon={
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      }
                      title="History Check"
                      description="Archive.org history, GitHub repo analysis, social presence"
                    />
                    <FeatureCard
                      icon={
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      }
                      title="SSL & Security"
                      description="Certificate validation, expiry checks, security headers"
                    />
                    <FeatureCard
                      icon={
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      }
                      title="Hosting Analysis"
                      description="Provider detection, free tier flags, infrastructure checks"
                    />
                    <FeatureCard
                      icon={
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      }
                      title="AI Analysis"
                      description="AI-powered deep analysis with Trust Scan AI"
                    />
                  </div>

                </div>
              )}
            </>
          )}

          {isScanning && !scanResult && (
            <div className="max-w-2xl mx-auto">
              <ScanningAnimation />
            </div>
          )}

          {scanResult && (
            <Report result={scanResult} onNewScan={handleNewScan} />
          )}
        </main>
      </div>
    </PageLayout>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors group">
      <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center mb-4 text-red-500 group-hover:text-red-400 transition-colors">
        {icon}
      </div>
      <h3 className="font-semibold text-zinc-200 mb-2">{title}</h3>
      <p className="text-sm text-zinc-500">{description}</p>
    </div>
  );
}

function ScanningAnimation() {
  const checks = [
    'Checking domain WHOIS...',
    'Validating SSL certificate...',
    'Detecting hosting provider...',
    'Analyzing website content...',
    'Searching Archive.org...',
    'Looking for GitHub repos...',
    'Detecting red flag patterns...',
    'Calculating risk score...',
  ];

  const [currentCheck, setCurrentCheck] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCheck((prev) => (prev + 1) % checks.length);
    }, 1500);
    return () => clearInterval(interval);
    // checks is constant, no need to re-run when it changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="text-center p-12 bg-zinc-900/50 border border-zinc-800 rounded-xl">
      <div className="relative w-24 h-24 mx-auto mb-6">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-red-500/20 rounded-full" />
        {/* Spinning ring */}
        <div className="absolute inset-0 border-4 border-transparent border-t-red-500 rounded-full animate-spin" />
        {/* Inner icon */}
        <div className="absolute inset-4 bg-gradient-to-br from-red-500/20 to-indigo-500/20 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <p className="text-lg text-zinc-300 mb-2">Scanning...</p>
      <p className="text-sm text-zinc-500 h-5 transition-all duration-300">
        {checks[currentCheck]}
      </p>
    </div>
  );
}
