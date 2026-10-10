import React from 'react';
import { PhoneMockup } from '../mockups/PhoneMockup';
import { Download, CheckCircle, Wifi, User } from 'lucide-react';

export const IdCardPreview: React.FC = () => {
  return (
    <PhoneMockup notchTitle="Digital ID">
      <div className="p-2 text-neutral-900 font-sans space-y-1.5 text-[clamp(8px,3.2cqw,11px)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-0.5 border-b border-neutral-200">
          <div>
            <h5 className="font-extrabold text-[clamp(9.5px,3.8cqw,12px)] text-neutral-900 leading-tight">
              Digital Student ID
            </h5>
            <p className="text-[clamp(7px,2.8cqw,8.5px)] text-neutral-500">Cryptographically signed</p>
          </div>
          <span className="flex items-center gap-0.5 text-[clamp(7px,2.8cqw,8.5px)] font-black px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
            Active
          </span>
        </div>

        {/* Glossy ID Card Card */}
        <div className="relative rounded-xl bg-gradient-to-tr from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-2.5 shadow-md border border-neutral-700/80 overflow-hidden space-y-1.5">
          <div className="flex items-center justify-between pb-1 border-b border-white/10 relative z-10">
            <span className="font-extrabold text-[clamp(7.5px,3cqw,9.5px)] tracking-wide leading-none">
              CAMPUSCONNECT
            </span>
            <Wifi className="w-2.5 h-2.5 text-neutral-400 rotate-90" />
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <div className="w-10 h-12 rounded-lg bg-slate-800/90 flex items-center justify-center shrink-0 border border-white/20 relative shadow-inner">
              <User className="w-5 h-5 text-slate-300" />
            </div>

            <div className="min-w-0 space-y-0.5">
              <h6 className="font-black text-[clamp(9.5px,3.8cqw,12px)] text-white tracking-tight truncate">
                Anonymous
              </h6>
              <div className="text-[clamp(7px,2.8cqw,8.5px)] text-amber-300 font-mono">
                Reg: 21CS042
              </div>
              <div className="text-[clamp(6.5px,2.6cqw,8px)] text-neutral-300 truncate">
                Dept: Computer Science
              </div>
            </div>
          </div>

          <div className="pt-1 border-t border-white/10 flex items-center justify-between relative z-10">
            <span className="text-[clamp(6.5px,2.6cqw,8px)] text-emerald-400 font-bold flex items-center gap-0.5">
              <CheckCircle className="w-2 h-2" /> Verified
            </span>

            {/* Scalable QR code */}
            <div className="bg-white p-0.5 rounded shadow-xs shrink-0">
              <svg width="24" height="24" viewBox="0 0 42 42" fill="none">
                <rect width="42" height="42" fill="white" />
                <rect x="2" y="2" width="12" height="12" stroke="black" strokeWidth="2" fill="white"/>
                <rect x="5" y="5" width="6" height="6" fill="black"/>
                <rect x="28" y="2" width="12" height="12" stroke="black" strokeWidth="2" fill="white"/>
                <rect x="31" y="5" width="6" height="6" fill="black"/>
                <rect x="2" y="28" width="12" height="12" stroke="black" strokeWidth="2" fill="white"/>
                <rect x="5" y="31" width="6" height="6" fill="black"/>
                <rect x="18" y="4" width="3" height="3" fill="black"/>
                <rect x="22" y="4" width="3" height="3" fill="black"/>
                <rect x="18" y="10" width="3" height="6" fill="black"/>
                <rect x="16" y="18" width="5" height="5" fill="black"/>
                <rect x="24" y="26" width="4" height="4" fill="black"/>
                <rect x="30" y="28" width="5" height="5" fill="black"/>
              </svg>
            </div>
          </div>
        </div>

        <button className="w-full py-1 bg-neutral-900 text-white rounded-lg text-[clamp(7.5px,3cqw,9.5px)] font-bold flex items-center justify-center gap-1 shadow-2xs">
          <Download className="w-2.5 h-2.5" /> Download PDF Card
        </button>
      </div>
    </PhoneMockup>
  );
};
