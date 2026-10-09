import { QuestionAnalysis } from '../types/research.types.js';
import { logger } from '../utils/logger.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Common software libraries for fast, deterministic detection
const KNOWN_LIBRARIES = [
  'React', 'Vue', 'Angular', 'Svelte', 'SolidJS', 'Preact',
  'Next.js', 'Nuxt', 'Remix', 'Astro', 'Gatsby',
  'Express', 'FastAPI', 'Django', 'Flask', 'NestJS', 'Koa', 'Fastify', 'Spring Boot', 'Quarkus', 'Micronaut',
  'PyTorch', 'TensorFlow', 'JAX', 'Scikit-Learn', 'Keras', 'LangChain', 'LlamaIndex',
  'Tokio', 'Actix Web', 'Axum', 'Rocket', 'Tonic',
  'Tailwind CSS', 'Bootstrap', 'Chakra UI', 'MUI',
  'Prisma', 'Drizzle', 'TypeORM', 'Mongoose', 'SQLAlchemy',
  'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'ClickHouse',
  'Zustand', 'Redux Toolkit', 'MobX', 'Pinia', 'Recoil'
];

export async function analyzeResearchQuestion(
  question: string,
  fallbackLibA = 'React',
  fallbackLibB = 'Vue',
  fallbackUseCase = 'Production web application'
): Promise<QuestionAnalysis> {
  const cleanQ = (question || '').trim();

  if (!cleanQ) {
    return {
      originalQuestion: `${fallbackLibA} vs ${fallbackLibB}`,
      identifiedLibraries: [fallbackLibA, fallbackLibB],
      useCase: fallbackUseCase,
      intent: 'comparison'
    };
  }

  // 1. Determine intent
  let intent: QuestionAnalysis['intent'] = 'comparison';
  const lower = cleanQ.toLowerCase();
  if (/safe|risk|security|stability|production ready|breaking changes/i.test(lower)) {
    intent = 'safety_evaluation';
  } else if (/migrate|migration|upgrade|switch from|move from/i.test(lower)) {
    intent = 'migration';
  }

  // 2. Try Gemini LLM for precise zero-shot extraction if key is present
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-3.8-flash' });
      const prompt = `You are a software engineering research agent. Analyze this developer query:
"${cleanQ}"

Extract JSON only with these keys:
{
  "libraryA": "primary technology or source technology (e.g. Express)",
  "libraryB": "competing technology or target technology (e.g. FastAPI)",
  "useCase": "concise description of the specific use case, workload or project constraint (e.g. Production API with high concurrency)",
  "intent": "comparison" | "migration" | "safety_evaluation" | "general_research"
}
Ensure libraryA and libraryB are canonical technology names. If only one library is mentioned, suggest the primary alternative in libraryB.
Output strictly JSON without markdown fences.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed.libraryA && parsed.libraryB) {
        return {
          originalQuestion: cleanQ,
          identifiedLibraries: [parsed.libraryA, parsed.libraryB],
          useCase: parsed.useCase || fallbackUseCase,
          intent: parsed.intent || intent
        };
      }
    } catch (err) {
      logger.warn('Gemini question analysis fallback to heuristic extraction', { error: String(err) });
    }
  }

  // 3. Robust Regex / Heuristic NLP Extraction
  const detected: string[] = [];
  for (const lib of KNOWN_LIBRARIES) {
    // Match whole words case-insensitively, handling periods like Next.js
    const escaped = lib.replace(/\./g, '\\.');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(cleanQ)) {
      if (!detected.includes(lib)) detected.push(lib);
    }
  }

  const DEFAULT_ALTERNATIVES: Record<string, string> = {
    'Next.js': 'Remix',
    'React': 'Vue',
    'Vue': 'React',
    'Angular': 'React',
    'Svelte': 'React',
    'Express': 'FastAPI',
    'FastAPI': 'Express',
    'Django': 'FastAPI',
    'Flask': 'FastAPI',
    'NestJS': 'Fastify',
    'Spring Boot': 'Quarkus',
    'PyTorch': 'TensorFlow',
    'TensorFlow': 'PyTorch',
    'Tokio': 'Actix Web',
    'Actix Web': 'Axum',
    'Zustand': 'Redux Toolkit',
    'Redux Toolkit': 'Zustand'
  };

  let libA = detected[0] || fallbackLibA;
  let libB = detected[1] || DEFAULT_ALTERNATIVES[libA] || fallbackLibB;

  // If "migrate from X to Y" pattern exists
  const migrateMatch = cleanQ.match(/migrate\s+(?:from\s+)?([A-Za-z0-9_.-]+)\s+to\s+([A-Za-z0-9_.-]+)/i);
  if (migrateMatch) {
    libA = migrateMatch[1];
    libB = migrateMatch[2];
    intent = 'migration';
  }

  // If "X vs Y" or "X or Y" pattern exists
  const vsMatch = cleanQ.match(/([A-Za-z0-9_.-]+)\s+(?:vs\.?|versus|or|compared to)\s+([A-Za-z0-9_.-]+)/i);
  if (vsMatch && detected.length < 2) {
    libA = vsMatch[1];
    libB = vsMatch[2];
  }

  // Extract Use Case: remove library names and prompt boilerplate
  let extractedUseCase = cleanQ
    .replace(new RegExp(`\\b(${libA}|${libB})\\b`, 'gi'), '')
    .replace(/should i migrate from|should i use|is the latest|safe to migrate to|compare|versus|vs\.?|or|between|for a|for an|for/gi, '')
    .replace(/[?.,!]/g, '')
    .trim();

  if (!extractedUseCase || extractedUseCase.length < 4) {
    extractedUseCase = fallbackUseCase;
  }

  return {
    originalQuestion: cleanQ,
    identifiedLibraries: [libA, libB],
    useCase: extractedUseCase,
    intent
  };
}
