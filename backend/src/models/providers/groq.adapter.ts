import { BaseModelProviderAdapter } from './base.adapter.js';
import { DiscoveredModel, ModelCapability } from '../../types/model.types.js';

export class GroqProviderAdapter extends BaseModelProviderAdapter {
  readonly providerName = 'groq';
  readonly displayName = 'Groq';

  isEnabled(): boolean {
    const key = process.env.GROQ_API_KEY;
    return Boolean(key && key.trim().length > 5);
  }

  private getApiKey(): string {
    return (process.env.GROQ_API_KEY || '').trim();
  }

  async listModels(): Promise<DiscoveredModel[]> {
    if (!this.isEnabled()) return [];

    const apiKey = this.getApiKey();
    const res = await this.safeRequest<{ data: any[] }>({
      url: 'https://api.groq.com/openai/v1/models',
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
    const displayName = this.formatDisplayName(modelId);
    const capabilities: ModelCapability[] = ['Text', 'Streaming'];

    if (modelId.includes('vision') || modelId.includes('vl')) {
      capabilities.push('Vision');
    }
    if (modelId.includes('deepseek-r1') || modelId.includes('reasoner') || modelId.includes('r1')) {
      capabilities.push('Reasoning');
    }
    if (modelId.includes('llama') || modelId.includes('mixtral') || modelId.includes('qwen')) {
      capabilities.push('Tool Calling', 'Structured Output');
    }

    const contextWindow = typeof raw.context_window === 'number' ? raw.context_window : null;
    if (contextWindow && contextWindow >= 100000) {
      capabilities.push('Long Context');
    }

    let releaseDate: string | null = null;
    if (raw.created && typeof raw.created === 'number') {
      try {
        releaseDate = new Date(raw.created * 1000).toISOString();
      } catch {}
    }

    return {
      provider: this.providerName,
      modelId,
      displayName,
      family: raw.owned_by || this.detectFamily(modelId),
      version: 'latest',
      description: `Ultra-fast inference model on Groq LPU: ${displayName}`,
      capabilities: Array.from(new Set(capabilities)),
      modalities: {
        input: capabilities.includes('Vision') ? ['text', 'image'] : ['text'],
        output: ['text']
      },
      contextWindow,
      maxOutputTokens: null,
      inputPricing: null,
      outputPricing: null,
      releaseDate,
      knowledgeCutoff: null,
      status: raw.active === false ? 'DEPRECATED' : 'ACTIVE',
      documentationUrl: 'https://console.groq.com/docs/models',
      apiUrl: 'https://api.groq.com/openai/v1',
      sourceUrl: 'https://groq.com',
      repositoryUrl: 'https://github.com/groq',
      official: true,
      raw
    };
  }

  private formatDisplayName(id: string): string {
    return id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  private detectFamily(id: string): string {
    if (id.includes('llama')) return 'Llama';
    if (id.includes('deepseek')) return 'DeepSeek';
    if (id.includes('mixtral') || id.includes('mistral')) return 'Mistral';
    if (id.includes('gemma')) return 'Gemma';
    if (id.includes('qwen')) return 'Qwen';
    return 'Groq';
  }
}
