import React, { useState } from 'react';
import { LaptopMockup } from '../mockups/LaptopMockup';
import { Search, ThumbsUp, Bell, FileText } from 'lucide-react';

interface CircularItem {
  id: string;
  title: string;
  dept: string;
  sem: string;
  date: string;
  type: 'circular' | 'note';
  upvotes?: number;
}

const mockCirculars: CircularItem[] = [
  {
    id: '1',
    title: 'Mid-Sem Exam Hall Allotment Matrix',
    dept: 'Exam Cell',
    sem: 'All Sems',
    date: '2h ago',
    type: 'circular',
  },
  {
    id: '2',
    title: 'Distributed Systems Unit 3 & 4 PYQs',
    dept: 'CSE',
    sem: 'Sem 6',
    date: 'Yesterday',
    type: 'note',
    upvotes: 84,
  },
  {
    id: '3',
    title: 'Hostel Night Extension Passes',
    dept: 'Hostel',
    sem: 'All Sems',
    date: 'Oct 08',
    type: 'circular',
  },
];

export const CircularsPreview: React.FC = () => {
  const [activeDept, setActiveDept] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const departments = ['All', 'CSE', 'Exam Cell', 'Hostel'];

  const filtered = mockCirculars.filter((item) => {
    const matchesDept = activeDept === 'All' || item.dept === activeDept;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.dept.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <LaptopMockup>
      <div className="p-2 text-neutral-900 font-sans text-[clamp(8px,2.4cqw,11px)] bg-[#fdfdfd] flex flex-col justify-between h-full">
        {/* Search Bar & Stats */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="relative flex-1">
            <Search className="w-2.5 h-2.5 text-neutral-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search circulars, PYQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search notices and notes"
              className="w-full pl-6 pr-2 py-1 bg-neutral-100 border border-neutral-200 rounded-md text-[clamp(7.5px,2.2cqw,10px)] focus:outline-none"
            />
          </div>
          <span className="text-[clamp(7px,2cqw,9px)] font-bold text-neutral-500 whitespace-nowrap bg-neutral-100 px-1.5 py-1 rounded border border-neutral-200">
            {filtered.length} found
          </span>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 shrink-0 text-[clamp(7px,2cqw,9px)]">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setActiveDept(dept)}
              className={`px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer ${
                activeDept === dept
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Feed */}
        <div className="space-y-1 overflow-y-auto flex-1">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-neutral-200/90 shadow-2xs"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                    item.type === 'circular'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {item.type === 'circular' ? (
                    <Bell className="w-2.5 h-2.5" />
                  ) : (
                    <FileText className="w-2.5 h-2.5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[clamp(8px,2.4cqw,10.5px)] text-neutral-900 truncate">{item.title}</p>
                  <div className="flex items-center gap-1 text-[clamp(6.5px,2cqw,8px)] text-neutral-500">
                    <span className="font-semibold text-neutral-700">{item.dept}</span>
                    <span>&bull;</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>

              {item.type === 'note' && item.upvotes && (
                <div className="flex items-center gap-0.5 text-[clamp(7.5px,2.2cqw,9.5px)] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1 py-0.2 rounded shrink-0">
                  <ThumbsUp className="w-2.5 h-2.5" />
                  <span>{item.upvotes}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </LaptopMockup>
  );
};
