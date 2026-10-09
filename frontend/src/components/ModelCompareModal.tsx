import React from 'react';
import { X } from 'lucide-react';
import { AiModelRecord } from '../types';
import { ModelComparisonView } from './ModelComparisonView';

interface ModelCompareModalProps {
  initialModelA?: string;
  initialModelB?: string;
  modelsList: AiModelRecord[];
  onClose: () => void;
}

export const ModelCompareModal: React.FC<ModelCompareModalProps> = ({
  initialModelA,
  initialModelB,
  modelsList,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-6xl max-h-[92vh] bg-[#F7F8FA] dark:bg-[#0A0A0B] border border-[#E5E7EB] dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#111114] dark:text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 bg-white dark:bg-[#111114] border-b border-[#E5E7EB] dark:border-white/10 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#6D4AFF] animate-pulse" />
            <span className="text-sm font-bold font-display text-[#111114] dark:text-white">
              AI Model Comparison Workspace
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0EBFF] text-[#6941D9] border border-[#DDD3FF] dark:bg-violet-500/15 dark:text-violet-300 font-bold">
              LIVE EVIDENCE
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Close Comparison Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <ModelComparisonView
            initialModelA={initialModelA}
            initialModelB={initialModelB}
            allModels={modelsList}
          />
        </div>
      </div>
    </div>
  );
};
