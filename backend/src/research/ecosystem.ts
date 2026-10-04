import axios from 'axios';
import { logger } from '../utils/logger.js';

export interface EcosystemDetectionResult {
  ecosystem: 'npm' | 'pypi' | 'crates' | 'maven' | 'go' | 'packagist' | 'rubygems' | 'unknown';
  packageName: string;
  isConfirmed: boolean;
  registryUrl?: string;
}

export async function detectEcosystem(libraryName: string, knownEcosystem?: string): Promise<EcosystemDetectionResult> {
  const cleanName = libraryName.trim().toLowerCase();

  if (knownEcosystem && knownEcosystem !== 'unknown') {
    return {
      ecosystem: knownEcosystem as any,
      packageName: cleanName,
      isConfirmed: true,
      registryUrl: getRegistryBaseUrl(knownEcosystem, cleanName)
    };
  }

  // 1. Probe npm registry
  try {
    const npmRes = await axios.get(`https://registry.npmjs.org/${encodeURIComponent(cleanName)}`, {
      timeout: 2500,
      headers: { 'Accept': 'application/vnd.npm.install-v1+json' }
    });
    if (npmRes.status === 200 && npmRes.data?.name) {
      return {
        ecosystem: 'npm',
        packageName: npmRes.data.name,
        isConfirmed: true,
        registryUrl: `https://www.npmjs.com/package/${encodeURIComponent(npmRes.data.name)}`
      };
    }
  } catch {
    // Continue to next probe
  }

  // 2. Probe PyPI registry
  try {
    const pypiRes = await axios.get(`https://pypi.org/pypi/${encodeURIComponent(cleanName)}/json`, {
      timeout: 2500
    });
    if (pypiRes.status === 200 && pypiRes.data?.info) {
      return {
        ecosystem: 'pypi',
        packageName: pypiRes.data.info.name,
        isConfirmed: true,
        registryUrl: `https://pypi.org/project/${encodeURIComponent(pypiRes.data.info.name)}/`
      };
    }
  } catch {
    // Continue to next probe
  }

  // 3. Probe crates.io
  try {
    const cratesRes = await axios.get(`https://crates.io/api/v1/crates/${encodeURIComponent(cleanName)}`, {
      timeout: 2500,
      headers: { 'User-Agent': 'LibraryLensAI/1.0 (research@librarylens.ai)' }
    });
    if (cratesRes.status === 200 && cratesRes.data?.crate) {
      return {
        ecosystem: 'crates',
        packageName: cratesRes.data.crate.name,
        isConfirmed: true,
        registryUrl: `https://crates.io/crates/${encodeURIComponent(cratesRes.data.crate.name)}`
      };
    }
  } catch {
    // Continue
  }

  // Fallback: Default to npm for JavaScript/TypeScript, but marked as unconfirmed
  return {
    ecosystem: 'npm',
    packageName: cleanName,
    isConfirmed: false
  };
}

function getRegistryBaseUrl(ecosystem: string, pkg: string): string {
  switch (ecosystem) {
    case 'npm': return `https://www.npmjs.com/package/${encodeURIComponent(pkg)}`;
    case 'pypi': return `https://pypi.org/project/${encodeURIComponent(pkg)}/`;
    case 'crates': return `https://crates.io/crates/${encodeURIComponent(pkg)}`;
    case 'maven': return `https://search.maven.org/artifact/${pkg.replace(':', '/')}`;
    default: return '';
  }
}
