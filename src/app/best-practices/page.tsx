import { Metadata } from 'next';
import {
  PageLayout,
  PageHero,
  ContentSection,
  DataTable,
  CalloutBox,
} from '@/components';
import { BRAND } from '@/lib/design-system';

export const metadata: Metadata = {
  title: `Security Best Practices - ${BRAND.name} by AIBuilds`,
  description: 'Learn how to protect yourself as an indie developer. Best practices for evaluating services, protecting API keys, and avoiding scams. By AIBuilds.',
  keywords: ['developer security best practices', 'api key security', 'indie developer safety', 'aibuilds', 'avoid scams'],
};

export default function BestPracticesPage() {
  const permissionsData = [
    { permission: 'GitHub read', meaning: 'Can see all your code, including private repos' },
    { permission: 'GitHub write', meaning: 'Can modify or delete your repositories' },
    { permission: 'Database URL', meaning: 'Full access to all your data' },
    { permission: 'Stripe key', meaning: 'Access to customer payments and billing' },
    { permission: 'AWS credentials', meaning: 'Your entire cloud infrastructure, your bill' },
    { permission: 'OpenAI key', meaning: 'Can use your API quota and see your usage' },
  ];

  return (
    <PageLayout>
      <div className="container mx-auto px-4">
        <PageHero
          title="Best Practices"
          subtitle="Protecting Yourself as an Indie Dev"
          breadcrumb={{ label: 'Home', href: '/' }}
          logo={{ src: '/logo.png', alt: BRAND.name, width: 240, height: 240 }}
        />

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Before Connecting */}
          <ContentSection title="Before Connecting Any Service">
            <div className="grid sm:grid-cols-2 gap-6">
              <CheckCard
                number="1"
                title="Check the Basics"
                items={[
                  'How old is the domain?',
                  'Do they have a privacy policy?',
                  'Can you contact them?',
                  'How do they make money?',
                ]}
              />
              <CheckCard
                number="2"
                title="Research the Company"
                items={[
                  'Search "[service name] scam"',
                  'Check r/indiehackers discussions',
                  'Look for real user reviews',
                  'Verify social media presence',
                ]}
              />
            </div>
          </ContentSection>

          {/* Permissions Table */}
          <ContentSection title="Understand What You're Granting">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
              <DataTable
                columns={[
                  { key: 'permission', header: 'Permission', className: 'font-mono text-amber-400' },
                  { key: 'meaning', header: 'What It Actually Means' },
                ]}
                data={permissionsData}
              />
            </div>
          </ContentSection>

          {/* Red Flags */}
          <ContentSection title="Red Flags to Watch For">
            <div className="grid sm:grid-cols-2 gap-4">
              <RedFlag text="Free tier with no clear business model" />
              <RedFlag text="Claims major customers with no proof" />
              <RedFlag text="Asks for credentials before explaining the product" />
              <RedFlag text="No documentation or API reference" />
              <RedFlag text="Generic testimonials with stock photos" />
              <RedFlag text="Very new domain + big claims" />
              <RedFlag text="Urgency tactics ('Limited time!')" />
              <RedFlag text="Requests write access when read would suffice" />
            </div>
          </ContentSection>

          {/* Safe Practices */}
          <ContentSection title="Safe Practices">
            <div className="space-y-4">
              <SafePractice
                title="Use Separate API Keys for Testing"
                description="Never give production credentials to unknown services. Create test keys with limited scope."
              />
              <SafePractice
                title="Verify Open Source Claims"
                description="If they claim to be open source, check the GitHub. Look for activity and contributors."
              />
              <SafePractice
                title="Ask in Communities"
                description="Before signing up, ask on r/indiehackers, Twitter, or Discord. Someone may have experience with them."
              />
              <SafePractice
                title="Start with Read-Only Access"
                description="If possible, grant read-only access first. Upgrade permissions only after you trust them."
              />
            </div>
          </ContentSection>

          {/* If It Sounds Too Good */}
          <ContentSection title="If It Sounds Too Good...">
            <CalloutBox type="warning" title="Ask the Hard Questions">
              <p className="mb-4">
                &ldquo;Free AI that auto-fixes your code and deploys for you!&rdquo;
              </p>
              <p className="text-zinc-400">
                Ask yourself: How? Who&apos;s paying for the AI compute? The hosting? Why is it free?
                If the business model doesn&apos;t make sense, your data might be the product.
              </p>
            </CalloutBox>
          </ContentSection>

          {/* Honeypot Education */}
          <ContentSection title="What is a Honeypot Scam?">
            <div className="space-y-6">
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                <h4 className="font-medium text-zinc-200 mb-2">Definition</h4>
                <p className="text-sm text-zinc-400">
                  A honeypot is a fake service designed to look legitimate while secretly harvesting your credentials,
                  API keys, or other sensitive data. They often look like helpful developer tools but are designed
                  to steal your access tokens and use them for malicious purposes.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-zinc-200 mb-3">Why Indie/Vibe Devs Are Targets</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-zinc-300"><strong>Ship fast mindset</strong></p>
                    <p className="text-xs text-zinc-500">Less time for security vetting</p>
                  </div>
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-zinc-300"><strong>Solo developers</strong></p>
                    <p className="text-xs text-zinc-500">No security team to review tools</p>
                  </div>
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-zinc-300"><strong>Valuable assets</strong></p>
                    <p className="text-xs text-zinc-500">API keys, cloud credentials, payment keys</p>
                  </div>
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-zinc-300"><strong>Active on social</strong></p>
                    <p className="text-xs text-zinc-500">Easy to find and target</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-zinc-200 mb-3">Common Honeypot Patterns</h4>
                <div className="space-y-2">
                  <HoneypotPattern text="&quot;Free tier&quot; tools that require your database URL" />
                  <HoneypotPattern text="AI wrappers asking for your OpenAI/Anthropic keys" />
                  <HoneypotPattern text="&quot;One-click deploy&quot; services wanting AWS credentials" />
                  <HoneypotPattern text="GitHub apps requesting write access to all repos" />
                  <HoneypotPattern text="&quot;Free hosting&quot; requiring your Stripe API key" />
                  <HoneypotPattern text="Chrome extensions asking for broad permissions" />
                </div>
              </div>

              <CalloutBox type="info" title="The Rise of AI-Powered Honeypots">
                <p className="text-sm">
                  AI makes it faster than ever to create convincing fake sites. Scammers can now generate professional
                  landing pages, documentation, and even chatbots that respond to your questions. The barrier to
                  creating sophisticated honeypots is lower than ever.
                </p>
              </CalloutBox>

              <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                <h4 className="font-medium text-indigo-400 mb-2">How {BRAND.name} Helps</h4>
                <ul className="space-y-1 text-sm text-zinc-400">
                  <li>&bull; Domain age verification (honeypots are usually new)</li>
                  <li>&bull; Red flag pattern detection for scam language</li>
                  <li>&bull; Credential harvesting keyword detection</li>
                  <li>&bull; AI-powered contextual analysis</li>
                  <li>&bull; Threat intelligence database checks</li>
                </ul>
              </div>
            </div>
          </ContentSection>

          {/* Quick Checklist */}
          <ContentSection title="Quick Pre-Connection Checklist">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="space-y-3">
                <QuickCheck text="Domain is at least 30 days old (or has clear explanation)" />
                <QuickCheck text="Privacy policy exists and makes sense" />
                <QuickCheck text="Contact information is real (not just a form)" />
                <QuickCheck text="Business model is clear" />
                <QuickCheck text="Permissions requested match stated functionality" />
                <QuickCheck text="No urgency tactics or pressure to sign up NOW" />
                <QuickCheck text="Can find real users or reviews online" />
              </div>
            </div>
          </ContentSection>
        </div>
      </div>
    </PageLayout>
  );
}

function CheckCard({ number, title, items }: { number: string; title: string; items: string[] }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 font-bold">
          {number}
        </div>
        <h3 className="font-semibold text-zinc-200">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
            <span className="text-zinc-600">&bull;</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RedFlag({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
      <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span className="text-zinc-300 text-sm">{text}</span>
    </div>
  );
}

function SafePractice({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
      <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
      <div>
        <h4 className="font-medium text-zinc-200">{title}</h4>
        <p className="text-sm text-zinc-400 mt-1">{description}</p>
      </div>
    </div>
  );
}

function QuickCheck({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 border-2 border-zinc-600 rounded flex items-center justify-center">
        <span className="text-transparent">&check;</span>
      </div>
      <span className="text-zinc-300 text-sm">{text}</span>
    </div>
  );
}

function HoneypotPattern({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
      <svg className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span className="text-zinc-300 text-sm" dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  );
}
