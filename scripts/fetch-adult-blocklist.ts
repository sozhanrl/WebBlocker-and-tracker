import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCES = [
  {
    name: 'StevenBlack/hosts (porn-only)',
    url: 'https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/porn-only/hosts'
  }
];

const IGNORED_HOSTS = new Set([
  'localhost',
  'localhost.localdomain',
  'local',
  'broadcasthost',
  '0.0.0.0',
  '127.0.0.1',
  '::1',
  'ip6-localhost',
  'ip6-loopback',
  'fe80::1%lo0'
]);

function normalizeDomain(raw: string): string | null {
  let domain = raw.trim().toLowerCase();

  // Strip comments
  if (domain.includes('#')) {
    domain = domain.split('#')[0].trim();
  }
  if (!domain || domain.startsWith('!') || domain.startsWith(';')) {
    return null;
  }

  // Strip IP prefix (e.g., 0.0.0.0 or 127.0.0.1)
  const parts = domain.split(/\s+/);
  if (parts.length >= 2 && (parts[0] === '0.0.0.0' || parts[0] === '127.0.0.1')) {
    domain = parts[1];
  } else if (parts.length >= 1) {
    domain = parts[0];
  }

  // Strip protocol
  domain = domain.replace(/^(https?:\/\/)/, '');
  // Strip paths, query params, trailing slashes
  domain = domain.split('/')[0];
  domain = domain.split('?')[0];
  domain = domain.split(':')[0]; // strip port

  // Strip leading www.
  if (domain.startsWith('www.')) {
    domain = domain.substring(4);
  }

  domain = domain.trim();

  if (
    !domain ||
    domain.length < 4 ||
    !domain.includes('.') ||
    IGNORED_HOSTS.has(domain) ||
    !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain)
  ) {
    return null;
  }

  return domain;
}

async function fetchBlocklist(source: { name: string; url: string }): Promise<string[]> {
  console.log(`Fetching: ${source.name} from ${source.url}...`);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout
    const res = await fetch(source.url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[WARN] Failed to fetch ${source.name}: HTTP ${res.status}`);
      return [];
    }

    const text = await res.text();
    const lines = text.split(/\r?\n/);
    const validDomains: string[] = [];

    for (const line of lines) {
      const normalized = normalizeDomain(line);
      if (normalized) {
        validDomains.push(normalized);
      }
    }

    console.log(`✓ ${source.name}: Parsed ${validDomains.length} valid domains.`);
    return validDomains;
  } catch (err: any) {
    console.warn(`[WARN] Error fetching ${source.name}:`, err.message);
    return [];
  }
}

async function main() {
  console.log('--- Fetching & Building Curated Adult Content Blocklist ---');
  const allDomains = new Set<string>();

  for (const source of SOURCES) {
    const domains = await fetchBlocklist(source);
    for (const d of domains) {
      allDomains.add(d);
    }
  }

  if (allDomains.size === 0) {
    console.error('[ERROR] No domains were fetched from remote sources. Aborting write.');
    process.exit(1);
  }

  const sortedDomains = Array.from(allDomains).sort();
  const dateStr = new Date().toISOString().split('T')[0];

  const targetFile = path.resolve(__dirname, '../src/lib/adultContentList.ts');

  const fileContent = `/**
 * Curated Adult Content Blocklist
 * Generated automatically by scripts/fetch-adult-blocklist.ts
 *
 * Sources:
 *  - StevenBlack/hosts (porn extension): https://github.com/StevenBlack/hosts
 *
 * Last Updated: ${dateStr}
 * Total Unique Domains: ${sortedDomains.length}
 *
 * Note: Subdomains (e.g., www.domain.com, m.domain.com) are automatically matched
 * and sinkholed on-device by OpenFocusVpnService.
 */

export const ADULT_CONTENT_DOMAINS: string[] = ${JSON.stringify(sortedDomains, null, 2)};

export const ADULT_CONTENT_BLOCKLIST_METADATA = {
  sources: [
    'StevenBlack/hosts (porn-only extension)'
  ],
  lastUpdated: '${dateStr}',
  totalDomains: ${sortedDomains.length}
};
`;

  fs.writeFileSync(targetFile, fileContent, 'utf-8');
  console.log(`\n🎉 Successfully generated: ${targetFile}`);
  console.log(`📊 Total curated adult domains: ${sortedDomains.length}`);
}

main().catch(err => {
  console.error('[FATAL] Script failed:', err);
  process.exit(1);
});
