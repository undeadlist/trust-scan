import { Metadata } from 'next';
import Link from 'next/link';
import {
  PageLayout,
  PageHero,
  ContentSection,
  Accordion,
  AccordionItem,
} from '@/components';
import { BRAND } from '@/lib/design-system';

export const metadata: Metadata = {
  title: `FAQ - ${BRAND.name}`,
  description: `Frequently asked questions about ${BRAND.name}. Learn about our trust scanning methodology.`,
};

export default function FAQPage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4">
        <PageHero
          title="Frequently Asked Questions"
          subtitle="Common questions about AIBuilds.net"
          breadcrumb={{ label: 'Home', href: '/' }}
        />

        <div className="max-w-3xl mx-auto">
          <ContentSection>
            <Accordion>
              <AccordionItem title="Is this free?" defaultOpen>
                <p>
                  Yes, completely free. The basic scan runs without any cost. For AI-powered
                  analysis, you can use your own free Gemini API key (BYOK - Bring Your Own Key).
                </p>
              </AccordionItem>

              <AccordionItem title="Do you store my API key?">
                <p>
                  No. Your Gemini API key is stored only in your browser&apos;s local storage.
                  It never touches our servers. When you run an AI analysis, the request goes
                  directly from your browser to Google&apos;s Gemini API.
                </p>
              </AccordionItem>

              <AccordionItem title="Why do I need my own Gemini key?">
                <p className="mb-2">
                  We wanted to offer AI analysis without charging users or running a SaaS business.
                  By using BYOK (Bring Your Own Key), you get free AI analysis using your own
                  quota, and we don&apos;t have to manage API costs or subscriptions.
                </p>
                <p>
                  Get a free key at{' '}
                  <a
                    href="https://aistudio.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    aistudio.google.com
                  </a>
                </p>
              </AccordionItem>

              <AccordionItem title="How accurate is this?">
                <p className="mb-2">
                  Our deterministic checks (domain age, SSL, hosting, etc.) are factual.
                  The AI analysis provides context and recommendations but isn&apos;t perfect.
                </p>
                <p>
                  <strong className="text-zinc-300">Important:</strong> This is a tool to help
                  you make informed decisions, not a guarantee of safety. Always do your own
                  research before connecting to any service.
                </p>
              </AccordionItem>

              <AccordionItem title="Can I check my own site?">
                <p>
                  Absolutely! Many site owners use {BRAND.name} to see how their site appears
                  to potential users. Check out our{' '}
                  <Link href="/site-owners" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                    Site Owners guide
                  </Link>{' '}
                  for tips on improving your trust score.
                </p>
              </AccordionItem>

              <AccordionItem title="Why was a legitimate site flagged?">
                <p className="mb-2">
                  False positives can happen, especially for:
                </p>
                <ul className="list-disc list-inside space-y-1 text-zinc-400 mb-2">
                  <li>Very new sites (domain age is just one signal)</li>
                  <li>JavaScript-heavy sites (our scraper may miss content)</li>
                  <li>Sites with unusual but legitimate setups</li>
                </ul>
                <p>
                  We continuously improve our detection. If you believe your site was
                  unfairly flagged,{' '}
                  <a
                    href={`mailto:${BRAND.contact}`}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    contact us
                  </a>.
                </p>
              </AccordionItem>

              <AccordionItem title="How do I improve my score?">
                <p>
                  See our detailed{' '}
                  <Link href="/site-owners" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                    Site Owners guide
                  </Link>. The quick version: add a privacy policy, terms of service,
                  contact page, and be transparent about who you are and how you make money.
                </p>
              </AccordionItem>

              <AccordionItem title="Is this open source?">
                <p>
                  Yes! You can view the full source code on{' '}
                  <a
                    href={BRAND.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    GitHub
                  </a>. PRs and issues are welcome.
                </p>
              </AccordionItem>

              <AccordionItem title="Who built this?">
                <p>
                  {BRAND.name} was built by the team behind{' '}
                  <a
                    href={BRAND.builtByUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {BRAND.builtBy}
                  </a>
                  , the marketplace for indie dev projects. We built this because we saw
                  too many sketchy services targeting indie developers.
                </p>
              </AccordionItem>

              <AccordionItem title="How can I report a bug or suggest a feature?">
                <p>
                  Open an issue on our{' '}
                  <a
                    href={BRAND.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    GitHub repository
                  </a>
                  , or email us at{' '}
                  <a
                    href={`mailto:${BRAND.contact}`}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {BRAND.contact}
                  </a>.
                </p>
              </AccordionItem>
            </Accordion>
          </ContentSection>

          {/* Still have questions? */}
          <div className="mt-12 text-center p-8 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <h3 className="text-xl font-semibold text-zinc-200 mb-2">
              Still have questions?
            </h3>
            <p className="text-zinc-400 mb-4">
              We&apos;re happy to help. Reach out anytime.
            </p>
            <a
              href={`mailto:${BRAND.contact}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 rounded-lg transition-colors text-white font-medium"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
