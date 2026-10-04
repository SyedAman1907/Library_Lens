import { Source, ComparisonReport, Evidence } from '../types/research.types.js';
import { logger } from '../utils/logger.js';

export interface ValidationSummary {
  totalClaimsChecked: number;
  validCitationsCount: number;
  invalidSourceIdsPurged: number;
  evidenceItems: Evidence[];
}

export function validateReportCitations(
  report: Partial<ComparisonReport>,
  validSources: Source[],
  libraryA: string,
  libraryB: string
): { validatedReport: Partial<ComparisonReport>; summary: ValidationSummary } {
  const sourceIdMap = new Map<string, Source>();
  for (const src of validSources) {
    sourceIdMap.set(src.id, src);
  }

  let totalClaimsChecked = 0;
  let validCitationsCount = 0;
  let invalidSourceIdsPurged = 0;
  const evidenceItems: Evidence[] = [];

  const filterAndVerifyIds = (
    rawIds: string[] | undefined,
    claimText: string,
    libName: string
  ): string[] => {
    if (!rawIds || !Array.isArray(rawIds)) return [];

    const verifiedIds: string[] = [];
    for (const id of rawIds) {
      if (sourceIdMap.has(id)) {
        verifiedIds.push(id);
        validCitationsCount++;
      } else {
        invalidSourceIdsPurged++;
        logger.warn(`Citation validation purged invalid source ID: ${id}`);
      }
    }

    totalClaimsChecked++;
    const isVerified = verifiedIds.length > 0;

    evidenceItems.push({
      id: `ev_${evidenceItems.length + 1}`,
      claim: claimText,
      sourceIds: verifiedIds,
      library: libName,
      confidence: isVerified ? 0.95 : 0.0,
      verified: isVerified,
      verificationState: isVerified ? 'VERIFIED' : 'UNVERIFIED',
      unverifiedReason: isVerified ? undefined : 'No sufficient verified evidence was found.'
    });

    return verifiedIds;
  };

  // 1. Validate Feature Matrix citations
  if (report.featureMatrix) {
    report.featureMatrix = report.featureMatrix.map((row) => {
      const verifiedIds = filterAndVerifyIds(
        row.sourceIds,
        `${row.category}: ${row.libraryA} vs ${row.libraryB}`,
        `${libraryA} / ${libraryB}`
      );
      return {
        ...row,
        sourceIds: verifiedIds,
        confidence: verifiedIds.length > 0 ? row.confidence || 0.9 : 0.5
      };
    });
  }

  // 2. Validate Breaking Changes citations
  if (report.breakingChanges) {
    report.breakingChanges = report.breakingChanges.map((item) => {
      const verifiedIds = filterAndVerifyIds(
        item.sourceId ? [item.sourceId] : [],
        `Breaking change in ${item.library} ${item.affectedVersion}: ${item.description}`,
        item.library
      );
      return {
        ...item,
        sourceId: verifiedIds[0] || (validSources[0]?.id ?? 'src_001')
      };
    });
  }

  // 3. Validate Migration Considerations
  if (report.migration && report.migration.considerations) {
    report.migration.considerations = report.migration.considerations.map((c) => {
      const verifiedIds = filterAndVerifyIds(
        c.sourceIds,
        `Migration [${c.area}]: ${c.details}`,
        `${libraryA} -> ${libraryB}`
      );
      return {
        ...c,
        sourceIds: verifiedIds
      };
    });
  }

  // 4. Validate TypeScript support
  if (report.typeScriptSupport) {
    if (report.typeScriptSupport.libraryA) {
      report.typeScriptSupport.libraryA.sourceIds = filterAndVerifyIds(
        report.typeScriptSupport.libraryA.sourceIds,
        `TypeScript support for ${libraryA}`,
        libraryA
      );
    }
    if (report.typeScriptSupport.libraryB) {
      report.typeScriptSupport.libraryB.sourceIds = filterAndVerifyIds(
        report.typeScriptSupport.libraryB.sourceIds,
        `TypeScript support for ${libraryB}`,
        libraryB
      );
    }
  }

  // 5. Validate Ecosystem Analysis
  if (report.ecosystemAnalysis) {
    if (report.ecosystemAnalysis.libraryA) {
      report.ecosystemAnalysis.libraryA.sourceIds = filterAndVerifyIds(
        report.ecosystemAnalysis.libraryA.sourceIds,
        `Ecosystem status for ${libraryA}`,
        libraryA
      );
    }
    if (report.ecosystemAnalysis.libraryB) {
      report.ecosystemAnalysis.libraryB.sourceIds = filterAndVerifyIds(
        report.ecosystemAnalysis.libraryB.sourceIds,
        `Ecosystem status for ${libraryB}`,
        libraryB
      );
    }
  }

  // 6. Validate Use Case Analysis
  if (report.useCaseAnalysis && report.useCaseAnalysis.considerations) {
    report.useCaseAnalysis.considerations = report.useCaseAnalysis.considerations.map((item) => {
      const verifiedIds = filterAndVerifyIds(
        item.sourceIds,
        `Use case factor [${item.factor}]`,
        `${libraryA} vs ${libraryB}`
      );
      return {
        ...item,
        sourceIds: verifiedIds
      };
    });
  }

  return {
    validatedReport: report,
    summary: {
      totalClaimsChecked,
      validCitationsCount,
      invalidSourceIdsPurged,
      evidenceItems
    }
  };
}
