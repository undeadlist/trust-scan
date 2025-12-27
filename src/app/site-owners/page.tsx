import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  PageLayout,
  PageHero,
  ContentSection,
  CalloutBox,
  Checklist,
  ChecklistItem,
} from '@/components';
import { BRAND } from '@/lib/design-system';

export const metadata: Metadata = {
  title: `For Site Owners - ${BRAND.name}`,
  description: 'How to improve your trust score on AIBuilds.net. Tips for site owners to build credibility.',
};

export default function SiteOwnersPage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4">
        <PageHero
          title="For Site Owners"
          subtitle="How to Improve Your Trust Score"
          description="Getting flagged? Here's how to fix it."
          breadcrumb={{ label: 'Home', href: '/' }}
        />

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Quick Wins */}
          <ContentSection title="Quick Wins">
            <div className="grid sm:grid-cols-2 gap-6">
              <QuickWin
                number="1"
                title="Add Essential Pages"
                items={[
                  { text: 'Privacy Policy', desc: 'Explain what data you collect' },
                  { text: 'Terms of Service', desc: 'Basic legal protection' },
                  { text: 'Contact Page', desc: 'Email, form, or social links' },
                  { text: 'Pricing', desc: 'How do you make money? Be transparent' },
                ]}
              />
              <QuickWin
                number="2"
                title="Prove You\'re Real"
                items={[
                  { text: 'Link to GitHub', desc: 'Show your repos or org' },
                  { text: 'Social presence', desc: 'Twitter, LinkedIn, etc.' },
                  { text: 'About/Team page', desc: 'Show the humans behind it' },
                  { text: 'Real testimonials', desc: 'With names and links' },
                ]}
              />
            </div>
          </ContentSection>

          {/* Domain Tips */}
          <ContentSection title="Make Your Domain Trustworthy">
            <div className="space-y-4">
              <TipCard
                title="Use a Real Domain"
                description="Using .vercel.app or .netlify.app for production? Consider a custom domain. It signals permanence."
                type="tip"
              />
              <TipCard
                title="Domain Age Matters"
                description="New domains are fine - just be transparent about it. Don't claim to be 'established since 2020' if your domain is 30 days old."
                type="info"
              />
              <TipCard
                title="WHOIS Privacy is Fine"
                description="Using WHOIS privacy protection is industry standard. It won't hurt your score. Just make sure you have other contact methods visible."
                type="success"
              />
            </div>
          </ContentSection>

          {/* Be Transparent */}
          <ContentSection title="Be Transparent About Claims">
            <div className="grid sm:grid-cols-2 gap-4">
              <DontClaim text="Don't claim Fortune 500 customers if you don't have them" />
              <DontClaim text="Don't claim 'enterprise-grade' on free hosting" />
              <DontClaim text="Don't claim 'trusted by thousands' without evidence" />
              <DontClaim text="Don't use fake testimonials or stock photos" />
            </div>
            <CalloutBox type="tip" title="Honesty Builds Trust" className="mt-6">
              <p>
                It&apos;s okay to be early stage! &ldquo;Launched last month&rdquo; or &ldquo;In beta&rdquo;
                is much better than fake enterprise claims. Indie devs respect authenticity.
              </p>
            </CalloutBox>
          </ContentSection>

          {/* Documentation */}
          <ContentSection title="Documentation for Dev Tools">
            <p className="text-zinc-400 mb-4">
              If you&apos;re building developer tools that need credentials:
            </p>
            <ul className="space-y-3 text-zinc-400">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Explain exactly what permissions you need and <span className="text-zinc-300">WHY</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Document your data handling and storage practices
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Show architecture diagrams if asking for sensitive access
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Request minimum necessary permissions (read vs write)
              </li>
            </ul>
          </ContentSection>

          {/* Trust Checklist */}
          <ContentSection title="The Trust Checklist">
            <Checklist>
              <ChecklistItem>Privacy Policy exists and is real (not template gibberish)</ChecklistItem>
              <ChecklistItem>Terms of Service</ChecklistItem>
              <ChecklistItem>Contact information (real email or form)</ChecklistItem>
              <ChecklistItem>Pricing or clear explanation of business model</ChecklistItem>
              <ChecklistItem>About/Team page</ChecklistItem>
              <ChecklistItem>Social links that actually work</ChecklistItem>
              <ChecklistItem>Documentation for technical products</ChecklistItem>
              <ChecklistItem>Reasonable claims that match your infrastructure</ChecklistItem>
              <ChecklistItem>Clear explanation of data handling</ChecklistItem>
            </Checklist>
          </ContentSection>

          {/* Verified Badge */}
          <ContentSection title="Earn Your Verified Badge">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <Image
                    src="/verified-badge.png"
                    alt="Trust Scan Verified Badge"
                    width={180}
                    height={180}
                    className="rounded-xl"
                  />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-semibold text-zinc-100 mb-3">
                    Show Users You&apos;re Verified
                  </h3>
                  <p className="text-zinc-400 mb-4">
                    Sites that pass our trust checks can display the {BRAND.name} Verified badge.
                    It signals to indie developers that your service has been scanned and verified
                    as legitimate.
                  </p>
                  <ul className="space-y-2 text-sm text-zinc-400">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Low risk score (under 25)
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      All essential pages present
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Valid SSL and proper hosting
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </ContentSection>

          {/* Re-scan */}
          <ContentSection title="Request a Re-scan">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
              <p className="text-zinc-400 mb-4">
                Fixed the issues? Scan results update every 24 hours, or you can scan again now.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 rounded-lg transition-colors text-white font-medium"
              >
                Scan Your Site
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <p className="text-sm text-zinc-500 mt-4">
                Still getting flagged unfairly?{' '}
                <a href={`mailto:${BRAND.contact}`} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  Contact us
                </a>
              </p>
            </div>
          </ContentSection>
        </div>
      </div>
    </PageLayout>
  );
}

function QuickWin({
  number,
  title,
  items,
}: {
  number: string;
  title: string;
  items: { text: string; desc: string }[];
}) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 font-bold">
          {number}
        </div>
        <h3 className="font-semibold text-zinc-200">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i}>
            <p className="font-medium text-zinc-300 text-sm">{item.text}</p>
            <p className="text-xs text-zinc-500">{item.desc}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TipCard({
  title,
  description,
  type,
}: {
  title: string;
  description: string;
  type: 'tip' | 'info' | 'success';
}) {
  const colors = {
    tip: 'border-indigo-500/30 bg-indigo-500/10',
    info: 'border-blue-500/30 bg-blue-500/10',
    success: 'border-emerald-500/30 bg-emerald-500/10',
  };

  return (
    <div className={`border rounded-lg p-4 ${colors[type]}`}>
      <h4 className="font-medium text-zinc-200 mb-1">{title}</h4>
      <p className="text-sm text-zinc-400">{description}</p>
    </div>
  );
}

function DontClaim({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
      <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
      <span className="text-zinc-400 text-sm">{text}</span>
    </div>
  );
}
