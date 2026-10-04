import { BaseModelProviderAdapter } from './base.adapter.js';
import { DiscoveredModel, ModelCapability } from '../../types/model.types.js';

export class OpenRouterProviderAdapter extends BaseModelProviderAdapter {
  readonly providerName = 'openrouter';
  readonly displayName = 'OpenRouter';

  isEnabled(): boolean {
    // OpenRouter has a public discovery endpoint accessible without an API key,
    // providing live catalog exploration across frontier and open-weight models.
    return true;
  }

  async listModels(): Promise<DiscoveredModel[]> {
    if (!this.isEnabled()) return [];

    const key = process.env.OPENROUTER_API_KEY;
    const headers: Record<string, string> = {
      'HTTP-Referer': 'https://librarylens.ai',
      'X-Title': 'LibraryLens AI'
    };
    if (key && key.trim().length > 5) {
      headers['Authorization'] = `Bearer ${key.trim()}`;
    }

    const res = await this.safeRequest<{ data: any[] }>({
      url: 'https://openrouter.ai/api/v1/models',
      method: 'GET',
      headers
    });

    const rawList = res.data?.data || [];
    return rawList.map(m => this.normalizeModel(m));
  }

  normalizeModel(raw: any): DiscoveredModel {
    const modelId = raw.id || '';
    const displayName = raw.name || modelId;
    const description = raw.description || '';

    const capabilities: ModelCapability[] = ['Text', 'Streaming'];

    const modality = raw.architecture?.modality || '';
    if (modality.includes('image') || modelId.includes('vision') || modelId.includes('vl') || modelId.includes('4o')) {
      capabilities.push('Vision');
    }
    if (modality.includes('audio')) {
      capabilities.push('Audio');
    }
    if (modelId.includes('coder') || modelId.includes('code') || modelId.includes('claude') || modelId.includes('gpt-4') || modelId.includes('gemini') || modelId.includes('deepseek')) {
      capabilities.push('Code');
    }
    if (modelId.includes('r1') || modelId.includes('reasoner') || modelId.includes('o1') || modelId.includes('o3') || modelId.includes('thinking')) {
      capabilities.push('Reasoning');
    }
    // Check parameters for tool calling and structured output
    const supportedParams = Array.isArray(raw.supported_parameters) ? raw.supported_parameters : [];
    if (supportedParams.includes('tools') || supportedParams.includes('function_call') || modelId.includes('gpt-4') || modelId.includes('claude') || modelId.includes('gemini')) {
      capabilities.push('Tool Calling');
      capabilities.push('Function Calling');
    }
    if (supportedParams.includes('response_format') || supportedParams.includes('structured_outputs') || modelId.includes('gpt-4') || modelId.includes('gemini')) {
      capabilities.push('Structured Output');
    }

    const contextWindow = typeof raw.context_length === 'number' ? raw.context_length : null;
    if (contextWindow && contextWindow >= 100000) {
      capabilities.push('Long Context');
    }

    // Pricing calculation (OpenRouter gives per-token pricing e.g. "0.000003")
    // Convert to standard USD per 1M tokens
    let inputPricing: number | null = null;
    let outputPricing: number | null = null;
    if (raw.pricing?.prompt) {
      const p = parseFloat(raw.pricing.prompt);
      if (!isNaN(p)) inputPricing = Number((p * 1_000_000).toFixed(4));
    }
    if (raw.pricing?.completion) {
      const c = parseFloat(raw.pricing.completion);
      if (!isNaN(c)) outputPricing = Number((c * 1_000_000).toFixed(4));
    }

    return {
      provider: this.providerName,
      modelId,
      displayName,
      family: modelId.split('/')[0] || 'OpenRouter',
      version: 'latest',
      description,
      capabilities: Array.from(new Set(capabilities)),
      modalities: {
        input: capabilities.includes('Vision') ? ['text', 'image'] : ['text'],
        output: ['text']
      },
      contextWindow,
      maxOutputTokens: typeof raw.top_provider?.max_completion_tokens === 'number' ? raw.top_provider.max_completion_tokens : null,
      inputPricing,
      outputPricing,
      releaseDate: null,
      knowledgeCutoff: null,
      status: 'ACTIVE',
      documentationUrl: 'https://openrouter.ai/docs/models',
      apiUrl: 'https://openrouter.ai/api/v1',
      sourceUrl: 'https://openrouter.ai',
      repositoryUrl: null,
      official: false, // aggregator
      raw
    };
  }
}
