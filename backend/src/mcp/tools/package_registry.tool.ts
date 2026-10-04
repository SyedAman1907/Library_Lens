import axios from 'axios';
import { logger } from '../../utils/logger.js';
import { Source, LibraryVersionData } from '../../types/research.types.js';

export async function fetchPackageRegistryData(
  library: string,
  ecosystem: string,
  packageName: string
): Promise<{ versionData: LibraryVersionData; source: Source | null }> {
  const retrievedAt = new Date().toISOString();
  logger.info(`Fetching package metadata for ${library} (${ecosystem}:${packageName})`);

  if (ecosystem === 'npm') {
    try {
      const [metaRes, downloadsRes] = await Promise.allSettled([
        axios.get(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`, {
          timeout: 5000,
          headers: { 'Accept': 'application/json' }
        }),
        axios.get(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(packageName)}`, {
          timeout: 3000
        })
      ]);

      if (metaRes.status === 'fulfilled' && metaRes.value.status === 200) {
        const data = metaRes.value.data;
        const distTags = data['dist-tags'] || {};
        const latestVersion = distTags.latest || Object.keys(data.versions || {}).pop() || 'Unknown';
        const versionObj = data.versions?.[latestVersion] || {};
        const timeObj = data.time || {};
        const releaseDate = timeObj[latestVersion] || timeObj.modified || null;

        // Parse repository URL cleanly
        let repoUrl = '';
        if (data.repository) {
          if (typeof data.repository === 'string') {
            repoUrl = data.repository;
          } else if (data.repository.url) {
            repoUrl = data.repository.url;
          }
        }
        repoUrl = repoUrl
          .replace(/^git\+/, '')
          .replace(/\.git$/, '')
          .replace(/^git:\/\//, 'https://');

        const homepage = data.homepage || versionObj.homepage || '';
        const license = versionObj.license || data.license || 'Open Source';
        const description = data.description || versionObj.description || '';

        let downloadsWeekly: number | undefined;
        if (downloadsRes.status === 'fulfilled' && downloadsRes.value.status === 200) {
          downloadsWeekly = downloadsRes.value.data?.downloads;
        }

        const packageUrl = `https://www.npmjs.com/package/${encodeURIComponent(packageName)}`;
        const sourceId = `src_pkg_${library.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

        const source: Source = {
          id: sourceId,
          title: `${packageName} on npm Registry`,
          url: packageUrl,
          sourceType: 'npm',
          tier: 2,
          publisher: 'npm',
          library,
          claim: `${library} current latest stable version is ${latestVersion} on npm.`,
          snippet: `Package: ${packageName}. Latest version: ${latestVersion}. License: ${license}. Weekly downloads: ${downloadsWeekly ? downloadsWeekly.toLocaleString() : 'N/A'}. ${description}`,
          publishedAt: releaseDate,
          retrievedAt,
          confidence: 0.99
        };

        const versionData: LibraryVersionData = {
          name: library,
          ecosystem: 'npm',
          currentVersion: latestVersion,
          releaseDate,
          packageUrl,
          repoUrl,
          homepageUrl: homepage,
          documentationUrl: homepage || repoUrl,
          sourceIds: [sourceId],
          description,
          license,
          downloadsWeekly
        };

        return { versionData, source };
      }
    } catch (err: any) {
      logger.warn(`npm fetch failed for ${packageName}: ${err.message}`);
    }
  }

  // PyPI
  if (ecosystem === 'pypi') {
    try {
      const pypiRes = await axios.get(`https://pypi.org/pypi/${encodeURIComponent(packageName)}/json`, {
        timeout: 5000
      });

      if (pypiRes.status === 200 && pypiRes.data?.info) {
        const info = pypiRes.data.info;
        const latestVersion = info.version || 'Unknown';
        const projectUrls = info.project_urls || {};
        const releaseDate = pypiRes.data.releases?.[latestVersion]?.[0]?.upload_time_iso_8601 || null;

        const packageUrl = info.package_url || `https://pypi.org/project/${encodeURIComponent(packageName)}/`;
        const repoUrl = projectUrls.Source || projectUrls.Repository || projectUrls['Source Code'] || info.home_page || '';
        const homepage = info.home_page || projectUrls.Homepage || '';
        const docUrl = projectUrls.Documentation || homepage;
        const license = info.license || 'Open Source';
        const description = info.summary || '';

        const sourceId = `src_pkg_${library.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

        const source: Source = {
          id: sourceId,
          title: `${packageName} on PyPI Registry`,
          url: packageUrl,
          sourceType: 'pypi',
          tier: 2,
          publisher: 'PyPI',
          library,
          claim: `${library} current latest stable version is ${latestVersion} on PyPI.`,
          snippet: `Package: ${packageName}. Latest version: ${latestVersion}. License: ${license}. Summary: ${description}`,
          publishedAt: releaseDate,
          retrievedAt,
          confidence: 0.99
        };

        const versionData: LibraryVersionData = {
          name: library,
          ecosystem: 'pypi',
          currentVersion: latestVersion,
          releaseDate,
          packageUrl,
          repoUrl,
          homepageUrl: homepage,
          documentationUrl: docUrl,
          sourceIds: [sourceId],
          description,
          license
        };

        return { versionData, source };
      }
    } catch (err: any) {
      logger.warn(`PyPI fetch failed for ${packageName}: ${err.message}`);
    }
  }

  // crates.io
  if (ecosystem === 'crates') {
    try {
      const cratesRes = await axios.get(`https://crates.io/api/v1/crates/${encodeURIComponent(packageName)}`, {
        timeout: 5000,
        headers: { 'User-Agent': 'LibraryLensAI/1.0 (research@librarylens.ai)' }
      });

      if (cratesRes.status === 200 && cratesRes.data?.crate) {
        const crt = cratesRes.data.crate;
        const latestVersion = crt.max_stable_version || crt.max_version || 'Unknown';
        const releaseDate = crt.updated_at || crt.created_at || null;
        const packageUrl = `https://crates.io/crates/${encodeURIComponent(packageName)}`;
        const repoUrl = crt.repository || '';
        const docUrl = crt.documentation || '';
        const homepage = crt.homepage || '';
        const description = crt.description || '';

        const sourceId = `src_pkg_${library.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

        const source: Source = {
          id: sourceId,
          title: `${packageName} on crates.io Registry`,
          url: packageUrl,
          sourceType: 'crates',
          tier: 2,
          publisher: 'crates.io',
          library,
          claim: `${library} current latest stable version is ${latestVersion} on crates.io.`,
          snippet: `Crate: ${packageName}. Latest version: ${latestVersion}. Total downloads: ${crt.downloads?.toLocaleString() || 'N/A'}. ${description}`,
          publishedAt: releaseDate,
          retrievedAt,
          confidence: 0.99
        };

        const versionData: LibraryVersionData = {
          name: library,
          ecosystem: 'crates',
          currentVersion: latestVersion,
          releaseDate,
          packageUrl,
          repoUrl,
          homepageUrl: homepage,
          documentationUrl: docUrl,
          sourceIds: [sourceId],
          description,
          license: 'Open Source',
          downloadsWeekly: crt.recent_downloads
        };

        return { versionData, source };
      }
    } catch (err: any) {
      logger.warn(`crates.io fetch failed for ${packageName}: ${err.message}`);
    }
  }

  // Maven Central
  if (ecosystem === 'maven') {
    try {
      const mavenRes = await axios.get(
        `https://search.maven.org/solrsearch/select?q=${encodeURIComponent(packageName)}&rows=1&wt=json`,
        { timeout: 5000 }
      );
      if (mavenRes.status === 200 && mavenRes.data?.response?.docs?.length > 0) {
        const doc = mavenRes.data.response.docs[0];
        const latestVersion = doc.latestVersion || doc.v || 'Unknown';
        const releaseDate = doc.timestamp ? new Date(doc.timestamp).toISOString() : null;
        const packageUrl = `https://central.sonatype.com/artifact/${doc.g}/${doc.a}`;
        const sourceId = `src_pkg_${library.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

        const source: Source = {
          id: sourceId,
          title: `${doc.g}:${doc.a} on Maven Central`,
          url: packageUrl,
          sourceType: 'maven',
          tier: 2,
          publisher: 'Maven Central',
          library,
          claim: `${library} current latest stable version is ${latestVersion} on Maven Central.`,
          snippet: `Artifact: ${doc.g}:${doc.a}. Latest version: ${latestVersion}. Repository: Maven Central.`,
          publishedAt: releaseDate,
          retrievedAt,
          confidence: 0.99
        };

        const versionData: LibraryVersionData = {
          name: library,
          ecosystem: 'maven',
          currentVersion: latestVersion,
          releaseDate,
          packageUrl,
          sourceIds: [sourceId],
          description: `${doc.g}:${doc.a} distributed on Maven Central`
        };

        return { versionData, source };
      }
    } catch (err: any) {
      logger.warn(`Maven fetch failed for ${packageName}: ${err.message}`);
    }
  }

  // NuGet
  if (ecosystem === 'nuget') {
    try {
      const nugetRes = await axios.get(
        `https://azuresearch-usnc.nuget.org/query?q=${encodeURIComponent(packageName)}&take=1`,
        { timeout: 5000 }
      );
      if (nugetRes.status === 200 && nugetRes.data?.data?.length > 0) {
        const item = nugetRes.data.data[0];
        const latestVersion = item.version || 'Unknown';
        const packageUrl = `https://www.nuget.org/packages/${encodeURIComponent(item.id || packageName)}`;
        const sourceId = `src_pkg_${library.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

        const source: Source = {
          id: sourceId,
          title: `${item.title || item.id} on NuGet Gallery`,
          url: packageUrl,
          sourceType: 'web',
          tier: 2,
          publisher: 'NuGet Gallery',
          library,
          claim: `${library} current latest stable version is ${latestVersion} on NuGet.`,
          snippet: `Package: ${item.id}. Latest version: ${latestVersion}. Downloads: ${item.totalDownloads?.toLocaleString() || 'N/A'}. ${item.description || ''}`,
          publishedAt: null,
          retrievedAt,
          confidence: 0.99
        };

        const versionData: LibraryVersionData = {
          name: library,
          ecosystem: 'nuget',
          currentVersion: latestVersion,
          releaseDate: null,
          packageUrl,
          repoUrl: item.projectUrl,
          sourceIds: [sourceId],
          description: item.description,
          downloadsWeekly: item.totalDownloads ? Math.floor(item.totalDownloads / 52) : undefined
        };

        return { versionData, source };
      }
    } catch (err: any) {
      logger.warn(`NuGet fetch failed for ${packageName}: ${err.message}`);
    }
  }

  // Fallback version data if registry fetch didn't return
  return {
    versionData: {
      name: library,
      ecosystem,
      currentVersion: 'Unknown',
      releaseDate: null,
      packageUrl: `https://www.google.com/search?q=${encodeURIComponent(library + ' package')}`,
      sourceIds: []
    },
    source: null
  };
}
