import { BaseModelProviderAdapter } from './base.adapter.js';
import { DiscoveredModel, ModelCapability } from '../../types/model.types.js';

export class AnthropicProviderAdapter extends BaseModelProviderAdapter {
  readonly providerName = 'anthropic';
  readonly displayName = 'Anthropic Claude';

  isEnabled(): boolean {
    const key = process.env.ANTHROPIC_API_KEY;
    return Boolean(key && key.trim().length > 5);
  }

  private getApiKey(): string {
    return (process.env.ANTHROPIC_API_KEY || '').trim();
  }

  async listModels(): Promise<DiscoveredModel[]> {
    if (!this.isEnabled()) return [];

    const apiKey = this.getApiKey();
    const res = await this.safeRequest<{ data: any[] }>({
      url: 'https://api.anthropic.com/v1/models',
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }
    });

    const rawList = res.data?.data || [];
    return rawList.map(m => this.normalizeModel(m));
  }

  normalizeModel(raw: any): DiscoveredModel {
    const modelId = raw.id || '';
    const displayName = raw.display_name || modelId;

    const capabilities: ModelCapability[] = ['Text', 'Streaming', 'Vision', 'Tool Calling', 'Structured Output'];
    if (modelId.includes('3-5-sonnet') || modelId.includes('3-opus') || modelId.includes('3-7-sonnet')) {
      capabilities.push('Reasoning');
      capabilities.push('Code');
    }
    capabilities.push('Long Context');

    return {
      provider: this.providerName,
      modelId,
      displayName,
      family: this.detectFamily(modelId),
      version: this.extractVersion(modelId),
      description: `Anthropic ${displayName} model`,
      capabilities: Array.from(new Set(capabilities)),
      modalities: {
        input: ['text', 'image'],
        output: ['text']
      },
      contextWindow: 200000, // Standard Claude 3/3.5/3.7 context window is 200k tokens
      maxOutputTokens: 8192,
      inputPricing: null,
      outputPricing: null,
      releaseDate: raw.created_at || null,
      knowledgeCutoff: null,
      status: 'ACTIVE',
      documentationUrl: 'https://docs.anthropic.com/en/docs/about-claude/models',
      apiUrl: 'https://api.anthropic.com/v1',
      sourceUrl: 'https://anthropic.com',
      repositoryUrl: 'https://github.com/anthropics',
      official: true,
      raw
    };
  }

  private detectFamily(id: string): string {
    if (id.includes('claude-3-7')) return 'Claude 3.7';
    if (id.includes('claude-3-5')) return 'Claude 3.5';
    if (id.includes('claude-3')) return 'Claude 3';
    return 'Claude';
  }

  private extractVersion(id: string): string {
    const match = id.match(/\d{8}/);
    if (match) return match[0];
    return '3.5';
  }
}
