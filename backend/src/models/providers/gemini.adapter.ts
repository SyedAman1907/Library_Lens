import { BaseModelProviderAdapter } from './base.adapter.js';
import { DiscoveredModel, ModelCapability } from '../../types/model.types.js';

export class GeminiProviderAdapter extends BaseModelProviderAdapter {
  readonly providerName = 'google';
  readonly displayName = 'Google Gemini';

  isEnabled(): boolean {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    return Boolean(key && key.trim().length > 5);
  }

  private getApiKey(): string {
    return (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
  }

  async listModels(): Promise<DiscoveredModel[]> {
    if (!this.isEnabled()) return [];

    const apiKey = this.getApiKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    const res = await this.safeRequest<{ models: any[] }>({
      url,
      method: 'GET'
    });

    const rawList = res.data?.models || [];
    return rawList.map(m => this.normalizeModel(m));
  }

  normalizeModel(raw: any): DiscoveredModel {
    // raw.name is formatted as "models/gemini-1.5-pro"
    const fullName = raw.name || '';
    const cleanId = fullName.replace(/^models\//, '');
    const displayName = raw.displayName || cleanId;
    const description = raw.description || '';

    const capabilities: ModelCapability[] = ['Text'];
    if (raw.supportedGenerationMethods?.includes('generateContent')) {
      capabilities.push('Streaming');
    }
    if (cleanId.includes('vision') || cleanId.includes('gemini-1.5') || cleanId.includes('gemini-2.0') || cleanId.includes('gemini-exp')) {
      capabilities.push('Vision');
      capabilities.push('Audio');
      capabilities.push('Video');
      capabilities.push('Tool Calling');
      capabilities.push('Structured Output');
    }
    if (cleanId.includes('thinking') || cleanId.includes('reasoning') || cleanId.includes('2.0-flash-thinking')) {
      capabilities.push('Reasoning');
    }
    if (cleanId.includes('embed')) {
      capabilities.push('Embeddings');
    }

    // Context windows
    const contextWindow = typeof raw.inputTokenLimit === 'number' ? raw.inputTokenLimit : null;
    const maxOutputTokens = typeof raw.outputTokenLimit === 'number' ? raw.outputTokenLimit : null;

    if (contextWindow && contextWindow >= 100000) {
      capabilities.push('Long Context');
    }

    return {
      provider: this.providerName,
      modelId: cleanId,
      displayName,
      family: 'Gemini',
      version: raw.version || cleanId.split('-')[1] || '1.0',
      description,
      capabilities: Array.from(new Set(capabilities)),
      modalities: {
        input: capabilities.includes('Vision') ? ['text', 'image', 'audio', 'video'] : ['text'],
        output: ['text']
      },
      contextWindow,
      maxOutputTokens,
      inputPricing: null, // Google API catalog endpoint doesn't return pricing in response; obtained via research
      outputPricing: null,
      releaseDate: null,
      knowledgeCutoff: null,
      status: 'ACTIVE',
      documentationUrl: 'https://ai.google.dev/gemini-api/docs/models/gemini',
      apiUrl: 'https://generativelanguage.googleapis.com/v1beta',
      sourceUrl: 'https://ai.google.dev',
      repositoryUrl: 'https://github.com/google-gemini',
      official: true,
      raw
    };
  }
}
