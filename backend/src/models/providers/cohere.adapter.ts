import { BaseModelProviderAdapter } from './base.adapter.js';
import { DiscoveredModel, ModelCapability } from '../../types/model.types.js';

export class CohereProviderAdapter extends BaseModelProviderAdapter {
  readonly providerName = 'cohere';
  readonly displayName = 'Cohere';

  isEnabled(): boolean {
    const key = process.env.COHERE_API_KEY;
    return Boolean(key && key.trim().length > 5);
  }

  private getApiKey(): string {
    return (process.env.COHERE_API_KEY || '').trim();
  }

  async listModels(): Promise<DiscoveredModel[]> {
    if (!this.isEnabled()) return [];

    const apiKey = this.getApiKey();
    const res = await this.safeRequest<{ models: any[] }>({
      url: 'https://api.cohere.com/v1/models',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    const rawList = res.data?.models || [];
    return rawList.map(m => this.normalizeModel(m));
  }

  normalizeModel(raw: any): DiscoveredModel {
    const modelId = raw.name || '';
    const displayName = this.formatDisplayName(modelId);
    const capabilities: ModelCapability[] = ['Text', 'Streaming'];

    if (raw.endpoints?.includes('chat') || modelId.includes('command')) {
      capabilities.push('Tool Calling', 'Structured Output');
    }
    if (raw.endpoints?.includes('embed') || modelId.includes('embed')) {
      capabilities.push('Embeddings');
    }
    if (raw.endpoints?.includes('rerank') || modelId.includes('rerank')) {
      // Specialized ranking
    }

    const contextWindow = typeof raw.context_length === 'number' ? raw.context_length : null;
    if (contextWindow && contextWindow >= 100000) {
      capabilities.push('Long Context');
    }

    return {
      provider: this.providerName,
      modelId,
      displayName,
      family: this.detectFamily(modelId),
      version: 'latest',
      description: `Cohere enterprise AI model: ${displayName}`,
      capabilities: Array.from(new Set(capabilities)),
      modalities: {
        input: ['text'],
        output: ['text']
      },
      contextWindow,
      maxOutputTokens: null,
      inputPricing: null,
      outputPricing: null,
      releaseDate: null,
      knowledgeCutoff: null,
      status: 'ACTIVE',
      documentationUrl: 'https://docs.cohere.com/docs/models',
      apiUrl: 'https://api.cohere.com/v1',
      sourceUrl: 'https://cohere.com',
      repositoryUrl: 'https://github.com/cohere-ai',
      official: true,
      raw
    };
  }

  private formatDisplayName(id: string): string {
    return id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  private detectFamily(id: string): string {
    if (id.includes('command-r')) return 'Command R';
    if (id.includes('command')) return 'Command';
    if (id.includes('embed')) return 'Embed';
    if (id.includes('rerank')) return 'Rerank';
    return 'Cohere';
  }
}
