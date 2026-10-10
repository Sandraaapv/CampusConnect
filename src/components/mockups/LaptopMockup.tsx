import React from 'react';

interface LaptopMockupProps {
  children: React.ReactNode;
  className?: string;
}

export const LaptopMockup: React.FC<LaptopMockupProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`relative select-none @container w-[320px] max-w-[min(84vw,360px)] lg:w-full lg:max-w-[min(34vw,52vh)] ${className}`}
      style={{
        maxHeight: 'clamp(160px, 31vh, 250px)',
      }}
    >
      {/* Screen lid with simple thin dark bezel (no dots, no pill) */}
      <div className="relative rounded-t-lg bg-[#18181c] p-[5px] pb-0 shadow-[0_12px_32px_rgba(0,0,0,0.16)] border border-neutral-700/70">
        {/* Tiny top webcam dot */}
        <div className="flex items-center justify-center py-0.5 bg-[#141416] rounded-t-md">
          <span className="w-1 h-1 rounded-full bg-neutral-600 inline-block"></span>
        </div>

        {/* Inner screen content */}
        <div
          className="relative bg-[#ffffff] text-neutral-900 rounded-b-xs overflow-hidden shadow-inner flex flex-col"
          style={{ height: 'calc(clamp(160px, 31vh, 250px) - 22px)', maxHeight: '240px' }}
        >
          {children}
          {/* Subtle glare reflection */}
          <div className="device-glare pointer-events-none" />
        </div>
      </div>

      {/* Laptop slim base */}
      <div className="relative h-2 bg-gradient-to-b from-[#2a2b32] to-[#18191e] rounded-b-sm mx-[-6px] shadow-sm flex items-center justify-center">
        <div className="w-12 h-0.5 bg-[#3e404b] rounded-full"></div>
      </div>
      <div className="mx-auto w-[85%] h-1 bg-black/10 blur-xs rounded-full"></div>
    </div>
  );
};
