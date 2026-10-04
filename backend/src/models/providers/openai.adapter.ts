import { BaseModelProviderAdapter } from './base.adapter.js';
import { DiscoveredModel, ModelCapability } from '../../types/model.types.js';

export class OpenAIProviderAdapter extends BaseModelProviderAdapter {
  readonly providerName = 'openai';
  readonly displayName = 'OpenAI';

  isEnabled(): boolean {
    const key = process.env.OPENAI_API_KEY;
    return Boolean(key && key.trim().length > 5);
  }

  private getApiKey(): string {
    return (process.env.OPENAI_API_KEY || '').trim();
  }

  async listModels(): Promise<DiscoveredModel[]> {
    if (!this.isEnabled()) return [];

    const apiKey = this.getApiKey();
    const res = await this.safeRequest<{ data: any[] }>({
      url: 'https://api.openai.com/v1/models',
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
    const capabilities = this.detectStandardCapabilities(modelId);

    // Explicit capabilities based on OpenAI model families
    if (modelId.startsWith('o1') || modelId.startsWith('o3')) {
      capabilities.push('Reasoning');
    }
    if (modelId.includes('4o') || modelId.includes('vision')) {
      capabilities.push('Vision');
      capabilities.push('Audio');
      capabilities.push('Tool Calling');
      capabilities.push('Structured Output');
    }
    if (modelId.includes('dall-e')) {
      capabilities.push('Image Generation');
    }
    if (modelId.includes('whisper')) {
      capabilities.push('Audio');
    }
    if (modelId.includes('embedding')) {
      capabilities.push('Embeddings');
    }

    // Estimate context window if recognized
    let contextWindow: number | null = null;
    if (modelId.includes('4o') || modelId.includes('o1')) {
      contextWindow = 128000;
    } else if (modelId.includes('gpt-4-turbo')) {
      contextWindow = 128000;
    } else if (modelId.includes('gpt-4-32k')) {
      contextWindow = 32768;
    } else if (modelId.includes('gpt-4')) {
      contextWindow = 8192;
    } else if (modelId.includes('gpt-3.5-turbo-16k')) {
      contextWindow = 16385;
    } else if (modelId.includes('gpt-3.5-turbo')) {
      contextWindow = 4096;
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
      family: this.detectFamily(modelId),
      version: this.extractVersion(modelId),
      description: `OpenAI ${displayName} model`,
      capabilities: Array.from(new Set(capabilities)),
      modalities: {
        input: capabilities.includes('Vision') ? ['text', 'image'] : ['text'],
        output: capabilities.includes('Image Generation') ? ['image'] : ['text']
      },
      contextWindow,
      maxOutputTokens: null,
      inputPricing: null,
      outputPricing: null,
      releaseDate,
      knowledgeCutoff: null,
      status: 'ACTIVE',
      documentationUrl: 'https://platform.openai.com/docs/models',
      apiUrl: 'https://api.openai.com/v1',
      sourceUrl: 'https://openai.com',
      repositoryUrl: 'https://github.com/openai',
      official: true,
      raw
    };
  }

  private formatDisplayName(id: string): string {
    if (id === 'gpt-4o') return 'GPT-4o';
    if (id === 'gpt-4o-mini') return 'GPT-4o Mini';
    if (id.startsWith('o1')) return id.toUpperCase();
    if (id.startsWith('o3')) return id.toUpperCase();
    return id;
  }

  private detectFamily(id: string): string {
    if (id.startsWith('gpt-4')) return 'GPT-4';
    if (id.startsWith('gpt-3.5')) return 'GPT-3.5';
    if (id.startsWith('o1') || id.startsWith('o3')) return 'O-Series';
    if (id.startsWith('dall-e')) return 'DALL-E';
    if (id.startsWith('text-embedding')) return 'Embeddings';
    return 'OpenAI';
  }

  private extractVersion(id: string): string {
    const match = id.match(/\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
    return 'latest';
  }
}
