import { Request, Response } from 'express';
import { normalizeLibraryName } from '../research/normalizer.js';
import { detectEcosystem } from '../research/ecosystem.js';
import { fetchPackageRegistryData } from '../mcp/tools/package_registry.tool.js';
import { fetchGitHubResearch } from '../mcp/tools/github_research.tool.js';
import { logger } from '../utils/logger.js';

export async function getLibraryDetails(req: Request, res: Response): Promise<void> {
  try {
    const name = Array.isArray(req.params.name) ? req.params.name[0] : req.params.name;
    const norm = normalizeLibraryName(name || '');
    const eco = await detectEcosystem(norm.defaultPackage, norm.ecosystem);

    const { versionData, source } = await fetchPackageRegistryData(norm.canonical, eco.ecosystem, eco.packageName);

    res.json({
      name: norm.canonical,
      ecosystem: eco.ecosystem,
      packageName: eco.packageName,
      versionData,
      source
    });
  } catch (err: any) {
    logger.error('Error fetching library details', err);
    res.status(500).json({ error: 'Failed to retrieve library details.' });
  }
}

export async function getLibraryReleases(req: Request, res: Response): Promise<void> {
  try {
    const name = Array.isArray(req.params.name) ? req.params.name[0] : req.params.name;
    const norm = normalizeLibraryName(name || '');
    const eco = await detectEcosystem(norm.defaultPackage, norm.ecosystem);
    const { versionData } = await fetchPackageRegistryData(norm.canonical, eco.ecosystem, eco.packageName);

    const ghData = await fetchGitHubResearch(norm.canonical, versionData.repoUrl);

    res.json({
      library: norm.canonical,
      repoUrl: ghData.repoUrl,
      stars: ghData.stars,
      openIssues: ghData.openIssues,
      releases: ghData.releases,
      sources: ghData.sources
    });
  } catch (err: any) {
    logger.error('Error fetching library releases', err);
    res.status(500).json({ error: 'Failed to retrieve library releases.' });
  }
}
