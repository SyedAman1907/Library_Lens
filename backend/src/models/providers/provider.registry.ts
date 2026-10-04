import { ModelProviderAdapter, ProviderHealth } from '../../types/model.types.js';
import { GeminiProviderAdapter } from './gemini.adapter.js';
import { OpenAIProviderAdapter } from './openai.adapter.js';
import { AnthropicProviderAdapter } from './anthropic.adapter.js';
import { MistralProviderAdapter } from './mistral.adapter.js';
import { GroqProviderAdapter } from './groq.adapter.js';
import { OpenRouterProviderAdapter } from './openrouter.adapter.js';
import { CohereProviderAdapter } from './cohere.adapter.js';
import { TogetherProviderAdapter } from './together.adapter.js';
import { logger } from '../../utils/logger.js';

export class ProviderRegistry {
  private adapters: Map<string, ModelProviderAdapter> = new Map();

  constructor() {
    this.registerDefaultAdapters();
  }

  private registerDefaultAdapters() {
    this.register(new GeminiProviderAdapter());
    this.register(new OpenAIProviderAdapter());
    this.register(new AnthropicProviderAdapter());
    this.register(new MistralProviderAdapter());
    this.register(new GroqProviderAdapter());
    this.register(new OpenRouterProviderAdapter());
    this.register(new CohereProviderAdapter());
    this.register(new TogetherProviderAdapter());
  }

  register(adapter: ModelProviderAdapter) {
    this.adapters.set(adapter.providerName.toLowerCase(), adapter);
    logger.info(`Registered Model Provider Adapter: [${adapter.providerName}] (${adapter.displayName}) - Enabled: ${adapter.isEnabled()}`);
  }

  getAdapter(providerName: string): ModelProviderAdapter | undefined {
    return this.adapters.get(providerName.toLowerCase());
  }

  getAllAdapters(): ModelProviderAdapter[] {
    return Array.from(this.adapters.values());
  }

  getEnabledAdapters(): ModelProviderAdapter[] {
    return Array.from(this.adapters.values()).filter(a => a.isEnabled());
  }

  async checkAllHealth(): Promise<ProviderHealth[]> {
    const results = await Promise.allSettled(
      this.getAllAdapters().map(adapter => adapter.healthCheck())
    );

    return results.map((res, index) => {
      const adapter = this.getAllAdapters()[index];
      if (res.status === 'fulfilled') {
        return res.value;
      }
      return {
        provider: adapter.providerName,
        displayName: adapter.displayName,
        enabled: adapter.isEnabled(),
        status: 'error',
        modelCount: 0,
        lastCheckedAt: new Date().toISOString(),
        errorMessage: String(res.reason?.message || 'Health check rejected')
      };
    });
  }
}

export const providerRegistry = new ProviderRegistry();
