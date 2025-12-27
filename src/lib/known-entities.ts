// Known legitimate domains that should get automatic LOW risk
// These are established companies/services that don't need detailed scam scanning

const KNOWN_LEGIT_DOMAINS = [
  // Big tech
  'google.com',
  'apple.com',
  'microsoft.com',
  'amazon.com',
  'meta.com',
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'x.com',
  'linkedin.com',

  // Hosting/Infrastructure
  'godaddy.com',
  'namecheap.com',
  'cloudflare.com',
  'vercel.com',
  'netlify.com',
  'railway.app',
  'heroku.com',
  'digitalocean.com',
  'linode.com',
  'vultr.com',
  'fly.io',
  'render.com',
  'supabase.com',
  'planetscale.com',
  'neon.tech',

  // Dev tools
  'github.com',
  'gitlab.com',
  'bitbucket.org',
  'linear.app',
  'notion.so',
  'figma.com',
  'slack.com',
  'discord.com',
  'atlassian.com',
  'jira.com',
  'trello.com',
  'asana.com',
  'monday.com',

  // Payments
  'stripe.com',
  'paypal.com',
  'square.com',
  'braintree.com',
  'paddle.com',
  'lemonsqueezy.com',
  'gumroad.com',

  // Auth providers
  'auth0.com',
  'clerk.com',
  'okta.com',

  // Analytics/Monitoring
  'sentry.io',
  'datadog.com',
  'newrelic.com',
  'logrocket.com',
  'mixpanel.com',
  'amplitude.com',
  'plausible.io',
  'posthog.com',

  // Email services
  'sendgrid.com',
  'mailgun.com',
  'postmark.com',
  'resend.com',
  'mailchimp.com',

  // CDN/Media
  'akamai.com',
  'fastly.com',
  'bunny.net',
  'imgix.com',
  'cloudinary.com',

  // User's ecosystem
  'undeadlist.com',
];

/**
 * Check if a domain is a known legitimate service
 */
export function isKnownLegitDomain(domain: string): boolean {
  const normalized = domain.toLowerCase().replace(/^www\./, '');
  return KNOWN_LEGIT_DOMAINS.some(
    (d) => normalized === d || normalized.endsWith('.' + d)
  );
}

/**
 * Get info about a known entity for display
 */
export function getKnownEntityInfo(
  domain: string
): { skipDetailedScan: boolean; note: string } | null {
  if (isKnownLegitDomain(domain)) {
    return {
      skipDetailedScan: true,
      note: 'Recognized established service',
    };
  }
  return null;
}

/**
 * Get the category of a known entity (for display purposes)
 */
export function getKnownEntityCategory(domain: string): string | null {
  const normalized = domain.toLowerCase().replace(/^www\./, '');

  const categories: Record<string, string[]> = {
    'Big Tech': ['google.com', 'apple.com', 'microsoft.com', 'amazon.com', 'meta.com', 'facebook.com'],
    'Hosting Provider': ['godaddy.com', 'namecheap.com', 'cloudflare.com', 'vercel.com', 'netlify.com', 'heroku.com', 'digitalocean.com'],
    'Developer Tools': ['github.com', 'gitlab.com', 'bitbucket.org', 'linear.app', 'notion.so', 'figma.com'],
    'Payment Processor': ['stripe.com', 'paypal.com', 'square.com', 'paddle.com'],
    'Communication': ['slack.com', 'discord.com', 'twitter.com', 'x.com', 'linkedin.com'],
  };

  for (const [category, domains] of Object.entries(categories)) {
    if (domains.some((d) => normalized === d || normalized.endsWith('.' + d))) {
      return category;
    }
  }

  return 'Established Service';
}
