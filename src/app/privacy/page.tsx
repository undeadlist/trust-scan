import { Metadata } from 'next';
import Link from 'next/link';
import {
  PageLayout,
  PageHero,
  ContentSection,
} from '@/components';
import { BRAND } from '@/lib/design-system';

export const metadata: Metadata = {
  title: `Privacy Policy - ${BRAND.name} by AIBuilds`,
  description: `Privacy policy for ${BRAND.name}. We don't sell your data, don't require API keys, and keep data collection minimal. Open source and transparent. By AIBuilds.`,
  keywords: ['trust scan privacy', 'aibuilds privacy policy', 'data privacy', 'no tracking', 'open source'],
};

export default function PrivacyPage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4">
        <PageHero
          title="Privacy Policy"
          subtitle="How we handle your data (spoiler: we keep it minimal)"
          breadcrumb={{ label: 'Home', href: '/' }}
        />

        <div className="max-w-3xl mx-auto space-y-8">
          <ContentSection>
            <p className="text-zinc-400 text-sm mb-6">
              Last updated: December 2024
            </p>
            <p className="text-zinc-300 mb-4">
              We built {BRAND.name} because we care about trust and transparency in the indie dev ecosystem.
              That same philosophy applies to how we handle your data. Here&apos;s the honest breakdown.
            </p>
          </ContentSection>

          <ContentSection title="The Short Version">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">&#10003;</span>
                <p className="text-zinc-300">We don&apos;t sell your data. Ever.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">&#10003;</span>
                <p className="text-zinc-300">No API keys required from you. AI analysis runs server-side.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">&#10003;</span>
                <p className="text-zinc-300">We cache scan results temporarily to improve speed. That&apos;s it.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">&#10003;</span>
                <p className="text-zinc-300">No accounts, no tracking pixels, no creepy analytics.</p>
              </div>
            </div>
          </ContentSection>

          <ContentSection title="What Data We Collect">
            <div className="space-y-6 text-zinc-400">
              <div>
                <h4 className="text-zinc-200 font-medium mb-2">URLs You Scan</h4>
                <p>
                  When you submit a URL for scanning, we process it to run our checks. We cache the results
                  in our database for 24 hours so repeat scans are faster and we don&apos;t hammer third-party
                  services unnecessarily. After 24 hours, you get a fresh scan.
                </p>
              </div>

              <div>
                <h4 className="text-zinc-200 font-medium mb-2">Scan Results</h4>
                <p>
                  The technical data we gather about scanned websites (domain age, SSL info, hosting details, etc.)
                  is stored temporarily for caching purposes. This data is about the websites being scanned,
                  not about you.
                </p>
              </div>

              <div>
                <h4 className="text-zinc-200 font-medium mb-2">AI Analysis</h4>
                <p>
                  AI analysis is performed server-side using our Trust Scan AI. No API keys are required
                  from you. The AI evaluates scan results to provide insights, but doesn&apos;t store any
                  additional personal data.
                </p>
              </div>

              <div>
                <h4 className="text-zinc-200 font-medium mb-2">Server Logs</h4>
                <p>
                  Like most web services, our hosting provider may log basic request data (IP addresses,
                  timestamps, etc.) for security and operational purposes. We don&apos;t actively analyze
                  this data to track individual users.
                </p>
              </div>
            </div>
          </ContentSection>

          <ContentSection title="What We Don&apos;t Do">
            <ul className="space-y-3 text-zinc-400">
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">&#10007;</span>
                <span>We don&apos;t create user accounts or profiles</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">&#10007;</span>
                <span>We don&apos;t use tracking cookies or analytics that follow you around the web</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">&#10007;</span>
                <span>We don&apos;t sell, rent, or share your data with third parties</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">&#10007;</span>
                <span>We don&apos;t require any API keys from you</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">&#10007;</span>
                <span>We don&apos;t require any personal information to use the service</span>
              </li>
            </ul>
          </ContentSection>

          <ContentSection title="Third-Party Services">
            <div className="space-y-4 text-zinc-400">
              <p>
                To perform scans, we query several third-party services on your behalf:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-zinc-300">WHOIS/RDAP services</strong> - for domain registration data</li>
                <li><strong className="text-zinc-300">Archive.org (Wayback Machine)</strong> - for historical snapshots</li>
                <li><strong className="text-zinc-300">GitHub API</strong> - for repository information</li>
                <li><strong className="text-zinc-300">The target website itself</strong> - to analyze its content</li>
              </ul>
              <p>
                AI analysis is performed server-side using our Trust Scan AI and doesn&apos;t require
                any external API calls from your browser.
              </p>
            </div>
          </ContentSection>

          <ContentSection title="Data Retention">
            <div className="space-y-4 text-zinc-400">
              <p>
                <strong className="text-zinc-300">Scan results:</strong> Cached for 24 hours, then eligible for deletion.
              </p>
              <p>
                <strong className="text-zinc-300">Server logs:</strong> Retained per our hosting provider&apos;s
                standard policies (typically 30-90 days).
              </p>
            </div>
          </ContentSection>

          <ContentSection title="Your Rights">
            <div className="space-y-4 text-zinc-400">
              <p>
                Since we don&apos;t create accounts or store personal data, there&apos;s not much to delete. But if you
                have concerns about any data we might have, reach out and we&apos;ll help you out.
              </p>
              <p>
                For EU/UK users: We believe our minimal data practices align with GDPR principles, but we&apos;re
                a small indie project, not a legal team. If you have specific GDPR requests, contact us and
                we&apos;ll do our best to accommodate them.
              </p>
            </div>
          </ContentSection>

          <ContentSection title="Open Source Transparency">
            <div className="space-y-4 text-zinc-400">
              <p>
                Don&apos;t take our word for it. {BRAND.name} is open source. You can{' '}
                <a
                  href={BRAND.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  review our code on GitHub
                </a>{' '}
                and see exactly what data we collect and how we handle it.
              </p>
            </div>
          </ContentSection>

          <ContentSection title="Changes to This Policy">
            <div className="space-y-4 text-zinc-400">
              <p>
                If we make significant changes to how we handle data, we&apos;ll update this page and the
                &quot;Last updated&quot; date. For a small indie tool like this, major changes are unlikely,
                but we&apos;ll keep you informed if they happen.
              </p>
            </div>
          </ContentSection>

          <ContentSection title="Contact">
            <div className="space-y-4 text-zinc-400">
              <p>
                Questions about privacy? Want to know what data we have about a specific scan? Just ask.
              </p>
              <a
                href={`mailto:${BRAND.contact}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {BRAND.contact}
              </a>
            </div>
          </ContentSection>

          {/* Link to Terms */}
          <div className="mt-12 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center">
            <p className="text-zinc-400 mb-4">
              This privacy policy works alongside our terms of service.
            </p>
            <Link
              href="/terms"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Read our Terms of Service &rarr;
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
