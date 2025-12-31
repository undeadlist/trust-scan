'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScanResult, AIAnalysis, RedFlag, RiskCalculationData, VerdictStatus } from '@/lib/types';
import { SeverityBadge } from './RiskBadge';
import { RiskGauge } from './RiskGauge';
import { RiskCalculationDisplay } from './RiskCalculationDisplay';
import { TechnicalSection } from './TechnicalSection';
import { VerdictCard } from './VerdictCard';
import { StickyHeader } from './StickyHeader';

interface ReportProps {
  result: ScanResult;
  onNewScan: () => void;
}

export function Report({ result, onNewScan }: ReportProps) {
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  // Red flags section starts collapsed by default
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set<string>()
  );
  const hasRunAnalysis = useRef(false);

  // Sticky header state
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

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

  // Sticky header intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyHeader(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (heroRef.current) {
      observer.observe(heroRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Build RiskCalculation data from AI analysis
  const buildRiskCalculation = (): RiskCalculationData | null => {
    if (!aiAnalysis?.riskBreakdown?.signals) return null;

    const adjustments: RiskCalculationData['adjustments'] = aiAnalysis.riskBreakdown.signals.map(signal => ({
      label: signal.factor,
      value: signal.points,
      type: signal.points < 0 ? 'positive' as const : 'negative' as const,
      note: signal.note,
    }));

    return {
      baseScore: 50,
      adjustments,
      finalScore: aiAnalysis.riskBreakdown.adjustedScore ?? result.riskScore,
    };
  };

  const riskCalculation = buildRiskCalculation();

  // Calculate final score and risk level when AI analysis adjusts the score
  const getFinalScoreData = () => {
    if (!aiAnalysis) {
      return { score: result.riskScore, level: result.riskLevel, adjusted: false };
    }

    // For comprehensive reports, use riskBreakdown.adjustedScore
    if (aiAnalysis.riskBreakdown?.adjustedScore !== undefined) {
      const finalScore = aiAnalysis.riskBreakdown.adjustedScore;
      let level: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (finalScore >= 70) level = 'critical';
      else if (finalScore >= 40) level = 'high';
      else if (finalScore >= 20) level = 'medium';
      return { score: finalScore, level, adjusted: finalScore !== result.riskScore };
    }

    // Legacy: use scoreAdjustment with proper type check (not falsy check!)
    if (typeof aiAnalysis.scoreAdjustment === 'number') {
      const finalScore = Math.max(0, Math.min(100, result.riskScore + aiAnalysis.scoreAdjustment));
      let level: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (finalScore >= 70) level = 'critical';
      else if (finalScore >= 40) level = 'high';
      else if (finalScore >= 20) level = 'medium';
      return { score: finalScore, level, adjusted: aiAnalysis.scoreAdjustment !== 0 };
    }

    return { score: result.riskScore, level: result.riskLevel, adjusted: false };
  };

  const finalScoreData = getFinalScoreData();

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

  // Get verdict status for sticky header
  const getVerdictStatus = (): VerdictStatus => {
    if (aiAnalysis?.verdict?.assessment) {
      return aiAnalysis.verdict.assessment;
    }
    // Derive from risk level if no AI verdict
    if (finalScoreData.level === 'critical' || finalScoreData.level === 'high') {
      return 'SUSPICIOUS';
    }
    if (finalScoreData.level === 'medium') {
      return 'CAUTION';
    }
    return 'TRUSTWORTHY';
  };

  // Helper to get technical section status
  const getSectionStatus = (sectionType: string): 'clean' | 'warning' | 'critical' | 'unknown' => {
    switch (sectionType) {
      case 'ssl':
        if (!result.sslData) return 'unknown';
        return result.sslData.valid ? 'clean' : 'critical';
      case 'hosting':
        if (!result.hostingData) return 'unknown';
        return result.hostingData.isFreeHosting ? 'warning' : 'clean';
      case 'threat':
        if (!result.threatData) return 'unknown';
        return result.threatData.isMalicious ? 'critical' : 'clean';
      case 'domain':
        if (!result.whoisData?.domainAge) return 'unknown';
        if (result.whoisData.domainAge < 90) return 'warning';
        return 'clean';
      default:
        return 'unknown';
    }
  };

  return (
    <>
      {/* Sticky Header - shows when scrolled past hero */}
      <StickyHeader
        domain={result.domain}
        score={finalScoreData.score}
        verdict={getVerdictStatus()}
        isVisible={showStickyHeader}
      />

      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Hero Header with RiskGauge */}
        <div
          ref={heroRef}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-6 bg-zinc-900/80 border border-zinc-800 rounded-xl"
        >
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-zinc-100 mb-1 break-all">
              {result.domain}
            </h2>
            <p className="text-sm text-zinc-500 break-all">{result.url}</p>
            <p className="text-xs text-zinc-600 mt-2">
              Scanned {formatDate(result.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <RiskGauge score={finalScoreData.score} size={160} />
            <button
              onClick={onNewScan}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 hover:bg-zinc-700 transition-colors whitespace-nowrap"
            >
              New Scan
            </button>
          </div>
        </div>

        {/* Known Entity Badge */}
        {result.isKnownEntity && (
          <div className="p-4 bg-zinc-800/50 border border-zinc-600 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-700/50 flex items-center justify-center">
                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-zinc-300 font-semibold">Recognized Established Service</h3>
                <p className="text-zinc-400 text-sm">
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

        {/* VERDICT CARD - The Hero Section (shown when AI analysis is ready) */}
        {aiLoading ? (
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-6 w-6 text-red-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-zinc-400">Analyzing with Trust Scan AI...</span>
            </div>
          </div>
        ) : aiError ? (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm">{aiError}</p>
          </div>
        ) : aiAnalysis?.verdict ? (
          <VerdictCard
            status={aiAnalysis.verdict.assessment}
            bottomLine={aiAnalysis.verdict.bottomLine}
            whatWeKnow={aiAnalysis.verdict.whatWeKnow || []}
            whatWeDontKnow={aiAnalysis.verdict.whatWeDontKnow || []}
            recommendations={aiAnalysis.verdict.recommendations || []}
            storageKey={result.domain}
          />
        ) : !aiAnalysis && (
          <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl">
            <p className="text-zinc-400 text-sm">
              AI-powered analysis is not currently available.
            </p>
          </div>
        )}

        {/* Red Flags Section - Condensed */}
        {result.redFlags.length > 0 && (
          <Section
            title="Red Flags Detected"
            count={result.redFlags.length}
            isExpanded={expandedSections.has('redflags')}
            onToggle={() => toggleSection('redflags')}
            variant="danger"
          >
            <div className="space-y-3">
              {result.redFlags.map((flag, index) => (
                <RedFlagCard key={index} flag={flag} />
              ))}
            </div>
          </Section>
        )}

        {/* Risk Calculation Visualization */}
        {riskCalculation && (
          <RiskCalculationDisplay calculation={riskCalculation} />
        )}

        {/* Technical Analysis - All Collapsed by Default */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Technical Analysis
          </h2>

          {/* Domain Intelligence */}
          <TechnicalSection
            title="Domain Intelligence"
            status={getSectionStatus('domain')}
            data={[
              { label: 'Domain Age', value: result.whoisData?.domainAge ? `${result.whoisData.domainAge} days` : 'Unknown', assessment: result.whoisData?.domainAge && result.whoisData.domainAge > 365 ? 'Established' : 'New/Unknown' },
              { label: 'Registrar', value: result.whoisData?.registrar || 'Unknown (WHOIS privacy)', assessment: 'Neutral' },
              { label: 'Privacy Protection', value: result.whoisData?.privacyProtected ? 'Enabled' : 'Disabled', assessment: 'Neutral' },
              { label: 'Creation Date', value: formatDate(result.whoisData?.creationDate ?? null) },
            ]}
            summary={aiAnalysis?.domainIntelligence?.analysis}
          />

          {/* SSL/TLS Security */}
          <TechnicalSection
            title="SSL/TLS Security"
            status={getSectionStatus('ssl')}
            data={[
              { label: 'Certificate Status', value: result.sslData?.valid ? 'Valid' : 'INVALID/FAILED', assessment: result.sslData?.valid ? 'Secure' : 'Critical' },
              { label: 'Issuer', value: result.sslData?.issuer || 'Unknown' },
              { label: 'Valid Until', value: formatDate(result.sslData?.validTo ?? null) },
              { label: 'Days Remaining', value: result.sslData?.daysRemaining?.toString() || 'Unknown' },
            ]}
            summary={aiAnalysis?.sslAnalysis?.whatThisMeans}
          />

          {/* Infrastructure */}
          <TechnicalSection
            title="Infrastructure Analysis"
            status={getSectionStatus('hosting')}
            data={[
              { label: 'Hosting Provider', value: result.hostingData?.provider || 'Unknown' },
              { label: 'IP Address', value: result.hostingData?.ipAddress || 'Unknown' },
              { label: 'CDN', value: result.hostingData?.cdnDetected || 'None detected' },
              { label: 'Free Hosting', value: result.hostingData?.isFreeHosting ? 'Yes' : 'No', assessment: result.hostingData?.isFreeHosting ? 'Elevated Risk' : 'Neutral' },
            ]}
            summary={aiAnalysis?.infrastructureAnalysis?.analysis}
          />

          {/* Web Presence */}
          <TechnicalSection
            title="Web Presence & Content"
            status={result.scraperData?.hasContactPage && result.scraperData?.hasPrivacyPolicy ? 'clean' : 'warning'}
            data={[
              { label: 'Site Title', value: result.scraperData?.title || 'Unknown' },
              { label: 'Contact Page', value: result.scraperData?.hasContactPage ? 'Found' : 'Not Found' },
              { label: 'Privacy Policy', value: result.scraperData?.hasPrivacyPolicy ? 'Found' : 'Not Found' },
              { label: 'Terms of Service', value: result.scraperData?.hasTermsOfService ? 'Found' : 'Not Found' },
              { label: 'Social Links', value: `${result.scraperData?.socialLinks?.length || 0} found` },
            ]}
            summary={aiAnalysis?.webPresence?.analysis}
          />

          {/* Historical Presence */}
          <TechnicalSection
            title="Historical Presence (Archive.org)"
            status={result.archiveData?.found ? 'clean' : 'unknown'}
            data={[
              { label: 'Found in Archive', value: result.archiveData?.found ? 'Yes' : 'No' },
              { label: 'First Snapshot', value: formatDate(result.archiveData?.firstSnapshot ?? null) },
              { label: 'Total Snapshots', value: result.archiveData?.snapshotCount?.toString() || 'Unknown' },
            ]}
            summary={aiAnalysis?.archiveAnalysis?.note}
          />

          {/* Threat Intelligence */}
          <TechnicalSection
            title="Threat Intelligence"
            status={getSectionStatus('threat')}
            data={[
              { label: 'URLhaus (Malware DB)', value: result.threatData?.isMalicious ? 'FLAGGED' : 'Clean', assessment: result.threatData?.isMalicious ? 'Critical' : 'Positive' },
              { label: 'Threat Type', value: result.threatData?.threat || 'None' },
              { label: 'Tags', value: result.threatData?.tags?.join(', ') || 'None' },
            ]}
            summary={aiAnalysis?.threatAnalysis?.analysis}
          />

          {/* GitHub Repository (if exists) */}
          {result.githubData?.repoFound && (
            <TechnicalSection
              title="GitHub Repository"
              status="clean"
              data={[
                { label: 'Repository', value: result.githubData.repoUrl || 'Unknown' },
                { label: 'Stars', value: result.githubData.stars?.toLocaleString() || 'Unknown' },
                { label: 'Contributors', value: result.githubData.contributors?.toString() || 'Unknown' },
                { label: 'Last Commit', value: formatDate(result.githubData.lastCommit) },
                { label: 'Archived', value: result.githubData.isArchived ? 'Yes' : 'No', assessment: result.githubData.isArchived ? 'Warning' : '' },
              ]}
            />
          )}
        </div>

        {/* Legacy AI Analysis Display (for backward compatibility with old format) */}
        {aiAnalysis && !aiAnalysis.verdict && aiAnalysis.summary && (
          <Section
            title="AI Analysis (Legacy)"
            isExpanded={expandedSections.has('ai-legacy')}
            onToggle={() => toggleSection('ai-legacy')}
          >
            <AiAnalysisDisplay analysis={aiAnalysis} originalScore={result.riskScore} />
          </Section>
        )}

        {/* Cached indicator */}
        <div className="text-center text-xs text-zinc-600">
          Scanned {formatDate(result.createdAt)} · Results cached until {formatDate(result.expiresAt)}
        </div>
      </div>
    </>
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
                  : 'bg-zinc-700/50 text-zinc-400'
              }`}
            >
              {count}
            </span>
          )}
          {badge && (
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded ${
                badge === 'safe'
                  ? 'bg-zinc-700/50 text-zinc-400'
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

// ============================================================================
// LEGACY AI ANALYSIS DISPLAY (kept for backward compatibility)
// ============================================================================

function AiAnalysisDisplay({ analysis, originalScore }: { analysis: AIAnalysis; originalScore?: number }) {
  // Map verdict to colors - using zinc for trustworthy (clean = safe), amber/red for warnings
  const verdictColors: Record<string, string> = {
    TRUSTWORTHY: 'bg-zinc-700/50 border-zinc-600 text-zinc-300',
    CAUTION: 'bg-amber-500/20 border-amber-500/50 text-amber-400',
    SUSPICIOUS: 'bg-orange-500/20 border-orange-500/50 text-orange-400',
    AVOID: 'bg-red-500/20 border-red-500/50 text-red-400',
  };

  // Get verdict string from object or derive from recommendation
  const verdictStr = analysis.verdict?.assessment || (
    analysis.recommendation === 'safe' ? 'TRUSTWORTHY' :
    analysis.recommendation === 'caution' ? 'CAUTION' : 'AVOID'
  );

  // Calculate combined score and detect if adjustment had effect
  const adjustment = analysis.scoreAdjustment || 0;
  const hasScanScore = typeof originalScore === 'number';
  const rawFinal = hasScanScore ? originalScore + adjustment : null;
  const finalScore = hasScanScore ? Math.max(0, Math.min(100, rawFinal!)) : null;
  const adjustmentHadEffect = hasScanScore && finalScore !== originalScore;
  const isLowerRisk = adjustment < 0;

  return (
    <div className="space-y-4">
      {/* Score Adjustment Display */}
      {hasScanScore && adjustment !== 0 && (
        <div className="p-4 rounded-lg border bg-zinc-800/50 border-zinc-700">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm text-zinc-400">AI Score Analysis</div>
              {adjustmentHadEffect ? (
                // Show clear arrow transition when adjustment had effect
                <div className="flex items-center gap-3 text-lg">
                  <span className="text-zinc-500">{originalScore}</span>
                  <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span className="font-bold text-zinc-100">{finalScore}</span>
                </div>
              ) : (
                // When adjustment had no effect (clamped at boundary)
                <div className="text-zinc-400">
                  Score unchanged (already at {finalScore === 0 ? 'minimum' : 'maximum'})
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              {isLowerRisk ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  <span>Lower risk</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span>Higher risk</span>
                </>
              )}
            </div>
          </div>
          {analysis.adjustmentReason && (
            <p className="mt-2 text-sm text-zinc-400">{analysis.adjustmentReason}</p>
          )}
        </div>
      )}

      {/* Verdict Badge */}
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full border text-sm font-medium ${verdictColors[verdictStr] || verdictColors.CAUTION}`}>
          {verdictStr}
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
        {analysis.concerns && analysis.concerns.length > 0 && (
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

        {analysis.positives && analysis.positives.length > 0 && (
          <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <h4 className="text-sm font-medium text-zinc-400 mb-2">Positives</h4>
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
        <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
          <h4 className="text-sm font-medium text-zinc-400 mb-2">Analysis Notes</h4>
          <p className="text-sm text-zinc-300">{analysis.falsePositiveCheck}</p>
        </div>
      )}
    </div>
  );
}

