// SSRF protection - block internal/private IPs and dangerous protocols

const BLOCKED_IP_RANGES = [
  /^127\./,                          // Loopback
  /^10\./,                           // Private Class A
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // Private Class B
  /^192\.168\./,                     // Private Class C
  /^169\.254\./,                     // Link-local
  /^0\./,                            // Current network
  /^::1$/,                           // IPv6 loopback
  /^fc00:/i,                         // IPv6 private
  /^fe80:/i,                         // IPv6 link-local
];

const BLOCKED_HOSTNAMES = [
  'localhost',
  'localhost.localdomain',
  'metadata.google.internal',        // GCP metadata
  '169.254.169.254',                 // AWS/Azure metadata
  'metadata.azure.internal',
];

const ALLOWED_PROTOCOLS = ['http:', 'https:'];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  normalizedUrl?: string;
}

export function validateUrl(input: string): ValidationResult {
  try {
    // Ensure URL has protocol
    let urlString = input.trim();
    if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
      urlString = `https://${urlString}`;
    }

    const url = new URL(urlString);

    // Block non-HTTP protocols
    if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
    }

    // Block internal hostnames
    const hostname = url.hostname.toLowerCase();
    if (BLOCKED_HOSTNAMES.includes(hostname)) {
      return { isValid: false, error: 'Internal URLs are not allowed' };
    }

    // Block private IP ranges
    for (const pattern of BLOCKED_IP_RANGES) {
      if (pattern.test(hostname)) {
        return { isValid: false, error: 'Private IP addresses are not allowed' };
      }
    }

    // Block URLs with credentials
    if (url.username || url.password) {
      return { isValid: false, error: 'URLs with credentials are not allowed' };
    }

    return { isValid: true, normalizedUrl: url.origin + url.pathname.replace(/\/$/, '') };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}
