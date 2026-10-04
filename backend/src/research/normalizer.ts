export interface SpellingCandidate {
  input: string;
  suggested: string;
  confidence: number;
  ecosystem: string;
}

// Canonical database of software libraries and frameworks for fast matching and spell checking
export const KNOWN_LIBRARIES: Record<string, { canonical: string; ecosystem: string; defaultPackage: string }> = {
  // JavaScript / TypeScript
  'react': { canonical: 'React', ecosystem: 'npm', defaultPackage: 'react' },
  'vue': { canonical: 'Vue', ecosystem: 'npm', defaultPackage: 'vue' },
  'angular': { canonical: 'Angular', ecosystem: 'npm', defaultPackage: '@angular/core' },
  'svelte': { canonical: 'Svelte', ecosystem: 'npm', defaultPackage: 'svelte' },
  'nextjs': { canonical: 'Next.js', ecosystem: 'npm', defaultPackage: 'next' },
  'next.js': { canonical: 'Next.js', ecosystem: 'npm', defaultPackage: 'next' },
  'next': { canonical: 'Next.js', ecosystem: 'npm', defaultPackage: 'next' },
  'nuxt': { canonical: 'Nuxt', ecosystem: 'npm', defaultPackage: 'nuxt' },
  'nuxtjs': { canonical: 'Nuxt', ecosystem: 'npm', defaultPackage: 'nuxt' },
  'express': { canonical: 'Express', ecosystem: 'npm', defaultPackage: 'express' },
  'fastify': { canonical: 'Fastify', ecosystem: 'npm', defaultPackage: 'fastify' },
  'nestjs': { canonical: 'NestJS', ecosystem: 'npm', defaultPackage: '@nestjs/core' },
  'remix': { canonical: 'Remix', ecosystem: 'npm', defaultPackage: '@remix-run/react' },
  'astro': { canonical: 'Astro', ecosystem: 'npm', defaultPackage: 'astro' },
  'tailwind': { canonical: 'Tailwind CSS', ecosystem: 'npm', defaultPackage: 'tailwindcss' },
  'tailwindcss': { canonical: 'Tailwind CSS', ecosystem: 'npm', defaultPackage: 'tailwindcss' },
  'zustand': { canonical: 'Zustand', ecosystem: 'npm', defaultPackage: 'zustand' },
  'redux': { canonical: 'Redux', ecosystem: 'npm', defaultPackage: 'redux' },

  // Python
  'fastapi': { canonical: 'FastAPI', ecosystem: 'pypi', defaultPackage: 'fastapi' },
  'django': { canonical: 'Django', ecosystem: 'pypi', defaultPackage: 'django' },
  'flask': { canonical: 'Flask', ecosystem: 'pypi', defaultPackage: 'flask' },
  'pytorch': { canonical: 'PyTorch', ecosystem: 'pypi', defaultPackage: 'torch' },
  'torch': { canonical: 'PyTorch', ecosystem: 'pypi', defaultPackage: 'torch' },
  'tensorflow': { canonical: 'TensorFlow', ecosystem: 'pypi', defaultPackage: 'tensorflow' },
  'pandas': { canonical: 'Pandas', ecosystem: 'pypi', defaultPackage: 'pandas' },
  'numpy': { canonical: 'NumPy', ecosystem: 'pypi', defaultPackage: 'numpy' },
  'scipy': { canonical: 'SciPy', ecosystem: 'pypi', defaultPackage: 'scipy' },
  'langchain': { canonical: 'LangChain', ecosystem: 'pypi', defaultPackage: 'langchain' },
  'llamaindex': { canonical: 'LlamaIndex', ecosystem: 'pypi', defaultPackage: 'llama-index' },
  'pydantic': { canonical: 'Pydantic', ecosystem: 'pypi', defaultPackage: 'pydantic' },
  'sqlalchemy': { canonical: 'SQLAlchemy', ecosystem: 'pypi', defaultPackage: 'sqlalchemy' },
  'celery': { canonical: 'Celery', ecosystem: 'pypi', defaultPackage: 'celery' },

  // Java
  'springboot': { canonical: 'Spring Boot', ecosystem: 'maven', defaultPackage: 'org.springframework.boot:spring-boot' },
  'spring-boot': { canonical: 'Spring Boot', ecosystem: 'maven', defaultPackage: 'org.springframework.boot:spring-boot' },
  'quarkus': { canonical: 'Quarkus', ecosystem: 'maven', defaultPackage: 'io.quarkus:quarkus-core' },
  'micronaut': { canonical: 'Micronaut', ecosystem: 'maven', defaultPackage: 'io.micronaut:micronaut-runtime' },

  // Rust
  'tokio': { canonical: 'Tokio', ecosystem: 'crates', defaultPackage: 'tokio' },
  'actix': { canonical: 'Actix Web', ecosystem: 'crates', defaultPackage: 'actix-web' },
  'actix-web': { canonical: 'Actix Web', ecosystem: 'crates', defaultPackage: 'actix-web' },
  'axum': { canonical: 'Axum', ecosystem: 'crates', defaultPackage: 'axum' },
  'serde': { canonical: 'Serde', ecosystem: 'crates', defaultPackage: 'serde' },
  'diesel': { canonical: 'Diesel', ecosystem: 'crates', defaultPackage: 'diesel' },

  // Go
  'gin': { canonical: 'Gin', ecosystem: 'go', defaultPackage: 'github.com/gin-gonic/gin' },
  'fiber': { canonical: 'Fiber', ecosystem: 'go', defaultPackage: 'github.com/gofiber/fiber' },
  'echo': { canonical: 'Echo', ecosystem: 'go', defaultPackage: 'github.com/labstack/echo' },

  // PHP
  'laravel': { canonical: 'Laravel', ecosystem: 'packagist', defaultPackage: 'laravel/framework' },
  'symfony': { canonical: 'Symfony', ecosystem: 'packagist', defaultPackage: 'symfony/symfony' },

  // Ruby
  'rails': { canonical: 'Ruby on Rails', ecosystem: 'rubygems', defaultPackage: 'rails' }
};

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

export function normalizeLibraryName(input: string): {
  normalized: string;
  canonical: string;
  ecosystem: string;
  defaultPackage: string;
  suggestion?: SpellingCandidate;
} {
  const cleaned = input.trim().replace(/[@/]/g, '').toLowerCase();

  // 1. Direct match
  if (KNOWN_LIBRARIES[cleaned]) {
    const entry = KNOWN_LIBRARIES[cleaned];
    return {
      normalized: cleaned,
      canonical: entry.canonical,
      ecosystem: entry.ecosystem,
      defaultPackage: entry.defaultPackage
    };
  }

  // 2. Fuzzy match for typo detection (e.g. "Reac" -> "React", "FastAPi" -> "FastAPI")
  let bestCandidate: { key: string; distance: number } | null = null;

  for (const key of Object.keys(KNOWN_LIBRARIES)) {
    const dist = levenshteinDistance(cleaned, key);
    if (dist <= 2 && dist < cleaned.length) {
      if (!bestCandidate || dist < bestCandidate.distance) {
        bestCandidate = { key, distance: dist };
      }
    }
  }

  if (bestCandidate && bestCandidate.distance > 0) {
    const matched = KNOWN_LIBRARIES[bestCandidate.key];
    const confidence = Math.max(0.6, 1 - bestCandidate.distance / Math.max(cleaned.length, bestCandidate.key.length));
    return {
      normalized: bestCandidate.key,
      canonical: matched.canonical,
      ecosystem: matched.ecosystem,
      defaultPackage: matched.defaultPackage,
      suggestion: {
        input,
        suggested: matched.canonical,
        confidence,
        ecosystem: matched.ecosystem
      }
    };
  }

  // 3. Fallback for custom or novel libraries
  const titleCase = input.trim().charAt(0).toUpperCase() + input.trim().slice(1);
  return {
    normalized: cleaned,
    canonical: titleCase,
    ecosystem: 'npm', // Default fallback probe
    defaultPackage: cleaned
  };
}
