import { describe, it, expect, beforeEach } from 'vitest';
import { GeminiProviderAdapter } from '../models/providers/gemini.adapter.js';
import { OpenAIProviderAdapter } from '../models/providers/openai.adapter.js';
import { AnthropicProviderAdapter } from '../models/providers/anthropic.adapter.js';
import { GroqProviderAdapter } from '../models/providers/groq.adapter.js';
import { OpenRouterProviderAdapter } from '../models/providers/openrouter.adapter.js';
import { providerRegistry } from '../models/providers/provider.registry.js';
import { AiModelDao, computeFreshness } from '../models/ai_model.schema.js';
import { modelDiscoveryService } from '../services/model_discovery.service.js';
import { AiModelRecord } from '../types/model.types.js';

describe('AI Model Intelligence Engine - Provider Adapters & Normalization', () => {
  it('correctly normalizes Gemini API models with capabilities and context token limits', () => {
    const adapter = new GeminiProviderAdapter();
    const raw = {
      name: 'models/gemini-1.5-pro-latest',
      displayName: 'Gemini 1.5 Pro Latest',
      description: 'Mid-size multimodal model designed for complex reasoning tasks',
      inputTokenLimit: 2097152,
      outputTokenLimit: 8192,
      supportedGenerationMethods: ['generateContent', 'countTokens']
    };

    const normalized = adapter.normalizeModel(raw);
    expect(normalized.provider).toBe('google');
    expect(normalized.modelId).toBe('gemini-1.5-pro-latest');
    expect(normalized.displayName).toBe('Gemini 1.5 Pro Latest');
    expect(normalized.contextWindow).toBe(2097152);
    expect(normalized.maxOutputTokens).toBe(8192);
    expect(normalized.capabilities).toContain('Vision');
    expect(normalized.capabilities).toContain('Long Context');
    expect(normalized.capabilities).toContain('Streaming');
    expect(normalized.status).toBe('ACTIVE');
  });

  it('correctly normalizes OpenAI models with version and context window', () => {
    const adapter = new OpenAIProviderAdapter();
    const raw = {
      id: 'gpt-4o',
      object: 'model',
      created: 1715368132,
      owned_by: 'system'
    };

    const normalized = adapter.normalizeModel(raw);
    expect(normalized.provider).toBe('openai');
    expect(normalized.modelId).toBe('gpt-4o');
    expect(normalized.contextWindow).toBe(128000);
    expect(normalized.capabilities).toContain('Vision');
    expect(normalized.capabilities).toContain('Tool Calling');
  });

  it('correctly normalizes Anthropic Claude models with 200k context', () => {
    const adapter = new AnthropicProviderAdapter();
    const raw = {
      id: 'claude-3-5-sonnet-20241022',
      display_name: 'Claude 3.5 Sonnet',
      created_at: '2024-10-22T00:00:00Z',
      type: 'model'
    };

    const normalized = adapter.normalizeModel(raw);
    expect(normalized.provider).toBe('anthropic');
    expect(normalized.modelId).toBe('claude-3-5-sonnet-20241022');
    expect(normalized.displayName).toBe('Claude 3.5 Sonnet');
    expect(normalized.contextWindow).toBe(200000);
    expect(normalized.capabilities).toContain('Reasoning');
    expect(normalized.capabilities).toContain('Vision');
  });

  it('correctly normalizes OpenRouter models with token pricing converted to per 1M tokens', () => {
    const adapter = new OpenRouterProviderAdapter();
    const raw = {
      id: 'meta-llama/llama-3.1-70b-instruct',
      name: 'Llama 3.1 70B Instruct',
      context_length: 131072,
      pricing: {
        prompt: '0.00000035',
        completion: '0.0000004'
      },
      architecture: {
        modality: 'text->text'
      }
    };

    const normalized = adapter.normalizeModel(raw);
    expect(normalized.provider).toBe('openrouter');
    expect(normalized.contextWindow).toBe(131072);
    expect(normalized.inputPricing).toBe(0.35);
    expect(normalized.outputPricing).toBe(0.4);
  });

  it('registers all 8 standard providers in ProviderRegistry', () => {
    const all = providerRegistry.getAllAdapters();
    expect(all.length).toBeGreaterThanOrEqual(8);
    const names = all.map(a => a.providerName);
    expect(names).toContain('google');
    expect(names).toContain('openai');
    expect(names).toContain('anthropic');
    expect(names).toContain('mistral');
    expect(names).toContain('groq');
    expect(names).toContain('openrouter');
    expect(names).toContain('cohere');
    expect(names).toContain('together');
  });

  it('gracefully reports disabled status without throwing when API key is missing', async () => {
    // Save original env
    const origKey = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    const adapter = new AnthropicProviderAdapter();
    expect(adapter.isEnabled()).toBe(false);

    const health = await adapter.healthCheck();
    expect(health.status).toBe('disabled');
    expect(health.enabled).toBe(false);

    // Restore
    if (origKey) process.env.ANTHROPIC_API_KEY = origKey;
  });
});

describe('AI Model Intelligence Engine - Database & DAO', () => {
  beforeEach(async () => {
    // Seed a test model
    const testRecord: AiModelRecord = {
      id: 'google:gemini-1.5-flash',
      provider: 'google',
      modelId: 'gemini-1.5-flash',
      displayName: 'Gemini 1.5 Flash',
      family: 'Gemini',
      version: '1.5',
      aliases: [],
      description: 'High-speed multimodal AI model',
      capabilities: ['Text', 'Vision', 'Streaming', 'Tool Calling'],
      modalities: { input: ['text', 'image'], output: ['text'] },
      contextWindow: 1048576,
      maxOutputTokens: 8192,
      inputPricing: 0.075,
      outputPricing: 0.30,
      releaseDate: '2024-05-14',
      knowledgeCutoff: null,
      status: 'ACTIVE',
      documentationUrl: 'https://ai.google.dev/gemini-api/docs/models/gemini',
      apiUrl: 'https://generativelanguage.googleapis.com',
      sourceUrl: 'https://ai.google.dev',
      repositoryUrl: 'https://github.com/google-gemini',
      official: true,
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      lastCheckedAt: new Date().toISOString(),
      lastResearchedAt: null,
      researchStatus: 'completed',
      freshness: 'Fresh',
      metadata: {},
      evidence: [],
      history: []
    };
    await AiModelDao.upsert(testRecord);
  });

  it('retrieves model by ID and by provider and modelId', async () => {
    const byId = await AiModelDao.findById('google:gemini-1.5-flash');
    expect(byId).not.toBeNull();
    expect(byId?.displayName).toBe('Gemini 1.5 Flash');

    const byProvider = await AiModelDao.findByProviderAndModel('google', 'gemini-1.5-flash');
    expect(byProvider).not.toBeNull();
    expect(byProvider?.contextWindow).toBe(1048576);
  });

  it('filters models by provider, status, and capabilities', async () => {
    const list = await AiModelDao.listAll({ provider: 'google' });
    expect(list.length).toBeGreaterThan(0);
    expect(list.every(m => m.provider === 'google')).toBe(true);

    const visionList = await AiModelDao.listAll({ capability: 'Vision' });
    expect(visionList.some(m => m.id === 'google:gemini-1.5-flash')).toBe(true);
  });

  it('correctly calculates model freshness based on timestamp thresholds', () => {
    const now = new Date().toISOString();
    expect(computeFreshness(now)).toBe('Fresh');

    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    expect(computeFreshness(twoDaysAgo)).toBe('Aging');

    const fiveDaysAgo = new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString();
    expect(computeFreshness(fiveDaysAgo)).toBe('Stale');
  });

  it('maintains changelog history records and notifications', async () => {
    const id = 'google:gemini-1.5-flash';
    await AiModelDao.addHistory(id, {
      id: 'hist-1',
      timestamp: new Date().toISOString(),
      changeType: 'METADATA_UPDATED',
      field: 'contextWindow',
      oldValue: 1048576,
      newValue: 2097152,
      description: 'Context window upgraded to 2M tokens',
      sourceUrl: 'https://ai.google.dev'
    });

    const updated = await AiModelDao.findById(id);
    expect(updated?.history.length).toBeGreaterThanOrEqual(1);
    expect(updated?.history[0].description).toContain('2M tokens');

    // Notifications
    await AiModelDao.recordNotification({
      id: 'notif-1',
      type: 'NEW_MODEL',
      title: 'New Model Released',
      message: 'Google released Gemini 1.5 Flash',
      provider: 'google',
      modelId: 'gemini-1.5-flash',
      timestamp: new Date().toISOString(),
      read: false
    });

    const notifs = await AiModelDao.getNotifications();
    expect(notifs.length).toBeGreaterThan(0);
    expect(notifs.some(n => n.id === 'notif-1')).toBe(true);

    await AiModelDao.markNotificationRead('notif-1');
    const readNotifs = await AiModelDao.getNotifications();
    const marked = readNotifs.find(n => n.id === 'notif-1');
    expect(marked?.read).toBe(true);
  });
});
