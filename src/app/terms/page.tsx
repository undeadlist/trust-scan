import { Metadata } from 'next';
import Link from 'next/link';
import {
  PageLayout,
  PageHero,
  ContentSection,
  CalloutBox,
} from '@/components';
import { BRAND } from '@/lib/design-system';

export const metadata: Metadata = {
  title: `Terms of Service - ${BRAND.name}`,
  description: `Terms of service for ${BRAND.name}. A free tool for indie developers.`,
};

export default function TermsPage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4">
        <PageHero
          title="Terms of Service"
          subtitle="The rules of the road (we kept them simple)"
          breadcrumb={{ label: 'Home', href: '/' }}
        />

        <div className="max-w-3xl mx-auto space-y-8">
          <ContentSection>
            <p className="text-zinc-400 text-sm mb-6">
              Last updated: December 2024
            </p>
            <p className="text-zinc-300 mb-4">
              {BRAND.name} is a free, open-source tool built to help indie developers make more informed
              decisions about the services they connect to. By using this tool, you agree to these terms.
              We&apos;ve tried to keep them readable because nobody likes legalese walls.
            </p>
          </ContentSection>

          <ContentSection title="What This Tool Does">
            <div className="space-y-4 text-zinc-400">
              <p>
                {BRAND.name} analyzes websites to provide trust indicators and potential red flags.
                We check things like domain age, SSL certificates, hosting providers, content patterns,
                and more. If you enable AI analysis (using your own API key), we also provide
                AI-generated insights.
              </p>
              <CalloutBox type="warning" title="Important">
                <p>
                  Our results are <strong>informational only</strong>. They&apos;re meant to be one data point
                  in your decision-making process, not a definitive verdict. We&apos;re a scanning tool,
                  not a guarantee of safety or legitimacy.
                </p>
              </CalloutBox>
            </div>
          </ContentSection>

          <ContentSection title="No Warranties">
            <div className="space-y-4 text-zinc-400">
              <p>
                We provide {BRAND.name} &quot;as is&quot; and &quot;as available.&quot; We make no warranties, expressed
                or implied, about:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>The accuracy, completeness, or reliability of our scan results</li>
                <li>Whether a website flagged as &quot;low risk&quot; is actually safe</li>
                <li>Whether a website flagged as &quot;high risk&quot; is actually malicious</li>
                <li>The availability or uptime of the service</li>
                <li>The accuracy of third-party data sources we query</li>
              </ul>
              <p className="mt-4">
                Our scanning methods aren&apos;t perfect. Scammers evolve, legitimate sites sometimes look
                suspicious, and our automated checks can&apos;t catch everything. Use your judgment.
              </p>
            </div>
          </ContentSection>

          <ContentSection title="Limitation of Liability">
            <div className="space-y-4 text-zinc-400">
              <p>
                To the maximum extent permitted by law, {BRAND.name}, its creators, contributors, and
                affiliates shall not be liable for any:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Direct, indirect, incidental, or consequential damages</li>
                <li>Loss of data, profits, or business opportunities</li>
                <li>Damages resulting from your reliance on our scan results</li>
                <li>Damages from connecting to services based on our assessments</li>
                <li>Any other damages arising from your use of this tool</li>
              </ul>
              <p className="mt-4 text-zinc-300">
                <strong>In plain English:</strong> If you scan a site, we say it looks fine, and it turns
                out to be a scam &mdash; that&apos;s on you, not us. We&apos;re providing information to help you
                make better decisions, but the final call is yours. Similarly, if we flag a legitimate
                site as suspicious, we&apos;re not liable for any impact that has.
              </p>
            </div>
          </ContentSection>

          <ContentSection title="Your Responsibilities">
            <div className="space-y-4 text-zinc-400">
              <p>By using {BRAND.name}, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the tool for its intended purpose (evaluating website trustworthiness)</li>
                <li>Not abuse the service with excessive automated requests</li>
                <li>Not use scan results to harass or defame legitimate businesses</li>
                <li>Do your own research before making important decisions</li>
                <li>Keep your own API keys (if using BYOK) secure</li>
              </ul>
            </div>
          </ContentSection>

          <ContentSection title="BYOK (Bring Your Own Key)">
            <div className="space-y-4 text-zinc-400">
              <p>
                If you use your own API keys for AI analysis (Gemini or Claude), you&apos;re responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Keeping your API keys secure</li>
                <li>Any usage charges from Google or Anthropic</li>
                <li>Complying with their terms of service</li>
              </ul>
              <p className="mt-4">
                Your keys are stored only in your browser&apos;s localStorage. We never see or store them
                on our servers. If you clear your browser data or use a different device, you&apos;ll need
                to enter your key again.
              </p>
            </div>
          </ContentSection>

          <ContentSection title="Intellectual Property">
            <div className="space-y-4 text-zinc-400">
              <p>
                {BRAND.name} is open source software. The code is available on{' '}
                <a
                  href={BRAND.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  GitHub
                </a>{' '}
                under its respective license. The {BRAND.name} name, logo, and branding remain the
                property of {BRAND.builtBy}.
              </p>
              <p>
                Scan results are provided for your personal or business use. You may share results,
                but you may not systematically scrape or redistribute our data commercially without permission.
              </p>
            </div>
          </ContentSection>

          <ContentSection title="Third-Party Services">
            <div className="space-y-4 text-zinc-400">
              <p>
                Our tool queries various third-party services (WHOIS providers, Archive.org, GitHub, etc.).
                We&apos;re not responsible for the accuracy or availability of data from these services.
                Each has their own terms and limitations.
              </p>
              <p>
                If you use BYOK AI analysis, your interaction with Google (Gemini) or Anthropic (Claude)
                is governed by their respective terms of service and privacy policies.
              </p>
            </div>
          </ContentSection>

          <ContentSection title="Acceptable Use">
            <div className="space-y-4 text-zinc-400">
              <p>Don&apos;t use {BRAND.name} to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Conduct denial-of-service attacks against websites you&apos;re scanning</li>
                <li>Attempt to exploit or hack our service or the sites being scanned</li>
                <li>Generate false or misleading reports to harm competitors</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Circumvent any rate limits or access controls we implement</li>
              </ul>
              <p className="mt-4">
                We reserve the right to block access if we detect abusive behavior.
              </p>
            </div>
          </ContentSection>

          <ContentSection title="Indemnification">
            <div className="space-y-4 text-zinc-400">
              <p>
                You agree to indemnify and hold harmless {BRAND.name}, its creators, and affiliates from
                any claims, damages, or expenses arising from your use of the service or violation of
                these terms.
              </p>
            </div>
          </ContentSection>

          <ContentSection title="Service Availability">
            <div className="space-y-4 text-zinc-400">
              <p>
                We do our best to keep {BRAND.name} running, but we&apos;re a small indie project, not a
                big tech company with five-nines uptime. The service may be unavailable due to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maintenance or updates</li>
                <li>Third-party service outages</li>
                <li>Technical issues beyond our control</li>
                <li>Force majeure events</li>
              </ul>
              <p className="mt-4">
                We don&apos;t guarantee any specific uptime or availability.
              </p>
            </div>
          </ContentSection>

          <ContentSection title="Changes to These Terms">
            <div className="space-y-4 text-zinc-400">
              <p>
                We may update these terms occasionally. When we do, we&apos;ll update the &quot;Last updated&quot;
                date at the top. Continued use of {BRAND.name} after changes means you accept the new terms.
                For significant changes, we may post an announcement.
              </p>
            </div>
          </ContentSection>

          <ContentSection title="Governing Law">
            <div className="space-y-4 text-zinc-400">
              <p>
                These terms are governed by and construed in accordance with applicable laws. Any disputes
                shall be resolved through good-faith negotiation first. We&apos;re indie devs &mdash; we&apos;d much
                rather talk it out than lawyer up.
              </p>
            </div>
          </ContentSection>

          <ContentSection title="Severability">
            <div className="space-y-4 text-zinc-400">
              <p>
                If any part of these terms is found to be unenforceable, the rest still applies.
                We didn&apos;t hide anything sneaky in here, we promise.
              </p>
            </div>
          </ContentSection>

          <ContentSection title="Contact">
            <div className="space-y-4 text-zinc-400">
              <p>
                Questions about these terms? Concerns about how we operate? We&apos;re happy to chat.
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

          {/* Summary Box */}
          <div className="mt-12 p-6 bg-gradient-to-br from-zinc-900/50 to-zinc-800/30 border border-zinc-700 rounded-xl">
            <h3 className="text-lg font-semibold text-zinc-200 mb-4">
              TL;DR
            </h3>
            <ul className="space-y-2 text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">&bull;</span>
                <span>{BRAND.name} is free and open source. Use it to help make informed decisions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">&bull;</span>
                <span>Our scan results are informational, not guarantees. Always do your own research.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">&bull;</span>
                <span>We&apos;re not liable if something goes wrong based on our results.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">&bull;</span>
                <span>Don&apos;t abuse the service or use it for shady purposes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">&bull;</span>
                <span>Questions? Reach out. We&apos;re friendly.</span>
              </li>
            </ul>
          </div>

          {/* Link to Privacy */}
          <div className="mt-8 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center">
            <p className="text-zinc-400 mb-4">
              These terms work alongside our privacy policy.
            </p>
            <Link
              href="/privacy"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Read our Privacy Policy &rarr;
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
