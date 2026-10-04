import axios from 'axios';
import { logger } from '../utils/logger.js';
import { Source } from '../types/research.types.js';

export interface ResearchResult {
  tool: string;
  query: string;
  results: any[];
  total: number;
  error?: string;
  notice?: string;
}

export interface ResearchTool {
  name: string;
  description: string;
  execute(input: unknown): Promise<ResearchResult>;
}

export class MCPClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.MCP_SERVER_URL || 'http://127.0.0.1:5005';
  }

  async isHealthy(): Promise<boolean> {
    try {
      const res = await axios.get(`${this.baseUrl}/health`, { timeout: 2000 });
      return res.status === 200 && res.data?.status === 'healthy';
    } catch {
      return false;
    }
  }

  async listTools(): Promise<any[]> {
    try {
      const res = await axios.get(`${this.baseUrl}/tools/list`, { timeout: 3000 });
      return res.data?.tools || [];
    } catch (err) {
      logger.warn('Failed to retrieve tool list from MCP server', { error: String(err) });
      return [];
    }
  }

  async callTool(name: string, args: Record<string, any>): Promise<ResearchResult> {
    try {
      logger.info(`Calling MCP tool '${name}'`, { query: args.query });
      const res = await axios.post(
        `${this.baseUrl}/tools/call`,
        { name, arguments: args },
        { timeout: 15000 }
      );
      const resultData = res.data?.result || {};
      return {
        tool: name,
        query: args.query || '',
        results: resultData.results || [],
        total: resultData.total || 0,
        notice: resultData.notice,
        error: resultData.error
      };
    } catch (err: any) {
      logger.warn(`MCP tool call '${name}' error`, { message: err.message });
      return {
        tool: name,
        query: args.query || '',
        results: [],
        total: 0,
        error: err.response?.data?.detail || err.message
      };
    }
  }

  // Specialized convenience helpers
  async webSearch(query: string, engine: 'google_light' | 'google' = 'google_light'): Promise<ResearchResult> {
    return this.callTool('web_search', { query, engine });
  }

  async documentationSearch(query: string): Promise<ResearchResult> {
    return this.callTool('documentation_search', { query });
  }

  async newsSearch(query: string): Promise<ResearchResult> {
    return this.callTool('news_search', { query });
  }

  async imagesSearch(query: string): Promise<ResearchResult> {
    return this.callTool('images_search', { query });
  }
}

export const mcpClient = new MCPClient();

export async function callMcpTool(name: string, args: Record<string, any>): Promise<any> {
  const result = await mcpClient.callTool(name, args);
  return {
    organic_results: result.results.map((r: any) => ({
      title: r.title,
      link: r.url || r.link,
      snippet: r.snippet,
      source: r.source || r.publisher
    })),
    results: result.results,
    total: result.total,
    error: result.error
  };
}
