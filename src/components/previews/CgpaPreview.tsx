import React, { useState } from 'react';
import { LaptopMockup } from '../mockups/LaptopMockup';
import { Target, AlertCircle } from 'lucide-react';

interface SubjectTarget {
  name: string;
  code: string;
  internal: number;
  examDaysLeft: number;
}

const subjects: SubjectTarget[] = [
  { name: 'DBMS', code: 'CS302', internal: 44, examDaysLeft: 4 },
  { name: 'Networks', code: 'CS304', internal: 41, examDaysLeft: 11 },
  { name: 'OS', code: 'CS306', internal: 34, examDaysLeft: 16 },
  { name: 'Software Eng', code: 'CS308', internal: 46, examDaysLeft: 22 },
];

export const CgpaPreview: React.FC = () => {
  const [targetCgpa, setTargetCgpa] = useState<number>(8.8);

  return (
    <LaptopMockup>
      <div className="p-2 text-neutral-900 font-sans text-[clamp(8px,2.4cqw,11px)] bg-[#fdfdfd] flex flex-col justify-between h-full">
        {/* Header and Target Slider */}
        <div className="flex items-center justify-between pb-1 border-b border-neutral-200 shrink-0">
          <div>
            <h4 className="font-extrabold text-[clamp(9px,2.8cqw,12px)] text-neutral-900 flex items-center gap-1 leading-tight">
              <Target className="w-3 h-3 text-amber-500" />
              Target CGPA Calculator
            </h4>
            <p className="text-[clamp(6.5px,2cqw,8.5px)] text-neutral-500">
              End-Sem = 2 &times; (Target &times; 10 &minus; Internal)
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-neutral-100 px-1.5 py-0.5 rounded-lg border border-neutral-300">
            <span className="text-[clamp(7px,2cqw,9px)] font-bold text-neutral-600">Goal:</span>
            <input
              type="range"
              min="7.0"
              max="9.9"
              step="0.1"
              value={targetCgpa}
              onChange={(e) => setTargetCgpa(parseFloat(e.target.value))}
              aria-label="Target CGPA selector slider"
              className="w-16 h-1 cursor-pointer"
            />
            <span className="font-black text-indigo-700 bg-indigo-50 px-1 rounded text-[clamp(8.5px,2.6cqw,11px)]">
              {targetCgpa.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-2 gap-1.5 my-1 flex-1">
          {subjects.map((sub) => {
            const requiredEndSem = Math.round(2 * (targetCgpa * 10 - sub.internal));
            const isUnreachable = requiredEndSem > 100;

            return (
              <div
                key={sub.code}
                className={`p-1.5 rounded-lg border transition-all flex flex-col justify-between ${
                  isUnreachable
                    ? 'bg-red-50/70 border-red-200 text-red-950'
                    : 'bg-white border-neutral-200/90 text-neutral-900 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between text-[clamp(7.5px,2.2cqw,9.5px)]">
                  <span className="font-bold truncate text-neutral-800">{sub.code} &bull; {sub.name}</span>
                  <span className="text-[clamp(6.5px,2cqw,8px)] text-neutral-500 font-mono">{sub.internal}/50</span>
                </div>

                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-[clamp(6.5px,2cqw,8px)] text-neutral-500">End-Sem:</span>
                  {isUnreachable ? (
                    <span className="font-bold text-[clamp(7px,2cqw,8.5px)] text-rose-700 bg-rose-50 border border-rose-200 px-1 rounded inline-flex items-center gap-0.5">
                      <AlertCircle className="w-2 h-2 text-rose-600" /> Exceeds Max
                    </span>
                  ) : (
                    <span className="font-black text-[clamp(8px,2.4cqw,10.5px)] text-emerald-700">
                      {Math.max(0, requiredEndSem)} / 100
                    </span>
                  )}
                </div>

                <div className="w-full h-1 bg-neutral-100 rounded-full mt-0.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isUnreachable ? 'bg-red-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(10, requiredEndSem))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Exam Countdown Bars */}
        <div className="pt-1 border-t border-neutral-200 shrink-0">
          <div className="grid grid-cols-4 gap-1 text-[clamp(6.5px,2cqw,8.5px)]">
            {subjects.map((sub) => (
              <div key={sub.code} className="bg-neutral-50 border border-neutral-200/90 p-1 rounded text-center">
                <span className="font-bold text-neutral-800 block truncate">{sub.code}</span>
                <span className="font-black text-indigo-600 text-[clamp(8px,2.4cqw,10px)] block">{sub.examDaysLeft}d</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LaptopMockup>
  );
};
