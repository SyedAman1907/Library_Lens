import React, { useState } from 'react';
import { Boxes, Search, ArrowRight, ExternalLink, Sparkles } from 'lucide-react';

interface LibrariesViewProps {
  onCompareWith: (libraryName: string) => void;
}

interface LibraryEntry {
  name: string;
  category: 'Frontend' | 'Full-Stack' | 'Backend & APIs' | 'AI & Data' | 'Systems & Rust';
  ecosystem: 'npm' | 'pypi' | 'crates' | 'maven';
  description: string;
  defaultVs: string;
}

const LIBRARIES_CATALOG: LibraryEntry[] = [
  // Frontend
  { name: 'React', category: 'Frontend', ecosystem: 'npm', description: 'Declarative component library for building modern user interfaces.', defaultVs: 'Vue' },
  { name: 'Vue', category: 'Frontend', ecosystem: 'npm', description: 'Progressive JavaScript framework with intuitive reactivity and SFCs.', defaultVs: 'React' },
  { name: 'React Query', category: 'Frontend', ecosystem: 'npm', description: 'Async state management, data caching, and server-state sync.', defaultVs: 'SWR' },
  { name: 'SWR', category: 'Frontend', ecosystem: 'npm', description: 'Stale-while-revalidate React hooks library for remote data fetching.', defaultVs: 'React Query' },
  { name: 'Svelte', category: 'Frontend', ecosystem: 'npm', description: 'Compiler-based UI framework generating surgically minimal vanilla code.', defaultVs: 'React' },
  { name: 'Angular', category: 'Frontend', ecosystem: 'npm', description: 'Full-featured enterprise application framework by Google.', defaultVs: 'React' },

  // Fullstack
  { name: 'Next.js', category: 'Full-Stack', ecosystem: 'npm', description: 'Production React framework with Server Components and hybrid rendering.', defaultVs: 'Nuxt' },
  { name: 'Nuxt', category: 'Full-Stack', ecosystem: 'npm', description: 'Intuitive full-stack Vue framework with automatic routing and SSR.', defaultVs: 'Next.js' },
  { name: 'Remix', category: 'Full-Stack', ecosystem: 'npm', description: 'Full stack web framework focused on web standards and modern UX.', defaultVs: 'Next.js' },
  { name: 'Astro', category: 'Full-Stack', ecosystem: 'npm', description: 'Content-driven web framework with zero-JS island architecture.', defaultVs: 'Next.js' },

  // Backend
  { name: 'FastAPI', category: 'Backend & APIs', ecosystem: 'pypi', description: 'High-performance Python async framework with automatic OpenAPI docs.', defaultVs: 'Express' },
  { name: 'Express', category: 'Backend & APIs', ecosystem: 'npm', description: 'Fast, unopinionated, minimalist web framework for Node.js.', defaultVs: 'FastAPI' },
  { name: 'Django', category: 'Backend & APIs', ecosystem: 'pypi', description: 'Batteries-included Python web framework for rapid development.', defaultVs: 'FastAPI' },
  { name: 'Spring Boot', category: 'Backend & APIs', ecosystem: 'maven', description: 'Production-grade enterprise Java framework with convention-over-configuration.', defaultVs: 'Quarkus' },

  // AI & Data
  { name: 'PyTorch', category: 'AI & Data', ecosystem: 'pypi', description: 'Dynamic deep learning tensor library favored by AI researchers.', defaultVs: 'TensorFlow' },
  { name: 'TensorFlow', category: 'AI & Data', ecosystem: 'pypi', description: 'Comprehensive end-to-end open source platform for machine learning.', defaultVs: 'PyTorch' },
  { name: 'LangChain', category: 'AI & Data', ecosystem: 'pypi', description: 'Framework for developing applications powered by large language models.', defaultVs: 'LlamaIndex' },
  { name: 'LlamaIndex', category: 'AI & Data', ecosystem: 'pypi', description: 'Data framework for LLM-based applications and RAG systems.', defaultVs: 'LangChain' },

  // Systems
  { name: 'Tokio', category: 'Systems & Rust', ecosystem: 'crates', description: 'Event-driven, non-blocking I/O platform for writing asynchronous Rust.', defaultVs: 'Actix Web' },
  { name: 'Actix Web', category: 'Systems & Rust', ecosystem: 'crates', description: 'Extremely fast, pragmatic HTTP server framework for Rust.', defaultVs: 'Axum' },
];

export const LibrariesView: React.FC<LibrariesViewProps> = ({ onCompareWith }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Frontend', 'Full-Stack', 'Backend & APIs', 'AI & Data', 'Systems & Rust'];

  const filtered = LIBRARIES_CATALOG.filter((lib) => {
    const matchesSearch = lib.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lib.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || lib.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB] dark:border-white/[0.08]">
        <div>
          <h2 className="text-2xl font-bold font-display text-[#111114] dark:text-[#F5F5F5] flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#6D4AFF]" />
            <span>Supported Libraries & Ecosystems</span>
          </h2>
          <p className="text-xs text-[#52525B] dark:text-[#71717A] mt-0.5">
            Explore verified software libraries or launch an instant comparison
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search libraries..."
            className="w-full pl-9 pr-3 py-1.5 command-input text-xs"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-[#F2EEFF] text-[#5B3FD6] dark:bg-violet-500/20 dark:text-violet-300 border border-[#DDD3FF] dark:border-violet-500/30 font-semibold'
                : 'text-[#52525B] dark:text-[#71717A] hover:text-[#111114] dark:hover:text-[#F5F5F5] bg-white dark:bg-white/[0.03] border border-[#E5E7EB] dark:border-white/[0.05]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((lib) => (
          <div
            key={lib.name}
            className="workspace-card p-5 flex flex-col justify-between hover:border-[#6D4AFF]/40 transition-all group bg-white dark:bg-[#0A0A0B] border border-[#E5E7EB] dark:border-white/[0.08] shadow-subtle"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-bold text-base text-[#111114] dark:text-[#F5F5F5] group-hover:text-[#6D4AFF] transition-colors">
                  {lib.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F8F8FA] dark:bg-white/[0.06] text-[#52525B] dark:text-[#A1A1AA] border border-[#E5E7EB] dark:border-white/[0.08] uppercase font-bold">
                  {lib.ecosystem}
                </span>
              </div>

              <span className="text-[10px] font-mono text-[#71717A] block mb-2">
                {lib.category}
              </span>

              <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] line-clamp-2 mb-4 leading-relaxed">
                {lib.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#E5E7EB] dark:border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#71717A]">
                vs <strong className="text-[#111114] dark:text-[#A1A1AA]">{lib.defaultVs}</strong>
              </span>

              <button
                onClick={() => onCompareWith(lib.name)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#6D4AFF] dark:text-brand-400 hover:underline cursor-pointer group-hover:translate-x-0.5 transition-transform"
              >
                <span>Compare</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
