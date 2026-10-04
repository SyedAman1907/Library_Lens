import { Request, Response } from 'express';
import { isDbConnected } from '../models/db.js';
import { mcpClient } from '../mcp/client.js';
import { providerRegistry } from '../models/providers/provider.registry.js';

export async function getHealth(req: Request, res: Response): Promise<void> {
  const mcpHealthy = await mcpClient.isHealthy();
  const dbConnected = isDbConnected();
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  const serpapiConfigured = Boolean(process.env.SERPAPI_API_KEY);

  // Collect provider health
  const providers = await providerRegistry.checkAllHealth();

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'LibraryLens AI Backend',
    database: {
      type: dbConnected ? 'MongoDB (Connected)' : 'In-Memory Store (Resilient Fallback)',
      connected: dbConnected
    },
    mcpServer: {
      url: process.env.MCP_SERVER_URL || 'http://127.0.0.1:5005',
      connected: mcpHealthy
    },
    integrations: {
      serpapi: serpapiConfigured,
      gemini: geminiConfigured,
      mcp: mcpHealthy,
      database: dbConnected
    },
    providers
  });
}

