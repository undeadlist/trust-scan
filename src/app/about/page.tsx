import { Metadata } from 'next';
import Image from 'next/image';
import {
  PageLayout,
  PageHero,
  ContentSection,
  CalloutBox,
} from '@/components';
import { BRAND } from '@/lib/design-system';

export const metadata: Metadata = {
  title: `About ${BRAND.name} - Free URL Scanner by AIBuilds`,
  description: `Learn about ${BRAND.name}, the free URL trust scanner for AI builders and indie developers. Built by ${BRAND.builtBy}. Open source security tool.`,
  keywords: ['about trust scan', 'aibuilds', 'undeadlist', 'url scanner', 'free security tool'],
};

export default function AboutPage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4">
        <PageHero
          title={`About ${BRAND.name}`}
          subtitle="Free. Open source. Built for AI builders."
          breadcrumb={{ label: 'Home', href: '/' }}
          logo={{ src: '/logo.png', alt: BRAND.name, width: 240, height: 240 }}
        />

        <div className="max-w-3xl mx-auto space-y-8">
          {/* Built By Section */}
          <ContentSection>
            <div className="flex items-center gap-4 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <Image
                src="/undeadlist-logo.png"
                alt={BRAND.builtBy}
                width={144}
                height={144}
                className="rounded-xl flex-shrink-0"
              />
              <div>
                <p className="text-sm text-zinc-500">Built by the team behind</p>
                <a
                  href={BRAND.builtByUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-bold text-red-400 hover:text-red-300 transition-colors"
                >
                  {BRAND.builtBy}
                </a>
                <p className="text-sm text-zinc-500 mt-1">The marketplace for indie dev projects</p>
              </div>
            </div>
          </ContentSection>

          {/* Why We Built This */}
          <ContentSection title="Why We Built This">
            <div className="space-y-4 text-zinc-400">
              <p>
                The vibe coding revolution made building easy. AI tools let anyone ship a product in a weekend.
                But they also made building scams easy.
              </p>
              <p>
                We saw apps asking indie devs for GitHub access, database credentials, and API keys &mdash;
                with zero way to verify if they were legit.
              </p>
              <p className="text-zinc-300 font-medium">
                So we built a free tool to help you check before you connect.
              </p>
            </div>
          </ContentSection>

          {/* How It Works */}
          <ContentSection title="How It Works">
            <p className="text-zinc-400 mb-6">
              We run automated checks on any URL you submit:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <CheckItem title="Domain Analysis" description="WHOIS age, registration details, privacy settings" />
              <CheckItem title="Hosting Detection" description="Provider identification, free tier flags" />
              <CheckItem title="SSL Validation" description="Certificate validity, issuer, expiration" />
              <CheckItem title="Content Scanning" description="Privacy policy, terms, contact info" />
              <CheckItem title="Pattern Matching" description="Suspicious claims, red flag detection" />
              <CheckItem title="History Check" description="Archive.org snapshots, GitHub presence" />
            </div>
          </ContentSection>

          {/* AI Analysis Section */}
          <ContentSection title="AI-Powered Analysis">
            <CalloutBox type="tip" title="Trust Scan AI">
              <p>
                Every scan includes AI-powered analysis using our Trust Scan AI. No API keys required &mdash;
                the AI evaluates scan results and provides human-readable insights about potential concerns.
                Free, automatic, and always included.
              </p>
            </CalloutBox>
          </ContentSection>

          {/* Open Source */}
          <ContentSection title="Open & Transparent">
            <div className="space-y-4 text-zinc-400">
              <p>
                We&apos;re indie devs too. We know trust is earned.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href={BRAND.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  View Source Code
                </a>
                <a
                  href={`mailto:${BRAND.contact}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Us
                </a>
              </div>
            </div>
          </ContentSection>
        </div>
      </div>
    </PageLayout>
  );
}

function CheckItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
      <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <p className="font-medium text-zinc-200">{title}</p>
        <p className="text-sm text-zinc-500">{description}</p>
      </div>
    </div>
  );
}
