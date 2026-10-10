import React from 'react';

interface PhoneMockupProps {
  children: React.ReactNode;
  className?: string;
  notchTitle?: string;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({ children, className = '', notchTitle }) => {
  return (
    <div
      className={`relative select-none @container w-[210px] max-w-[min(68vw,230px)] lg:w-[min(24vw,240px)] ${className}`}
      style={{
        maxHeight: 'clamp(170px, 34vh, 320px)',
      }}
    >
      {/* Outer chassis */}
      <div
        className="relative rounded-[26px] bg-[#1a1a20] p-[5px] shadow-[0_16px_40px_rgba(0,0,0,0.2)] border border-[#33333e] flex flex-col"
        style={{ height: 'clamp(170px, 34vh, 320px)', maxHeight: '320px' }}
      >
        {/* Screen Bezel */}
        <div className="relative rounded-[22px] bg-[#ffffff] text-neutral-900 overflow-hidden flex-1 flex flex-col">
          {/* Compact Notch / Dynamic Island */}
          <div className="relative z-20 flex items-center justify-between px-3 pt-1 pb-0.5 bg-neutral-900 text-white text-[8px] font-semibold tracking-wider shrink-0">
            <span>9:41</span>
            <div className="h-2.5 bg-black rounded-full flex items-center justify-center space-x-1 px-1.5 shadow-xs">
              <span className="w-1 h-1 rounded-full bg-[#111111] border border-neutral-700"></span>
              <span className="text-[7px] text-neutral-400 font-mono scale-90">{notchTitle || 'CC'}</span>
            </div>
            <div className="flex items-center space-x-1 text-[7px]">
              <span>5G</span>
              <div className="w-2.5 h-1.5 border border-white/80 rounded-[1px] p-[0.5px] flex items-center">
                <div className="w-full h-full bg-white rounded-[0.5px]"></div>
              </div>
            </div>
          </div>

          {/* Screen Content Body */}
          <div className="relative flex-1 overflow-y-auto overflow-x-hidden bg-[#fafafa]">
            {children}
            <div className="device-glare pointer-events-none" />
          </div>

          {/* Home indicator bar */}
          <div className="relative z-20 bg-neutral-100/90 py-0.5 flex justify-center border-t border-neutral-200/50 shrink-0">
            <div className="w-16 h-0.5 bg-neutral-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
