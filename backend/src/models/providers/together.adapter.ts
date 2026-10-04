import { BaseModelProviderAdapter } from './base.adapter.js';
import { DiscoveredModel, ModelCapability } from '../../types/model.types.js';

export class TogetherProviderAdapter extends BaseModelProviderAdapter {
  readonly providerName = 'together';
  readonly displayName = 'Together AI';

  isEnabled(): boolean {
    const key = process.env.TOGETHER_API_KEY;
    return Boolean(key && key.trim().length > 5);
  }

  private getApiKey(): string {
    return (process.env.TOGETHER_API_KEY || '').trim();
  }

  async listModels(): Promise<DiscoveredModel[]> {
    if (!this.isEnabled()) return [];

    const apiKey = this.getApiKey();
    const res = await this.safeRequest<any[]>({
      url: 'https://api.together.xyz/v1/models',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    const rawList = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
    return rawList.map((m: any) => this.normalizeModel(m));
  }

  normalizeModel(raw: any): DiscoveredModel {
    const modelId = raw.id || '';
    const displayName = raw.display_name || modelId;
    const description = raw.description || `Together AI hosted open-weights model: ${displayName}`;

    const capabilities: ModelCapability[] = ['Text', 'Streaming'];

    if (modelId.includes('vision') || modelId.includes('vl') || raw.type === 'image') {
      capabilities.push('Vision');
    }
    if (modelId.includes('code') || modelId.includes('coder') || modelId.includes('codestral')) {
      capabilities.push('Code');
    }
    if (modelId.includes('deepseek-r1') || modelId.includes('reasoner') || modelId.includes('r1')) {
      capabilities.push('Reasoning');
    }
    if (modelId.includes('flux') || modelId.includes('sdxl') || modelId.includes('diffusion')) {
      capabilities.push('Image Generation');
    }

    const contextWindow = typeof raw.context_length === 'number' ? raw.context_length : null;
    if (contextWindow && contextWindow >= 100000) {
      capabilities.push('Long Context');
    }

    // Pricing in Together AI
    let inputPricing: number | null = null;
    let outputPricing: number | null = null;
    if (raw.pricing) {
      if (typeof raw.pricing.input === 'number') inputPricing = raw.pricing.input;
      if (typeof raw.pricing.output === 'number') outputPricing = raw.pricing.output;
    }

    return {
      provider: this.providerName,
      modelId,
      displayName,
      family: modelId.split('/')[0] || 'Together',
      version: 'latest',
      description,
      capabilities: Array.from(new Set(capabilities)),
      modalities: {
        input: capabilities.includes('Vision') ? ['text', 'image'] : ['text'],
        output: capabilities.includes('Image Generation') ? ['image'] : ['text']
      },
      contextWindow,
      maxOutputTokens: null,
      inputPricing,
      outputPricing,
      releaseDate: null,
      knowledgeCutoff: null,
      status: 'ACTIVE',
      documentationUrl: 'https://docs.together.ai/docs/models',
      apiUrl: 'https://api.together.xyz/v1',
      sourceUrl: 'https://together.ai',
      repositoryUrl: 'https://github.com/togethercomputer',
      official: false,
      raw
    };
  }
}
