import { describe, it, expect } from 'vitest';
import { executeAutonomousResearch, refreshResearch, getResearchById } from '../research/orchestrator.js';
import { challengeClaim } from '../citations/challenger.js';

describe('End-to-End Hackathon Workflow Verification', () => {
  it('executes full autonomous research pipeline for hackathon question', async () => {
    const question = 'Should I use React or Vue for a production dashboard?';

    // Execute real research orchestrator pipeline
    const record = await executeAutonomousResearch({
      question,
      options: {
        includeNews: true,
        includeVisuals: true,
        forceRefresh: true
      }
    });

    // 1. Question accepted & analyzed
    expect(record.id).toBeDefined();
    expect(record.question).toBe(question);
    expect(record.questionAnalysis).toBeDefined();
    expect(record.questionAnalysis?.identifiedLibraries).toContain('React');
    expect(record.questionAnalysis?.identifiedLibraries).toContain('Vue');

    // 2. Research plan generated (10 high level steps)
    expect(record.researchPlan).toBeDefined();
    expect(record.researchPlan?.actions?.length).toBe(10);
    expect(record.researchPlan?.tasks.length).toBeGreaterThan(0);

    // 3. Package & GitHub metadata retrieved
    expect(record.report?.versionData?.libraryA?.currentVersion).toBeDefined();
    expect(record.report?.versionData?.libraryB?.currentVersion).toBeDefined();

    // 4. Evidence collected, deduplicated & claims validated
    expect(record.sources.length).toBeGreaterThan(0);
    expect(record.evidence.length).toBeGreaterThan(0);
    expect(record.report?.summary).toBeDefined();

    // 5. Breaking change radar & migration assistant present
    expect(record.report?.breakingChanges).toBeDefined();
    expect(record.report?.migration).toBeDefined();

    // 6. Citations attached and valid: verified claims must have sources, unverified must have reason
    const verifiedClaims = record.evidence.filter((e) => e.verified);
    expect(verifiedClaims.length).toBeGreaterThan(0);
    for (const ev of verifiedClaims) {
      expect(ev.sourceIds.length).toBeGreaterThan(0);
      expect(ev.verificationState).toBe('VERIFIED');
    }

    const unverifiedClaims = record.evidence.filter((e) => !e.verified);
    for (const ev of unverifiedClaims) {
      expect(ev.verificationState).toBe('UNVERIFIED');
      expect(ev.unverifiedReason).toBe('No sufficient verified evidence was found.');
    }

    // 7. Signature "Challenge This Claim" feature
    const firstVerifiedClaimId = verifiedClaims[0].id;
    const challengeResult = await challengeClaim(record, firstVerifiedClaimId);
    expect(challengeResult.claimId).toBe(firstVerifiedClaimId);
    expect(['VERIFIED', 'PARTIALLY VERIFIED', 'UNVERIFIED', 'CONFLICTING EVIDENCE']).toContain(
      challengeResult.verificationState
    );

    // 8. Replay events logged
    expect(record.replayEvents).toBeDefined();
    expect(record.replayEvents!.length).toBeGreaterThan(0);

    // 9. Report versioning on refresh
    const refreshed = await refreshResearch(record.id);
    expect(refreshed.currentVersionNumber).toBe(2);
    expect(refreshed.versions?.length).toBeGreaterThan(0);
  }, 120000); // Allow sufficient timeout for live multi-source research
});
