import { Metadata } from 'next';
import {
  PageLayout,
  PageHero,
  ContentSection,
  DataTable,
  CalloutBox,
} from '@/components';
import { BRAND, RISK_CONFIG } from '@/lib/design-system';

export const metadata: Metadata = {
  title: `How ${BRAND.name} Works - URL Scanning Methodology`,
  description: `Learn how ${BRAND.name} by AIBuilds analyzes websites for trust signals, scam patterns, and red flags. Free URL scanning methodology explained.`,
  keywords: ['how trust scan works', 'url scanning', 'website analysis', 'scam detection methodology', 'aibuilds'],
};

export default function HowItWorksPage() {
  const checksData = [
    { check: 'Domain Age', description: 'WHOIS registration date and history' },
    { check: 'SSL Certificate', description: 'Valid? Issuer? Days until expiration?' },
    { check: 'Hosting Provider', description: 'Who hosts it? Free tier detection' },
    { check: 'Required Pages', description: 'Privacy policy, Terms of Service, Contact' },
    { check: 'Archive History', description: 'Wayback Machine snapshots' },
    { check: 'GitHub Presence', description: 'Public repositories or organization' },
    { check: 'Pattern Matching', description: 'Suspicious claims and red flag detection' },
  ];

  const scoringData = Object.entries(RISK_CONFIG).map(([level, config]) => ({
    score: config.range,
    level: (
      <span className={config.textClass}>{config.label}</span>
    ),
    meaning: config.meaning,
  }));

  return (
    <PageLayout>
      <div className="container mx-auto px-4">
        <PageHero
          title={`How ${BRAND.name} Works`}
          subtitle="Transparent methodology for trust assessment"
          breadcrumb={{ label: 'Home', href: '/' }}
          logo={{ src: '/logo.png', alt: BRAND.name, width: 240, height: 240 }}
        />

        <div className="max-w-4xl mx-auto space-y-8">
          {/* What We Check */}
          <ContentSection title="Deterministic Checks (No AI)">
            <p className="text-zinc-400 mb-6">
              These checks run automatically on every scan, no AI required:
            </p>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
              <DataTable
                columns={[
                  { key: 'check', header: 'Check', className: 'font-medium text-zinc-200' },
                  { key: 'description', header: 'What We Look For' },
                ]}
                data={checksData}
              />
            </div>
          </ContentSection>

          {/* AI Analysis */}
          <ContentSection title="AI Analysis">
            <p className="text-zinc-400 mb-4">
              After automated checks, our Trust Scan AI provides intelligent analysis:
            </p>
            <ul className="space-y-2 text-zinc-400 mb-6">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Contextual claim verification
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Red flag pattern recognition
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Holistic risk assessment
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Actionable recommendations
              </li>
            </ul>
            <CalloutBox type="info" title="Free & Automatic">
              AI analysis is included with every scan. No API keys required.
            </CalloutBox>
          </ContentSection>

          {/* What We Don't Do */}
          <ContentSection title="What We DON'T Do">
            <div className="grid sm:grid-cols-2 gap-4">
              <DontItem text="Require any API keys from you" />
              <DontItem text="Guarantee a site is safe (we flag concerns)" />
              <DontItem text="Scan sites without permission (you submit the URL)" />
              <DontItem text="Access any private data" />
            </div>
          </ContentSection>

          {/* Scoring */}
          <ContentSection title="Risk Scoring">
            <p className="text-zinc-400 mb-6">
              Based on our checks, we calculate a risk score:
            </p>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
              <DataTable
                columns={[
                  { key: 'score', header: 'Score', className: 'font-mono' },
                  { key: 'level', header: 'Risk Level' },
                  { key: 'meaning', header: 'Meaning' },
                ]}
                data={scoringData}
              />
            </div>
          </ContentSection>

          {/* Limitations */}
          <ContentSection title="Limitations">
            <CalloutBox type="warning" title="Important Disclaimers">
              <ul className="space-y-2 mt-2">
                <li>&bull; JavaScript-heavy sites may not scrape fully</li>
                <li>&bull; New ≠ scam (we try to be fair to new projects)</li>
                <li>&bull; WHOIS privacy is normal (not a strong signal alone)</li>
                <li>&bull; We can miss sophisticated scams</li>
                <li>&bull; This is a tool, not a guarantee</li>
              </ul>
            </CalloutBox>
          </ContentSection>

          {/* Open Source */}
          <ContentSection title="Open Source">
            <p className="text-zinc-400 mb-4">
              Want to see exactly how it works? Check out the source code:
            </p>
            <a
              href={BRAND.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors text-white"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              View on GitHub
            </a>
          </ContentSection>
        </div>
      </div>
    </PageLayout>
  );
}

function DontItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
      <svg className="w-5 h-5 text-zinc-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
      <span className="text-zinc-400 text-sm">{text}</span>
    </div>
  );
}
