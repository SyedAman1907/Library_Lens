import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { DiscoveredModel, ModelProviderAdapter, ProviderHealth, ModelCapability } from '../../types/model.types.js';
import { logger } from '../../utils/logger.js';

export abstract class BaseModelProviderAdapter implements ModelProviderAdapter {
  abstract readonly providerName: string;
  abstract readonly displayName: string;

  protected lastSuccessfulSync: string | null = null;
  protected lastFailedSync: string | null = null;
  protected lastErrorMessage: string | null = null;
  protected lastModelCount: number = 0;

  abstract isEnabled(): boolean;
  abstract listModels(): Promise<DiscoveredModel[]>;
  abstract normalizeModel(rawModel: any): DiscoveredModel;

  async getModelDetails(modelId: string): Promise<DiscoveredModel | null> {
    const list = await this.listModels();
    return list.find(m => m.modelId.toLowerCase() === modelId.toLowerCase()) || null;
  }

  async healthCheck(): Promise<ProviderHealth> {
    const enabled = this.isEnabled();
    if (!enabled) {
      return {
        provider: this.providerName,
        displayName: this.displayName,
        enabled: false,
        status: 'disabled',
        modelCount: this.lastModelCount,
        lastCheckedAt: this.lastSuccessfulSync || this.lastFailedSync,
        errorMessage: 'API key not configured'
      };
    }

    try {
      // Perform a lightweight check or probe
      const models = await this.listModels();
      this.lastSuccessfulSync = new Date().toISOString();
      this.lastModelCount = models.length;
      return {
        provider: this.providerName,
        displayName: this.displayName,
        enabled: true,
        status: 'connected',
        modelCount: models.length,
        lastCheckedAt: this.lastSuccessfulSync
      };
    } catch (err: any) {
      this.lastFailedSync = new Date().toISOString();
      this.lastErrorMessage = this.sanitizeErrorMessage(err.message || 'Health check failed');
      return {
        provider: this.providerName,
        displayName: this.displayName,
        enabled: true,
        status: 'error',
        modelCount: this.lastModelCount,
        lastCheckedAt: this.lastFailedSync,
        errorMessage: this.lastErrorMessage
      };
    }
  }

  protected async safeRequest<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const timeout = config.timeout || 12000;
    try {
      return await axios({
        ...config,
        timeout,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'LibraryLens-AI-Model-Intelligence/1.0',
          ...(config.headers || {})
        }
      });
    } catch (err: any) {
      const sanitized = this.sanitizeErrorMessage(err.message || String(err));
      logger.warn(`Provider [${this.providerName}] request failed: ${sanitized}`, {
        provider: this.providerName,
        status: err.response?.status
      });
      throw new Error(`Provider [${this.providerName}] error: ${sanitized}`);
    }
  }

  protected sanitizeErrorMessage(msg: string): string {
    // Strip possible API keys or tokens from query parameters or headers
    return msg
      .replace(/key=[a-zA-Z0-9_\-\.]{10,}/gi, 'key=***')
      .replace(/Bearer\s+[a-zA-Z0-9_\-\.]{10,}/gi, 'Bearer ***')
      .replace(/x-api-key:[a-zA-Z0-9_\-\.]{10,}/gi, 'x-api-key:***');
  }

  /**
   * Helper to detect standard capabilities from model string attributes,
   * without hallucinating false negatives or unsupported flags.
   */
  protected detectStandardCapabilities(nameOrId: string, desc?: string, explicitCaps: string[] = []): ModelCapability[] {
    const caps = new Set<ModelCapability>();
    const text = `${nameOrId} ${desc || ''}`.toLowerCase();

    // Explicit capabilities passed
    for (const c of explicitCaps) {
      if (c) caps.add(c as ModelCapability);
    }

    // Heuristics based strictly on naming conventions from providers
    if (text.includes('vision') || text.includes('vl') || text.includes('multimodal') || text.includes('4o')) {
      caps.add('Vision');
    }
    if (text.includes('audio') || text.includes('voice') || text.includes('speech')) {
      caps.add('Audio');
    }
    if (text.includes('video')) {
      caps.add('Video');
    }
    if (text.includes('coder') || text.includes('code') || text.includes('codestral')) {
      caps.add('Code');
    }
    if (text.includes('reasoning') || text.includes('thought') || text.includes('r1') || text.includes('o1') || text.includes('o3')) {
      caps.add('Reasoning');
    }
    if (text.includes('embed')) {
      caps.add('Embeddings');
    }
    if (text.includes('image') && (text.includes('generation') || text.includes('dall-e') || text.includes('imagen') || text.includes('flux'))) {
      caps.add('Image Generation');
    }

    // Default for generative LLMs: Text & Streaming
    if (!caps.has('Embeddings') && !caps.has('Image Generation')) {
      caps.add('Text');
      caps.add('Streaming');
    }

    return Array.from(caps);
  }
}
