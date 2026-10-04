import { BaseModelProviderAdapter } from './base.adapter.js';
import { DiscoveredModel, ModelCapability } from '../../types/model.types.js';

export class MistralProviderAdapter extends BaseModelProviderAdapter {
  readonly providerName = 'mistral';
  readonly displayName = 'Mistral AI';

  isEnabled(): boolean {
    const key = process.env.MISTRAL_API_KEY;
    return Boolean(key && key.trim().length > 5);
  }

  private getApiKey(): string {
    return (process.env.MISTRAL_API_KEY || '').trim();
  }

  async listModels(): Promise<DiscoveredModel[]> {
    if (!this.isEnabled()) return [];

    const apiKey = this.getApiKey();
    const res = await this.safeRequest<{ data: any[] }>({
      url: 'https://api.mistral.ai/v1/models',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    const rawList = res.data?.data || [];
    return rawList.map(m => this.normalizeModel(m));
  }

  normalizeModel(raw: any): DiscoveredModel {
    const modelId = raw.id || '';
    const displayName = raw.name || modelId;
    const description = raw.description || `Mistral ${displayName} model`;

    const capabilities: ModelCapability[] = ['Text', 'Streaming'];

    if (raw.capabilities) {
      if (raw.capabilities.function_calling) capabilities.push('Function Calling', 'Tool Calling');
      if (raw.capabilities.vision) capabilities.push('Vision');
    }

    if (modelId.includes('pixtral')) capabilities.push('Vision');
    if (modelId.includes('codestral')) capabilities.push('Code');
    if (modelId.includes('embed')) capabilities.push('Embeddings');

    const contextWindow = typeof raw.max_context_length === 'number' ? raw.max_context_length : (
      modelId.includes('large') ? 128000 : 32768
    );

    if (contextWindow >= 100000) {
      capabilities.push('Long Context');
    }

    return {
      provider: this.providerName,
      modelId,
      displayName,
      family: this.detectFamily(modelId),
      version: 'latest',
      description,
      capabilities: Array.from(new Set(capabilities)),
      modalities: {
        input: capabilities.includes('Vision') ? ['text', 'image'] : ['text'],
        output: ['text']
      },
      contextWindow,
      maxOutputTokens: null,
      inputPricing: null,
      outputPricing: null,
      releaseDate: null,
      knowledgeCutoff: null,
      status: 'ACTIVE',
      documentationUrl: 'https://docs.mistral.ai/getting-started/models/models_overview',
      apiUrl: 'https://api.mistral.ai/v1',
      sourceUrl: 'https://mistral.ai',
      repositoryUrl: 'https://github.com/mistralai',
      official: true,
      raw
    };
  }

  private detectFamily(id: string): string {
    if (id.includes('pixtral')) return 'Pixtral';
    if (id.includes('codestral')) return 'Codestral';
    if (id.includes('ministral')) return 'Ministral';
    if (id.includes('mistral-large')) return 'Mistral Large';
    if (id.includes('mistral-small')) return 'Mistral Small';
    return 'Mistral';
  }
}
