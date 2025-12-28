'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScanResult, AIAnalysis, RedFlag } from '@/lib/types';
import { RiskBadge, SeverityBadge } from './RiskBadge';

interface ReportProps {
  result: ScanResult;
  onNewScan: () => void;
}

export function Report({ result, onNewScan }: ReportProps) {
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['redflags', 'ai'])
  );
  const hasRunAnalysis = useRef(false);

  // Run analysis using Trust Scan AI (server-side)
  const runTrustScanAnalysis = useCallback(async () => {
    setAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanResult: result }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAiAnalysis(data.analysis);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI analysis failed');
    } finally {
      setAiLoading(false);
    }
  }, [result]);

  useEffect(() => {
    // Reset analysis state when result changes
    setAiAnalysis(null);
    setAiError(null);
    hasRunAnalysis.current = false;
  }, [result.id]);

  useEffect(() => {
    // Auto-run AI analysis if available
    if (hasRunAnalysis.current) return;

    // Check server config
    fetch('/api/config')
      .then(res => res.json())
      .then(config => {
        if (hasRunAnalysis.current) return;

        if (config.trustScanAvailable) {
          hasRunAnalysis.current = true;
          runTrustScanAnalysis();
        }
      })
      .catch(() => {
        // Server not available, analysis will show unavailable state
      });
  }, [result.id, runTrustScanAnalysis]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-zinc-900/80 border border-zinc-800 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 mb-1 break-all">
            {result.domain}
          </h2>
          <p className="text-sm text-zinc-500 break-all">{result.url}</p>
        </div>
        <div className="flex items-center gap-4">
          <RiskBadge level={result.riskLevel} score={result.riskScore} size="lg" />
          <button
            onClick={onNewScan}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            New Scan
          </button>
        </div>
      </div>

      {/* Known Entity Badge */}
      {result.isKnownEntity && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-emerald-400 font-semibold">Recognized Established Service</h3>
              <p className="text-emerald-400/70 text-sm">
                {result.scanNotes.join(' • ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Trust Scan Verified Badge */}
      {result.verifiedBadge?.isVerified && !result.isKnownEntity && (
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-indigo-400 font-semibold">Trust Scan Verified</h3>
              <p className="text-indigo-400/70 text-sm">
                This site has been manually verified by Trust Scan
                {result.verifiedBadge.category && ` • ${result.verifiedBadge.category}`}
                {result.verifiedBadge.expiresAt && ` • Valid until ${new Date(result.verifiedBadge.expiresAt).toLocaleDateString()}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Scan Confidence Warning */}
      {result.scanConfidence === 'low' && !result.isKnownEntity && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-amber-400 font-semibold">Limited Scan Confidence</h3>
              <p className="text-amber-400/70 text-sm">
                {result.scanNotes.length > 0
                  ? result.scanNotes.join(' • ')
                  : 'Some content could not be analyzed. Results may be incomplete.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Red Flags Section */}
      <Section
        title="Red Flags Detected"
        count={result.redFlags.length}
        isExpanded={expandedSections.has('redflags')}
        onToggle={() => toggleSection('redflags')}
        variant={result.redFlags.length > 0 ? 'danger' : 'success'}
      >
        {result.redFlags.length > 0 ? (
          <div className="space-y-3">
            {result.redFlags.map((flag, index) => (
              <RedFlagCard key={index} flag={flag} />
            ))}
          </div>
        ) : (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <p className="text-emerald-400">
              ✓ No red flags detected. This doesn&apos;t guarantee safety, but no obvious warning signs were found.
            </p>
          </div>
        )}
      </Section>

      {/* AI Analysis Section */}
      <Section
        title="AI Analysis"
        isExpanded={expandedSections.has('ai')}
        onToggle={() => toggleSection('ai')}
        badge={aiAnalysis?.verdict || aiAnalysis?.recommendation}
      >
        {aiLoading ? (
          <div className="flex items-center gap-3 p-4">
            <svg className="animate-spin h-5 w-5 text-red-500" viewBox="0 0 24 24">
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
            <span className="text-zinc-400">Analyzing with Trust Scan AI...</span>
          </div>
        ) : aiError ? (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{aiError}</p>
          </div>
        ) : aiAnalysis ? (
          <AiAnalysisDisplay analysis={aiAnalysis} />
        ) : (
          <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <p className="text-zinc-400 text-sm">
              AI-powered analysis is not currently available.
            </p>
          </div>
        )}
      </Section>

      {/* Domain Info Section */}
      <Section
        title="Domain Information"
        isExpanded={expandedSections.has('domain')}
        onToggle={() => toggleSection('domain')}
      >
        <div className="grid md:grid-cols-2 gap-4">
          {/* WHOIS */}
          <InfoCard title="WHOIS Data">
            {result.whoisData ? (
              <dl className="space-y-2 text-sm">
                <InfoRow
                  label="Domain Age"
                  value={
                    result.whoisData.domainAge !== null
                      ? `${result.whoisData.domainAge} days`
                      : 'Unknown'
                  }
                />
                <InfoRow label="Created" value={formatDate(result.whoisData.creationDate)} />
                <InfoRow label="Expires" value={formatDate(result.whoisData.expirationDate)} />
                <InfoRow label="Registrar" value={result.whoisData.registrar || 'Unknown'} />
                <InfoRow
                  label="Privacy"
                  value={result.whoisData.privacyProtected ? 'Protected' : 'Public'}
                />
              </dl>
            ) : (
              <p className="text-zinc-500 text-sm">No WHOIS data available</p>
            )}
          </InfoCard>

          {/* SSL */}
          <InfoCard title="SSL Certificate">
            {result.sslData ? (
              <dl className="space-y-2 text-sm">
                <InfoRow
                  label="Status"
                  value={result.sslData.valid ? '✓ Valid' : '✕ Invalid'}
                  valueClass={result.sslData.valid ? 'text-emerald-400' : 'text-red-400'}
                />
                <InfoRow label="Issuer" value={result.sslData.issuer || 'Unknown'} />
                <InfoRow label="Valid From" value={formatDate(result.sslData.validFrom)} />
                <InfoRow label="Valid To" value={formatDate(result.sslData.validTo)} />
                <InfoRow
                  label="Days Left"
                  value={
                    result.sslData.daysRemaining !== null
                      ? `${result.sslData.daysRemaining} days`
                      : 'Unknown'
                  }
                />
              </dl>
            ) : (
              <p className="text-zinc-500 text-sm">No SSL data available</p>
            )}
          </InfoCard>

          {/* Hosting */}
          <InfoCard title="Hosting">
            {result.hostingData ? (
              <dl className="space-y-2 text-sm">
                <InfoRow label="Provider" value={result.hostingData.provider || 'Unknown'} />
                <InfoRow
                  label="Free Hosting"
                  value={result.hostingData.isFreeHosting ? 'Yes' : 'No'}
                  valueClass={result.hostingData.isFreeHosting ? 'text-amber-400' : 'text-zinc-300'}
                />
                <InfoRow label="CDN" value={result.hostingData.cdnDetected || 'None detected'} />
                <InfoRow label="IP" value={result.hostingData.ipAddress || 'Unknown'} />
              </dl>
            ) : (
              <p className="text-zinc-500 text-sm">No hosting data available</p>
            )}
          </InfoCard>

          {/* Archive */}
          <InfoCard title="Archive.org History">
            {result.archiveData?.found ? (
              <dl className="space-y-2 text-sm">
                <InfoRow
                  label="First Snapshot"
                  value={formatDate(result.archiveData.firstSnapshot)}
                />
                <InfoRow
                  label="Total Snapshots"
                  value={result.archiveData.snapshotCount?.toString() || 'Unknown'}
                />
                <InfoRow
                  label="Archive Age"
                  value={
                    result.archiveData.oldestAge !== null
                      ? `${result.archiveData.oldestAge} days`
                      : 'Unknown'
                  }
                />
              </dl>
            ) : (
              <p className="text-zinc-500 text-sm">No archive history found</p>
            )}
          </InfoCard>
        </div>
      </Section>

      {/* Website Content Section */}
      <Section
        title="Website Content"
        isExpanded={expandedSections.has('content')}
        onToggle={() => toggleSection('content')}
      >
        {result.scraperData ? (
          <div className="space-y-4">
            {result.scraperData.title && (
              <div>
                <h4 className="text-sm font-medium text-zinc-400 mb-1">Title</h4>
                <p className="text-zinc-200">{result.scraperData.title}</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <ContentIndicator
                label="Contact"
                present={result.scraperData.hasContactPage}
              />
              <ContentIndicator
                label="Privacy"
                present={result.scraperData.hasPrivacyPolicy}
              />
              <ContentIndicator
                label="Terms"
                present={result.scraperData.hasTermsOfService}
              />
              <ContentIndicator
                label="Pricing"
                present={result.scraperData.hasPricing}
              />
              <ContentIndicator
                label="Docs"
                present={result.scraperData.hasDocumentation}
              />
            </div>

            {result.scraperData.socialLinks.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-zinc-400 mb-2">Social Links</h4>
                <div className="flex flex-wrap gap-2">
                  {result.scraperData.socialLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-400 hover:text-zinc-200 truncate max-w-[200px]"
                    >
                      {new URL(link).hostname}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">No content data available</p>
        )}
      </Section>

      {/* GitHub Section */}
      {result.githubData?.repoFound && (
        <Section
          title="GitHub Repository"
          isExpanded={expandedSections.has('github')}
          onToggle={() => toggleSection('github')}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <InfoCard title="Repository">
              <dl className="space-y-2 text-sm">
                <InfoRow
                  label="URL"
                  value={
                    <a
                      href={result.githubData.repoUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      {result.githubData.repoUrl}
                    </a>
                  }
                />
                <InfoRow
                  label="Stars"
                  value={result.githubData.stars?.toLocaleString() || 'Unknown'}
                />
                <InfoRow
                  label="Forks"
                  value={result.githubData.forks?.toLocaleString() || 'Unknown'}
                />
              </dl>
            </InfoCard>

            <InfoCard title="Activity">
              <dl className="space-y-2 text-sm">
                <InfoRow
                  label="Contributors"
                  value={result.githubData.contributors?.toString() || 'Unknown'}
                />
                <InfoRow
                  label="Open Issues"
                  value={result.githubData.openIssues?.toString() || 'Unknown'}
                />
                <InfoRow
                  label="Last Commit"
                  value={formatDate(result.githubData.lastCommit)}
                />
                <InfoRow
                  label="Archived"
                  value={result.githubData.isArchived ? 'Yes' : 'No'}
                  valueClass={result.githubData.isArchived ? 'text-amber-400' : 'text-zinc-300'}
                />
              </dl>
            </InfoCard>
          </div>
        </Section>
      )}

      {/* Cached indicator */}
      <div className="text-center text-xs text-zinc-600">
        Scanned {formatDate(result.createdAt)} · Results cached until {formatDate(result.expiresAt)}
      </div>
    </div>
  );
}

// Sub-components

function Section({
  title,
  count,
  badge,
  variant,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  count?: number;
  badge?: string;
  variant?: 'danger' | 'success';
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const borderColor =
    variant === 'danger'
      ? 'border-red-500/30'
      : variant === 'success'
      ? 'border-emerald-500/30'
      : 'border-zinc-800';

  return (
    <div className={`bg-zinc-900/80 border ${borderColor} rounded-xl overflow-hidden`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
          {count !== undefined && (
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded ${
                count > 0
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {count}
            </span>
          )}
          {badge && (
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded ${
                badge === 'safe'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : badge === 'avoid'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {badge.toUpperCase()}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-zinc-500 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isExpanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function RedFlagCard({ flag }: { flag: RedFlag }) {
  return (
    <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <SeverityBadge severity={flag.severity} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-zinc-100">{flag.title}</h4>
          <p className="text-sm text-zinc-400 mt-1">{flag.description}</p>
          {flag.evidence && (
            <p className="text-xs text-zinc-500 mt-2 font-mono bg-zinc-900 px-2 py-1 rounded">
              {flag.evidence}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function AiAnalysisDisplay({ analysis }: { analysis: AIAnalysis }) {
  // Map verdict to colors
  const verdictColors: Record<string, string> = {
    TRUSTWORTHY: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400',
    CAUTION: 'bg-amber-500/20 border-amber-500/50 text-amber-400',
    SUSPICIOUS: 'bg-orange-500/20 border-orange-500/50 text-orange-400',
    AVOID: 'bg-red-500/20 border-red-500/50 text-red-400',
  };

  const verdict = analysis.verdict || (
    analysis.recommendation === 'safe' ? 'TRUSTWORTHY' :
    analysis.recommendation === 'caution' ? 'CAUTION' : 'AVOID'
  );

  return (
    <div className="space-y-4">
      {/* Verdict Badge */}
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full border text-sm font-medium ${verdictColors[verdict] || verdictColors.CAUTION}`}>
          {verdict}
        </span>
        {analysis.riskLevel && (
          <span className="text-xs text-zinc-500">
            Risk Level: {analysis.riskLevel}
          </span>
        )}
      </div>

      <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
        <p className="text-zinc-200">{analysis.summary}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {analysis.concerns.length > 0 && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <h4 className="text-sm font-medium text-red-400 mb-2">Concerns</h4>
            <ul className="space-y-1">
              {analysis.concerns.map((concern, i) => (
                <li key={i} className="text-sm text-zinc-300">
                  • {concern}
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.positives.length > 0 && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <h4 className="text-sm font-medium text-emerald-400 mb-2">Positives</h4>
            <ul className="space-y-1">
              {analysis.positives.map((positive, i) => (
                <li key={i} className="text-sm text-zinc-300">
                  • {positive}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
        <h4 className="text-sm font-medium text-zinc-400 mb-2">Reasoning</h4>
        <p className="text-sm text-zinc-300">{analysis.reasoning}</p>
      </div>

      {/* False Positive Check */}
      {analysis.falsePositiveCheck && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h4 className="text-sm font-medium text-blue-400 mb-2">Note on Potential False Positives</h4>
          <p className="text-sm text-zinc-300">{analysis.falsePositiveCheck}</p>
        </div>
      )}
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
      <h4 className="text-sm font-medium text-zinc-400 mb-3">{title}</h4>
      {children}
    </div>
  );
}

function InfoRow({
  label,
  value,
  valueClass = 'text-zinc-300',
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-zinc-500">{label}</dt>
      <dd className={`${valueClass} text-right truncate`}>{value}</dd>
    </div>
  );
}

function ContentIndicator({ label, present }: { label: string; present: boolean }) {
  return (
    <div
      className={`
        px-3 py-2 rounded-lg text-center text-sm
        ${
          present
            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
            : 'bg-zinc-800 border border-zinc-700 text-zinc-500'
        }
      `}
    >
      {present ? '✓' : '✕'} {label}
    </div>
  );
}
