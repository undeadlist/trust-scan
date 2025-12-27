import { SSLData } from '../types';
import * as https from 'https';
import * as tls from 'tls';

export async function checkSSL(domain: string): Promise<SSLData> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({
        valid: false,
        issuer: null,
        validFrom: null,
        validTo: null,
        daysRemaining: null,
        protocol: null,
        error: 'Connection timeout',
      });
    }, 10000);

    try {
      const options = {
        host: domain,
        port: 443,
        method: 'GET',
        rejectUnauthorized: false, // We want to inspect even invalid certs
        agent: new https.Agent({
          maxCachedSessions: 0,
        }),
      };

      const req = https.request(options, (res) => {
        clearTimeout(timeout);

        const socket = res.socket as tls.TLSSocket;
        const cert = socket.getPeerCertificate();

        if (!cert || Object.keys(cert).length === 0) {
          resolve({
            valid: false,
            issuer: null,
            validFrom: null,
            validTo: null,
            daysRemaining: null,
            protocol: null,
            error: 'No certificate found',
          });
          return;
        }

        const validFrom = cert.valid_from ? new Date(cert.valid_from) : null;
        const validTo = cert.valid_to ? new Date(cert.valid_to) : null;
        const now = new Date();

        let daysRemaining: number | null = null;
        let valid = false;

        if (validFrom && validTo) {
          valid = now >= validFrom && now <= validTo;
          daysRemaining = Math.floor(
            (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
        }

        // Check if certificate is authorized (trusted chain)
        const authorized = socket.authorized;

        resolve({
          valid: valid && authorized,
          issuer: cert.issuer?.O || cert.issuer?.CN || null,
          validFrom: validFrom?.toISOString() || null,
          validTo: validTo?.toISOString() || null,
          daysRemaining,
          protocol: socket.getProtocol() || null,
        });

        req.destroy();
      });

      req.on('error', (error) => {
        clearTimeout(timeout);
        resolve({
          valid: false,
          issuer: null,
          validFrom: null,
          validTo: null,
          daysRemaining: null,
          protocol: null,
          error: error.message,
        });
      });

      req.end();
    } catch (error) {
      clearTimeout(timeout);
      resolve({
        valid: false,
        issuer: null,
        validFrom: null,
        validTo: null,
        daysRemaining: null,
        protocol: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}
