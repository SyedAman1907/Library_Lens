import React from 'react';

export const AmbientBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
      {/* Extremely subtle soft violet radial ambient gradient (Section 4) */}
      <div
        className="absolute -top-[160px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#6D4AFF]/[0.035] dark:from-[#6D4AFF]/[0.07] via-[#8B72FF]/[0.015] to-transparent blur-[120px]"
      />
    </div>
  );
};
