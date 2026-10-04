import { Request, Response } from 'express';
import {
  runResearch,
  getResearchById,
  subscribeToProgress,
  listResearches,
  deleteResearchById,
  getResearchEvidence,
  getResearchClaims,
  getResearchVersions,
  replayResearchSession
} from '../research/orchestrator.js';
import { challengeClaim } from '../citations/challenger.js';
import { inMemoryResearchStore, isDbConnected } from '../models/db.js';
import { ResearchModel } from '../models/research.schema.js';
import { logger } from '../utils/logger.js';
import { normalizeLibraryName } from '../research/normalizer.js';

function getParamId(req: Request): string {
  const id = req.params.id;
  if (Array.isArray(id)) return id[0] || '';
  return id || '';
}

export async function startResearch(req: Request, res: Response): Promise<void> {
  try {
    const { question, libraryA, libraryB, useCase, options } = req.body;

    if (!question && (!libraryA || !libraryB)) {
      res.status(400).json({ error: 'Either a research question or both libraryA and libraryB are required.' });
      return;
    }

    logger.info(`Starting research: ${question || `${libraryA} vs ${libraryB}`}`);
    const record = await runResearch({
      question,
      libraryA,
      libraryB,
      useCase,
      options
    });

    res.json(record);
  } catch (err: any) {
    logger.error('Error starting research', err);
    res.status(500).json({
      error: 'An error occurred during research. Please verify your connection and parameters.',
      details: err.message
    });
  }
}

export async function getResearch(req: Request, res: Response): Promise<void> {
  try {
    const id = getParamId(req);
    const record = await getResearchById(id);

    if (!record) {
      res.status(404).json({ error: `Research report with ID '${id}' not found.` });
      return;
    }

    res.json(record);
  } catch (err: any) {
    logger.error('Error getting research', err);
    res.status(500).json({ error: 'Failed to retrieve research record.' });
  }
}

export async function refreshResearch(req: Request, res: Response): Promise<void> {
  try {
    const id = getParamId(req);
    const existing = await getResearchById(id);

    if (!existing) {
      res.status(404).json({ error: `Cannot refresh: Research with ID '${id}' not found.` });
      return;
    }

    logger.info(`Refreshing research ${id} for ${existing.libraryA} vs ${existing.libraryB}`);
    const freshRecord = await runResearch(
      {
        question: existing.question,
        libraryA: existing.libraryA,
        libraryB: existing.libraryB,
        useCase: existing.useCase,
        options: { ...existing.options, forceRefresh: true }
      },
      '',
      '',
      undefined,
      existing.id
    );

    res.json(freshRecord);
  } catch (err: any) {
    logger.error('Error refreshing research', err);
    res.status(500).json({ error: 'Failed to refresh research.' });
  }
}

export async function getResearchSources(req: Request, res: Response): Promise<void> {
  try {
    const id = getParamId(req);
    const record = await getResearchById(id);

    if (!record) {
      res.status(404).json({ error: 'Research not found' });
      return;
    }

    res.json({
      researchId: id,
      total: record.sources.length,
      sources: record.sources
    });
  } catch (err: any) {
    logger.error('Error retrieving sources', err);
    res.status(500).json({ error: 'Failed to retrieve sources.' });
  }
}

export async function getResearchEvidenceHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = getParamId(req);
    const evidence = await getResearchEvidence(id);
    res.json({ researchId: id, total: evidence.length, evidence });
  } catch (err: any) {
    logger.error('Error retrieving evidence', err);
    res.status(500).json({ error: 'Failed to retrieve evidence.' });
  }
}

export async function getResearchClaimsHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = getParamId(req);
    const claims = await getResearchClaims(id);
    res.json({ researchId: id, total: claims.length, claims });
  } catch (err: any) {
    logger.error('Error retrieving claims', err);
    res.status(500).json({ error: 'Failed to retrieve claims.' });
  }
}

export async function challengeClaimHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = getParamId(req);
    const rawClaimId = req.params.claimId;
    const claimId = Array.isArray(rawClaimId) ? (rawClaimId[0] || '') : (rawClaimId || '');
    const { claimText } = req.body;

    const record = await getResearchById(id);
    if (!record) {
      res.status(404).json({ error: `Research record '${id}' not found.` });
      return;
    }

    const result = await challengeClaim(record, claimId, claimText);

    // Save updated challenges on record
    if (isDbConnected()) {
      await ResearchModel.updateOne(
        { id },
        { $set: { challenges: record.challenges } }
      ).catch(() => {});
    }
    inMemoryResearchStore.set(record.id, record);

    res.json(result);
  } catch (err: any) {
    logger.error('Error challenging claim', err);
    res.status(500).json({ error: 'Failed to challenge claim.', details: err.message });
  }
}

export async function getResearchVersionsHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = getParamId(req);
    const versions = await getResearchVersions(id);
    res.json({ researchId: id, total: versions.length, versions });
  } catch (err: any) {
    logger.error('Error retrieving versions', err);
    res.status(500).json({ error: 'Failed to retrieve report versions.' });
  }
}

export async function replayResearchHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = getParamId(req);
    const replayData = await replayResearchSession(id);
    if (!replayData) {
      res.status(404).json({ error: `Research record '${id}' not found for replay.` });
      return;
    }
    res.json(replayData);
  } catch (err: any) {
    logger.error('Error replaying research', err);
    res.status(500).json({ error: 'Failed to replay research.' });
  }
}

export function streamResearchProgress(req: Request, res: Response): void {
  const id = getParamId(req);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ step: 'connected', message: 'Connected to research stream', progressPercent: 0 })}\n\n`);

  const unsubscribe = subscribeToProgress(id, (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  req.on('close', () => {
    unsubscribe();
  });
}

export async function listResearchHistory(req: Request, res: Response): Promise<void> {
  try {
    const limit = parseInt(String(req.query.limit || '50'), 10);
    const items = await listResearches(limit);
    res.json({
      total: items.length,
      items
    });
  } catch (err: any) {
    logger.error('Error listing research history', err);
    res.status(500).json({ error: 'Failed to list research history.' });
  }
}

export async function deleteResearch(req: Request, res: Response): Promise<void> {
  try {
    const id = getParamId(req);
    await deleteResearchById(id);
    res.json({ success: true, message: `Research record ${id} removed.` });
  } catch (err: any) {
    logger.error('Error deleting research', err);
    res.status(500).json({ error: 'Failed to delete research record.' });
  }
}
